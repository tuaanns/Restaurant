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
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('bank_name'); // Tên ngân hàng đầy đủ
            $table->string('bank_code'); // Mã viết tắt (MB, VCB, TCB, ACB, ...)
            $table->string('bin', 10); // Mã BIN ngân hàng (970422, 970436, ...)
            $table->string('account_number'); // Số tài khoản
            $table->string('account_name'); // Tên chủ tài khoản (viết hoa không dấu hoặc có dấu)
            $table->string('branch')->nullable(); // Chi nhánh ngân hàng
            $table->boolean('is_default')->default(false); // Đặt làm tài khoản nhận tiền mặc định (dùng cho VietQR POS)
            $table->boolean('is_active')->default(true); // Trạng thái hoạt động
            $table->string('qr_template')->default('compact2'); // compact2, compact, qr_only
            $table->text('notes')->nullable(); // Ghi chú thêm
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bank_accounts');
    }
};

