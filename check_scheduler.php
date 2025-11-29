<?php

/**
 * Check Laravel Scheduler Status
 * Helps identify if multiple schedulers are running
 */

echo "=== Laravel Scheduler Status Check ===\n\n";

// Check for schedule:work processes
echo "1. Checking for 'schedule:work' processes...\n";
exec('tasklist /FI "IMAGENAME eq php.exe" /FO CSV 2>nul', $output);

$scheduleWorkProcesses = [];
$allPhpProcesses = [];

foreach ($output as $line) {
    if (strpos($line, 'php.exe') !== false && preg_match('/"php.exe","(\d+)"/', $line, $matches)) {
        $pid = $matches[1];
        exec("wmic process where processid={$pid} get commandline /format:list 2>nul", $cmdOutput);
        $commandLine = '';
        foreach ($cmdOutput as $cmdLine) {
            if (strpos($cmdLine, 'CommandLine=') !== false) {
                $commandLine = str_replace('CommandLine=', '', trim($cmdLine));
                break;
            }
        }
        
        $allPhpProcesses[] = ['pid' => $pid, 'command' => $commandLine];
        
        if (strpos($commandLine, 'schedule:work') !== false) {
            $scheduleWorkProcesses[] = ['pid' => $pid, 'command' => $commandLine];
        }
    }
}

$workCount = count($scheduleWorkProcesses);
if ($workCount === 0) {
    echo "   ✅ No 'schedule:work' processes found\n";
} elseif ($workCount === 1) {
    echo "   ✅ One 'schedule:work' process found (correct)\n";
    echo "      PID: {$scheduleWorkProcesses[0]['pid']}\n";
} else {
    echo "   ⚠️  WARNING: {$workCount} 'schedule:work' processes found!\n";
    foreach ($scheduleWorkProcesses as $proc) {
        echo "      PID: {$proc['pid']}\n";
    }
    echo "   → This will cause duplicate scheduled tasks!\n";
}

// Check for schedule:run in recent processes
echo "\n2. Checking for recent 'schedule:run' executions...\n";
$logFile = __DIR__ . '/storage/logs/laravel.log';
if (file_exists($logFile)) {
    $logContent = file_get_contents($logFile);
    $runCount = substr_count($logContent, 'schedule:run');
    $lastRun = '';
    if (preg_match('/\[([^\]]+)\].*schedule:run/', $logContent, $matches)) {
        $lastRun = $matches[1];
    }
    echo "   Found {$runCount} 'schedule:run' references in logs\n";
    if ($lastRun) {
        echo "   Last seen: {$lastRun}\n";
    }
} else {
    echo "   Log file not found\n";
}

// Check Windows Task Scheduler
echo "\n3. Checking Windows Task Scheduler...\n";
exec('schtasks /query /FO CSV 2>nul', $tasks);
$laravelTasks = [];
foreach ($tasks as $task) {
    if (stripos($task, 'laravel') !== false || 
        stripos($task, 'schedule') !== false ||
        stripos($task, 'artisan') !== false) {
        $laravelTasks[] = $task;
    }
}

if (empty($laravelTasks)) {
    echo "   ℹ️  No Laravel scheduler tasks found in Windows Task Scheduler\n";
} else {
    echo "   Found " . count($laravelTasks) . " Laravel-related task(s):\n";
    foreach ($laravelTasks as $task) {
        echo "      {$task}\n";
    }
}

// Check for overlapping uptime updates in logs (read last 500 lines efficiently)
echo "\n4. Checking for overlapping uptime updates in recent logs...\n";
if (file_exists($logFile)) {
    // Read last 500 lines efficiently
    $handle = fopen($logFile, 'r');
    if ($handle) {
        fseek($handle, -1, SEEK_END); // Go to end of file
        $pos = ftell($handle);
        $lines = [];
        $line = '';
        $lineCount = 0;
        
        // Read backwards to get last 500 lines
        while ($pos > 0 && $lineCount < 500) {
            $char = fgetc($handle);
            if ($char === "\n") {
                if (!empty($line)) {
                    array_unshift($lines, $line);
                    $lineCount++;
                }
                $line = '';
            } else {
                $line = $char . $line;
            }
            $pos--;
            fseek($handle, $pos, SEEK_SET);
        }
        fclose($handle);
        
        $uptimeStarts = [];
        foreach ($lines as $line) {
            if (preg_match('/\[([^\]]+)\].*Starting device uptime/', $line, $matches)) {
                $timestamp = $matches[1];
                $uptimeStarts[] = $timestamp;
            }
        }
        
        if (count($uptimeStarts) >= 2) {
            // Check if any two starts are within the same minute
            $overlaps = [];
            for ($i = 0; $i < count($uptimeStarts) - 1; $i++) {
                $time1 = strtotime($uptimeStarts[$i]);
                $time2 = strtotime($uptimeStarts[$i + 1]);
                if ($time1 && $time2) {
                    $diff = abs($time2 - $time1);
                    if ($diff < 60) { // Less than 60 seconds apart
                        $overlaps[] = [
                            'first' => $uptimeStarts[$i],
                            'second' => $uptimeStarts[$i + 1],
                            'diff' => $diff
                        ];
                    }
                }
            }
            
            if (!empty($overlaps)) {
                echo "   ⚠️  WARNING: Found overlapping uptime updates!\n";
                foreach (array_slice($overlaps, 0, 5) as $overlap) { // Show max 5
                    echo "      {$overlap['first']} and {$overlap['second']} (only {$overlap['diff']} seconds apart)\n";
                }
                if (count($overlaps) > 5) {
                    echo "      ... and " . (count($overlaps) - 5) . " more\n";
                }
            } else {
                echo "   ✅ No overlapping uptime updates detected in recent logs\n";
            }
        } else {
            echo "   ℹ️  Not enough uptime update entries to check for overlaps\n";
        }
    } else {
        echo "   Could not read log file\n";
    }
} else {
    echo "   Log file not found\n";
}

// Recommendations
echo "\n=== Recommendations ===\n";
if ($workCount > 1) {
    echo "⚠️  You have multiple schedulers running!\n";
    echo "   Action: Stop all but one 'schedule:work' process\n";
    echo "   Command: taskkill /PID <pid> /F (for each duplicate)\n\n";
}

if ($workCount === 0 && empty($laravelTasks)) {
    echo "ℹ️  No scheduler detected. You need to set one up:\n";
    echo "   Option 1: Run 'php artisan schedule:work' in a terminal\n";
    echo "   Option 2: Create Windows Task Scheduler task:\n";
    echo "      - Trigger: Every minute\n";
    echo "      - Action: Run program 'php'\n";
    echo "      - Arguments: artisan schedule:run\n";
    echo "      - Start in: " . __DIR__ . "\n\n";
}

echo "✅ Locking mechanism has been added to prevent overlapping executions.\n";
echo "   Commands will now skip if another instance is already running.\n";

