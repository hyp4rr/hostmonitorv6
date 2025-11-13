# Ping System Performance Guide

## Overview

The improved ping system now includes **resource management** and **CPU throttling** to prevent your computer from slowing down during device monitoring.

## Key Improvements

### 1. **Controlled Concurrency** 🎯
- Limits the number of simultaneous ping processes
- Default: 30 concurrent pings (adjustable)
- Prevents overwhelming your system with hundreds of processes

### 2. **Batch Delays** ⏱️
- Adds small delays between batches of pings
- Default: 50ms delay (adjustable)
- Gives your CPU time to breathe between batches

### 3. **CPU-Aware Throttling** 🧠
- Automatically detects high system load
- Slows down when your computer is busy
- Speeds up when resources are available

### 4. **Configurable Settings** ⚙️
- All settings can be adjusted via `.env` file
- No code changes needed to tune performance
- Easy to optimize for your specific hardware

## Configuration

Add these settings to your `.env` file:

```env
# Maximum concurrent ping processes (recommended: 20-50)
PING_MAX_CONCURRENT=30

# Delay between batches in milliseconds (recommended: 50-100ms)
PING_BATCH_DELAY_MS=50

# Enable CPU-aware throttling (recommended: true)
PING_CPU_AWARE_THROTTLING=true

# Ping timeout in milliseconds (recommended: 200-500ms)
PING_TIMEOUT_MS=200

# Queue batch size (recommended: 50-100 with multiple workers)
PING_QUEUE_BATCH_SIZE=100

# Recommended number of queue workers
PING_RECOMMENDED_WORKERS=2
```

## Performance Profiles

Choose a profile based on your system:

### 🐌 Low-End System (Slow but Safe)
```env
PING_MAX_CONCURRENT=10
PING_BATCH_DELAY_MS=100
PING_CPU_AWARE_THROTTLING=true
PING_TIMEOUT_MS=300
PING_QUEUE_BATCH_SIZE=50
PING_RECOMMENDED_WORKERS=1
```
- **Best for**: Older computers, laptops, systems with limited RAM
- **Speed**: Slower but won't slow down your computer
- **Time for 2000 devices**: ~5-8 minutes

### ⚖️ Balanced System (Recommended)
```env
PING_MAX_CONCURRENT=30
PING_BATCH_DELAY_MS=50
PING_CPU_AWARE_THROTTLING=true
PING_TIMEOUT_MS=200
PING_QUEUE_BATCH_SIZE=100
PING_RECOMMENDED_WORKERS=2
```
- **Best for**: Most modern computers
- **Speed**: Good balance between speed and system load
- **Time for 2000 devices**: ~2-4 minutes

### 🚀 High-End System (Fast)
```env
PING_MAX_CONCURRENT=50
PING_BATCH_DELAY_MS=20
PING_CPU_AWARE_THROTTLING=true
PING_TIMEOUT_MS=200
PING_QUEUE_BATCH_SIZE=150
PING_RECOMMENDED_WORKERS=4
```
- **Best for**: Powerful desktops, servers with good CPU/RAM
- **Speed**: Very fast with minimal impact
- **Time for 2000 devices**: ~1-2 minutes

## How to Use

### Method 1: Scheduled Automatic Pings (Recommended)

The system automatically pings switches every minute via the scheduler. To enable device pings:

1. **Add to scheduler** (already configured in `bootstrap/app.php`):
```php
$schedule->command('switches:ping')->everyMinute();
```

2. **Run the scheduler**:
```bash
php artisan schedule:work
```

### Method 2: Manual Ping All Devices

```bash
# Start queue workers first (optimized - 2 workers)
start_ping_workers.bat

# Then ping all devices
php artisan devices:ping-all
```

### Method 3: Instant Ping (No Queue)

For immediate results without using the queue:

```bash
php artisan devices:ping-instant
```

## Monitoring Performance

### Check if System is Slow

**Windows Task Manager:**
1. Press `Ctrl + Shift + Esc`
2. Check CPU usage
3. If consistently above 80%, reduce `PING_MAX_CONCURRENT`

**Logs:**
```bash
# View ping performance logs
tail -f storage/logs/laravel.log | grep "Pinging devices"
```

