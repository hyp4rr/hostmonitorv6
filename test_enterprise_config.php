<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Testing EnterprisePingService with new configuration...\n";

// Check the current configuration
echo "Current monitoring configuration:\n";
echo "- Timeout: " . config('monitoring.timeout') . " seconds\n";
echo "- Max Concurrent: " . config('monitoring.max_concurrent') . "\n";
echo "- Batch Size: " . config('monitoring.batch_size') . "\n\n";

// Test the EnterprisePingService
$enterpriseService = new \App\Services\EnterprisePingService();
echo "Testing EnterprisePingService with updated config:\n";

// Test a small batch
$testDevices = \App\Models\Device::where('is_active', true)->take(5)->get();

$startTime = microtime(true);
$results = [];

foreach ($testDevices as $device) {
    echo "\nPinging {$device->name} ({$device->ip_address})...\n";
    
    $deviceStart = microtime(true);
    $result = $enterpriseService->executeOptimizedPing($device);
    $deviceDuration = round((microtime(true) - $deviceStart) * 1000, 2);
    
    $status = $result['status'] === 'online' ? '✅ Online' : '❌ Offline';
    $responseTime = $result['response_time'] ?? 'N/A';
    
    echo "   Result: {$status}\n";
    echo "   Response Time: {$responseTime}ms\n";
    echo "   Duration: {$deviceDuration}ms\n";
    
    $results[] = $result;
}

$totalDuration = round((microtime(true) - $startTime) * 1000, 2);
$onlineCount = count(array_filter($results, fn($r) => $r['status'] === 'online'));
$offlineCount = count($results) - $onlineCount;

echo "\nEnterprise Service Results:\n";
echo "- Online: {$onlineCount}\n";
echo "- Offline: {$offlineCount}\n";
echo "- Total Duration: {$totalDuration}ms\n";

// Compare with FastPingService
echo "\nComparing with FastPingService:\n";
$fastService = new \App\Services\FastPingService();

$fastResults = [];
foreach ($testDevices as $device) {
    $result = $fastService->pingSingle($device->id);
    $fastResults[] = $result;
}

$fastOnlineCount = count(array_filter($fastResults, fn($r) => $r['status'] === 'online'));
$fastOfflineCount = count($fastResults) - $fastOnlineCount;

echo "- FastPingService: {$fastOnlineCount} online, {$fastOfflineCount} offline\n";
echo "- EnterprisePingService: {$onlineCount} online, {$offlineCount} offline\n";

if ($onlineCount === $fastOnlineCount) {
    echo "✅ Both services now show consistent results!\n";
} else {
    echo "⚠️ Results still differ between services\n";
}

echo "\nConfiguration update complete!\n";
