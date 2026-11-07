<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'type', // order_discount, percent, fixed_amount, buy_get, fixed_price
        'discount_value',
        'min_order',
        'from_date',
        'to_date',
        'is_active',
        'budget_used'
    ];

    protected $casts = [
        'discount_value' => 'float',
        'min_order' => 'float',
        'budget_used' => 'float',
        'is_active' => 'boolean'
    ];

    public function orders()
    {
        return $this->hasMany(Order::class, 'promotion_id');
    }
}
