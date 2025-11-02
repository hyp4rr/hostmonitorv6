<?php

namespace App\Jobs;

use App\Models\NetworkSwitch;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;

class PingSwitch implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public NetworkSwitch $switch
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $isOnline = $this->pingHost($this->switch->ip_address);
        
        $newStatus = $isOnline ? 'online' : 'offline';
        
        if ($this->switch->status !== $newStatus) {
            $this->switch->status = $newStatus;
            $this->switch->save();
            
            // Broadcast status change
            Cache::put("switch_status_{$this->switch->id}", $newStatus, 120);
        }
    }
    
    /**
     * Ping a host to check if it's reachable
     */
    private function pingHost(string $ip): bool
    {
        // Windows ping command: -n 1 (1 packet), -w 1000 (1 second timeout for speed)
        $command = sprintf('ping -n 1 -w 1000 %s 2>&1', escapeshellarg($ip));
        
        exec($command, $output, $returnCode);
        
        // Check both return code and output for "Reply from" or "TTL="
        $outputString = implode(' ', $output);
        $isReachable = ($returnCode === 0) && 
                      (stripos($outputString, 'Reply from') !== false || 
                       stripos($outputString, 'TTL=') !== false);
        
        return $isReachable;
    }
}
