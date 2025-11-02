<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NetworkSwitch extends Model
{
    protected $table = 'switches';

    protected $fillable = [
        'name',
        'ip_address',
        'location',
        'brand',
        'status',
        'uptime_days',
        'uptime_hours',
    ];

    protected $casts = [
        'uptime_days' => 'integer',
        'uptime_hours' => 'integer',
    ];

    public function getUptimeAttribute(): string
    {
        return "{$this->uptime_days}d {$this->uptime_hours}h";
    }
}
