# PowerShell script to remove the Laravel Scheduler task

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Remove Laravel Scheduler Task" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "This script requires Administrator privileges!" -ForegroundColor Yellow
    Write-Host "Please right-click and select Run as Administrator" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press Enter to continue" -ForegroundColor Cyan
    $null = Read-Host
    exit 1
}

$taskName = "Laravel Scheduler - HostMonitor"

# Check if task exists
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if (-not $existingTask) {
    Write-Host "Task not found." -ForegroundColor Yellow
    Write-Host "Nothing to remove." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press Enter to continue" -ForegroundColor Cyan
    $null = Read-Host
    exit 0
}

Write-Host "Found task: $taskName" -ForegroundColor Cyan
Write-Host "Status: $($existingTask.State)" -ForegroundColor White
Write-Host ""

$response = Read-Host "Are you sure you want to delete this task? (Y/N)"

if ($response -eq "Y" -or $response -eq "y") {
    try {
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
        Write-Host "Task deleted successfully!" -ForegroundColor Green
    } catch {
        Write-Host "Error deleting task: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Cancelled" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press Enter to continue" -ForegroundColor Cyan
$null = Read-Host
