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
        'managed_by',
        'serial_number',
        'category',
        'status',
        'building',
        'is_active',
        'uptime_percentage',
        'uptime_minutes',
        'response_time',
        'last_ping',
        'offline_reason',
        'offline_acknowledged_by',
        'offline_acknowledged_at',
        'offline_since',
        'offline_duration_minutes',
        'offline_alert_sent',
        'last_status_change',
        'previous_status',
        'last_notification_sent',
        'daily_digest_sent',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'uptime_percentage' => 'decimal:2',
        'response_time' => 'decimal:2',
        'last_ping' => 'datetime',
        'offline_acknowledged_at' => 'datetime',
        'offline_since' => 'datetime',
        'offline_alert_sent' => 'boolean',
        'last_status_change' => 'datetime',
        'last_notification_sent' => 'datetime',
        'daily_digest_sent' => 'boolean',
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

    public function managedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'managed_by');
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class);
    }

    public function monitoringHistory(): HasMany
    {
        return $this->hasMany(MonitoringHistory::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(DeviceComment::class)->orderBy('created_at', 'desc');
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

    /**
     * Update device status and track state changes
     */
    public function updateStatus($newStatus)
    {
        if ($this->status !== $newStatus) {
            $this->previous_status = $this->status;
            $this->status = $newStatus;
            $this->last_status_change = now();
            
            // Reset notification flags when status changes
            if ($newStatus === 'online') {
                $this->offline_alert_sent = false;
                $this->daily_digest_sent = false;
            }
            
            $this->save();
        }
    }

    /**
     * Check if device has been offline for more than 5 minutes
     */
    public function isOfflineForMoreThan($minutes)
    {
        if ($this->status !== 'offline') {
            return false;
        }
        
        $offlineSince = $this->offline_since ?: $this->last_status_change ?: $this->updated_at;
        return $offlineSince->diffInMinutes(now()) >= $minutes;
    }

    /**
     * Check if notification should be sent (prevents duplicates)
     */
    public function shouldSendNotification()
    {
        if ($this->status !== 'offline') {
            return false;
        }
        
        // If never sent notification, send one
        if (!$this->last_notification_sent) {
            return true;
        }
        
        // If device came back online and went offline again after last notification
        if ($this->previous_status === 'online' && $this->last_status_change->gt($this->last_notification_sent)) {
            return true;
        }
        
        return false;
    }

    /**
     * Mark notification as sent
     */
    public function markNotificationSent()
    {
        $this->last_notification_sent = now();
        $this->offline_alert_sent = true;
        $this->save();
    }

    /**
     * Reset daily digest flag (for 9am reset)
     */
    public function resetDailyDigest()
    {
        $this->daily_digest_sent = false;
        $this->save();
    }
}