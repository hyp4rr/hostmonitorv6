<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Device extends Model
{
    protected $fillable = [
        'branch_id',
        'name',
        'ip_address',
        'mac_address',
        'barcode',
        'type',
        'category',
        'status',
        'location',
        'building',
        'manufacturer',
        'model',
        'priority',
        'uptime_percentage',
        'response_time',
        'is_monitored',
        'is_active',
        'last_check',
        'offline_reason',
        'offline_acknowledged_by',
        'offline_acknowledged_at',
        'latitude',
        'longitude',
    ];

    protected $casts = [
        'is_monitored' => 'boolean',
        'is_active' => 'boolean',
        'uptime_percentage' => 'decimal:2',
        'last_check' => 'datetime',
        'offline_acknowledged_at' => 'datetime',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class);
    }
}