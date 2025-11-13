<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Testing ping timeout issues...\n";

// Test the current FastPingService settings
$pingService = new \App\Services\FastPingService();
echo "Current timeout: 1 second\n";
echo "Max concurrent: 20 devices\n\n";

// Test a few devices with different timeout values
$testDevices = \App\Models\Device::where('is_active', true)
    ->whereIn('category', ['switch', 'tas'])
    ->take(5)
    ->get();

echo "Testing with 1 second timeout (current setting):\n";
foreach ($testDevices as $device) {
    $startTime = microtime(true);
    $pingResult = $pingService->pingSingle($device->id);
    $duration = round((microtime(true) - $startTime) * 1000, 2);
    
    $status = $pingResult['status'] === 'online' ? '✅ Online' : '❌ Offline';
    echo "- {$device->name} ({$device->ip_address}): {$status} ({$pingResult['response_time']}ms, took {$duration}ms total)\n";
}

// Now let's test with a longer timeout by creating a custom ping
echo "\n\nTesting with 3 second timeout (recommended):\n";

foreach ($testDevices as $device) {
    $startTime = microtime(true);
    
    // Manual ping with 3 second timeout
    if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
        $cmd = "ping -n 1 -w 3000 {$device->ip_address}";
    } else {
        $cmd = "ping -c 1 -W 3 {$device->ip_address}";
    }
    
    $output = [];
    $returnCode = 0;
    exec($cmd . ' 2>&1', $output, $returnCode);
    
    $duration = round((microtime(true) - $startTime) * 1000, 2);
    
    if ($returnCode === 0) {
        // Parse response time from output
        $responseTime = "N/A";
        foreach ($output as $line) {
            if (preg_match('/time[=<](\d+)ms/', $line, $matches)) {
                $responseTime = $matches[1] . 'ms';
                break;
            }
        }
        echo "- {$device->name} ({$device->ip_address}): ✅ Online ({$responseTime}, took {$duration}ms total)\n";
    } else {
        echo "- {$device->name} ({$device->ip_address}): ❌ Offline (took {$duration}ms total)\n";
    }
}

echo "\nAnalysis complete. If devices show as online with 3s timeout but offline with 1s timeout, the timeout is too aggressive.\n";
