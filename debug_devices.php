<?php

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Checking current device status...\n";
echo "==================================\n";

$totalDevices = App\Models\Device::count();
$offlineDevices = App\Models\Device::where('status', 'offline')->count();
$onlineDevices = App\Models\Device::where('status', 'online')->count();

echo "Total devices: {$totalDevices}\n";
echo "Online devices: {$onlineDevices}\n";
echo "Offline devices: {$offlineDevices}\n\n";

echo "Offline device details:\n";
echo "======================\n";
$offline = App\Models\Device::where('status', 'offline')->get();
foreach ($offline as $device) {
    echo "ID: {$device->id}, Name: {$device->name}, IP: {$device->ip_address}, Status: {$device->status}, Managed by: {$device->managed_by}\n";
}

echo "\nTesting mail data structure...\n";
echo "==============================\n";
$offlineDevices = App\Models\Device::where('status', 'offline')
    ->whereNotNull('managed_by')
    ->with(['managedBy', 'branch', 'location'])
    ->get();

echo "Offline devices with manager: {$offlineDevices->count()}\n";

if ($offlineDevices->isNotEmpty()) {
    $devicesByUser = $offlineDevices->groupBy('managed_by');
    echo "Grouped by " . $devicesByUser->count() . " user(s)\n";
    
    foreach ($devicesByUser as $userId => $devices) {
        echo "User {$userId}: {$devices->count()} devices\n";
    }
}
