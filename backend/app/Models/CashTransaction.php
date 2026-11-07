<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'type', // 'receipt' (thu), 'payment' (chi)
        'payment_method', // 'cash' (tiền mặt), 'bank' (tài khoản ngân hàng)
        'category',
        'amount',
        'invoice_ref',
        'target_type',
        'target_name',
        'target_phone',
        'description',
        'is_business_result',
        'transacted_at',
        'created_by',
        'branch_name',
    ];

    protected $casts = [
        'amount' => 'float',
        'is_business_result' => 'boolean',
        'transacted_at' => 'datetime',
    ];

    protected $appends = [
        'transacted_time',
        'transacted_date_str',
    ];

    public function getTransactedTimeAttribute()
    {
        return $this->transacted_at ? $this->transacted_at->timezone('Asia/Ho_Chi_Minh')->format('H:i') : null;
    }

    public function getTransactedDateStrAttribute()
    {
        return $this->transacted_at ? $this->transacted_at->timezone('Asia/Ho_Chi_Minh')->format('d/m/Y H:i') : null;
    }
}
