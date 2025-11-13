<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Testing actual 'Ping All Devices' functionality...\n";

// 1. Get the actual MonitoringController and test pingAllDevices
echo "1. Testing MonitoringController::pingAllDevices()\n";
echo "========================================\n";

try {
    $controller = new \App\Http\Controllers\Api\MonitoringController(app(\App\Services\FastPingService::class));
    
    echo "Starting bulk ping for all devices...\n";
    $startTime = microtime(true);
    
    $result = $controller->pingAllDevices();
    
    $duration = round((microtime(true) - $startTime) * 1000, 2);
    
    // Handle JsonResponse object
    if ($result instanceof \Illuminate\Http\JsonResponse) {
        $data = $result->getData(true);
    } else {
        $data = $result;
    }
    
    echo "\nBulk Ping Results:\n";
    echo "Success: " . ($data['success'] ? '✅ Yes' : '❌ No') . "\n";
    echo "Message: " . ($data['message'] ?? 'N/A') . "\n";
    echo "Duration: {$duration}ms\n";
    
    if (isset($data['stats'])) {
        echo "\nStatistics:\n";
        echo "- Total devices: " . $data['stats']['total_devices'] . "\n";
        echo "- Online devices: " . $data['stats']['online_devices'] . "\n";
        echo "- Offline devices: " . $data['stats']['offline_devices'] . "\n";
        echo "- Ping duration: " . $data['stats']['ping_duration'] . "ms\n";
        
        $total = $data['stats']['total_devices'];
        $online = $data['stats']['online_devices'];
        $offline = $data['stats']['offline_devices'];
        $uptime = $total > 0 ? round(($online / $total) * 100, 1) : 0;
        
        echo "- Uptime percentage: {$uptime}%\n";
    }
    
    // Show sample results if available
    if (isset($data['result']['results']) && count($data['result']['results']) > 0) {
        echo "\nSample device results:\n";
        $sampleResults = array_slice($data['result']['results'], 0, 10);
        
        foreach ($sampleResults as $deviceResult) {
            $status = $deviceResult['status'] === 'online' ? '✅' : '❌';
            $responseTime = $deviceResult['response_time'] ?? 'N/A';
            echo "{$status} {$deviceResult['name']} ({$deviceResult['ip_address']}) - {$responseTime}ms\n";
        }
        
        if (count($data['result']['results']) > 10) {
            echo "... and " . (count($data['result']['results']) - 10) . " more devices\n";
        }
    }
    
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

// 2. Compare with individual ping results
echo "\n\n2. Comparing with individual pings\n";
echo "===================================\n";

// Get a sample of devices to compare
$sampleDevices = \App\Models\Device::where('is_active', true)
    ->take(5)
    ->get();

$individualResults = [];
foreach ($sampleDevices as $device) {
    $pingService = new \App\Services\FastPingService();
    $result = $pingService->pingSingle($device->id);
    $individualResults[] = $result;
    
    $status = $result['status'] === 'online' ? '✅' : '❌';
    $responseTime = $result['response_time'] ?? 'N/A';
    echo "{$status} {$device['name']} ({$device['ip_address']}) - {$responseTime}ms\n";
}

$individualOnline = count(array_filter($individualResults, fn($r) => $r['status'] === 'online'));
$individualOffline = count($individualResults) - $individualOnline;

echo "\nIndividual ping summary: {$individualOnline} online, {$individualOffline} offline\n";

// 3. Check if there's a pattern in offline devices
echo "\n\n3. Analyzing offline device patterns\n";
echo "====================================\n";

$allDevices = \App\Models\Device::where('is_active', true)->get();
echo "Total devices in database: " . $allDevices->count() . "\n";

// Group by category
$byCategory = $allDevices->groupBy('category');
foreach ($byCategory as $category => $devices) {
    echo "- {$category}: " . $devices->count() . " devices\n";
}

// Test a few devices from each category to see if there's a pattern
echo "\nTesting devices by category:\n";
foreach ($byCategory as $category => $devices) {
    echo "\n{$category} devices:\n";
    $categorySample = $devices->take(3);
    
    foreach ($categorySample as $device) {
        $pingService = new \App\Services\FastPingService();
        $result = $pingService->pingSingle($device->id);
        $status = $result['status'] === 'online' ? '✅' : '❌';
        echo "  {$status} {$device->name} ({$device->ip_address})\n";
    }
}

echo "\nTest completed!\n";
