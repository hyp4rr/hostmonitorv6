# Switch Ping Monitoring Setup

## Overview
The system automatically pings all 355 switches every 5 minutes to check if they are online or offline.

## Commands

### Manual Ping
To manually ping all switches and update their status:
```bash
php artisan switches:ping
```

This will:
- Ping all 355 switches
- Update their status in the database (online/offline)
- Show progress bar
- Display summary (online count / offline count)

### Automatic Ping (Scheduled)

The system is configured to automatically ping all switches **every 5 minutes**.

#### Start the Scheduler

**Option 1: Using Laravel Scheduler (Recommended)**
```bash
php artisan schedule:work
```
This runs the scheduler in the foreground. Keep this terminal open.

**Option 2: Using Windows Task Scheduler**
1. Open Task Scheduler
2. Create a new task
3. Set trigger: Every 5 minutes
4. Set action: Run program
   - Program: `php`
   - Arguments: `artisan switches:ping`
   - Start in: `C:\Users\hyper\Herd\hostmonitorv6`

**Option 3: Using Cron (if on Linux/Mac)**
```bash
* * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
```

## How It Works

1. **Ping Command**: Uses Windows `ping -n 1 -w 1000 [IP]`
   - `-n 1`: Send 1 ping packet
   - `-w 1000`: Wait 1000ms (1 second) for response

2. **Status Update**: 
   - If ping succeeds → status = 'online'
   - If ping fails → status = 'offline'

3. **Database**: Status is saved to SQLite database

4. **Frontend**: Devices page automatically shows updated status

## Configuration

To change ping frequency, edit `bootstrap/app.php`:

```php
->withSchedule(function (Schedule $schedule): void {
    // Change this line:
    $schedule->command('switches:ping')->everyFiveMinutes();
    
    // Options:
    // ->everyMinute()
    // ->everyTwoMinutes()
    // ->everyFiveMinutes()
    // ->everyTenMinutes()
    // ->hourly()
})
```

## Monitoring

### View Current Status
Visit: http://hostmonitorv6.test/monitor/devices

### Check Database
```bash
sqlite3 database/database.sqlite
SELECT status, COUNT(*) FROM switches GROUP BY status;
```

### View Logs
Check Laravel logs for any ping errors:
```bash
tail -f storage/logs/laravel.log
```

## Performance

- **355 switches** × **1 second timeout** = ~6 minutes per full scan
- Runs every 5 minutes (may overlap if network is slow)
- Consider increasing timeout or running in parallel for faster results

## Troubleshooting

### Ping command not found
Make sure you're on Windows or adjust the ping command in:
`app/Console/Commands/PingSwitches.php`

For Linux/Mac:
```php
$command = "ping -c 1 -W 1 {$ip}";
```

### Scheduler not running
Make sure to run:
```bash
php artisan schedule:work
```

### Too slow
To speed up, you can ping in parallel using Laravel queues or async processes.
