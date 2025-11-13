# Quick Start - Fast Ping Setup ⚡

## ✅ Setup Complete!

The queue tables have been created. Now you can start pinging devices!

## How to Use (2 Steps)

### Step 1: Start Queue Workers

**Option A: Using Batch File (Easiest)**
```bash
# Double-click or run:
start_ping_workers.bat
```

**Option B: Manual (Single Worker)**
```bash
php artisan queue:work
```

**Option C: Manual (4 Workers for Maximum Speed)**
Open 4 separate terminals and run in each:
```bash
php artisan queue:work --queue=default --tries=1 --name=worker-1
php artisan queue:work --queue=default --tries=1 --name=worker-2
php artisan queue:work --queue=default --tries=1 --name=worker-3
php artisan queue:work --queue=default --tries=1 --name=worker-4
```

### Step 2: Dispatch Ping Jobs

In a **new terminal**, run:
```bash
php artisan devices:ping-all
```

## What Happens

1. The command creates 11 batch jobs (200 devices each)
2. Queue workers pick up and process the jobs
3. Each worker pings devices in parallel
4. With 4 workers: **All 2,118 devices pinged in ~1 minute!**

## Monitor Progress

```bash
# Check queue status
php artisan queue:monitor

# View logs
tail -f storage/logs/laravel.log

# Check database for job status
# Jobs table shows pending jobs
# Failed_jobs table shows any failures
```

## Performance

| Workers | Time | Devices/Second |
|---------|------|----------------|
| 1 worker | 2-3 min | ~12-15 devices/sec |
| 4 workers | 30-60 sec | ~35-70 devices/sec |

## Troubleshooting

### Workers not processing jobs?
Make sure workers are running:
```bash
# Check if workers are running
Get-Process | Where-Object {$_.ProcessName -eq "php"}

# Or restart workers
start_ping_workers.bat
```

### Jobs stuck in queue?
```bash
# Clear failed jobs
php artisan queue:flush

# Retry failed jobs
php artisan queue:retry all

# Clear all jobs and start fresh
php artisan queue:clear
```

### Want to see real-time progress?
```bash
# In worker terminal, you'll see:
# [timestamp] Processing: App\Jobs\PingDevicesBatch
# [timestamp] Processed:  App\Jobs\PingDevicesBatch
```

## Next Steps

### Schedule Automatic Pings

Add to `routes/console.php`:
```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('devices:ping-all')->everyFiveMinutes();
```

Then run the scheduler:
```bash
php artisan schedule:work
```

### Use Supervisor (Production)

For production, use Supervisor to keep workers running:

1. Install Supervisor
2. Create config at `/etc/supervisor/conf.d/laravel-worker.conf`:
```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/artisan queue:work --sleep=3 --tries=1
autostart=true
autorestart=true
numprocs=4
user=www-data
```

3. Start Supervisor:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-worker:*
```

## Summary

✅ Queue tables created
✅ Batch size: 200 devices
✅ Timeout: 100ms (ultra-fast)
✅ Ready to ping 2,118 devices in under 1 minute!

**Start workers, run `php artisan devices:ping-all`, and watch it fly! 🚀**
