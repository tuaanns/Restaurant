<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('promotions')) {
            Schema::create('promotions', function (Blueprint $table) {
                $table->id();
                $table->string('code')->unique();
                $table->string('name');
                $table->string('type')->default('order_discount'); // order_discount, percent, fixed_amount, buy_get, fixed_price
                $table->decimal('discount_value', 12, 2)->default(0);
                $table->decimal('min_order', 12, 2)->default(0);
                $table->string('from_date')->nullable();
                $table->string('to_date')->nullable();
                $table->boolean('is_active')->default(true);
                $table->decimal('budget_used', 12, 2)->default(0);
                $table->timestamps();
            });
        }

        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table) {
                if (!Schema::hasColumn('orders', 'promotion_id')) {
                    $table->foreignId('promotion_id')->nullable()->constrained('promotions')->nullOnDelete();
                }
                if (!Schema::hasColumn('orders', 'promotion_code')) {
                    $table->string('promotion_code')->nullable();
                }
                if (!Schema::hasColumn('orders', 'promotion_name')) {
                    $table->string('promotion_name')->nullable();
                }
                if (!Schema::hasColumn('orders', 'promotion_discount_amount')) {
                    $table->decimal('promotion_discount_amount', 12, 2)->default(0);
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table) {
                if (Schema::hasColumn('orders', 'promotion_id')) {
                    $table->dropForeign(['promotion_id']);
                    $table->dropColumn('promotion_id');
                }
                if (Schema::hasColumn('orders', 'promotion_code')) {
                    $table->dropColumn('promotion_code');
                }
                if (Schema::hasColumn('orders', 'promotion_name')) {
                    $table->dropColumn('promotion_name');
                }
                if (Schema::hasColumn('orders', 'promotion_discount_amount')) {
                    $table->dropColumn('promotion_discount_amount');
                }
            });
        }

        Schema::dropIfExists('promotions');
    }
};
