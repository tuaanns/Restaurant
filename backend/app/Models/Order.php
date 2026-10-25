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
        'vat_percent' => 'float',
        'vat_amount' => 'float',
        'total_amount' => 'float',
        'paid_amount' => 'float',
        'change_amount' => 'float',
        'printed_prebill_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    public function table()
    {
        return $this->belongsTo(DiningTable::class, 'table_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
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
        $subtotal = $this->items()->sum('subtotal');
        $discountAmount = ($subtotal * ($this->discount_percent / 100));
        $taxableAmount = $subtotal - $discountAmount;
        $vatAmount = ($taxableAmount * ($this->vat_percent / 100));
        $totalAmount = $taxableAmount + $vatAmount;

        $this->update([
            'subtotal' => $subtotal,
            'discount_amount' => round($discountAmount),
            'vat_amount' => round($vatAmount),
            'total_amount' => round($totalAmount),
        ]);
    }
}
