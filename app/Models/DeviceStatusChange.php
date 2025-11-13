<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeviceStatusChange extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'device_id',
        'previous_status',
        'new_status',
        'change_time',
        'notification_sent',
        'acknowledged',
        'acknowledged_by',
        'acknowledged_at',
        'resolved',
        'resolved_at',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'change_time' => 'datetime',
        'notification_sent' => 'boolean',
        'acknowledged' => 'boolean',
        'acknowledged_at' => 'datetime',
        'resolved' => 'boolean',
        'resolved_at' => 'datetime',
    ];

    /**
     * Get the device that owns the status change.
     */
    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }

    /**
     * Get the user who acknowledged the status change.
     */
    public function acknowledgedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'acknowledged_by');
    }

    /**
     * Scope a query to only include critical changes.
     */
    public function scopeCritical($query)
    {
        return $query->where('previous_status', 'online')
                    ->where('new_status', 'offline');
    }

    /**
     * Scope a query to only include unacknowledged changes.
     */
    public function scopeUnacknowledged($query)
    {
        return $query->where('acknowledged', false);
    }

    /**
     * Scope a query to only include unresolved changes.
     */
    public function scopeUnresolved($query)
    {
        return $query->where('resolved', false);
    }

    /**
     * Scope a query for changes within a time period.
     */
    public function scopeWithinPeriod($query, $hours)
    {
        return $query->where('change_time', '>=', now()->subHours($hours));
    }

    /**
     * Check if this is a critical status change.
     */
    public function isCritical(): bool
    {
        return $this->previous_status === 'online' && $this->new_status === 'offline';
    }

    /**
     * Check if this status change is still unresolved.
     */
    public function isUnresolved(): bool
    {
        return !$this->resolved && ($this->new_status === 'offline' || $this->new_status === 'down');
    }

    /**
     * Acknowledge the status change.
     */
    public function acknowledge(int $userId, ?string $notes = null): void
    {
        $this->update([
            'acknowledged' => true,
            'acknowledged_by' => $userId,
            'acknowledged_at' => now(),
            'notes' => $notes,
        ]);
    }

    /**
     * Resolve the status change.
     */
    public function resolve(): void
    {
        $this->update([
            'resolved' => true,
            'resolved_at' => now(),
        ]);
    }

    /**
     * Get the duration of the status change in minutes.
     */
    public function getDurationInMinutes(): int
    {
        $endTime = $this->resolved_at ?? now();
        return $this->change_time->diffInMinutes($endTime);
    }

    /**
     * Get human-readable duration.
     */
    public function getHumanDuration(): string
    {
        $minutes = $this->getDurationInMinutes();
        
        if ($minutes < 60) {
            return "{$minutes} minutes";
        }
        
        $hours = floor($minutes / 60);
        $remainingMinutes = $minutes % 60;
        
        if ($remainingMinutes === 0) {
            return "{$hours} " . str('hour')->plural($hours);
        }
        
        return "{$hours} " . str('hour')->plural($hours) . " {$remainingMinutes} minutes";
    }
}
