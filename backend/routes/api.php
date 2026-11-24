<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PosController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\PaymentWebhookController;

/*
|--------------------------------------------------------------------------
| API Routes - Hệ Thống Thu Ngân & Phân Quyền AURA RESTAURANT
|--------------------------------------------------------------------------
*/

// Authentication Routes (Đăng nhập / Đăng xuất / Lấy thông tin user)
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::get('/users', [AuthController::class, 'getUsers'])->middleware('role:admin');
        Route::post('/users', [AuthController::class, 'createUser'])->middleware('role:admin');
        Route::post('/users/import', [AuthController::class, 'importUsers'])->middleware('role:admin');
        Route::patch('/users/{id}', [AuthController::class, 'updateUser'])->middleware('role:admin');
        Route::delete('/users/{id}', [AuthController::class, 'deleteUser'])->middleware('role:admin');
    });
});

// Admin Management Routes (Thống kê doanh thu, Quản lý thực đơn, Sổ quỹ, v.v.)
// Khóa bảo mật toàn bộ API Admin bằng Sanctum & Role: admin
Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/stats', [AdminController::class, 'getStats']);
    Route::get('/reports', [AdminController::class, 'getReports']);

    // Quản lý Món Ăn (Products)
    Route::post('/products', [AdminController::class, 'addProduct']);
    Route::post('/products/import', [AdminController::class, 'importProducts']);
    Route::patch('/products/{id}', [AdminController::class, 'updateProduct']);
    Route::delete('/products/{id}', [AdminController::class, 'deleteProduct']);

    // Quản lý Nhóm Thực Đơn (Categories) - Thêm/Sửa/Xóa
    Route::get('/categories', [AdminController::class, 'getCategories']);
    Route::post('/categories', [AdminController::class, 'addCategory']);
    Route::patch('/categories/{id}', [AdminController::class, 'updateCategory']);
    Route::delete('/categories/{id}', [AdminController::class, 'deleteCategory']);

    // Quản lý Khách Hàng - Danh sách, Thêm/Sửa/Xóa
    Route::get('/customers', [AdminController::class, 'getCustomers']);
    Route::post('/customers', [AdminController::class, 'addCustomer']);
    Route::post('/customers/import', [AdminController::class, 'importCustomers']);
    Route::patch('/customers/{id}', [AdminController::class, 'updateCustomer']);
    Route::delete('/customers/{id}', [AdminController::class, 'deleteCustomer']);

    // Quản lý Phòng/Bàn (Tables) - Danh sách, Thêm/Sửa/Xóa, Import
    Route::get('/tables', [AdminController::class, 'getTables']);
    Route::post('/tables', [AdminController::class, 'addTable']);
    Route::patch('/tables/{id}', [AdminController::class, 'updateTable']);
    Route::delete('/tables/{id}', [AdminController::class, 'deleteTable']);
    Route::post('/tables/import', [AdminController::class, 'importTables']);

    // Quản lý Khu Vực (Areas) - Danh sách, Thêm/Sửa/Xóa
    Route::get('/areas', [AdminController::class, 'getAreas']);
    Route::post('/areas', [AdminController::class, 'addArea']);
    Route::patch('/areas/{id}', [AdminController::class, 'updateArea']);
    Route::delete('/areas/{id}', [AdminController::class, 'deleteArea']);

    // Quản lý Khuyến Mãi (Promotions) - Danh sách, Thêm/Sửa/Xóa
    Route::get('/promotions', [AdminController::class, 'getPromotions']);
    Route::post('/promotions', [AdminController::class, 'addPromotion']);
    Route::patch('/promotions/{id}', [AdminController::class, 'updatePromotion']);
    Route::delete('/promotions/{id}', [AdminController::class, 'deletePromotion']);

    // Quản lý Sổ Quỹ (Cash Transactions) - Phiếu Thu / Phiếu Chi
    Route::get('/cash-transactions', [AdminController::class, 'getCashTransactions']);
    Route::post('/cash-transactions', [AdminController::class, 'createCashTransaction']);
    Route::delete('/cash-transactions/{id}', [AdminController::class, 'deleteCashTransaction']);

    // Quản lý Tài Khoản Ngân Hàng (Bank Accounts) - Thiết lập tài khoản ngân hàng & VietQR
    Route::get('/bank-accounts', [AdminController::class, 'getBankAccounts']);
    Route::post('/bank-accounts', [AdminController::class, 'createBankAccount']);
    Route::put('/bank-accounts/{id}', [AdminController::class, 'updateBankAccount']);
    Route::post('/bank-accounts/{id}/set-default', [AdminController::class, 'setDefaultBankAccount']);
    Route::delete('/bank-accounts/{id}', [AdminController::class, 'deleteBankAccount']);

    // Quản lý Sao lưu CSDL (Database Backups)
    Route::get('/backups', [AdminController::class, 'getBackups']);
    Route::post('/backups/create', [AdminController::class, 'createBackup']);
    Route::get('/backups/{filename}/download', [AdminController::class, 'downloadBackup']);
    Route::delete('/backups/{filename}', [AdminController::class, 'deleteBackup']);
});

