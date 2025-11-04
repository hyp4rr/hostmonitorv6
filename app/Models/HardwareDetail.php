<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HardwareDetail extends Model
{
    use HasFactory;

    protected $fillable = ['brand_id', 'model_id'];

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function hardwareModel()
    {
        return $this->belongsTo(HardwareModel::class, 'model_id');
    }

    public function devices()
    {
        return $this->hasMany(Device::class, 'hardware_detail_id');
    }
}