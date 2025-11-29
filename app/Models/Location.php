<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_id',
        'location_folder_id',
        'name',
        'main_block',
        'description',
        'latitude',
        'longitude',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function locationFolder()
    {
        return $this->belongsTo(LocationFolder::class);
    }

    public function devices()
    {
        return $this->hasMany(Device::class);
    }
}