### Adjust Settings

If your computer is slow during pings:

1. **Reduce concurrent pings**:
   ```env
   PING_MAX_CONCURRENT=20  # or even 10
   ```

2. **Increase batch delay**:
   ```env
   PING_BATCH_DELAY_MS=100  # or even 200
   ```

3. **Use fewer workers**:
   - Edit `start_ping_workers.bat`
   - Remove Worker 2, 3, 4 sections
   - Keep only Worker 1

If pings are too slow and your computer can handle more:

1. **Increase concurrent pings**:
   ```env
   PING_MAX_CONCURRENT=50
   ```

2. **Reduce batch delay**:
   ```env
   PING_BATCH_DELAY_MS=20
   ```

3. **Use more workers**:
   - Edit `start_ping_workers.bat`
   - Add more worker sections (copy Worker 2 pattern)

## Technical Details

### How It Works

1. **Chunking**: Devices are split into small chunks (default: 30 devices)
2. **Parallel Processing**: Each chunk is pinged in parallel
3. **Batch Delays**: Small delays between chunks prevent CPU overload
4. **CPU Monitoring**: System automatically slows down if CPU is busy
5. **Timeout Management**: Fast timeouts (200ms) prevent waiting for offline devices

### Resource Usage

With default settings (30 concurrent, 50ms delay):
- **CPU Usage**: 20-40% during active pinging
- **Memory**: ~50-100MB additional
- **Network**: Minimal (ICMP packets are tiny)
- **Disk I/O**: Low (only database updates)

### Why This is Better

**Before:**
- ❌ Up to 800 simultaneous processes (with 4 workers × 200 batch size)
- ❌ No delays between batches
- ❌ No CPU monitoring
- ❌ Could freeze your computer

**After:**
- ✅ Maximum 30-50 simultaneous processes
- ✅ Smart delays between batches
- ✅ Automatic CPU throttling
- ✅ Smooth operation without slowdown

## Troubleshooting

### Problem: Computer is still slow

**Solution 1**: Reduce concurrent pings
```env
PING_MAX_CONCURRENT=10
```

**Solution 2**: Increase delays
```env
PING_BATCH_DELAY_MS=200
```

**Solution 3**: Use only 1 worker
```bash
# Manually start just one worker
php artisan queue:work --queue=default --tries=1
```

### Problem: Pings are too slow

**Solution 1**: Increase concurrent pings
```env
PING_MAX_CONCURRENT=50
```

**Solution 2**: Reduce delays
```env
PING_BATCH_DELAY_MS=20
```

**Solution 3**: Use more workers
- Edit `start_ping_workers.bat` and add more workers

### Problem: Some devices timeout incorrectly

**Solution**: Increase timeout
```env
PING_TIMEOUT_MS=500
```

### Problem: Queue jobs are stuck

**Solution**: Restart workers
1. Close all worker windows
2. Run `start_ping_workers.bat` again

## Best Practices

1. **Start with default settings** - They work well for most systems
2. **Monitor your CPU** - Use Task Manager to check load
3. **Adjust gradually** - Change one setting at a time
4. **Test after changes** - Run a manual ping to see the effect
5. **Use CPU throttling** - Keep `PING_CPU_AWARE_THROTTLING=true`
6. **Don't over-optimize** - 2-4 minutes for 2000 devices is good enough

## Quick Reference

| Setting | Low-End | Balanced | High-End |
|---------|---------|----------|----------|
| Max Concurrent | 10 | 30 | 50 |
| Batch Delay (ms) | 100 | 50 | 20 |
| Timeout (ms) | 300 | 200 | 200 |
| Queue Batch Size | 50 | 100 | 150 |
| Workers | 1 | 2 | 4 |
| Est. Time (2000 devices) | 5-8 min | 2-4 min | 1-2 min |

## Summary

The improved ping system now:
- ✅ Limits concurrent processes to prevent system overload
- ✅ Adds delays between batches for smoother operation
- ✅ Monitors CPU and throttles automatically
- ✅ Is fully configurable via `.env` file
- ✅ Works well on low-end and high-end systems
- ✅ Won't freeze or slow down your computer

**Default configuration is optimized for most systems and should work well without any changes!**
