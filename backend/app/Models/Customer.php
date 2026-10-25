<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'membership_tier',
        'discount_percent'
    ];

    protected $casts = [
        'discount_percent' => 'float',
    ];

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
