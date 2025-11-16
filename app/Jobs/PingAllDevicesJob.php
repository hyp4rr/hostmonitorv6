<?php

namespace App\Jobs;

use App\Models\Device;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class PingAllDevicesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 1;

    /**
     * The number of seconds the job can run before timing out.
     *
     * @var int
     */
    public $timeout = 60; // 1 minute (just dispatches batch jobs)

    /**
     * Warning threshold in milliseconds (devices responding slower than this will be marked as warning)
     *
     * @var int
     */
    protected $warningThreshold = 1000; // 1 second

    /**
     * Execute the job - dispatches batch jobs for scalable processing
     */
    public function handle(): void
    {
        try {
            $startTime = microtime(true);
            
            // Get all active devices, excluding offline acknowledged devices
            $devices = Device::where('is_active', true)
                ->where('status', '!=', 'offline_ack')
                ->pluck('id');
            
            if ($devices->isEmpty()) {
                Log::info("PingAllDevicesJob: No devices to ping");
                return;
            }

            $deviceCount = $devices->count();
            
            // Optimized for 5000+ devices: Process in batches of 100 devices per job (increased for speed)
            $batchSize = 100;
            $batches = $devices->chunk($batchSize);
            $totalBatches = $batches->count();
            
            Log::info("PingAllDevicesJob: Dispatching {$totalBatches} batch jobs for {$deviceCount} devices");
            
            // Store ping start info in cache
            Cache::put('ping_all_started', [
                'total_devices' => $deviceCount,
                'total_batches' => $totalBatches,
                'started_at' => now()->toISOString(),
            ], 600); // 10 minutes
            
            // Dispatch batch jobs immediately (no delay for maximum speed)
            foreach ($batches as $batchIndex => $batch) {
                PingDeviceBatchJob::dispatch($batch->toArray(), $this->warningThreshold)
                    ->onQueue('ping');
                    // Removed delay for faster processing
            }
            
            $duration = round((microtime(true) - $startTime) * 1000, 2);
            
            Log::info("PingAllDevicesJob: Dispatched {$totalBatches} batch jobs in {$duration}ms");
            
        } catch (\Exception $e) {
            Log::error("PingAllDevicesJob failed: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }
    
    /**
     * Set warning threshold
     */
    public function setWarningThreshold(int $threshold): self
    {
        $this->warningThreshold = $threshold;
        return $this;
    }
}

