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
        $this->save();
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
                return $this->status === 'online' ? 100 : 0;
            }

            $onlineChecks = $this->monitoringHistory()
                ->where('checked_at', '>=', $startDate)
                ->where('status', 'online')
                ->count();

            $percentage = round((float) (($onlineChecks / $totalChecks) * 100), 2);
            
            // Update the device with calculated percentage
            $this->uptime_percentage = $percentage;
            $this->save();
            
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
        
        // Ensure online_since is set if device is online but doesn't have it
        if ($this->status === 'online' && !$this->online_since) {
            // Device is online but online_since is not set - set it now
            $this->online_since = $now;
            $this->offline_since = null;
        } elseif ($this->status === 'offline' && $this->online_since) {
            // Device went offline - clear online_since
            $this->online_since = null;
            if (!$this->offline_since) {
                $this->offline_since = $now;
            }
        }
        
        // Calculate real uptime minutes from monitoring history (last 24 hours)
        $this->uptime_minutes = $this->calculateRealUptimeMinutes();
        
        // Recalculate percentage
        $this->uptime_percentage = round((float) $this->getCalculatedUptimePercentage(), 2);
        $this->save();
    }
    
    /**
     * Calculate real uptime minutes from monitoring history (last 24 hours)
     */
    public function calculateRealUptimeMinutes(): int
    {
        $startDate = now()->subHours(24);
        
        // Get monitoring history for last 24 hours, ordered by time
        $history = $this->monitoringHistory()
            ->where('checked_at', '>=', $startDate)
            ->orderBy('checked_at', 'asc')
            ->get();
        
        // If device is currently online and has online_since, always count that time
        if ($this->status === 'online' && $this->online_since) {
            $onlineSince = $this->online_since;
            // Only count time within the last 24 hours
            if ($onlineSince->lt($startDate)) {
                $onlineSince = $startDate;
            }
            $minutesSinceOnline = max(0, $onlineSince->diffInMinutes(now()));
            
            // If we have history, also calculate from history and use the larger value
            if ($history->isNotEmpty()) {
                // Calculate from history
                $totalMinutesFromHistory = 0;
                $lastCheckTime = $startDate;
                $lastStatus = null;
                
                foreach ($history as $check) {
                    $checkTime = $check->checked_at;
                    
                    // If device was online in the previous period, add those minutes
                    if ($lastStatus === 'online') {
                        $minutesBetween = max(0, $lastCheckTime->diffInMinutes($checkTime));
                        $totalMinutesFromHistory += $minutesBetween;
                    }
                    
                    $lastCheckTime = $checkTime;
                    $lastStatus = $check->status;
                }
                
                // If last check was online, add time since then (but don't double-count with online_since)
                if ($lastStatus === 'online' && $lastCheckTime) {
                    // Only add if last check was before online_since (to avoid double counting)
                    if ($lastCheckTime->lt($onlineSince)) {
                        $minutesFromLastCheck = max(0, $lastCheckTime->diffInMinutes($onlineSince));
                        $totalMinutesFromHistory += $minutesFromLastCheck;
                    }
                }
                
                // Use the sum of history + current online time
                return min(1440, (int) ($totalMinutesFromHistory + $minutesSinceOnline));
            } else {
                // No history - just use online_since
                return min(1440, (int) $minutesSinceOnline);
            }
        }
        
        // Device is offline or no online_since - calculate from history only
        if ($history->isEmpty()) {
            return 0;
        }
        
        // Calculate total minutes online from history
        $totalMinutes = 0;
        $lastCheckTime = $startDate;
        $lastStatus = null;
        
        foreach ($history as $check) {
            $checkTime = $check->checked_at;
            
            // If device was online in the previous period, add those minutes
            if ($lastStatus === 'online') {
                $minutesBetween = max(0, $lastCheckTime->diffInMinutes($checkTime));
                $totalMinutes += $minutesBetween;
            }
            
            $lastCheckTime = $checkTime;
            $lastStatus = $check->status;
        }
        
        // If device is currently online (but no online_since somehow), add time since last check
        if ($this->status === 'online' && $lastStatus === 'online' && $lastCheckTime) {
            $minutesSinceLastCheck = max(0, $lastCheckTime->diffInMinutes(now()));
            $totalMinutes += $minutesSinceLastCheck;
        }
        
        // Cap at 24 hours (1440 minutes)
        return min(1440, (int) $totalMinutes);
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