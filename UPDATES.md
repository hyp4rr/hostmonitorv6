# System Updates - Device Monitoring

## ✅ Completed Features

### 1. **Table View with Sortable Columns**
- Replaced list view with a professional table layout
- Columns: Name, IP Address, Uptime, Status, Location
- Click any column header to sort ascending/descending
- Visual indicators (arrows) show current sort field and direction
- Responsive design with hover effects

### 2. **Improved Ping Detection**
- Fixed ping command to properly detect online/offline status
- Now checks for "Reply from" or "TTL=" in ping output
- Uses 2-second timeout for more reliable detection
- Properly escapes IP addresses for security

### 3. **Real-time Status Updates**
- Status now reflects actual ping results
- Automatic updates every 5 minutes via scheduler
- Manual ping available: `php artisan switches:ping`

## How to Use

### View Devices
1. Navigate to **http://hostmonitorv6.test/monitor/devices**
2. Switch between Grid and Table view using toggle buttons
3. Click column headers to sort (Name, IP, Uptime, Status, Location)
4. Use filters: Search, Status, Location
5. Click any row to see device details

### Sorting
- **Click once**: Sort ascending (A→Z, 0→9)
- **Click twice**: Sort descending (Z→A, 9→0)
- **Active column**: Shows up/down arrow
- **Inactive columns**: Shows sort icon (faded)

### Start Real-time Monitoring
```bash
# Start the scheduler (keeps running)
php artisan schedule:work

# Or manually ping all devices
php artisan switches:ping
```

### Check Status
```bash
# View in browser
http://hostmonitorv6.test/monitor/devices

# Check database
php artisan tinker
>>> App\Models\NetworkSwitch::where('status', 'offline')->count()
```

## Technical Details

### Files Modified
1. **`app/Console/Commands/PingSwitches.php`**
   - Improved ping detection logic
   - Added output parsing for "Reply from" and "TTL="
   - Increased timeout to 2 seconds

2. **`resources/js/pages/monitor/devices.tsx`**
   - Added table view with sortable columns
   - Implemented sort state management
   - Added sort indicators (ChevronUp, ChevronDown, ArrowUpDown)
   - Responsive table design with hover effects

3. **`bootstrap/app.php`**
   - Scheduled automatic ping every 5 minutes

### Database
- **Table**: `switches`
- **Status field**: Updated in real-time by ping command
- **355 devices** imported and monitored

### Ping Logic
```php
// Windows ping: 1 packet, 2 second timeout
ping -n 1 -w 2000 [IP]

// Checks for:
- Return code === 0
- Output contains "Reply from" OR "TTL="
```

## Performance
- **Ping speed**: ~2 seconds per device
- **Total scan time**: ~12 minutes for 355 devices
- **Scheduled**: Every 5 minutes (may overlap if network is slow)
- **Frontend**: Instant sorting, no page reload

## Next Steps (Optional)
1. **Parallel Ping**: Use Laravel queues for faster scanning
2. **WebSocket**: Real-time updates without page refresh
3. **Ping History**: Track uptime/downtime over time
4. **Alerts**: Email/SMS when device goes offline
5. **Graphs**: Visualize uptime statistics
