# PowerShell script to check the status of Laravel Scheduler task

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Laravel Scheduler Status Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$taskName = "Laravel Scheduler - HostMonitor"

# Check if task exists
$task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if (-not $task) {
    Write-Host "Task not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Run setup_scheduler.ps1 to create the task." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press Enter to continue" -ForegroundColor Cyan
    $null = Read-Host
    exit 1
}

# Get task info
$taskInfo = Get-ScheduledTaskInfo -TaskName $taskName
$taskActions = $task.Actions

Write-Host "Task Found: $taskName" -ForegroundColor Green
Write-Host ""
Write-Host "Task Details:" -ForegroundColor Cyan
Write-Host "   Status: $($task.State)" -ForegroundColor White
Write-Host "   Last Run Time: $($taskInfo.LastRunTime)" -ForegroundColor White
Write-Host "   Last Run Result: $($taskInfo.LastTaskResult)" -ForegroundColor $(if ($taskInfo.LastTaskResult -eq 0) { "Green" } else { "Red" })
Write-Host "   Next Run Time: $($taskInfo.NextRunTime)" -ForegroundColor White
Write-Host "   Number of Missed Runs: $($taskInfo.NumberOfMissedRuns)" -ForegroundColor $(if ($taskInfo.NumberOfMissedRuns -eq 0) { "Green" } else { "Yellow" })
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "   Executable: $($taskActions.Execute)" -ForegroundColor White
Write-Host "   Arguments: $($taskActions.Arguments)" -ForegroundColor White
Write-Host "   Working Directory: $($taskActions.WorkingDirectory)" -ForegroundColor White
Write-Host ""

# Check if task is enabled
if ($task.State -eq "Ready") {
    Write-Host "Task is ready and will run automatically" -ForegroundColor Green
} elseif ($task.State -eq "Running") {
    Write-Host "Task is currently running" -ForegroundColor Yellow
} elseif ($task.State -eq "Disabled") {
    Write-Host "Task is disabled!" -ForegroundColor Yellow
    Write-Host "   Enable it in Task Scheduler or run:" -ForegroundColor White
    Write-Host "   Enable-ScheduledTask -TaskName `"$taskName`"" -ForegroundColor Cyan
} else {
    Write-Host "Task status: $($task.State)" -ForegroundColor Yellow
}

Write-Host ""

# Check last run result
if ($taskInfo.LastTaskResult -ne 0) {
    Write-Host "Last run had an error (Result code: $($taskInfo.LastTaskResult))" -ForegroundColor Yellow
    Write-Host "   Check storage\logs\laravel.log for details" -ForegroundColor White
    Write-Host ""
}

# Show recent log entries if available
$logPath = Join-Path $PSScriptRoot "storage\logs\laravel.log"
if (Test-Path $logPath) {
    Write-Host "Recent Log Entries (last 5 lines):" -ForegroundColor Cyan
    try {
        $logLines = Get-Content $logPath -Tail 5 -ErrorAction SilentlyContinue
        if ($logLines) {
            $logLines | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
        }
    } catch {
        Write-Host "   (Could not read log file)" -ForegroundColor Yellow
    }
    Write-Host ""
}

Write-Host "Tips:" -ForegroundColor Cyan
Write-Host "   - To manually run: Start-ScheduledTask -TaskName `"$taskName`"" -ForegroundColor White
Write-Host "   - To stop: Stop-ScheduledTask -TaskName `"$taskName`"" -ForegroundColor White
Write-Host "   - To view in Task Scheduler: taskschd.msc" -ForegroundColor White
Write-Host ""

Write-Host "Press Enter to continue" -ForegroundColor Cyan
$null = Read-Host
