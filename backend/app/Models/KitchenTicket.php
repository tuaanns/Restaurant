<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KitchenTicket extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'ticket_code',
        'table_name',
        'items_json',
        'printed_at'
    ];

    protected $casts = [
        'printed_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }
}
