<?php

namespace App\Jobs;

use App\Models\Device;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class DeviceStatusChangeJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 5;

    /**
     * The number of seconds the job can run before timing out.
     *
     * @var int
     */
    public $timeout = 60;

    /**
     * The device status change data.
     *
     * @var array
     */
    protected $changeData;

    /**
     * Create a new job instance.
     */
    public function __construct(array $changeData)
    {
        $this->changeData = $changeData;
        
        // Set queue name and priority
        $this->onQueue('notifications');
        
        // Set high priority for critical status changes
        if ($this->isCriticalChange()) {
            $this->onQueue('critical_notifications');
        }
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $device = Device::find($this->changeData['device_id']);
            
            if (!$device) {
                Log::warning("Device not found for status change notification", [
                    'device_id' => $this->changeData['device_id']
                ]);
                return;
            }

            Log::info("Processing device status change notification", [
                'device_id' => $device->id,
                'device_name' => $device->name,
                'change' => $this->changeData
            ]);

            // Send notifications to device manager
            $this->notifyDeviceManager($device);

            // Send notifications to admin users for critical changes
            if ($this->isCriticalChange()) {
                $this->notifyAdminUsers($device);
            }

            // Log the status change for analytics
            $this->logStatusChange($device);

            Log::info("Device status change notification completed", [
                'device_id' => $device->id,
                'device_name' => $device->name
            ]);

        } catch (\Exception $e) {
            Log::error("DeviceStatusChangeJob failed", [
                'change_data' => $this->changeData,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Retry with exponential backoff
            if ($this->attempts() < $this->tries) {
                $delay = min(300, 30 * pow(2, $this->attempts() - 1)); // Max 5 minutes
                $this->release($delay);
            }

            throw $e;
        }
    }

    /**
     * Notify the device manager about the status change.
     */
    protected function notifyDeviceManager(Device $device): void
    {
        if (!$device->managed_by) {
            Log::info("No device manager assigned", [
                'device_id' => $device->id,
                'device_name' => $device->name
            ]);
            return;
        }

        $manager = User::find($device->managed_by);
        
        if (!$manager || !$manager->email) {
            Log::warning("Device manager not found or has no email", [
                'device_id' => $device->id,
                'manager_id' => $device->managed_by
            ]);
            return;
        }

        try {
            // Send email notification
            Mail::to($manager->email)->send(new \App\Mail\DeviceStatusChange($device, $this->changeData));
            
            Log::info("Device manager notified", [
                'device_id' => $device->id,
                'manager_email' => $manager->email
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to notify device manager", [
                'device_id' => $device->id,
                'manager_email' => $manager->email,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Notify admin users about critical status changes.
     */
    protected function notifyAdminUsers(Device $device): void
    {
        try {
            $adminUsers = User::where('role', 'admin')
                ->whereNotNull('email')
                ->get();

            foreach ($adminUsers as $admin) {
                Mail::to($admin->email)->send(new \App\Mail\CriticalDeviceAlert($device, $this->changeData));
            }

            Log::info("Admin users notified of critical change", [
                'device_id' => $device->id,
                'admin_count' => $adminUsers->count()
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to notify admin users", [
                'device_id' => $device->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Log the status change for analytics and reporting.
     */
    protected function logStatusChange(Device $device): void
    {
        try {
            \App\Models\DeviceStatusChange::create([
                'device_id' => $device->id,
                'previous_status' => $this->changeData['previous_status'],
                'new_status' => $this->changeData['new_status'],
                'change_time' => $this->changeData['timestamp'],
                'notification_sent' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to log status change", [
                'device_id' => $device->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Determine if this is a critical status change.
     */
    protected function isCriticalChange(): bool
    {
        // Critical changes: online -> offline, or multiple consecutive failures
        return $this->changeData['previous_status'] === 'online' 
               && $this->changeData['new_status'] === 'offline';
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("DeviceStatusChangeJob failed permanently", [
            'change_data' => $this->changeData,
            'attempts' => $this->attempts(),
            'error' => $exception->getMessage()
        ]);
    }

    /**
     * Get the unique ID for the job.
     */
    public function uniqueId(): string
    {
        return 'device_status_change_' . $this->changeData['device_id'] . '_' . 
               ($this->changeData['timestamp'] ?? time());
    }

    /**
     * Get the tags for the job.
     */
    public function tags(): array
    {
        return [
            'device_status_change',
            'device:' . $this->changeData['device_id'],
            'status:' . $this->changeData['new_status'],
            'critical:' . ($this->isCriticalChange() ? 'yes' : 'no')
        ];
    }
}
