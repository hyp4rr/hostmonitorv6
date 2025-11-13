<?php

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\FastPingService;

echo "🚀 Fast Ping System Performance Test\n";
echo "=====================================\n";

$pingService = new FastPingService();

// Test multiple runs for performance analysis
$runs = 5;
$totalDuration = 0;
$results = [];

echo "Running {$runs} performance tests...\n\n";

for ($i = 1; $i <= $runs; $i++) {
    echo "Test Run #{$i}:\n";
    echo "------------\n";
    
    $startTime = microtime(true);
    $result = $pingService->pingAllDevices();
    $duration = round((microtime(true) - $startTime) * 1000, 2);
    
    $totalDuration += $duration;
    $results[] = [
        'run' => $i,
        'duration' => $duration,
        'total' => $result['stats']['total'],
        'online' => $result['stats']['online'],
        'offline' => $result['stats']['offline'],
    ];
    
    echo "Duration: {$duration}ms\n";
    echo "Devices: {$result['stats']['total']} ({$result['stats']['online']} online, {$result['stats']['offline']} offline)\n";
    echo "System Duration: {$result['stats']['duration']}ms\n\n";
    
    // Small delay between runs
    usleep(500000); // 0.5 seconds
}

// Performance analysis
$avgDuration = round($totalDuration / $runs, 2);
$minDuration = min(array_column($results, 'duration'));
$maxDuration = max(array_column($results, 'duration'));

echo "📊 Performance Analysis:\n";
echo "========================\n";
echo "Average Duration: {$avgDuration}ms\n";
echo "Min Duration: {$minDuration}ms\n";
echo "Max Duration: {$maxDuration}ms\n";
echo "Total Test Time: " . round($totalDuration, 2) . "ms\n\n";

// Calculate devices per second
$deviceCount = $results[0]['total'];
$devicesPerSecond = round($deviceCount / ($avgDuration / 1000), 2);

echo "🎯 Performance Metrics:\n";
echo "=======================\n";
echo "Devices Monitored: {$deviceCount}\n";
echo "Devices/Second: {$devicesPerSecond}\n";
echo "Avg Time/Device: " . round($avgDuration / $deviceCount, 2) . "ms\n\n";

// Test API endpoints
echo "🌐 Testing API Endpoints:\n";
echo "==========================\n";

// Test status endpoint
$apiStart = microtime(true);
$latestResults = $pingService->getLatestResults();
$latestStats = $pingService->getLatestStats();
$apiDuration = round((microtime(true) - $apiStart) * 1000, 2);

echo "Cache retrieval time: {$apiDuration}ms\n";
echo "Cached results: " . count($latestResults) . " devices\n";
echo "Cached stats: {$latestStats['total']} total, {$latestStats['online']} online, {$latestStats['offline']} offline\n\n";

echo "✅ Performance test completed successfully!\n";
echo "==========================================\n";
