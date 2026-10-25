<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'code', 'icon', 'sort_order'];

    public function products()
    {
        return $this->hasMany(Product::class, 'category_id')->where('is_active', true);
    }
}
