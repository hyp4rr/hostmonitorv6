<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\MonitoringHistory;
use Carbon\Carbon;

class CleanupMonitoringHistory extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'monitoring:cleanup {--days=90 : Number of days to keep}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up old monitoring history records (default: keep last 90 days)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = $this->option('days');
        $cutoffDate = Carbon::now()->subDays($days);
        
        $this->info("Cleaning up monitoring history older than {$days} days...");
        $this->info("Cutoff date: {$cutoffDate->toDateTimeString()}");
        
        // Count records to be deleted
        $count = MonitoringHistory::where('checked_at', '<', $cutoffDate)->count();
        
        if ($count === 0) {
            $this->info('No records to delete.');
            return 0;
        }
        
        $this->warn("Found {$count} records to delete.");
        
        if (!$this->confirm('Do you want to proceed?', true)) {
            $this->info('Operation cancelled.');
            return 0;
        }
        
        // Delete old records
        $deleted = MonitoringHistory::where('checked_at', '<', $cutoffDate)->delete();
        
        $this->info("Successfully deleted {$deleted} monitoring history records.");
        $this->info("Remaining records: " . MonitoringHistory::count());
        
        return 0;
    }
}
