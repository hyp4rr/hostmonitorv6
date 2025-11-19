# PowerShell script to automatically create and configure Windows Task Scheduler for Laravel
# This will create a task that runs schedule:run every minute

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Laravel Scheduler Auto-Setup" -ForegroundColor Cyan
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

# Get project directory
$projectPath = $PSScriptRoot
$phpPath = ""

# Try to find PHP path
Write-Host "Detecting PHP path..." -ForegroundColor Cyan

# Check common PHP locations
$possiblePhpPaths = @(
    "C:\php8.4\php.exe",
    "C:\Users\hyper\Herd\Herd\bin\php.exe",
    "C:\Program Files\Herd\bin\php.exe",
    "C:\Program Files\Laravel\Herd\bin\php.exe",
    "C:\Herd\bin\php.exe",
    "C:\xampp\php\php.exe",
    "C:\laragon\bin\php\php-*\php.exe"
)

foreach ($path in $possiblePhpPaths) {
    if (Test-Path $path) {
        $phpPath = $path
        break
    }
}

# If not found, try to find PHP in PATH
if (-not $phpPath) {
    try {
        $phpPath = (Get-Command php -ErrorAction Stop).Source
    } catch {
        Write-Host "PHP not found in PATH" -ForegroundColor Red
        Write-Host "Please enter the full path to PHP executable:" -ForegroundColor Yellow
        $phpPath = Read-Host "PHP Path"
        
        if (-not (Test-Path $phpPath)) {
            Write-Host "Invalid PHP path: $phpPath" -ForegroundColor Red
            exit 1
        }
    }
}

Write-Host "Found PHP at: $phpPath" -ForegroundColor Green
Write-Host "Project path: $projectPath" -ForegroundColor Green
Write-Host ""

# Task name
$taskName = "Laravel Scheduler - HostMonitor"

# Check if task already exists
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if ($existingTask) {
    Write-Host "Task already exists!" -ForegroundColor Yellow
    $response = Read-Host "Do you want to delete and recreate it? (Y/N)"
    
    if ($response -eq "Y" -or $response -eq "y") {
        Write-Host "Deleting existing task..." -ForegroundColor Yellow
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
        Write-Host "Task deleted" -ForegroundColor Green
    } else {
        Write-Host "Setup cancelled" -ForegroundColor Red
        exit 0
    }
}

Write-Host ""
Write-Host "Creating scheduled task..." -ForegroundColor Cyan

# Create the action (what to run)
$action = New-ScheduledTaskAction -Execute $phpPath -Argument "artisan schedule:run" -WorkingDirectory $projectPath

# Create the trigger (when to run - every minute, starting now)
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 1) -RepetitionDuration (New-TimeSpan -Days 365)

# Create settings
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable:$false `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1)

# Create principal (run as current user, highest privileges)
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType S4U -RunLevel Highest

# Register the task
try {
    Register-ScheduledTask `
        -TaskName $taskName `
        -Action $action `
        -Trigger $trigger `
        -Settings $settings `
        -Principal $principal `
        -Description "Runs Laravel scheduler every minute for device monitoring, uptime updates, and alerts" `
        -Force | Out-Null
    
    Write-Host "Task created successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Start the task immediately
    Write-Host "Starting task..." -ForegroundColor Cyan
    Start-ScheduledTask -TaskName $taskName
    Write-Host "Task started!" -ForegroundColor Green
    Write-Host ""
    
    # Show task info
    Write-Host "Task Information:" -ForegroundColor Cyan
    Write-Host "   Name: $taskName" -ForegroundColor White
    Write-Host "   Status: $((Get-ScheduledTask -TaskName $taskName).State)" -ForegroundColor White
    Write-Host "   Next Run: $((Get-ScheduledTaskInfo -TaskName $taskName).NextRunTime)" -ForegroundColor White
    Write-Host ""
    
    Write-Host "Setup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "The scheduler will now run every minute automatically." -ForegroundColor Cyan
    Write-Host "You can manage it in Task Scheduler (taskschd.msc)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To verify it is working:" -ForegroundColor Yellow
    Write-Host "   1. Open Task Scheduler" -ForegroundColor White
    Write-Host "   2. Find task: $taskName" -ForegroundColor White
    Write-Host "   3. Check Last Run Result (should be 0x0 for success)" -ForegroundColor White
    Write-Host "   4. Check logs: storage\logs\laravel.log" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "Error creating task: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   1. Make sure you are running as Administrator" -ForegroundColor White
    Write-Host "   2. Check if PHP path is correct: $phpPath" -ForegroundColor White
    Write-Host "   3. Check if project path is correct: $projectPath" -ForegroundColor White
    exit 1
}

Write-Host "Press Enter to continue" -ForegroundColor Cyan
$null = Read-Host
