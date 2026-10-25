<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'code',
        'price',
        'unit',
        'description',
        'image_url',
        'is_active',
        'is_popular'
    ];

    protected $casts = [
        'price' => 'float',
        'is_active' => 'boolean',
        'is_popular' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
