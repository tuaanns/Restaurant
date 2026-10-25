<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Khu vực (Tầng 1, Tầng 2, Phòng VIP, Sân vườn)
        Schema::create('areas', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // 2. Bàn ăn & Phòng
        Schema::create('dining_tables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('area_id')->constrained('areas')->onDelete('cascade');
            $table->string('name');
            $table->integer('capacity')->default(4);
            $table->string('status')->default('empty'); // empty, occupied, billing
            $table->integer('guest_count')->default(0);
            $table->dateTime('started_at')->nullable();
            $table->string('notes')->nullable();
            $table->boolean('is_takeaway')->default(false);
            $table->boolean('is_vip')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // 3. Nhóm thực đơn
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('icon')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // 4. Món ăn / Đồ uống
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->string('name');
            $table->string('code')->nullable();
            $table->decimal('price', 12, 2)->default(0);
            $table->string('unit')->default('phần');
            $table->text('description')->nullable();
            $table->string('image_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_popular')->default(false);
            $table->timestamps();
        });

        // 5. Khách hàng
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('membership_tier')->default('Hội viên');
            $table->decimal('discount_percent', 5, 2)->default(0);
            $table->timestamps();
        });

        // 6. Đơn order
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_code')->unique();
            $table->foreignId('table_id')->nullable()->constrained('dining_tables')->nullOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('cashier_name')->default('Thu Hằng');
            $table->string('shift')->default('Ca sáng (07:00 - 15:00)');
            $table->string('order_type')->default('dine_in'); // dine_in, takeaway
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount_percent', 5, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('vat_percent', 5, 2)->default(8);
            $table->decimal('vat_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->string('status')->default('active'); // active, billing, paid, cancelled
            $table->string('payment_method')->nullable(); // cash, qr_banking, card
            $table->decimal('paid_amount', 12, 2)->nullable();
            $table->decimal('change_amount', 12, 2)->nullable();
            $table->dateTime('printed_prebill_at')->nullable();
            $table->dateTime('paid_at')->nullable();
            $table->timestamps();
        });

        // 7. Chi tiết món trong order
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->string('product_name');
            $table->string('unit')->default('phần');
            $table->integer('quantity')->default(1);
            $table->decimal('price', 12, 2)->default(0);
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->string('note')->nullable();
            $table->string('status')->default('new_pending'); // sent_kitchen, new_pending, served, cancelled
            $table->boolean('is_auto_added')->default(false);
            $table->dateTime('sent_to_kitchen_at')->nullable();
            $table->timestamps();
        });

        // 8. Phiếu gửi bếp
        Schema::create('kitchen_tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->string('ticket_code')->unique();
            $table->string('table_name');
            $table->longText('items_json');
            $table->dateTime('printed_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kitchen_tickets');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('dining_tables');
        Schema::dropIfExists('areas');
    }
};
