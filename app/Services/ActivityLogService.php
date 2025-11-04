<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ActivityLogService
{
    /**
     * Log an activity
     */
    public function log(string $action, string $entityType, ?int $entityId = null, ?array $details = null, ?int $branchId = null): void
    {
        try {
            ActivityLog::create([
                'user_id' => Auth::id(),
                'branch_id' => $branchId,
                'action' => $action,
                'entity_type' => $entityType,
                'entity_id' => $entityId,
                'details' => $details ? json_encode($details) : null,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to log activity: " . $e->getMessage());
        }
    }

    /**
     * Log device creation
     */
    public function logDeviceCreated(int $deviceId, string $deviceName, int $branchId): void
    {
        $this->log(
            'created',
            'device',
            $deviceId,
            ['device_name' => $deviceName],
            $branchId
        );
    }

    /**
     * Log device update
     */
    public function logDeviceUpdated(int $deviceId, string $deviceName, array $changes, int $branchId): void
    {
        $this->log(
            'updated',
            'device',
            $deviceId,
            [
                'device_name' => $deviceName,
                'changes' => $changes
            ],
            $branchId
        );
    }

    /**
     * Log device deletion
     */
    public function logDeviceDeleted(int $deviceId, string $deviceName, int $branchId): void
    {
        $this->log(
            'deleted',
            'device',
            $deviceId,
            ['device_name' => $deviceName],
            $branchId
        );
    }

    /**
     * Log location creation
     */
    public function logLocationCreated(int $locationId, string $locationName, int $branchId): void
    {
        $this->log(
            'created',
            'location',
            $locationId,
            ['location_name' => $locationName],
            $branchId
        );
    }

    /**
     * Log location update
     */
    public function logLocationUpdated(int $locationId, string $locationName, array $changes, int $branchId): void
    {
        $this->log(
            'updated',
            'location',
            $locationId,
            [
                'location_name' => $locationName,
                'changes' => $changes
            ],
            $branchId
        );
    }

    /**
     * Log location deletion
     */
    public function logLocationDeleted(int $locationId, string $locationName, int $branchId): void
    {
        $this->log(
            'deleted',
            'location',
            $locationId,
            ['location_name' => $locationName],
            $branchId
        );
    }

    /**
     * Log brand creation
     */
    public function logBrandCreated(int $brandId, string $brandName): void
    {
        $this->log(
            'created',
            'brand',
            $brandId,
            ['brand_name' => $brandName]
        );
    }

    /**
     * Log brand update
     */
    public function logBrandUpdated(int $brandId, string $brandName, array $changes): void
    {
        $this->log(
            'updated',
            'brand',
            $brandId,
            [
                'brand_name' => $brandName,
                'changes' => $changes
            ]
        );
    }

    /**
     * Log brand deletion
     */
    public function logBrandDeleted(int $brandId, string $brandName): void
    {
        $this->log(
            'deleted',
            'brand',
            $brandId,
            ['brand_name' => $brandName]
        );
    }

    /**
     * Log model creation
     */
    public function logModelCreated(int $modelId, string $modelName): void
    {
        $this->log(
            'created',
            'model',
            $modelId,
            ['model_name' => $modelName]
        );
    }

    /**
     * Log model update
     */
    public function logModelUpdated(int $modelId, string $modelName, array $changes): void
    {
        $this->log(
            'updated',
            'model',
            $modelId,
            [
                'model_name' => $modelName,
                'changes' => $changes
            ]
        );
    }

    /**
     * Log model deletion
     */
    public function logModelDeleted(int $modelId, string $modelName): void
    {
        $this->log(
            'deleted',
            'model',
            $modelId,
            ['model_name' => $modelName]
        );
    }

    /**
     * Get recent activities for a branch
     */
    public function getRecentActivities(?int $branchId = null, int $limit = 20): array
    {
        $query = ActivityLog::with('user')
            ->orderBy('created_at', 'desc')
            ->limit($limit);

        if ($branchId) {
            $query->where(function ($q) use ($branchId) {
                $q->where('branch_id', $branchId)
                  ->orWhereNull('branch_id'); // Include global activities (brands, models)
            });
        }

        return $query->get()->map(function ($activity) {
            return [
                'id' => $activity->id,
                'user' => $activity->user ? $activity->user->name : 'System',
                'action' => $activity->action,
                'entity_type' => $activity->entity_type,
                'entity_id' => $activity->entity_id,
                'details' => $activity->details ? json_decode($activity->details, true) : null,
                'created_at' => $activity->created_at->toIso8601String(),
                'time_ago' => $activity->created_at->diffForHumans(),
            ];
        })->toArray();
    }
}
