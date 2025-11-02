<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends Model
{
    protected $fillable = [
        'name',
        'code',
        'description',
        'address',
        'latitude',
        'longitude',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    public function devices(): HasMany
    {
        return $this->hasMany(Device::class);
    }

    public function getDeviceCountAttribute(): int
    {
        return $this->devices()->count();
    }

    public function getLocationsAttribute(): array
    {
        return $this->devices()->pluck('location')->unique()->values()->toArray();
    }
}