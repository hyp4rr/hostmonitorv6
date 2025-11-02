<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Device extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'ip_address',
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
    ];

    protected $casts = [
        'is_monitored' => 'boolean',
        'is_active' => 'boolean',
        'uptime_percentage' => 'decimal:2',
        'last_check' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class);
    }

    public function monitoringHistory(): HasMany
    {
        return $this->hasMany(MonitoringHistory::class);
    }

    public function latestHistory()
    {
        return $this->hasOne(MonitoringHistory::class)->latestOfMany('checked_at');
    }
}
