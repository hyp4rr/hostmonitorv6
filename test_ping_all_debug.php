<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Testing Ping All Devices functionality...\n\n";

try {
    // Test 1: Check if we can get devices
    echo "1. Testing device retrieval...\n";
    $devices = \App\Models\Device::where('is_active', true)->limit(5)->get();
    echo "   Found " . $devices->count() . " active devices\n";
    
    if ($devices->count() > 0) {
        foreach ($devices as $device) {
            echo "   - {$device->name} ({$device->ip_address})\n";
        }
    }
    
    // Test 2: Test single device ping
    echo "\n2. Testing single device ping...\n";
    if ($devices->count() > 0) {
        $testDevice = $devices->first();
        echo "   Pinging: {$testDevice->name} ({$testDevice->ip_address})\n";
        
        if (class_exists('App\Services\EnterprisePingService')) {
            $pingService = new \App\Services\EnterprisePingService();
            $result = $pingService->executeOptimizedPing($testDevice);
            echo "   Result: " . json_encode($result, JSON_PRETTY_PRINT) . "\n";
        } else {
            echo "   EnterprisePingService not found\n";
        }
    }
    
    // Test 3: Check cache locks
    echo "\n3. Checking cache locks...\n";
    $locks = [
        'monitoring.active',
        'monitoring.running', 
        'ping_service.running',
        'bulk_ping.active'
    ];
    
    foreach ($locks as $lock) {
        $value = \Illuminate\Support\Facades\Cache::get($lock, 'not_set');
        echo "   {$lock}: {$value}\n";
    }
    
    // Test 4: Clear locks and test ping all
    echo "\n4. Clearing locks and testing ping all...\n";
    foreach ($locks as $lock) {
        \Illuminate\Support\Facades\Cache::put($lock, false, 300);
        echo "   Cleared {$lock}\n";
    }
    
    // Test with just 2 devices to avoid timeout
    echo "\n5. Testing ping all with 2 devices...\n";
    $testDevices = \App\Models\Device::where('is_active', true)->limit(2)->get();
    echo "   Pinging " . $testDevices->count() . " devices\n";
    
    $startTime = microtime(true);
    $results = [];
    $onlineCount = 0;
    $offlineCount = 0;
    
    foreach ($testDevices as $index => $device) {
        echo "   Pinging device {$index}: {$device->name} ({$device->ip_address})\n";
        
        try {
            if (class_exists('App\Services\EnterprisePingService')) {
                $pingService = new \App\Services\EnterprisePingService();
                $pingResult = $pingService->executeOptimizedPing($device);
                
                echo "     Status: {$pingResult['status']}, Response: {$pingResult['response_time']}ms\n";
                
                if ($pingResult['status'] === 'online') {
                    $onlineCount++;
                } else {
                    $offlineCount++;
                }
                
                $results[] = $pingResult;
            }
        } catch (\Exception $e) {
            echo "     ERROR: " . $e->getMessage() . "\n";
            $offlineCount++;
        }
    }
    
    $duration = round((microtime(true) - $startTime) * 1000, 2);
    
    echo "\n=== RESULTS ===\n";
    echo "Total devices: " . $testDevices->count() . "\n";
    echo "Online: {$onlineCount}\n";
    echo "Offline: {$offlineCount}\n";
    echo "Duration: {$duration}ms\n";
    
    if ($testDevices->count() > 0) {
        echo "Test completed successfully!\n";
    } else {
        echo "No devices to test with!\n";
    }
    
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    echo "\nStack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\nTest complete.\n";
