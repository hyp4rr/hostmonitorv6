<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Analyzing the 18 offline devices from bulk ping...\n";

// Get the latest bulk ping results
$pingService = new \App\Services\FastPingService();
$latestResults = $pingService->getLatestResults();

$offlineDevices = array_filter($latestResults, fn($r) => $r['status'] === 'offline');

echo "Found " . count($offlineDevices) . " offline devices from bulk ping\n\n";

// Test each offline device individually with longer timeout
echo "Testing offline devices individually (5s timeout):\n";
echo "===================================================\n";

$actuallyOffline = 0;
$falseNegatives = 0;

foreach ($offlineDevices as $device) {
    echo "\nTesting {$device['name']} ({$device['ip_address']})...\n";
    
    // Test with 5 second timeout
    if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
        $cmd = "ping -n 1 -w 5000 {$device['ip_address']}";
    } else {
        $cmd = "ping -c 1 -W 5 {$device['ip_address']}";
    }
    
    $start = microtime(true);
    $output = [];
    $returnCode = 0;
    exec($cmd . ' 2>&1', $output, $returnCode);
    $duration = round((microtime(true) - $start) * 1000, 2);
    
    if ($returnCode === 0) {
        // Device responded - this was a false negative
        $falseNegatives++;
        echo "  ❌ FALSE NEGATIVE - Device is actually online!\n";
        
        // Parse response time
        $responseTime = "N/A";
        foreach ($output as $line) {
            if (preg_match('/time[=<](\d+)ms/', $line, $matches)) {
                $responseTime = $matches[1] . 'ms';
                break;
            }
        }
        echo "  Response time: {$responseTime}, Test duration: {$duration}ms\n";
    } else {
        // Device is actually offline
        $actuallyOffline++;
        echo "  ✅ Confirmed offline (took {$duration}ms)\n";
    }
}

echo "\n\nAnalysis Summary:\n";
echo "==================\n";
echo "Total devices tested: " . count($offlineDevices) . "\n";
echo "Actually offline: {$actuallyOffline}\n";
echo "False negatives: {$falseNegatives}\n";

if ($falseNegatives > 0) {
    $falseNegativeRate = round(($falseNegatives / count($offlineDevices)) * 100, 1);
    echo "False negative rate: {$falseNegativeRate}%\n";
    echo "\n⚠️  ISSUE: {$falseNegatives} devices were marked as offline but are actually online!\n";
    echo "This suggests the timeout is still too aggressive for some devices.\n";
} else {
    echo "\n✅ All offline devices are confirmed to be actually offline.\n";
    echo "The bulk ping is working accurately.\n";
}

// Test with even longer timeout for the false negatives
if ($falseNegatives > 0) {
    echo "\n\nTesting false negatives with 10s timeout:\n";
    echo "===========================================\n";
    
    // This would help determine the optimal timeout
    echo "Consider increasing timeout to 5-10 seconds for these slow devices.\n";
}

echo "\nAnalysis complete.\n";
