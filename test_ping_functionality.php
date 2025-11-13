<?php

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "🔧 Testing Ping Functionality\n";
echo "=============================\n";

use App\Http\Controllers\Api\MonitoringController;

$controller = new MonitoringController(new App\Services\FastPingService());

// Test 1: Get ping status for all devices
echo "\n1. Testing GET /api/monitoring/ping-status\n";
echo "--------------------------------------------\n";

try {
    $response = $controller->getPingStatus();
    $data = $response->getData();
    
    echo "Status: " . ($data->success ? "✅ Success" : "❌ Failed") . "\n";
    echo "Total Devices: {$data->stats->total}\n";
    echo "Online: {$data->stats->online}\n";
    echo "Offline: {$data->stats->offline}\n";
    echo "Warning: {$data->stats->warning}\n";
    echo "Timestamp: {$data->timestamp}\n";
    
    // Show first few devices
    if (!empty($data->devices)) {
        echo "\nSample Devices:\n";
        foreach (array_slice($data->devices, 0, 3) as $device) {
            $statusIcon = $device->status === 'online' ? '🟢' : '🔴';
            $performance = $device->performance ?? 'unknown';
            echo "{$statusIcon} {$device->name} ({$device->ip_address}) - {$device->status} - {$performance}\n";
        }
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

// Test 2: Ping all devices
echo "\n\n2. Testing POST /api/monitoring/ping-all\n";
echo "-----------------------------------------\n";

try {
    $response = $controller->pingAllDevices();
    $data = $response->getData();
    
    echo "Status: " . ($data->success ? "✅ Success" : "❌ Failed") . "\n";
    echo "Message: {$data->message}\n";
    echo "Duration: {$data->duration}ms\n";
    echo "Total Devices: {$data->stats->total_devices}\n";
    echo "Online Devices: {$data->stats->online_devices}\n";
    echo "Offline Devices: {$data->stats->offline_devices}\n";
    echo "Ping Duration: {$data->stats->ping_duration}ms\n";
    echo "Devices/Second: {$data->stats->devices_per_second}\n";
    echo "Timestamp: {$data->timestamp}\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

// Test 3: Ping single device
echo "\n\n3. Testing POST /api/monitoring/device/{id}/ping\n";
echo "-------------------------------------------------\n";

try {
    // Get first device
    $device = \App\Models\Device::where('is_active', true)->first();
    if ($device) {
        $response = $controller->pingSingleDevice($device->id);
        $data = $response->getData();
        
        echo "Device: {$data->device->name} ({$data->device->ip_address})\n";
        echo "Status: " . ($data->success ? "✅ Success" : "❌ Failed") . "\n";
        echo "Message: {$data->message}\n";
        echo "Current Status: {$data->stats->current_status}\n";
        echo "Response Time: " . ($data->stats->response_time ? $data->stats->response_time . 'ms' : 'N/A') . "\n";
        echo "Ping Duration: {$data->stats->ping_duration}ms\n";
        echo "Performance: {$data->stats->performance}\n";
        echo "Is Online: " . ($data->stats->is_online ? 'Yes' : 'No') . "\n";
        echo "Recent History Entries: " . count($data->recent_history) . "\n";
        
        if (!empty($data->recent_history)) {
            echo "Recent History:\n";
            foreach (array_slice($data->recent_history, 0, 3) as $history) {
                $icon = $history->status === 'online' ? '🟢' : '🔴';
                $time = $history->response_time ? $history->response_time . 'ms' : 'N/A';
                echo "  {$icon} {$history->status} - {$time} - {$history->checked_at}\n";
            }
        }
    } else {
        echo "No devices found to test single ping\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

// Test 4: Ping by category
echo "\n\n4. Testing POST /api/monitoring/category/{category}/ping\n";
echo "-----------------------------------------------------\n";

try {
    $response = $controller->pingByCategory('tas');
    $data = $response->getData();
    
    echo "Status: " . ($data->success ? "✅ Success" : "❌ Failed") . "\n";
    echo "Message: {$data->message}\n";
    echo "Category: {$data->category}\n";
    echo "Duration: {$data->duration}ms\n";
    echo "Total Devices: {$data->stats->total_devices}\n";
    echo "Online Devices: {$data->stats->online_devices}\n";
    echo "Offline Devices: {$data->stats->offline_devices}\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\n✅ All ping functionality tests completed!\n";
echo "==========================================\n";
