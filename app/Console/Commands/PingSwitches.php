<?php

namespace App\Console\Commands;

use App\Models\NetworkSwitch;
use Illuminate\Console\Command;

class PingSwitches extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'switches:ping';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Ping all switches to check their status';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to ping all switches in parallel...');
        
        $switches = NetworkSwitch::all();
        
        // Dispatch all ping jobs simultaneously
        foreach ($switches as $switch) {
            \App\Jobs\PingSwitch::dispatch($switch);
        }
        
        $this->info("Dispatched {$switches->count()} ping jobs!");
        $this->info("Jobs are running in parallel. Status will update in database shortly.");
        $this->info("Run 'php artisan queue:work' to process the jobs.");
        
        return 0;
    }
    
    /**
     * Ping a host to check if it's reachable
     */
    private function pingHost(string $ip): bool
    {
        // Windows ping command: -n 1 (1 packet), -w 2000 (2 second timeout)
        $command = sprintf('ping -n 1 -w 2000 %s 2>&1', escapeshellarg($ip));
        
        exec($command, $output, $returnCode);
        
        // Check both return code and output for "Reply from" or "TTL="
        $outputString = implode(' ', $output);
        $isReachable = ($returnCode === 0) && 
                      (stripos($outputString, 'Reply from') !== false || 
                       stripos($outputString, 'TTL=') !== false);
        
        return $isReachable;
    }
}
