<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Device extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_id',
        'location_id',
        'hardware_detail_id',
        'name',
        'ip_address',
        'mac_address',
        'barcode',
        'category',
        'status',
        'building',
        'is_active',
        'uptime_percentage',
        'response_time',
        'last_ping',
        'offline_reason',
        'offline_acknowledged_by',
        'offline_acknowledged_at',
        'offline_since',
        'offline_duration_minutes',
        'offline_alert_sent',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'uptime_percentage' => 'decimal:2',
        'response_time' => 'decimal:2',
        'last_ping' => 'datetime',
        'offline_acknowledged_at' => 'datetime',
        'offline_since' => 'datetime',
        'offline_alert_sent' => 'boolean',
    ];

    protected $appends = ['brand', 'model'];

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
        return $this->belongsTo(HardwareDetail::class, 'hardware_detail_id');
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class);
    }

    public function monitoringHistory(): HasMany
    {
        return $this->hasMany(MonitoringHistory::class);
    }

    // Virtual attributes for backward compatibility
    public function getBrandAttribute()
    {
        return $this->hardwareDetail?->brand?->name ?? '';
    }

    public function getModelAttribute()
    {
        return $this->hardwareDetail?->hardwareModel?->name ?? '';
    }
}