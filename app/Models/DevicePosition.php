<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DevicePosition extends Model
{
    protected $fillable = [
        'device_id',
        'floor_id',
        'x',
        'y',
        'marker_type',
    ];

    protected $casts = [
        'x' => 'float',
        'y' => 'float',
    ];

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }

    public function floor(): BelongsTo
    {
        return $this->belongsTo(Floor::class);
    }
}


