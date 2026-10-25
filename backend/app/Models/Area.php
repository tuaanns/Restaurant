<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Area extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'code', 'sort_order'];

    public function tables()
    {
        return $this->hasMany(DiningTable::class, 'area_id')->orderBy('sort_order');
    }
}
