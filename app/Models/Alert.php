<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Alert extends Model
{
    protected $fillable = [
        'device_id',
        'type',
        'severity',
        'category',
        'title',
        'message',
        'status',
        'acknowledged',
        'triggered_at',
        'acknowledged_at',
        'acknowledged_by',
        'reason',
        'downtime',
        'resolved',
        'resolved_at',
    ];

    protected $casts = [
        'acknowledged' => 'boolean',
        'resolved' => 'boolean',
        'triggered_at' => 'datetime',
        'acknowledged_at' => 'datetime',
        'resolved_at' => 'datetime',
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