// SSE Event Stream hỗ trợ cả token dạng query string ?token= cho browser EventSource
Route::get('/pos/events/stream', [PosController::class, 'streamEvents']);

// POS Cashier & Waiter Routes (Sơ đồ bàn, gọi món, báo bếp, in bill, thanh toán)
Route::prefix('pos')->middleware(['auth:sanctum', 'role:admin,cashier,waiter'])->group(function () {
    // Đồng bộ sự kiện thời gian thực (Real-time SSE & Polling cursor)
    Route::get('/events/latest', [PosController::class, 'getLatestEvents']);

    // Tài khoản ngân hàng mặc định cho POS VietQR
    Route::get('/default-bank-account', [AdminController::class, 'getDefaultBankAccount']);
    // Sơ đồ bàn, khu vực và trạng thái
    Route::get('/tables', [PosController::class, 'getTables']);
    
    // Thực đơn món ăn và danh mục
    Route::get('/menu', [PosController::class, 'getMenu']);

    // Danh sách khách hàng
    Route::get('/customers', [PosController::class, 'getCustomers']);

    // Chi tiết order của bàn được chọn (hỗ trợ cả GET và POST để tự động khởi tạo đơn)
    Route::match(['get', 'post'], '/tables/{tableId}/order', [PosController::class, 'getTableOrder']);

    // Thêm món vào bàn
    Route::post('/orders/{orderId}/items', [PosController::class, 'addItem']);

    // Cập nhật số lượng hoặc ghi chú món
    Route::patch('/items/{itemId}', [PosController::class, 'updateItem']);

    // Báo bếp (F10) & Quản lý bếp KDS
    Route::post('/orders/{orderId}/send-kitchen', [PosController::class, 'sendToKitchen']);
    Route::get('/kitchen/items', [PosController::class, 'getKitchenItems']);
    Route::patch('/kitchen/items/{itemId}/status', [PosController::class, 'updateKitchenItemStatus']);

    // Danh sách chương trình khuyến mãi đang chạy (POS)
    Route::get('/promotions', [PosController::class, 'getPromotions']);

    // Kiểm tra trạng thái đơn hàng (Polling tự động đóng modal khi nhận tiền VietQR)
    Route::get('/orders/{orderId}/status', [PaymentWebhookController::class, 'getOrderStatus']);

    // --- CÁC THAO TÁC CỦA THU NGÂN & QUẢN LÝ (ROLE: ADMIN, CASHIER) ---
    Route::middleware('role:admin,cashier')->group(function () {
        // Xóa món khỏi order
        Route::delete('/items/{itemId}', [PosController::class, 'deleteItem']);

        // Huỷ toàn bộ order (xoá sạch món, reset bàn về empty)
        Route::post('/orders/{orderId}/clear', [PosController::class, 'clearOrder']);

        // Gán khách hàng cho order (để tính % giảm giá thành viên)
        Route::post('/orders/{orderId}/customer', [PosController::class, 'updateCustomer']);

        // Áp dụng hoặc hủy khuyến mãi cho order
        Route::post('/orders/{orderId}/promotion', [PosController::class, 'applyPromotion']);

        // In tạm tính
        Route::post('/orders/{orderId}/print-prebill', [PosController::class, 'printPreBill']);

        // Thanh toán (F9)
        Route::post('/orders/{orderId}/checkout', [PosController::class, 'checkout']);

        // Chuyển bàn
        Route::post('/tables/transfer', [PosController::class, 'transferTable']);

        // Tách đơn sang bàn khác
        Route::post('/tables/split-order', [PosController::class, 'splitOrder']);
    });

    // Khôi phục dữ liệu mẫu (Chỉ Admin)
    Route::post('/reset-demo', [PosController::class, 'resetDemo'])->middleware('role:admin');
});

// Cổng tiếp nhận Webhook ngân hàng tự động (SePay, Casso, Android App Gateway) - Public cho gateway ngân hàng
Route::post('/payment/webhook', [PaymentWebhookController::class, 'handleWebhook']);
Route::post('/payment/test-simulate', [PaymentWebhookController::class, 'simulateWebhook']);
