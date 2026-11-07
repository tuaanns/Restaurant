<?php

namespace App\Services;

use App\Models\Order;
use App\Models\DiningTable;
use App\Models\CashTransaction;
use App\Services\CashBookService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

/**
 * Service Layer: Xử lý thanh toán đơn hàng, Webhook VietQR (SePay/Casso) và đồng bộ bàn
 */
class PaymentService
{
    protected CashBookService $cashBookService;

    public function __construct(CashBookService $cashBookService)
    {
        $this->cashBookService = $cashBookService;
    }

    /**
     * Phân tích và xử lý Webhook chuyển khoản ngân hàng
     */
    public function handleIncomingWebhook(array $payload): array
    {
        $amount = 0;
        $content = '';
        $gateway = '';
        $accountNumber = '';
        $referenceCode = '';

        // 1. Định dạng SePay
        if (isset($payload['transferAmount']) || isset($payload['transferType'])) {
            $amount = (float)($payload['transferAmount'] ?? 0);
            $content = $payload['content'] ?? ($payload['description'] ?? '');
            $gateway = $payload['gateway'] ?? 'SePay';
            $accountNumber = $payload['accountNumber'] ?? '';
            $referenceCode = $payload['referenceCode'] ?? ($payload['id'] ?? '');
        }
        // 2. Định dạng Casso
        elseif (isset($payload['data']) && is_array($payload['data'])) {
            $firstTx = $payload['data'][0] ?? [];
            $amount = (float)($firstTx['amount'] ?? 0);
            $content = $firstTx['description'] ?? '';
            $gateway = 'Casso';
            $accountNumber = $firstTx['bank_sub_acc_id'] ?? '';
            $referenceCode = $firstTx['tid'] ?? '';
        }
        // 3. Định dạng App thông báo Android
        elseif (isset($payload['amount'])) {
            $amount = (float)$payload['amount'];
            $content = $payload['content'] ?? ($payload['description'] ?? '');
            $gateway = $payload['gateway'] ?? 'AppGateway';
            $accountNumber = $payload['account_number'] ?? '';
            $referenceCode = $payload['reference_code'] ?? uniqid('TX_');
        }
        // 4. Fallback tin nhắn SMS
        elseif (isset($payload['text']) || isset($payload['message'])) {
            $text = $payload['text'] ?? $payload['message'];
            $content = $text;
            if (preg_match('/\+?([0-9]{1,3}(?:[.,][0-9]{3})+|[0-9]{4,})\s*(?:VND|đ|d)/i', $text, $matches)) {
                $cleanNum = str_replace(['.', ','], '', $matches[1]);
                $amount = (float)$cleanNum;
            }
            $gateway = 'SMS/Notification';
            $referenceCode = uniqid('NOTIF_');
        }

        if ($amount <= 0 && empty($content)) {
            return [
                'success' => false,
                'status' => 400,
                'message' => 'Dữ liệu webhook không hợp lệ (thiếu số tiền hoặc nội dung)'
            ];
        }

        // Khớp đơn hàng
        $order = $this->matchOrder($content, $amount);

        if (!$order) {
            Log::warning("Webhook received transfer but no matching active order found. Amount: {$amount}, Content: {$content}");
            return [
                'success' => false,
                'status' => 200,
                'message' => 'Đã nhận biến động số dư nhưng không tìm thấy đơn hàng hoặc bàn phù hợp đang mở',
                'parsed' => [
                    'amount' => $amount,
                    'content' => $content
                ]
            ];
        }

        // Hoàn tất đơn hàng và giải phóng bàn
        return $this->completeOrderWithTransfer($order, $amount, $gateway, $content, $referenceCode);
    }

