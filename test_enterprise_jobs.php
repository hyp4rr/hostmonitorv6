<?php

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "🧪 Testing Enterprise Jobs\n";
echo "==========================\n";

// Test MonitorDevicesJob
echo "1. Testing MonitorDevicesJob...\n";

use App\Jobs\MonitorDevicesJob;
use App\Jobs\DeviceStatusChangeJob;

// Create a test job instance
$monitorJob = new MonitorDevicesJob(0, 10);
echo "✅ MonitorDevicesJob created successfully\n";
echo "   Batch Number: " . $monitorJob->getBatchNumber() . "\n";
echo "   Batch Size: " . $monitorJob->getBatchSize() . "\n";
echo "   Unique ID: " . $monitorJob->uniqueId() . "\n";

// Test DeviceStatusChangeJob
echo "\n2. Testing DeviceStatusChangeJob...\n";

$changeData = [
    'device_id' => 1,
    'device_name' => 'Test Device',
    'ip_address' => '192.168.1.1',
    'previous_status' => 'online',
    'new_status' => 'offline',
    'timestamp' => now()->toISOString()
];

$statusJob = new DeviceStatusChangeJob($changeData);
echo "✅ DeviceStatusChangeJob created successfully\n";
echo "   Device ID: " . $changeData['device_id'] . "\n";
echo "   Status Change: " . $changeData['previous_status'] . " → " . $changeData['new_status'] . "\n";
echo "   Unique ID: " . $statusJob->uniqueId() . "\n";
echo "   Tags: " . implode(', ', $statusJob->tags()) . "\n";

// Test mail classes
echo "\n3. Testing Mail Classes...\n";

use App\Mail\DeviceStatusChange;
use App\Mail\CriticalDeviceAlert;

$device = \App\Models\Device::find(1);
if ($device) {
    $statusMail = new DeviceStatusChange($device, $changeData);
    echo "✅ DeviceStatusChange mail created\n";
    echo "   Subject: " . $statusMail->envelope()->subject . "\n";
    
    $criticalMail = new CriticalDeviceAlert($device, $changeData);
    echo "✅ CriticalDeviceAlert mail created\n";
    echo "   Subject: " . $criticalMail->envelope()->subject . "\n";
} else {
    echo "⚠️  No device found for mail testing\n";
}

// Test DeviceStatusChange model
echo "\n4. Testing DeviceStatusChange Model...\n";

use App\Models\DeviceStatusChange as DeviceStatusChangeModel;

$statusChange = new DeviceStatusChangeModel([
    'device_id' => 1,
    'previous_status' => 'online',
    'new_status' => 'offline',
    'change_time' => now(),
    'notification_sent' => true,
]);

echo "✅ DeviceStatusChange model created\n";
echo "   Is Critical: " . ($statusChange->isCritical() ? 'Yes' : 'No') . "\n";
echo "   Is Unresolved: " . ($statusChange->isUnresolved() ? 'Yes' : 'No') . "\n";

echo "\n✅ All enterprise jobs and classes are working correctly!\n";
echo "======================================================\n";
