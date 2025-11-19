# Quick script to check scheduler status

$taskName = "Laravel Scheduler - HostMonitor"
$task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if ($task) {
    $info = Get-ScheduledTaskInfo -TaskName $taskName
    Write-Host "Task Status: $($task.State)" -ForegroundColor Cyan
    Write-Host "Last Run Time: $($info.LastRunTime)" -ForegroundColor White
    Write-Host "Last Run Result: $($info.LastTaskResult)" -ForegroundColor $(if ($info.LastTaskResult -eq 0) { "Green" } else { "Red" })
    Write-Host "Next Run Time: $($info.NextRunTime)" -ForegroundColor White
    Write-Host "Missed Runs: $($info.NumberOfMissedRuns)" -ForegroundColor $(if ($info.NumberOfMissedRuns -eq 0) { "Green" } else { "Yellow" })
    Write-Host ""
    Write-Host "Action:" -ForegroundColor Cyan
    Write-Host "  Execute: $($task.Actions[0].Execute)" -ForegroundColor White
    Write-Host "  Arguments: $($task.Actions[0].Arguments)" -ForegroundColor White
    Write-Host "  Working Dir: $($task.Actions[0].WorkingDirectory)" -ForegroundColor White
} else {
    Write-Host "Task not found!" -ForegroundColor Red
}

