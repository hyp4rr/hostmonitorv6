<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Testing improved 5-second timeout...\n";

// Test the previously false negative devices
$falseNegatives = [
    ['name' => 'FSKTM', 'ip' => '10.65.53.158'],
    ['name' => 'AP SW BCB 2nd Floor B-201-02', 'ip' => '10.9.4.40'],
    ['name' => 'B-105-01', 'ip' => '10.9.4.13'],
    ['name' => 'Pumas Remote UBNT Pos Kawalan', 'ip' => '10.100.10.206']
];

echo "Testing devices that were previously false negatives:\n";
echo "======================================================\n";

$pingService = new \App\Services\FastPingService();

foreach ($falseNegatives as $device) {
    echo "\nTesting {$device['name']} ({$device['ip']}) with 5s timeout...\n";
    
    // Find the device in database
    $dbDevice = \App\Models\Device::where('ip_address', $device['ip'])->first();
    if ($dbDevice) {
        $startTime = microtime(true);
        $result = $pingService->pingSingle($dbDevice->id);
        $duration = round((microtime(true) - $startTime) * 1000, 2);
        
        $status = $result['status'] === 'online' ? '✅ Online' : '❌ Offline';
        $responseTime = $result['response_time'] ?? 'N/A';
        
        echo "   Result: {$status}\n";
        echo "   Response Time: {$responseTime}ms\n";
        echo "   Total Duration: {$duration}ms\n";
    } else {
        echo "   Device not found in database\n";
    }
}

echo "\n\nTesting small bulk ping with new timeout:\n";
echo "==========================================\n";

// Test bulk ping with a small sample
$controller = new \App\Http\Controllers\Api\MonitoringController(app(\App\Services\FastPingService::class));

echo "Running bulk ping with 5s timeout...\n";
$startTime = microtime(true);

$result = $controller->pingAllDevices();
$duration = round((microtime(true) - $startTime) * 1000, 2);

// Handle JsonResponse
if ($result instanceof \Illuminate\Http\JsonResponse) {
    $data = $result->getData(true);
} else {
    $data = $result;
}

echo "\nBulk Ping Results with 5s timeout:\n";
echo "Success: " . ($data['success'] ? '✅ Yes' : '❌ No') . "\n";
echo "Duration: {$duration}ms\n";

if (isset($data['stats'])) {
    $total = $data['stats']['total_devices'];
    $online = $data['stats']['online_devices'];
    $offline = $data['stats']['offline_devices'];
    $uptime = $total > 0 ? round(($online / $total) * 100, 1) : 0;
    
    echo "- Total devices: {$total}\n";
    echo "- Online devices: {$online}\n";
    echo "- Offline devices: {$offline}\n";
    echo "- Uptime percentage: {$uptime}%\n";
    
    $improvement = $uptime - 93.6; // Previous uptime was 93.6%
    echo "- Improvement: " . ($improvement >= 0 ? '+' : '') . "{$improvement}%\n";
}

echo "\nConfiguration updated:\n";
echo "- Timeout: 5 seconds (was 3 seconds)\n";
echo "- Both FastPingService and EnterprisePingService updated\n";
echo "- Should catch slow-responding devices now\n";

echo "\nTest completed!\n";
