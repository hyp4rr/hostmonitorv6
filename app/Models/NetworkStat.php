<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NetworkStat extends Model
{
    protected $fillable = [
        'device_id',
        'bytes_in',
        'bytes_out',
        'packets_in',
        'packets_out',
        'errors',
        'latency',
        'recorded_at',
    ];

    protected $casts = [
        'bytes_in' => 'integer',
        'bytes_out' => 'integer',
        'packets_in' => 'integer',
        'packets_out' => 'integer',
        'errors' => 'integer',
        'latency' => 'decimal:2',
        'recorded_at' => 'datetime',
    ];

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }
}
