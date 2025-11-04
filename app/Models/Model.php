<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model as BaseModel;

class Model extends BaseModel
{
    use HasFactory;

    protected $table = 'hardware_models';
    
    protected $fillable = ['brand_id', 'name', 'description'];

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }
}