<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Testing bulk ping vs individual ping...\n";

// Test the same device with both methods
$testDevice = \App\Models\Device::where('is_active', true)->first();

if (!$testDevice) {
    echo "No devices found to test.\n";
    exit;
}

echo "Testing device: {$testDevice->name} ({$testDevice->ip_address})\n\n";

// Test 1: Individual ping
echo "1. Individual Ping Test:\n";
$pingService = new \App\Services\FastPingService();
$individualStart = microtime(true);
$individualResult = $pingService->pingSingle($testDevice->id);
$individualDuration = round((microtime(true) - $individualStart) * 1000, 2);

echo "   Result: " . ($individualResult['status'] === 'online' ? '✅ Online' : '❌ Offline') . "\n";
echo "   Response Time: " . ($individualResult['response_time'] ?? 'N/A') . "ms\n";
echo "   Total Duration: {$individualDuration}ms\n\n";

// Test 2: Manual ping with different timeouts
echo "2. Manual Ping Tests:\n";

$timeouts = [1, 2, 3, 5];
foreach ($timeouts as $timeout) {
    $cmd = "ping -n 1 -w " . ($timeout * 1000) . " {$testDevice->ip_address}";
    
    $start = microtime(true);
    $output = [];
    $returnCode = 0;
    exec($cmd . ' 2>&1', $output, $returnCode);
    $duration = round((microtime(true) - $start) * 1000, 2);
    
    $status = $returnCode === 0 ? '✅ Online' : '❌ Offline';
    $responseTime = "N/A";
    
    if ($returnCode === 0) {
        foreach ($output as $line) {
            if (preg_match('/time[=<](\d+)ms/', $line, $matches)) {
                $responseTime = $matches[1] . 'ms';
                break;
            }
        }
    }
    
    echo "   {$timeout}s timeout: {$status} (Response: {$responseTime}, Total: {$duration}ms)\n";
}

echo "\n3. Testing bulk ping with small batch:\n";

// Test 3: Small batch ping (simulate bulk ping)
$batchDevices = \App\Models\Device::where('is_active', true)->take(5)->get();
$bulkStart = microtime(true);

$bulkResults = [];
foreach ($batchDevices as $device) {
    $result = $pingService->pingSingle($device->id);
    $bulkResults[] = $result;
    
    $status = $result['status'] === 'online' ? '✅' : '❌';
    echo "   {$device->name}: {$status}\n";
}

$bulkDuration = round((microtime(true) - $bulkStart) * 1000, 2);
$onlineCount = count(array_filter($bulkResults, fn($r) => $r['status'] === 'online'));
$offlineCount = count($bulkResults) - $onlineCount;

echo "\nBulk batch results: {$onlineCount} online, {$offlineCount} offline\n";
echo "Total bulk duration: {$bulkDuration}ms\n";

// Test 4: Check if the device actually responds to ping
echo "\n4. Direct ping test:\n";
$directCmd = "ping -n 1 -w 5000 {$testDevice->ip_address}";
echo "Running: {$directCmd}\n";
$output = [];
$returnCode = 0;
exec($directCmd . ' 2>&1', $output, $returnCode);
echo "Return Code: {$returnCode}\n";
echo "Output:\n";
foreach ($output as $line) {
    echo "   {$line}\n";
}

echo "\nAnalysis complete.\n";
