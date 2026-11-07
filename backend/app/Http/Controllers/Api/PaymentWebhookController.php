<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\PaymentService;

/**
 * Controller: Webhook thanh toán VietQR & SePay (Thin Controller)
 */
class PaymentWebhookController extends Controller
{
    protected PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Tiếp nhận Webhook biến động số dư ngân hàng từ SePay, Casso hoặc App thông báo
     * Endpoint: POST /api/payment/webhook
     */
    public function handleWebhook(Request $request)
    {
        $result = $this->paymentService->handleIncomingWebhook($request->all());
        $status = $result['status'] ?? 200;
        unset($result['status']);
        return response()->json($result, $status);
    }

    /**
     * Lấy trạng thái thanh toán của đơn hàng (dùng cho POS realtime listener)
     */
    public function getOrderStatus($orderId)
    {
        $orderData = $this->paymentService->getOrderStatus((int)$orderId);
        if (!$orderData) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng'
            ], 404);
        }

        return response()->json(array_merge(['success' => true], $orderData));
    }

    /**
     * Giả lập gửi webhook thử nghiệm từ trang Quản trị (Admin Test Simulator)
     */
    public function simulateWebhook(Request $request)
    {
        $tableNum = trim($request->input('table_num', '1'));
        $amount = (float)$request->input('amount', 0);
        $orderCode = trim($request->input('order_code', ''));

        $content = $orderCode ? "QUAN TRA {$orderCode}" : "QUAN TRA BAN {$tableNum}";

        $fakeRequest = new Request([
            'transferAmount' => $amount,
            'content' => $content,
            'gateway' => 'Test_Simulator',
            'accountNumber' => '19006888',
            'referenceCode' => 'SIMULATE_' . time(),
        ]);

        return $this->handleWebhook($fakeRequest);
    }
}
