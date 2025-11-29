# How to Stop Pinging

## Quick Stop Methods

### Method 1: Stop the Laravel Scheduler (If Running)

If you started the scheduler with:
```bash
php artisan schedule:work
```

**To stop it:**
1. Find the terminal/command prompt window running `schedule:work`
2. Press `Ctrl + C` to stop it
3. Or close the terminal window

### Method 2: Stop Queue Workers

If you started queue workers with `start_ping_workers.bat` or manually:

**Windows:**
1. Open Task Manager (`Ctrl + Shift + Esc`)
2. Look for processes named:
   - `php artisan queue:work`
   - `Queue Worker 1`, `Queue Worker 2`, etc.
3. End these processes

**Or close the worker windows:**
- Look for command prompt windows titled "Queue Worker 1", "Queue Worker 2", etc.
- Close those windows

**Command line:**
```bash
# Find and kill queue workers
taskkill /F /FI "WINDOWTITLE eq Queue Worker*"
```

### Method 3: Disable Scheduled Tasks (Permanent)

To permanently stop automatic pinging, comment out the scheduled tasks:

#### Option A: Disable in `app/Console/Kernel.php`

Edit `app/Console/Kernel.php` and comment out the ping-related tasks:

```php
protected function schedule(Schedule $schedule): void
{
    // ... other tasks ...
    
    // COMMENTED OUT - Disabled automatic pinging
    // $schedule->command('devices:monitor')
    //          ->everyThirtySeconds()
    //          ->description('Fast device monitoring every 30 seconds')
    //          ->withoutOverlapping();

    // $schedule->command('devices:monitor --continuous --interval=120')
    //          ->everyTwoMinutes()
    //          ->description('Continuous device monitoring backup')
    //          ->withoutOverlapping();

    // $schedule->command('devices:ping-all')
    //          ->everyFiveMinutes()
    //          ->description('Ping all devices and update their status and last_ping timestamp')
    //          ->withoutOverlapping();
}
```

#### Option B: Disable in `bootstrap/app.php`

Edit `bootstrap/app.php` and comment out:

```php
->withSchedule(function (Schedule $schedule): void {
    // ... other tasks ...
    
    // COMMENTED OUT - Disabled automatic pinging
    // $schedule->command('devices:ping-all')
    //          ->everyFiveMinutes()
    //          ->description('Ping all devices and update their status and last_ping timestamp')
    //          ->withoutOverlapping();
})
```

### Method 4: Check for Background Processes

**Check if scheduler is running:**
```bash
# Windows PowerShell
Get-Process | Where-Object {$_.ProcessName -like "*php*" -and $_.CommandLine -like "*schedule*"}

# Or check Task Manager for PHP processes
```

**Check if queue workers are running:**
```bash
# Windows PowerShell
Get-Process | Where-Object {$_.ProcessName -like "*php*" -and $_.CommandLine -like "*queue*"}
```

## Complete Stop Checklist

1. ✅ **Stop Laravel Scheduler**
   - Find and close `php artisan schedule:work` terminal
   - Or press `Ctrl + C` in that terminal

2. ✅ **Stop Queue Workers**
   - Close all "Queue Worker" command prompt windows
   - Or use Task Manager to end PHP processes running queue:work

3. ✅ **Disable Scheduled Tasks** (Optional - for permanent stop)
   - Comment out ping tasks in `app/Console/Kernel.php`
   - Comment out ping tasks in `bootstrap/app.php`

4. ✅ **Verify Stopped**
   - Check Task Manager - no PHP processes should be running
   - Check logs - no new ping entries should appear

## Re-enable Pinging Later

To start pinging again:

1. **Uncomment the scheduled tasks** in the files above
2. **Start the scheduler:**
   ```bash
   php artisan schedule:work
   ```
3. **Start queue workers (if needed):**
   ```bash
   start_ping_workers.bat
   ```

## Manual Ping (One-Time)

If you want to ping devices manually without automatic scheduling:

```bash
php artisan devices:ping-all
```

This will ping once and stop (no automatic repetition).

