# PowerShell script to fix the Laravel Scheduler task PHP path

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fix Laravel Scheduler Task" -ForegroundColor Cyan
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
$task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if (-not $task) {
    Write-Host "Task not found!" -ForegroundColor Red
    Write-Host "Run setup_scheduler.ps1 first to create the task." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press Enter to continue" -ForegroundColor Cyan
    $null = Read-Host
    exit 1
}

Write-Host "Current task configuration:" -ForegroundColor Cyan
$currentAction = $task.Actions[0]
Write-Host "   Execute: $($currentAction.Execute)" -ForegroundColor White
Write-Host "   Arguments: $($currentAction.Arguments)" -ForegroundColor White
Write-Host "   Working Directory: $($currentAction.WorkingDirectory)" -ForegroundColor White
Write-Host ""

# Find PHP path
$phpPath = ""
$possiblePhpPaths = @(
    "C:\php8.4\php.exe",
    "C:\Users\hyper\Herd\Herd\bin\php.exe",
    "C:\Program Files\Herd\bin\php.exe",
    "C:\Herd\bin\php.exe",
    "C:\xampp\php\php.exe"
)

Write-Host "Detecting PHP path..." -ForegroundColor Cyan
foreach ($path in $possiblePhpPaths) {
    if (Test-Path $path) {
        $phpPath = $path
        Write-Host "Found PHP at: $phpPath" -ForegroundColor Green
        break
    }
}

# If not found, try PATH
if (-not $phpPath) {
    try {
        $phpPath = (Get-Command php -ErrorAction Stop).Source
        Write-Host "Found PHP in PATH: $phpPath" -ForegroundColor Green
    } catch {
        Write-Host "PHP not found!" -ForegroundColor Red
        Write-Host "Please enter the full path to PHP executable:" -ForegroundColor Yellow
        $phpPath = Read-Host "PHP Path"
        
        if (-not (Test-Path $phpPath)) {
            Write-Host "Invalid PHP path: $phpPath" -ForegroundColor Red
            exit 1
        }
    }
}

# Get project path
$projectPath = $PSScriptRoot

Write-Host ""
Write-Host "Updating task with:" -ForegroundColor Cyan
Write-Host "   PHP Path: $phpPath" -ForegroundColor White
Write-Host "   Project Path: $projectPath" -ForegroundColor White
Write-Host ""

$response = Read-Host "Update the task? (Y/N)"

if ($response -ne "Y" -and $response -ne "y") {
    Write-Host "Cancelled" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press Enter to continue" -ForegroundColor Cyan
    $null = Read-Host
    exit 0
}

# Create new action with correct PHP path
$newAction = New-ScheduledTaskAction -Execute $phpPath -Argument "artisan schedule:run" -WorkingDirectory $projectPath

# Update the task - only update the Action (Principal and other settings remain unchanged)
try {
    Set-ScheduledTask `
        -TaskName $taskName `
        -Action $newAction | Out-Null
    
    Write-Host "Task updated successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Verify
    $updatedTask = Get-ScheduledTask -TaskName $taskName
    $updatedAction = $updatedTask.Actions[0]
    Write-Host "Updated configuration:" -ForegroundColor Cyan
    Write-Host "   Execute: $($updatedAction.Execute)" -ForegroundColor White
    Write-Host "   Arguments: $($updatedAction.Arguments)" -ForegroundColor White
    Write-Host "   Working Directory: $($updatedAction.WorkingDirectory)" -ForegroundColor White
    Write-Host ""
    
    # Test run
    Write-Host "Testing task..." -ForegroundColor Cyan
    Start-ScheduledTask -TaskName $taskName
    Start-Sleep -Seconds 2
    
    $taskInfo = Get-ScheduledTaskInfo -TaskName $taskName
    Write-Host "Last Run Result: $($taskInfo.LastTaskResult)" -ForegroundColor $(if ($taskInfo.LastTaskResult -eq 0) { "Green" } else { "Yellow" })
    
    if ($taskInfo.LastTaskResult -eq 0) {
        Write-Host "Task is working correctly!" -ForegroundColor Green
    } else {
        Write-Host "Task still has errors. Check storage\logs\laravel.log for details." -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "Error updating task: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Press Enter to continue" -ForegroundColor Cyan
$null = Read-Host

