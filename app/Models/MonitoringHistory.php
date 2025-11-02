<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MonitoringHistory extends Model
{
    use HasFactory;

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
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}
