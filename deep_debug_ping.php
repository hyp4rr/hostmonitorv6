<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Deep debugging ping issue...\n";

// 1. Check if configuration cache is cleared
echo "1. Configuration Status:\n";
echo "Monitoring timeout: " . config('monitoring.timeout') . "s\n";
echo "Max concurrent: " . config('monitoring.max_concurrent') . "\n";
echo "Batch size: " . config('monitoring.batch_size') . "\n";

// 2. Test the actual MonitoringController pingAllDevices method
echo "\n2. Testing MonitoringController pingAllDevices:\n";

$controller = new \App\Http\Controllers\Api\MonitoringController(app(\App\Services\FastPingService::class));

$startTime = microtime(true);
try {
    // Test with a small subset first
    echo "Testing bulk ping method...\n";
    
    // Get a small sample to test
    $testDevices = \App\Models\Device::where('is_active', true)->take(3)->get();
    echo "Testing with " . $testDevices->count() . " devices:\n";
    
    foreach ($testDevices as $device) {
        echo "- {$device->name} ({$device->ip_address})\n";
    }
    
    // Now test the actual bulk ping method
    $result = $controller->pingAllDevices();
    $duration = round((microtime(true) - $startTime) * 1000, 2);
    
    echo "\nBulk ping result:\n";
    echo "- Success: " . ($result['success'] ? 'Yes' : 'No') . "\n";
    echo "- Message: " . ($result['message'] ?? 'N/A') . "\n";
    echo "- Duration: {$duration}ms\n";
    
    if (isset($result['stats'])) {
        echo "- Total devices: " . $result['stats']['total_devices'] . "\n";
        echo "- Online devices: " . $result['stats']['online_devices'] . "\n";
        echo "- Offline devices: " . $result['stats']['offline_devices'] . "\n";
    }
    
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

// 3. Check which service is actually being used
echo "\n3. Service Detection:\n";
if (class_exists('App\Services\EnterprisePingService')) {
    echo "EnterprisePingService exists - will be used for bulk operations\n";
    
    $enterprise = new \App\Services\EnterprisePingService();
    echo "Enterprise service timeout: " . config('monitoring.timeout') . "s\n";
    echo "Enterprise service concurrent: " . config('monitoring.max_concurrent') . "\n";
} else {
    echo "EnterprisePingService not found - FastPingService will be used\n";
}

// 4. Test direct vs bulk ping on same devices
echo "\n4. Direct vs Bulk Comparison:\n";

$sampleDevice = \App\Models\Device::where('is_active', true)->first();
if ($sampleDevice) {
    echo "Testing device: {$sampleDevice->name} ({$sampleDevice->ip_address})\n";
    
    // Direct ping
    $fastService = new \App\Services\FastPingService();
    $directResult = $fastService->pingSingle($sampleDevice->id);
    echo "Direct ping: " . ($directResult['status'] === 'online' ? '✅ Online' : '❌ Offline') . "\n";
    
    // Enterprise ping
    if (class_exists('App\Services\EnterprisePingService')) {
        $enterpriseService = new \App\Services\EnterprisePingService();
        $enterpriseResult = $enterpriseService->executeOptimizedPing($sampleDevice);
        echo "Enterprise ping: " . ($enterpriseResult['status'] === 'online' ? '✅ Online' : '❌ Offline') . "\n";
    }
}

// 5. Check for any Laravel config caching
echo "\n5. Cache Status:\n";
echo "Config cached: " . (app()->configurationIsCached() ? 'Yes' : 'No') . "\n";
echo "Routes cached: " . (app()->routesAreCached() ? 'Yes' : 'No') . "\n";

echo "\nDebugging complete.\n";
