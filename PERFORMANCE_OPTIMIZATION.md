# Performance Optimization Guide

## Overview
This document outlines the performance optimizations implemented to handle 1,500+ devices efficiently.

## Optimizations Implemented

### 1. Database Indexes
**File:** `database/migrations/2025_11_07_020838_add_performance_indexes_to_devices_table.php`

Added composite indexes for frequently queried columns:
- `idx_devices_branch_active_status`: (branch_id, is_active, status)
- `idx_devices_category_status`: (category, status)
- `idx_devices_status_active`: (status, is_active)
- `idx_devices_last_ping`: (last_ping)
- `idx_devices_ip_address`: (ip_address)

**To apply:**
```bash
php artisan migrate
```

### 2. API Pagination
**File:** `app/Http/Controllers/Api/DeviceController.php`

- Implemented pagination (default 50 items per page)
- Added filtering by category and status
- Caching results for 5 minutes

**API Usage:**
```javascript
// Fetch devices with pagination
GET /api/devices?page=1&per_page=50&category=switches&status=online
```

### 3. Lazy Loading
**File:** `app/Http/Controllers/MonitorController.php`

- Removed eager loading of all devices on page load
- Only load device counts instead of full device objects
- Devices are now fetched via API when needed

### 4. Batch Pinging with Queue
**Files:**
- `app/Jobs/PingDevicesBatch.php`
- `app/Console/Commands/PingAllDevices.php`

Ping devices in batches using Laravel queues for better performance.

**Usage:**
```bash
# Ping all devices in batches of 50
php artisan devices:ping-all --batch-size=50

# Run queue worker to process ping jobs
php artisan queue:work
```

### 5. Caching Strategy
- Dashboard stats: 2 minutes (120 seconds)
- Device lists: 5 minutes (300 seconds)
- Cache keys include filters for accurate results

## Recommended Setup

### 1. Run Migrations
```bash
php artisan migrate
```

### 2. Set Up Queue Worker
For production, use Supervisor to keep queue worker running:

```bash
# Start queue worker
php artisan queue:work --tries=1 --timeout=300
```

### 3. Schedule Periodic Pinging
Add to `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule)
{
    // Ping all devices every 5 minutes
    $schedule->command('devices:ping-all --batch-size=50')
             ->everyFiveMinutes()
             ->withoutOverlapping();
}
```

Then run the scheduler:
```bash
php artisan schedule:work
```

### 4. Optional: Redis Cache
For better performance, use Redis instead of file cache:

**Install Redis:**
```bash
composer require predis/predis
```

**Update `.env`:**
```env
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
```

## Performance Metrics

### Before Optimization
- Loading 1,511 devices: ~5-10 seconds
- Pinging all devices: ~15-30 minutes (sequential)
- Page load: Slow, unresponsive

### After Optimization
- Loading 50 devices: <1 second
- Pinging all devices: ~2-5 minutes (parallel batches)
- Page load: Fast, responsive
- API responses: Cached, instant

## Frontend Recommendations

### 1. Implement Pagination UI
Update device tables to use pagination:
```typescript
const [page, setPage] = useState(1);
const [perPage, setPerPage] = useState(50);

// Fetch devices with pagination
axios.get(`/api/devices?page=${page}&per_page=${perPage}`)
```

### 2. Add Virtual Scrolling
For large lists, consider using `react-window` or `react-virtualized`:
```bash
npm install react-window
```

### 3. Debounce Search/Filter
Add debouncing to search inputs to reduce API calls:
```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback(
    (value) => fetchDevices(value),
    500
);
```

## Monitoring

### Check Queue Status
```bash
# View failed jobs
php artisan queue:failed

# Retry failed jobs
php artisan queue:retry all

# Clear failed jobs
php artisan queue:flush
```

### Check Cache
```bash
# Clear cache
php artisan cache:clear

# View cache stats (if using Redis)
redis-cli info stats
```

## Troubleshooting

### Slow Queries
```bash
# Enable query logging
DB::enableQueryLog();

# View queries
dd(DB::getQueryLog());
```

### Memory Issues
Increase PHP memory limit in `php.ini`:
```ini
memory_limit = 512M
```

### Queue Not Processing
```bash
# Check queue connection
php artisan queue:work --once

# Restart queue worker
php artisan queue:restart
```

## Future Optimizations

1. **Implement WebSockets** for real-time device status updates
2. **Add Database Replication** for read-heavy operations
3. **Use Elasticsearch** for advanced search and filtering
4. **Implement CDN** for static assets
5. **Add Load Balancing** for multiple servers

## Support

For issues or questions, check:
- Laravel Queue Documentation: https://laravel.com/docs/queues
- Laravel Performance: https://laravel.com/docs/optimization
- Database Indexing: https://laravel.com/docs/migrations#indexes
