<?php

namespace App\Services;

use App\Models\CashTransaction;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

/**
 * Service Layer: Quản lý hạch toán Sổ quỹ, Phiếu thu / chi và Tính toán số dư
 */
class CashBookService
{
    /**
     * Lấy danh sách giao dịch và bảng tổng kết quỹ theo khoảng thời gian
     */
    public function getTransactionsSummary(array $filters): array
    {
        $fundType = $filters['fund_type'] ?? 'all';
        $docType = $filters['doc_type'] ?? 'all';
        $category = $filters['category'] ?? null;
        $search = $filters['search'] ?? null;
        $date = $filters['date'] ?? null;
        $fromDate = $filters['from_date'] ?? null;
        $toDate = $filters['to_date'] ?? null;
        $businessOnly = $filters['is_business_result'] ?? null;

        // Xác định khoảng thời gian
        if ($fromDate && $toDate) {
            $startDateTime = Carbon::parse($fromDate)->startOfDay();
            $endDateTime = Carbon::parse($toDate)->endOfDay();
        } elseif ($date) {
            $startDateTime = Carbon::parse($date)->startOfDay();
            $endDateTime = Carbon::parse($date)->endOfDay();
        } else {
            $startDateTime = Carbon::now('Asia/Ho_Chi_Minh')->startOfMonth();
            $endDateTime = Carbon::now('Asia/Ho_Chi_Minh')->endOfDay();
        }

        // 1. Quỹ đầu kỳ
        $priorCashReceipt = (float)CashTransaction::where('payment_method', 'cash')->where('type', 'receipt')->where('transacted_at', '<', $startDateTime)->sum('amount');
        $priorCashPayment = (float)CashTransaction::where('payment_method', 'cash')->where('type', 'payment')->where('transacted_at', '<', $startDateTime)->sum('amount');
        $cashOpening = $priorCashReceipt - $priorCashPayment;

        $priorBankReceipt = (float)CashTransaction::where('payment_method', 'bank')->where('type', 'receipt')->where('transacted_at', '<', $startDateTime)->sum('amount');
        $priorBankPayment = (float)CashTransaction::where('payment_method', 'bank')->where('type', 'payment')->where('transacted_at', '<', $startDateTime)->sum('amount');
        $bankOpening = $priorBankReceipt - $priorBankPayment;

        $openingBalance = ($fundType === 'cash') ? $cashOpening : (($fundType === 'bank') ? $bankOpening : ($cashOpening + $bankOpening));

        // 2. Query giao dịch trong kỳ
        $query = CashTransaction::whereBetween('transacted_at', [$startDateTime, $endDateTime]);

        if ($fundType !== 'all') {
            $query->where('payment_method', $fundType);
        }

        if ($docType !== 'all') {
            $query->where('type', $docType);
        }

        if ($category && $category !== 'all') {
            $query->where('category', $category);
        }

        if ($businessOnly === 'true' || $businessOnly === true || $businessOnly === '1') {
            $query->where('is_business_result', true);
        } elseif ($businessOnly === 'false' || $businessOnly === false || $businessOnly === '0') {
            $query->where('is_business_result', false);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('target_name', 'like', "%{$search}%")
                  ->orWhere('target_phone', 'like', "%{$search}%")
                  ->orWhere('invoice_ref', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        $transactions = $query->orderBy('transacted_at', 'desc')->orderBy('id', 'desc')->get();

        // 3. Tính toán số dư trong kỳ
        $totalReceipt = (float)$transactions->where('type', 'receipt')->sum('amount');
        $totalPayment = (float)$transactions->where('type', 'payment')->sum('amount');
        $closingBalance = $openingBalance + $totalReceipt - $totalPayment;

        $cashReceipt = (float)$transactions->where('type', 'receipt')->where('payment_method', 'cash')->sum('amount');
        $cashPayment = (float)$transactions->where('type', 'payment')->where('payment_method', 'cash')->sum('amount');
        $bankReceipt = (float)$transactions->where('type', 'receipt')->where('payment_method', 'bank')->sum('amount');
        $bankPayment = (float)$transactions->where('type', 'payment')->where('payment_method', 'bank')->sum('amount');

        return [
            'summary' => [
                'opening_balance' => $openingBalance,
                'total_receipt' => $totalReceipt,
                'total_payment' => $totalPayment,
                'closing_balance' => $closingBalance,
                'cash' => [
                    'opening' => $cashOpening,
                    'receipt' => $cashReceipt,
                    'payment' => $cashPayment,
                    'closing' => $cashOpening + $cashReceipt - $cashPayment,
                ],
                'bank' => [
                    'opening' => $bankOpening,
                    'receipt' => $bankReceipt,
                    'payment' => $bankPayment,
                    'closing' => $bankOpening + $bankReceipt - $bankPayment,
                ],
            ],
            'transactions' => $transactions,
            'period' => [
                'from' => $startDateTime->format('Y-m-d H:i:s'),
                'to' => $endDateTime->format('Y-m-d H:i:s'),
            ]
        ];
    }

    /**
     * Tạo mã phiếu thu (PT) hoặc phiếu chi (PC) tự động
     */
    public function generateVoucherCode(string $type): string
    {
        $prefix = ($type === 'receipt') ? 'PT' : 'PC';
        $dateStr = date('ymd');
        $countToday = CashTransaction::where('type', $type)
            ->whereDate('created_at', Carbon::today())
            ->count() + 1;
        $code = $prefix . $dateStr . '-' . str_pad($countToday, 3, '0', STR_PAD_LEFT);

        if (CashTransaction::where('code', $code)->exists()) {
            $code = $prefix . $dateStr . '-' . strtoupper(substr(uniqid(), -4));
        }

        return $code;
    }

    /**
     * Tạo phiếu thu / phiếu chi mới
     */
    public function createTransaction(array $data): CashTransaction
    {
        $type = $data['type'];
        $code = trim($data['code'] ?? '') ?: $this->generateVoucherCode($type);

        $transactedAt = !empty($data['transacted_at'])
            ? Carbon::parse($data['transacted_at'])->timezone('Asia/Ho_Chi_Minh')
            : Carbon::now('Asia/Ho_Chi_Minh');

        return CashTransaction::create([
            'code' => $code,
            'type' => $type,
            'payment_method' => $data['payment_method'] ?? 'cash',
            'category' => $data['category'],
            'amount' => (float)$data['amount'],
            'invoice_ref' => $data['invoice_ref'] ?? null,
            'target_type' => $data['target_type'] ?? 'other',
            'target_name' => $data['target_name'] ?? 'Khách lẻ / Đối tác',
            'target_phone' => $data['target_phone'] ?? null,
            'description' => $data['description'] ?? null,
            'is_business_result' => isset($data['is_business_result']) ? (bool)$data['is_business_result'] : true,
            'transacted_at' => $transactedAt,
            'created_by' => $data['created_by'] ?? 'Quản lý nhà hàng',
            'branch_name' => $data['branch_name'] ?? 'QUÁN TRÀ - 103 Trần Hưng Đạo, Đặc khu Phú Quốc, Tỉnh An Giang',
        ]);
    }

    /**
     * Xóa phiếu thu / chi
     */
    public function deleteTransaction(int $id): bool
    {
        $tx = CashTransaction::find($id);
        if (!$tx) {
            return false;
        }
        return (bool)$tx->delete();
    }
}
