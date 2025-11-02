<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ImportSwitches extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'switches:import';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import all switches from raw data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Importing switches...');
        
        \App\Models\NetworkSwitch::truncate();
        
        $switches = $this->getAllSwitchesData();
        
        $this->info('Total parsed: ' . count($switches));
        
        foreach ($switches as $switch) {
            \App\Models\NetworkSwitch::create($switch);
        }
        
        $this->info('Successfully imported ' . count($switches) . ' switches!');
        
        return 0;
    }
    
    private function getAllSwitchesData()
    {
        // Read from file
        $filePath = storage_path('app/switches_full.txt');
        $rawData = file_get_contents($filePath);
        
        $switches = [];
        $currentLocation = '';
        $lines = explode("\n", $rawData);
        
        $skipped = [];
        
        foreach ($lines as $lineNum => $line) {
            $line = trim($line);
            if (empty($line)) continue;
            
            // Check if it's a location header
            if (strpos($line, ':') === false && (strpos($line, 'MC ') === 0 || strpos($line, 'PUMAS') === 0 || strpos($line, 'NDC') === 0)) {
                $currentLocation = $line;
                continue;
            }
            
            // Parse switch data
            if (preg_match('/^(.+?):\s*(\d+\.\d+\.\d+\.\d+)(.*)$/', $line, $matches)) {
                $name = trim($matches[1]);
                $ip = trim($matches[2]);
                $note = trim($matches[3]);
                
                $status = (strpos($note, 'ACK - No answer') !== false || strpos($note, 'No answer') !== false) 
                    ? 'offline' : 'online';
                
                $switches[] = [
                    'name' => $name,
                    'ip_address' => $ip,
                    'location' => $currentLocation,
                    'status' => $status,
                    'uptime_days' => $status === 'offline' ? 0 : rand(30, 150),
                    'uptime_hours' => $status === 'offline' ? 0 : rand(0, 23),
                ];
            } elseif (strpos($line, ':') !== false) {
                $skipped[] = "Line $lineNum: $line";
            }
        }
        
        if (!empty($skipped)) {
            file_put_contents(storage_path('logs/skipped_switches.log'), implode("\n", $skipped));
        }
        
        return $switches;
    }
}
