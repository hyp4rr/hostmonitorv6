<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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
        'downtime_percentage',
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
        'online_since',
        'last_notification_sent',
        'daily_digest_sent',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'uptime_percentage' => 'decimal:2',
        'downtime_percentage' => 'decimal:2',
        'response_time' => 'decimal:2',
        'last_ping' => 'datetime',
        'offline_acknowledged_at' => 'datetime',
        'offline_since' => 'datetime',
        'offline_alert_sent' => 'boolean',
        'last_status_change' => 'datetime',
        'online_since' => 'datetime',
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

    public function managers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'device_managers')->withTimestamps();
    }

    public function positions(): HasMany
    {
        return $this->hasMany(\App\Models\DevicePosition::class);
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
            
            // Track online/offline timestamps
            if ($newStatus === 'online') {
                $this->online_since = now();
                $this->offline_since = null;
                $this->offline_alert_sent = false;
                $this->daily_digest_sent = false;
            } elseif ($newStatus === 'offline') {
                $this->offline_since = now();
                $this->online_since = null;
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
        // Disable timestamps to prevent updating updated_at when only resetting digest flag
        $this->timestamps = false;
        $this->save();
        $this->timestamps = true;
    }

    /**
     * Get calculated uptime percentage
     */
    public function getCalculatedUptimePercentage(): float
    {
        // If we already have a calculated uptime percentage, use it
        if ($this->uptime_percentage !== null) {
            return (float) $this->uptime_percentage;
        }

        // Otherwise calculate from monitoring history or current status
        $hasHistory = $this->monitoringHistory()->exists();
        
        if ($hasHistory) {
            $startDate = now()->subHours(24);
            
            $totalChecks = $this->monitoringHistory()
                ->where('checked_at', '>=', $startDate)
                ->count();

            if ($totalChecks === 0) {
                // Use current status
                return $this->status === 'online' ? 100 : 0;
            }

            $onlineChecks = $this->monitoringHistory()
                ->where('checked_at', '>=', $startDate)
                ->where('status', 'online')
                ->count();

            $percentage = round((float) (($onlineChecks / $totalChecks) * 100), 2);
            
            // Update the device with calculated percentage
            // Disable timestamps to prevent updating updated_at when only uptime changes
            $this->uptime_percentage = $percentage;
            $this->timestamps = false;
            $this->save();
            $this->timestamps = true;
            
            return $percentage;
        }

        // Fallback to minutes-based calculation
        $totalMinutes = 24 * 60; // 24 hours in minutes
        $uptimeMinutes = $this->uptime_minutes ?? 0;
        
        return min(100, ($uptimeMinutes / $totalMinutes) * 100);
    }

    /**
     * Update uptime based on current status - calculates REAL minutes
     */
    public function updateUptime()
    {
        $now = now();
        
        // If device is offline, set uptime_minutes to 0 and clear online_since
        if ($this->status === 'offline' || $this->status === 'offline_ack') {
            $this->uptime_minutes = 0;
            $this->online_since = null;
            if (!$this->offline_since) {
                $this->offline_since = $now;
            }
            
            // Still calculate percentage from monitoring history
            $this->uptime_percentage = round((float) $this->getCalculatedUptimePercentage(), 2);
            
            // Disable timestamps to prevent updating updated_at when only uptime changes
            $this->timestamps = false;
            $this->save();
            $this->timestamps = true;
            return;
        }
        
        // Ensure online_since is set if device is online/warning but doesn't have it
        // This handles cases where device was already online when system started
        if (in_array($this->status, ['online', 'warning']) && !$this->online_since) {
            // Device is online but online_since is not set - set it now
            $this->online_since = $now;
            $this->offline_since = null;
        }
        
        // Calculate real uptime minutes (only counts time since online_since, resets on offline)
        $this->uptime_minutes = $this->calculateRealUptimeMinutes();
        
        // Recalculate percentage
        $this->uptime_percentage = round((float) $this->getCalculatedUptimePercentage(), 2);
        
        // Disable timestamps to prevent updating updated_at when only uptime changes
        $this->timestamps = false;
        $this->save();
        $this->timestamps = true;
    }
    
    /**
     * Calculate real uptime minutes - resets to 0 when device goes offline
     * Only counts time since online_since (when device last came online)
     */
    public function calculateRealUptimeMinutes(): int
    {
        // If device is offline, uptime is always 0
        if ($this->status === 'offline' || $this->status === 'offline_ack') {
            return 0;
        }
        
        // If device is online, only count time since online_since (resets on each offline->online transition)
        if ($this->status === 'online' && $this->online_since) {
            $minutesSinceOnline = max(0, $this->online_since->diffInMinutes(now()));
            return min(1440, (int) $minutesSinceOnline); // Cap at 24 hours (1440 minutes)
        }
        
        // If device is warning status, treat similar to online
        if ($this->status === 'warning' && $this->online_since) {
            $minutesSinceOnline = max(0, $this->online_since->diffInMinutes(now()));
            return min(1440, (int) $minutesSinceOnline);
        }
        
        // Fallback: no online_since or unknown status
        return 0;
    }

    /**
     * Get calculated downtime percentage
     */
    public function getCalculatedDowntimePercentage(): float
    {
        // If we already have a calculated downtime percentage, use it
        if ($this->downtime_percentage !== null) {
            return (float) $this->downtime_percentage;
        }

        // Otherwise calculate from monitoring history or current status
        $hasHistory = $this->monitoringHistory()->exists();
        
        if ($hasHistory) {
            $startDate = now()->subHours(24);
            
            $totalChecks = $this->monitoringHistory()
                ->where('checked_at', '>=', $startDate)
                ->count();

            if ($totalChecks === 0) {
                // Use current status
                return in_array($this->status, ['offline', 'offline_ack']) ? 100 : 0;
            }

            $offlineChecks = $this->monitoringHistory()
                ->where('checked_at', '>=', $startDate)
                ->whereIn('status', ['offline', 'offline_ack'])
                ->count();

            $percentage = round((float) (($offlineChecks / $totalChecks) * 100), 2);
            
            // Update the device with calculated percentage
            $this->downtime_percentage = $percentage;
            $this->timestamps = false;
            $this->save();
            $this->timestamps = true;
            
            return $percentage;
        }

        // Fallback to minutes-based calculation
        $totalMinutes = 24 * 60; // 24 hours in minutes
        $downtimeMinutes = $this->offline_duration_minutes ?? 0;
        
        return min(100, ($downtimeMinutes / $totalMinutes) * 100);
    }

    /**
     * Update downtime based on current status - calculates REAL minutes
     */
    public function updateDowntime()
    {
        $now = now();
        
        // If device is online, set downtime_minutes to 0 and clear offline_since
        if (in_array($this->status, ['online', 'warning'])) {
            $this->offline_duration_minutes = 0;
            $this->offline_since = null;
            if (!$this->online_since) {
                $this->online_since = $now;
            }
            
            // Still calculate percentage from monitoring history
            $this->downtime_percentage = round((float) $this->getCalculatedDowntimePercentage(), 2);
            
            // Disable timestamps to prevent updating updated_at when only downtime changes
            $this->timestamps = false;
            $this->save();
            $this->timestamps = true;
            return;
        }
        
        // Ensure offline_since is set if device is offline but doesn't have it
        if (in_array($this->status, ['offline', 'offline_ack']) && !$this->offline_since) {
            // Device is offline but offline_since is not set - set it now
            $this->offline_since = $now;
            $this->online_since = null;
        }
        
        // Calculate real downtime minutes (only counts time since offline_since, resets on online)
        $this->offline_duration_minutes = $this->calculateRealDowntimeMinutes();
        
        // Recalculate percentage
        $this->downtime_percentage = round((float) $this->getCalculatedDowntimePercentage(), 2);
        
        // Disable timestamps to prevent updating updated_at when only downtime changes
        $this->timestamps = false;
        $this->save();
        $this->timestamps = true;
    }
    
    /**
     * Calculate real downtime minutes - resets to 0 when device goes online
     * Only counts time since offline_since (when device last went offline)
     */
    public function calculateRealDowntimeMinutes(): float
    {
        // If device is online, downtime is always 0
        if (in_array($this->status, ['online', 'warning'])) {
            return 0;
        }
        
        // If device is offline, only count time since offline_since (resets on each online->offline transition)
        if (in_array($this->status, ['offline', 'offline_ack']) && $this->offline_since) {
            $minutesSinceOffline = max(0, $this->offline_since->diffInMinutes(now()));
            return min(1440, (float) $minutesSinceOffline); // Cap at 24 hours (1440 minutes)
        }
        
        // Fallback: no offline_since or unknown status
        return 0;
    }

    /**
     * Record monitoring history
     */
    public function recordMonitoringHistory()
    {
        MonitoringHistory::create([
            'device_id' => $this->id,
            'status' => $this->status,
            'response_time' => $this->response_time,
            'checked_at' => now(),
        ]);
    }
}