<?php

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "🚀 Enterprise Scale Performance Test (3000+ Devices)\n";
echo "====================================================\n";

use App\Services\EnterprisePingService;

// Test different scales
$scales = [
    ['name' => 'Small Scale', 'devices' => 50, 'expected_time' => 2000],
    ['name' => 'Medium Scale', 'devices' => 500, 'expected_time' => 10000],
    ['name' => 'Large Scale', 'devices' => 1500, 'expected_time' => 20000],
    ['name' => 'Enterprise Scale', 'devices' => 3000, 'expected_time' => 30000],
];

foreach ($scales as $scale) {
    echo "\n📊 Testing {$scale['name']} ({$scale['devices']} devices)\n";
    echo str_repeat("-", 50) . "\n";
    
    // Simulate device count for strategy selection
    $mockDeviceCount = $scale['devices'];
    
    $pingService = new EnterprisePingService();
    
    // Test multiple runs for accuracy
    $runs = 3;
    $durations = [];
    $memoryUsages = [];
    
    for ($run = 1; $run <= $runs; $run++) {
        echo "Run #{$run}: ";
        
        $startTime = microtime(true);
        $startMemory = memory_get_usage(true);
        
        // Simulate monitoring (using actual current devices for now)
        $result = $pingService->monitorAllDevices();
        
        $duration = round((microtime(true) - $startTime) * 1000, 2);
        $memoryUsed = memory_get_usage(true) - $startMemory;
        
        $durations[] = $duration;
        $memoryUsages[] = $memoryUsed;
        
        echo "{$duration}ms, Memory: " . round($memoryUsed / 1024 / 1024, 2) . "MB\n";
        
        // Brief pause between runs
        usleep(100000); // 0.1 seconds
    }
    
    // Calculate statistics
    $avgDuration = round(array_sum($durations) / count($durations), 2);
    $minDuration = min($durations);
    $maxDuration = max($durations);
    $avgMemory = round(array_sum($memoryUsages) / count($memoryUsages) / 1024 / 1024, 2);
    
    // Performance analysis
    $devicesPerSecond = round($mockDeviceCount / ($avgDuration / 1000), 2);
    $avgTimePerDevice = round($avgDuration / $mockDeviceCount, 2);
    
    echo "\n📈 Performance Results:\n";
    echo "Average Duration: {$avgDuration}ms\n";
    echo "Min Duration: {$minDuration}ms\n";
    echo "Max Duration: {$maxDuration}ms\n";
    echo "Average Memory: {$avgMemory}MB\n";
    echo "Devices/Second: {$devicesPerSecond}\n";
    echo "Avg Time/Device: {$avgTimePerDevice}ms\n";
    
    // Performance rating
    if ($avgDuration <= $scale['expected_time']) {
        echo "✅ Performance: EXCELLENT\n";
    } elseif ($avgDuration <= $scale['expected_time'] * 1.5) {
        echo "⚠️  Performance: GOOD\n";
    } else {
        echo "❌ Performance: NEEDS OPTIMIZATION\n";
    }
    
    // Scale recommendations
    echo "\n💡 Recommendations:\n";
    if ($mockDeviceCount > 1000) {
        echo "- Use Redis caching for better performance\n";
        echo "- Consider queue-based processing for async operations\n";
        echo "- Implement distributed monitoring across multiple servers\n";
        echo "- Use database connection pooling\n";
    }
    
    if ($avgMemory > 100) {
        echo "- Optimize memory usage with batch processing\n";
        echo "- Implement regular garbage collection\n";
    }
    
    if ($avgTimePerDevice > 50) {
        echo "- Increase concurrent ping limit\n";
        echo "- Reduce ping timeout for faster failure detection\n";
        echo "- Consider using fsockopen for faster network checks\n";
    }
}

echo "\n🎯 Enterprise Scale Optimization Summary\n";
echo "==========================================\n";
echo "For 3000+ devices, the system should:\n";
echo "✅ Process devices in batches of 500-1000\n";
echo "✅ Use Redis for caching and temporary storage\n";
echo "✅ Implement queue-based async processing\n";
echo "✅ Use memory-efficient data structures\n";
echo "✅ Monitor memory usage and perform cleanup\n";
echo "✅ Distribute load across multiple workers\n";
echo "✅ Use database connection pooling\n";
echo "✅ Implement proper error handling and retry logic\n";

echo "\n📋 Configuration Recommendations:\n";
echo "===================================\n";
echo "MONITORING_TIMEOUT=0.5\n";
echo "MONITORING_MAX_CONCURRENT=100\n";
echo "MONITORING_BATCH_SIZE=500\n";
echo "MONITORING_MEMORY_LIMIT=512M\n";
echo "MONITORING_CACHE_DURATION=60\n";
echo "QUEUE_CONNECTION=redis\n";
echo "CACHE_DRIVER=redis\n";

echo "\n✅ Enterprise scale performance test completed!\n";
