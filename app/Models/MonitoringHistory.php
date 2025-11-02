<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MonitoringHistory extends Model
{
    protected $table = 'monitoring_history';
    
    protected $fillable = [
        'device_id',
        'status',
        'response_time',
        'checked_at',
        'error_message',
    ];

    protected $casts = [
        'checked_at' => 'datetime',
    ];

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }
}