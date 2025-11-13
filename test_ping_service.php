<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Testing ping service...\n";

// Test the FastPingService directly
$pingService = new \App\Services\FastPingService();
echo "Created FastPingService\n";

// Get devices that would be pinged
$devices = \App\Models\Device::where('is_active', true)->get();
echo "\nDevices that will be pinged:\n";
echo "- Total active devices: {$devices->count()}\n";

// Show breakdown by category
$byCategory = $devices->groupBy('category');
foreach ($byCategory as $category => $categoryDevices) {
    echo "- {$category}: {$categoryDevices->count()} devices\n";
}

// Test a small sample ping from each category
echo "\nTesting ping on sample devices...\n";

// Get 1 TAS device and 2 switch devices
$tasDevice = \App\Models\Device::where('category', 'tas')->where('is_active', true)->first();
$switchDevices = \App\Models\Device::where('category', 'switch')->where('is_active', true)->take(2)->get();

$sampleDevices = collect([$tasDevice])->merge($switchDevices);

foreach ($sampleDevices as $device) {
    if (!$device) continue;
    
    echo "\nPinging {$device->name} ({$device->ip_address})...\n";
    
    // Simple ping test
    $pingResult = $pingService->pingSingle($device->id);
    
    if ($pingResult['status'] === 'online') {
        echo "✅ Online: {$pingResult['response_time']}ms\n";
    } else {
        echo "❌ Offline\n";
    }
    
    // Show device category to confirm it's working on all types
    echo "   Category: {$device->category}\n";
}

echo "\nPing test completed.\n";
