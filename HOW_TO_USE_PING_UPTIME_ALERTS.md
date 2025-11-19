# How to Use Ping All, Uptime Monitoring, and Alerts

## 1. 🚀 How to Run "Ping All"

### Option A: Using the UI Button (Recommended)
1. Go to the **Devices** page (`/monitor/devices`)
2. Look for the **"Ping All"** button in the header (next to the grid/list view toggle)
3. Click the button - it will:
   - Ping all active devices in the current branch
   - Show a loading spinner while pinging
   - Display results with statistics (online/offline counts, uptime percentage)
   - Automatically refresh device statuses after completion

### Option B: Using the API Endpoint
```bash
# Make a POST request to ping all devices
curl -X POST http://your-domain/ping-all-devices \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"
```

### Important Notes:
- **Queue Workers Required**: The ping system uses background jobs. Make sure queue workers are running:
  ```bash
  php artisan queue:work
  ```
- The ping operation processes devices in batches (100 devices per batch) to avoid timeouts
- Estimated completion time is shown in the alert message
- Page will auto-refresh after estimated completion time

---

## 2. ⏱️ How to Activate Uptime Monitoring

Uptime monitoring is **automatically scheduled** to run every minute, but you need to ensure the Laravel scheduler is running.

### Step 1: Check Scheduled Tasks
The uptime update command is already scheduled in `app/Console/Kernel.php`:
```php
// Update device uptime calculations every minute
$schedule->command('devices:update-uptime')
         ->everyMinute()
         ->description('Update device uptime calculations based on monitoring history')
         ->withoutOverlapping();
```

### Step 2: Start the Laravel Scheduler
**On Windows (using Task Scheduler):**
1. Open Task Scheduler
2. Create a new task that runs every minute
3. Action: Start a program
4. Program: `php`
5. Arguments: `artisan schedule:run`
6. Start in: `C:\Users\hyper\Herd\hostmonitorv6`

**On Linux/Mac (using cron):**
```bash
# Add this to your crontab (crontab -e)
* * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1
```

**Alternative: Run Manually**
You can also run the uptime update command manually:
```bash
php artisan devices:update-uptime
```

### Step 3: Verify It's Working
- Check device uptime percentages in the Devices page
- Uptime is calculated based on monitoring history (last 24 hours)
- Online devices increment their uptime, offline devices reset to 0

---

## 3. 🔔 Does the 2-Minute Alert Work?

### Current Status: ✅ **Fully Implemented and Working!**

The 2-minute alert system is now fully implemented and will automatically create alerts when devices are offline for 2+ minutes.

### How It Works:
1. ✅ **Automatic Monitoring**: Devices are monitored every 30 seconds (scheduled task)
2. ✅ **Offline Tracking**: When a device goes offline, `offline_since` timestamp is set
3. ✅ **Alert Creation**: After 2 minutes of being offline, an alert is automatically created
4. ✅ **Duplicate Prevention**: The `offline_alert_sent` flag prevents duplicate alerts
5. ✅ **Alert Reset**: When device comes back online, the flag is reset for future alerts

### Alert Details:
- **Type**: `device_offline`
- **Severity**: `high`
- **Category**: `connectivity`
- **Title**: "Device Offline: [Device Name]"
- **Message**: Includes device name, IP address, and offline duration
- **Status**: `active`
- **Downtime**: Shows minutes offline

### Where to View Alerts:
1. Go to the **Alerts** page (`/monitor/alerts` or `/configuration?entity=alerts`)
2. Filter by status: `active` to see current alerts
3. Filter by severity: `high` to see offline alerts
4. Alerts can be acknowledged or resolved

### Testing the Alert System:
1. Set a device to offline (or disconnect it from network)
2. Wait 2+ minutes
3. The monitoring system will automatically:
   - Detect the device is offline
   - Track the offline duration
   - Create an alert after 2 minutes
4. Check the Alerts page to see the new alert

### Important Notes:
- Alerts are created automatically during scheduled monitoring (every 30 seconds)
- No manual intervention needed - the system handles everything
- Each device gets only one alert per offline incident (prevents spam)
- When device comes back online, the alert flag resets for future incidents

---

## Summary

| Feature | Status | How to Use |
|---------|--------|------------|
| **Ping All** | ✅ Working | Click "Ping All" button on Devices page |
| **Uptime Monitoring** | ✅ Scheduled | Ensure `php artisan schedule:run` is running every minute |
| **2-Minute Alerts** | ✅ Working | Automatic - alerts created when devices offline for 2+ minutes |

---

## Quick Commands Reference

```bash
# Ping all devices (via queue)
php artisan queue:work

# Update uptime manually
php artisan devices:update-uptime

# Run device monitoring
php artisan devices:monitor

# Run scheduler (needs to run every minute)
php artisan schedule:run

# Check scheduled tasks
php artisan schedule:list
```

