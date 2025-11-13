<?php

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "🌐 Testing Fast Ping API Endpoints\n";
echo "===================================\n";

// Test monitoring status endpoint
echo "1. Testing GET /api/monitoring/status\n";
echo "---------------------------------------\n";

try {
    $controller = new App\Http\Controllers\Api\MonitoringController(new App\Services\FastPingService());
    $response = $controller->status();
    $data = $response->getData();
    
    echo "Status: " . ($data->success ? "✅ Success" : "❌ Failed") . "\n";
    echo "Timestamp: {$data->timestamp}\n";
    echo "Total Devices: {$data->stats->total}\n";
    echo "Online: {$data->stats->online}\n";
    echo "Offline: {$data->stats->offline}\n";
    echo "Duration: {$data->stats->duration}ms\n";
    echo "Monitoring Active: " . ($data->monitoring_active ? "Yes" : "No") . "\n\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n\n";
}

// Test ping all devices endpoint
echo "2. Testing POST /api/monitoring/ping-all\n";
echo "----------------------------------------\n";

try {
    $response = $controller->pingAllDevices();
    $data = $response->getData();
    
    echo "Status: " . ($data->success ? "✅ Success" : "❌ Failed") . "\n";
    echo "Message: {$data->message}\n";
    echo "Duration: {$data->duration}ms\n";
    echo "Total Devices: {$data->stats->total_devices}\n";
    echo "Online Devices: {$data->stats->online_devices}\n";
    echo "Offline Devices: {$data->stats->offline_devices}\n";
    echo "Devices/Second: {$data->stats->devices_per_second}\n\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n\n";
}

// Test analytics endpoint
echo "3. Testing GET /api/monitoring/analytics\n";
echo "-----------------------------------------\n";

try {
    $request = new Illuminate\Http\Request(['hours' => 24]);
    $response = $controller->analytics($request);
    $data = $response->getData();
    
    echo "Status: " . ($data->success ? "✅ Success" : "❌ Failed") . "\n";
    echo "Period: Last {$data->period->hours} hours\n";
    echo "Total Devices: {$data->overview->total_devices}\n";
    echo "Online Devices: {$data->overview->online_devices}\n";
    echo "Offline Devices: {$data->overview->offline_devices}\n";
    echo "Uptime Percentage: {$data->overview->uptime_percentage}%\n";
    echo "Avg Response Time: {$data->performance->avg_response_time}ms\n";
    echo "Total Checks: {$data->performance->total_checks}\n\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n\n";
}

// Test single device ping
echo "4. Testing GET /api/monitoring/device/{id}/ping\n";
echo "-------------------------------------------------\n";

try {
    // Get first device ID
    $device = App\Models\Device::where('is_active', true)->first();
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
        echo "Recent History: " . count($data->recent_history) . " entries\n\n";
    } else {
        echo "No devices found to test\n\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n\n";
}

// Test dashboard endpoint
echo "5. Testing GET /api/monitoring/dashboard\n";
echo "----------------------------------------\n";

try {
    $response = $controller->dashboard();
    $data = $response->getData();
    
    echo "Status: " . ($data->success ? "✅ Success" : "❌ Failed") . "\n";
    echo "Timestamp: {$data->timestamp}\n";
    echo "Total Devices: {$data->stats->total}\n";
    echo "Online: {$data->stats->online}\n";
    echo "Offline: {$data->stats->offline}\n";
    echo "Recent Alerts: " . count($data->recent_alerts) . "\n";
    echo "Monitoring Active: " . ($data->monitoring->active ? "Yes" : "No") . "\n\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n\n";
}

echo "✅ API endpoint testing completed!\n";
echo "==================================\n";