    /**
     * Hoàn tất thanh toán đơn hàng qua chuyển khoản
     */
    public function completeOrderWithTransfer(Order $order, float $amount, string $gateway, string $content, string $referenceCode): array
    {
        $order->update([
            'status' => 'paid',
            'payment_method' => 'qr_banking',
            'paid_amount' => $amount,
            'change_amount' => max(0, $amount - $order->total_amount),
            'paid_at' => Carbon::now('Asia/Ho_Chi_Minh'),
        ]);

        $tableName = 'Mang Về';
        if ($order->table) {
            $tableName = $order->table->name;
            $order->table->update([
                'status' => 'empty',
                'guest_count' => 0,
                'started_at' => null,
                'notes' => null,
            ]);
        }

        // Tự động ghi nhận vào Sổ quỹ
        try {
            $this->cashBookService->createTransaction([
                'type' => 'receipt',
                'payment_method' => 'bank',
                'category' => 'Thu tiền hóa đơn bán hàng (Tự động VietQR)',
                'amount' => $amount,
                'invoice_ref' => $order->order_code,
                'target_type' => 'customer',
                'target_name' => $order->customer ? $order->customer->name : 'Khách thanh toán VietQR',
                'target_phone' => $order->customer ? $order->customer->phone : null,
                'description' => "Thanh toán tự động qua {$gateway} - Nội dung: {$content} - Mã GD: {$referenceCode}",
                'is_business_result' => true,
                'created_by' => 'Hệ thống tự động (VietQR Webhook)',
                'branch_name' => 'QUÁN TRÀ - 103 Trần Hưng Đạo, Đặc khu Phú Quốc, Tỉnh An Giang',
            ]);
        } catch (\Exception $e) {
            Log::error('Could not auto-create cash transaction for webhook: ' . $e->getMessage());
        }

        Log::info("Successfully auto-completed Order {$order->order_code} for table {$tableName} with amount {$amount}");

        return [
            'success' => true,
            'status' => 200,
            'message' => "Thanh toán thành công cho đơn {$order->order_code} ({$tableName})!",
            'order_id' => $order->id,
            'order_code' => $order->order_code,
            'table_name' => $tableName,
            'amount_paid' => $amount
        ];
    }

    /**
     * Khớp đơn hàng theo nội dung chuyển khoản và số tiền
     */
    public function matchOrder(string $content, float $amount): ?Order
    {
        $normalized = mb_strtoupper($content, 'UTF-8');

        // Case 1: Khớp mã đơn (ORD-...)
        if (preg_match('/ORD[-_]?([0-9]{4,})/i', $normalized, $matches)) {
            $extractedCode = 'ORD-' . $matches[1];
            $order = Order::with('table')
                ->where('status', 'open')
                ->where('order_code', 'like', "%{$extractedCode}%")
                ->latest()
                ->first();
            if ($order) {
                return $order;
            }
        }

        // Case 2: Khớp theo Tên bàn (BAN 01, BÀN 1, T1, VIP 02...)
        if (preg_match('/(?:BAN|BÀN|TABLE)\s*([0-9]+)/iu', $normalized, $matches)) {
            $tableNum = (int)$matches[1];
            $tableNames = [
                'BÀN ' . str_pad($tableNum, 2, '0', STR_PAD_LEFT),
                'Bàn ' . str_pad($tableNum, 2, '0', STR_PAD_LEFT),
                'BAN ' . str_pad($tableNum, 2, '0', STR_PAD_LEFT),
                'BÀN ' . $tableNum,
                'Bàn ' . $tableNum,
                'BAN ' . $tableNum,
            ];

            $order = Order::with('table')
                ->where('status', 'open')
                ->whereHas('table', function ($q) use ($tableNames) {
                    $q->whereIn('name', $tableNames);
                })
                ->latest()
                ->first();

            if ($order) {
                return $order;
            }
        }

        // Case 3: Tìm đơn 'open' duy nhất có số tiền khớp hoàn toàn
        if ($amount > 0) {
            $matchedOrders = Order::with('table')
                ->where('status', 'open')
                ->where('total_amount', $amount)
                ->get();

            if ($matchedOrders->count() === 1) {
                return $matchedOrders->first();
            }
        }

        return null;
    }

    /**
     * Lấy chi tiết trạng thái đơn hàng cho màn hình POS lắng nghe realtime
     */
    public function getOrderStatus(int $orderId): ?array
    {
        $order = Order::with('table')->find($orderId);
        if (!$order) {
            return null;
        }

        return [
            'status' => $order->status,
            'is_paid' => $order->status === 'paid',
            'payment_method' => $order->payment_method,
            'paid_amount' => $order->paid_amount,
            'total_amount' => $order->total_amount,
            'paid_at' => $order->paid_at ? Carbon::parse($order->paid_at)->format('H:i:s d/m/Y') : null,
            'table_name' => $order->table ? $order->table->name : 'Mang Về'
        ];
    }
}

