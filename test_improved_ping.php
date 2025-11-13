<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Testing improved ping service...\n";

// Test the improved FastPingService
$pingService = new \App\Services\FastPingService();
echo "Improved timeout: 3 seconds\n";
echo "Reduced concurrent: 15 devices\n";
echo "Added delay between batches\n\n";

// Test a sample of devices to see the improvement
$testDevices = \App\Models\Device::where('is_active', true)
    ->take(10)
    ->get();

echo "Testing sample of 10 devices with improved service:\n";
$onlineCount = 0;
$offlineCount = 0;

foreach ($testDevices as $device) {
    $startTime = microtime(true);
    $pingResult = $pingService->pingSingle($device->id);
    $duration = round((microtime(true) - $startTime) * 1000, 2);
    
    if ($pingResult['status'] === 'online') {
        $onlineCount++;
        echo "- {$device->name} ({$device->ip_address}): ✅ Online ({$pingResult['response_time']}ms, took {$duration}ms)\n";
    } else {
        $offlineCount++;
        echo "- {$device->name} ({$device->ip_address}): ❌ Offline (took {$duration}ms)\n";
    }
}

echo "\nSample Results: {$onlineCount} online, {$offlineCount} offline\n";

// Test a small batch to see the improvement
echo "\nTesting small batch (5 devices) with improved service:\n";
$batchDevices = \App\Models\Device::where('is_active', true)->take(5)->get();
$batchStart = microtime(true);

foreach ($batchDevices as $device) {
    $pingResult = $pingService->pingSingle($device->id);
    $status = $pingResult['status'] === 'online' ? '✅' : '❌';
    echo "- {$device->name}: {$status}\n";
}

$batchDuration = round((microtime(true) - $batchStart) * 1000, 2);
echo "\nBatch of 5 devices completed in {$batchDuration}ms\n";

echo "\nImprovement complete. The service now uses:\n";
echo "- 3 second timeout (was 1 second)\n";
echo "- 15 concurrent pings (was 20)\n";
echo "- 100ms delay between batches\n";
echo "- Better logging for debugging\n";
