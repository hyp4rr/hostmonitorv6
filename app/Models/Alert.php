<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Alert extends Model
{
    protected $fillable = [
        'device_id',
        'severity',
        'category',
        'triggered_at',
        'acknowledged',
        'acknowledged_by',
        'reason',
        'acknowledged_at',
        'downtime',
    ];

    protected $casts = [
        'acknowledged' => 'boolean',
        'triggered_at' => 'datetime',
        'acknowledged_at' => 'datetime',
    ];

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }

    public function getDeviceNameAttribute(): string
    {
        return $this->device->name;
    }

    public function getDeviceIpAttribute(): string
    {
        return $this->device->ip_address;
    }
}