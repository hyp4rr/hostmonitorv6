<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Alert extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_id',
        'type',
        'severity',
        'title',
        'message',
        'status',
        'acknowledged',
        'acknowledged_at',
        'acknowledged_by',
        'resolved',
        'resolved_at',
    ];

    protected $casts = [
        'acknowledged' => 'boolean',
        'resolved' => 'boolean',
        'acknowledged_at' => 'datetime',
        'resolved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }
}
