# Laravel Scheduler Setup for Windows

## Problem
The `php artisan schedule:run` command runs once and stops. This is by design - it's meant to be called every minute by a scheduler.

## Solution Options

### Option 0: Automatic Setup (Easiest - Recommended!) ⭐
Use the provided script to automatically create and configure the Task Scheduler:

**Double-click `setup_scheduler.bat` (or right-click → Run as Administrator)**

Or use PowerShell directly:
**Right-click `setup_scheduler.ps1` → Run as Administrator**

This script will:
- ✅ Automatically detect PHP path (checks Herd, XAMPP, Laragon, etc.)
- ✅ Create the scheduled task
- ✅ Configure it to run every minute
- ✅ Start it immediately
- ✅ Show you the status

**Other useful scripts:**
- `check_scheduler.bat` / `check_scheduler.ps1` - Check if scheduler is running and show status
- `remove_scheduler.bat` / `remove_scheduler.ps1` - Remove the scheduled task

### Option 1: Continuous Monitoring (Recommended for Development/Testing)
Run the monitoring command continuously in a loop:

```bash
# Run this in a command prompt
php artisan devices:monitor --continuous --interval=30
```

Or use the batch file:
```bash
start_continuous_monitoring.bat
```

This will:
- Run monitoring every 30 seconds
- Continue running until you press Ctrl+C
- Automatically restart if there's an error

### Option 2: Task Scheduler Setup (Recommended for Production)
Set up Windows Task Scheduler to run `schedule:run` every minute:

#### Step 1: Create a Batch File
Create `run_scheduler.bat` in your project root:
```batch
@echo off
cd /d "C:\Users\hyper\Herd\hostmonitorv6"
php artisan schedule:run
```

#### Step 2: Set Up Task Scheduler
1. Open **Task Scheduler** (search for it in Windows)
2. Click **Create Basic Task**
3. Name: `Laravel Scheduler`
4. Trigger: **Daily** → **Recur every: 1 day** → **Repeat task every: 1 minute** → **Duration: Indefinitely**
5. Action: **Start a program**
   - Program: `C:\Users\hyper\Herd\Herd\bin\php.exe` (or your PHP path)
   - Arguments: `artisan schedule:run`
   - Start in: `C:\Users\hyper\Herd\hostmonitorv6`
6. Check **Open the Properties dialog** → Click **Finish**
7. In Properties:
   - General tab: Check **Run whether user is logged on or not**
   - Settings tab: 
     - Check **Allow task to be run on demand**
     - Check **Run task as soon as possible after a scheduled start is missed**
     - Check **If the task fails, restart every: 1 minute**
     - Set **Attempt to restart up to: 3 times**

#### Step 3: Test
- Right-click the task → **Run**
- Check if it runs successfully
- Check logs: `storage/logs/laravel.log`

### Option 3: Loop Script (Simple Alternative)
Use the provided `start_scheduler_loop.bat`:

```bash
start_scheduler_loop.bat
```

This will:
- Run `schedule:run` every 60 seconds
- Continue running until you press Ctrl+C
- Keep a command prompt window open

**Or use PowerShell version:**
```powershell
.\start_continuous_monitoring.ps1
```

This provides better output formatting and error handling.

## What Gets Scheduled

Based on `app/Console/Kernel.php`:

1. **Device Monitoring**: Every 30 seconds
   ```php
   $schedule->command('devices:monitor')->everyThirtySeconds();
   ```

2. **Uptime Updates**: Every minute
   ```php
   $schedule->command('devices:update-uptime')->everyMinute();
   ```

3. **Notifications**: Every minute (9 AM - 5 PM)
   ```php
   $schedule->command('devices:send-notifications')->everyMinute();
   ```

## Verify It's Working

1. **Check Logs**:
   ```bash
   tail -f storage/logs/laravel.log
   ```

2. **Check Device Status**: Go to Devices page and see if statuses update

3. **Check Alerts**: After 2 minutes offline, check Alerts page

4. **Check Uptime**: Device uptime percentages should update every minute

## Troubleshooting

### Scheduler Not Running
- Check Task Scheduler → Task Scheduler Library → Find your task → Check "Last Run Result"
- Check if PHP path is correct
- Check if project path is correct
- Run manually: `php artisan schedule:run` to see errors

### Tasks Not Executing
- Check `withoutOverlapping()` - if a task is still running, it won't start again
- Check logs for errors
- Verify database connection

### Continuous Monitoring Stops
- Check for errors in the console
- Check if PHP process is still running
- Check system resources (memory, CPU)

## Quick Commands

```bash
# Run scheduler once (for testing)
php artisan schedule:run

# List scheduled tasks
php artisan schedule:list

# Run continuous monitoring
php artisan devices:monitor --continuous --interval=30

# Run uptime update manually
php artisan devices:update-uptime

# Run monitoring once
php artisan devices:monitor
```

