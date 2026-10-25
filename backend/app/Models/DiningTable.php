<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiningTable extends Model
{
    use HasFactory;

    protected $fillable = [
        'area_id',
        'name',
        'capacity',
        'status',
        'guest_count',
        'started_at',
        'notes',
        'is_takeaway',
        'is_vip',
        'sort_order'
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'is_takeaway' => 'boolean',
        'is_vip' => 'boolean',
    ];

    public function area()
    {
        return $this->belongsTo(Area::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'table_id');
    }

    public function activeOrder()
    {
        return $this->hasOne(Order::class, 'table_id')
            ->whereIn('status', ['active', 'billing'])
            ->latestOfMany();
    }
}
