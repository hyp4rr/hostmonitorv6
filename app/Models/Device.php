<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Device extends Model
{
    protected $fillable = [
        'branch_id',
        'location_id',
        'hardware_detail_id',
        'name',
        'ip_address',
        'mac_address',
        'barcode',
        'type',
        'category',
        'status',
        'building',
        'uptime_percentage',
        'is_active',
        'response_time',
        'last_check',
        'offline_reason',
        'latitude',
        'longitude',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'uptime_percentage' => 'decimal:2',
        'response_time' => 'integer',
        'last_ping' => 'datetime',
        'offline_acknowledged_at' => 'datetime',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function hardwareDetail(): BelongsTo
    {
        return $this->belongsTo(HardwareDetail::class);
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class);
    }

    public function monitoringHistory(): HasMany
    {
        return $this->hasMany(MonitoringHistory::class);
    }
}