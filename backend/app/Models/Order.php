<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_code',
        'table_id',
        'customer_id',
        'promotion_id',
        'promotion_code',
        'promotion_name',
        'promotion_discount_amount',
        'cashier_name',
        'shift',
        'order_type',
        'subtotal',
        'discount_percent',
        'discount_amount',
        'vat_percent',
        'vat_amount',
        'total_amount',
        'status',
        'payment_method',
        'paid_amount',
        'change_amount',
        'printed_prebill_at',
        'paid_at'
    ];

    protected $casts = [
        'subtotal' => 'float',
        'discount_percent' => 'float',
        'discount_amount' => 'float',
        'promotion_discount_amount' => 'float',
        'vat_percent' => 'float',
        'vat_amount' => 'float',
        'total_amount' => 'float',
        'paid_amount' => 'float',
        'change_amount' => 'float',
        'printed_prebill_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    protected $appends = ['created_time'];

    public function getCreatedTimeAttribute()
    {
        return $this->created_at ? $this->created_at->timezone('Asia/Ho_Chi_Minh')->format('H:i') : null;
    }

    public function table()
    {
        return $this->belongsTo(DiningTable::class, 'table_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function promotion()
    {
        return $this->belongsTo(Promotion::class, 'promotion_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    public function kitchenTickets()
    {
        return $this->hasMany(KitchenTicket::class, 'order_id');
    }

    public function recalculateTotals(): void
    {
        $subtotal = (float)$this->items()->sum('subtotal');
        
        // 1. Giảm giá Hội viên (tính theo % chiết khấu của khách)
        $memberDiscountAmount = round($subtotal * (((float)$this->discount_percent) / 100));
        
        // 2. Giảm giá từ Chương trình Khuyến Mãi (CTKM)
        $promoDiscountAmount = 0;
        if ($this->promotion_id) {
            $promo = $this->promotion;
            if ($promo && $promo->is_active) {
                // Kiểm tra điều kiện đơn tối thiểu
                if ($subtotal >= (float)$promo->min_order) {
                    if ($promo->type === 'order_discount' || $promo->type === 'percent') {
                        $promoDiscountAmount = round($subtotal * (((float)$promo->discount_value) / 100));
                    } elseif ($promo->type === 'fixed_amount' || $promo->type === 'fixed_price') {
                        $promoDiscountAmount = round(min($subtotal, (float)$promo->discount_value));
                    }
                }
            }
        }

        $totalDiscountAmount = min($subtotal, $memberDiscountAmount + $promoDiscountAmount);
        $taxableAmount = max(0, $subtotal - $totalDiscountAmount);
        $vatAmount = round($taxableAmount * (((float)$this->vat_percent) / 100));
        $totalAmount = round($taxableAmount + $vatAmount);

        $this->update([
            'subtotal' => $subtotal,
            'discount_amount' => $totalDiscountAmount,
            'promotion_discount_amount' => $promoDiscountAmount,
            'vat_amount' => $vatAmount,
            'total_amount' => $totalAmount,
        ]);
    }
}
