<?php

namespace App\Jobs;

use App\Services\EnterprisePingService;
use App\Models\Device;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class MonitorDevicesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * The number of seconds the job can run before timing out.
     *
     * @var int
     */
    public $timeout = 300;

    /**
     * The batch number for this job.
     *
     * @var int
     */
    protected $batchNumber;

    /**
     * The batch size for processing.
     *
     * @var int
     */
    protected $batchSize;

    /**
     * Create a new job instance.
     */
    public function __construct(int $batchNumber, int $batchSize)
    {
        $this->batchNumber = $batchNumber;
        $this->batchSize = $batchSize;
        
        // Set queue name based on priority
        $this->onQueue('monitoring');
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $startTime = microtime(true);
            
            Log::info("Processing monitoring batch", [
                'batch_number' => $this->batchNumber,
                'batch_size' => $this->batchSize,
                'job_id' => $this->job->getJobId()
            ]);

            // Get devices for this batch, excluding offline acknowledged devices
            $devices = Device::where('is_active', true)
                ->where('status', '!=', 'offline_ack')
                ->orderBy('id')
                ->skip($this->batchNumber * $this->batchSize)
                ->take($this->batchSize)
                ->get();

            if ($devices->isEmpty()) {
                Log::info("No devices found for batch", [
                    'batch_number' => $this->batchNumber
                ]);
                return;
            }

            // Process devices using enterprise ping service
            $pingService = new EnterprisePingService();
            $results = [];

            foreach ($devices as $device) {
                $result = $pingService->executeOptimizedPing($device);
                $results[] = $result;
            }

            // Update device statuses in batch
            $pingService->updateDeviceStatusesBatch($results);

            // Store monitoring history in batch
            $pingService->storeMonitoringHistoryBatch($results);

            $duration = round((microtime(true) - $startTime) * 1000, 2);

            Log::info("Monitoring batch completed", [
                'batch_number' => $this->batchNumber,
                'devices_processed' => $devices->count(),
                'duration' => $duration,
                'devices_per_second' => round($devices->count() / ($duration / 1000), 2)
            ]);

        } catch (\Exception $e) {
            Log::error("MonitorDevicesJob failed", [
                'batch_number' => $this->batchNumber,
                'batch_size' => $this->batchSize,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Release the job back to the queue if it's not the last attempt
            if ($this->attempts() < $this->tries) {
                $this->release(30); // Release for 30 seconds
            }

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("MonitorDevicesJob failed permanently", [
            'batch_number' => $this->batchNumber,
            'batch_size' => $this->batchSize,
            'attempts' => $this->attempts(),
            'error' => $exception->getMessage()
        ]);
    }

    /**
     * Get the batch number for this job.
     */
    public function getBatchNumber(): int
    {
        return $this->batchNumber;
    }

    /**
     * Get the batch size for this job.
     */
    public function getBatchSize(): int
    {
        return $this->batchSize;
    }

    /**
     * Get the unique ID for the job.
     */
    public function uniqueId(): string
    {
        return 'monitor_devices_batch_' . $this->batchNumber;
    }
}
