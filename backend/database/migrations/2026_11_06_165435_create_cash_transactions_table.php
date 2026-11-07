<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cash_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('type'); // 'receipt' (thu) hoặc 'payment' (chi)
            $table->string('payment_method'); // 'cash' (tiền mặt) hoặc 'bank' (tài khoản ngân hàng)
            $table->string('category'); // Loại thu / Loại chi
            $table->decimal('amount', 15, 2)->default(0);
            $table->string('invoice_ref')->nullable(); // Số - Ngày hóa đơn
            $table->string('target_type')->default('other'); // customer, supplier, staff, other
            $table->string('target_name')->nullable(); // Tên người nộp / nhận
            $table->string('target_phone')->nullable(); // SĐT
            $table->text('description')->nullable(); // Ghi chú
            $table->boolean('is_business_result')->default(true); // Hạch toán vào kết quả hoạt động kinh doanh
            $table->dateTime('transacted_at'); // Ngày giờ lập phiếu thực tế
            $table->string('created_by')->nullable(); // Người lập
            $table->string('branch_name')->default('QUÁN TRÀ - 103 Trần Hưng Đạo, Đặc khu Phú Quốc, Tỉnh An Giang');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cash_transactions');
    }
};
