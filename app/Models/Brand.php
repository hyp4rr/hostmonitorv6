<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model as BaseModel;

class Brand extends BaseModel
{
    use HasFactory;

    protected $fillable = ['name', 'description'];

    public function hardwareModels()
    {
        return $this->hasMany(HardwareModel::class, 'brand_id');
    }
}