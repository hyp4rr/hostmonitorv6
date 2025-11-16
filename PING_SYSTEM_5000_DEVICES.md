# Scalable Ping System for 5000+ Devices

## Overview

This system is designed to handle large-scale device monitoring (5000+ devices) using a queue-based batch processing architecture.

## Architecture

### Components

1. **PingAllDevicesJob** - Main dispatcher job
   - Quickly dispatches batch jobs
   - Returns immediately to avoid nginx timeout
   - Stores metadata in cache

2. **PingDeviceBatchJob** - Batch processing job
   - Processes 50 devices per batch
   - Runs in parallel using `proc_open`
   - Updates device statuses with warning support

### Status Logic

- **Online**: Device responds in < 1000ms (1 second)
- **Warning**: Device responds but takes > 1000ms (slow response)
- **Offline**: Device doesn't respond at all

## Setup

### 1. Start Queue Worker

You need to run a queue worker to process the batch jobs:

```bash
php artisan queue:work --queue=ping
```

For better performance with 5000+ devices, run multiple workers:

```bash
# Windows PowerShell
.\start_ping_workers.ps1

# Or manually start multiple workers
Start-Process powershell -ArgumentList "php artisan queue:work --queue=ping"
Start-Process powershell -ArgumentList "php artisan queue:work --queue=ping"
Start-Process powershell -ArgumentList "php artisan queue:work --queue=ping"
```

### 2. Configuration

The warning threshold (default: 1000ms) can be adjusted in `PingAllDevicesJob`:

```php
protected $warningThreshold = 1000; // 1 second
```

## How It Works

1. **User clicks "Ping All Devices"**
   - Route dispatches `PingAllDevicesJob`
   - Returns immediately with "processing" status

2. **PingAllDevicesJob runs**
   - Gets all active device IDs
   - Splits into batches of 50 devices
   - Dispatches `PingDeviceBatchJob` for each batch
   - Stores metadata in cache

3. **PingDeviceBatchJob processes**
   - Pings 50 devices in parallel
   - Determines status:
     - Online: response < 1000ms
     - Warning: response > 1000ms but device responded
     - Offline: no response
   - Updates database

4. **User refreshes page**
   - Sees updated device statuses

## Performance

- **Batch Size**: 100 devices per batch (optimized for speed)
- **Concurrent Pings**: 100 per batch (all in parallel)
- **Ping Timeout**: 2000ms (2 seconds) per device
- **Warning Threshold**: 1000ms (1 second)
- **Max Wait Time**: 2.5 seconds per batch (optimized)

### Estimated Times (Single Worker)

- **100 devices**: ~3 seconds (1 batch × 2.5s)
- **500 devices**: ~12.5 seconds (5 batches × 2.5s)
- **1000 devices**: ~25 seconds (10 batches × 2.5s)
- **5000 devices**: ~2 minutes (50 batches × 2.5s)

### Estimated Times (4 Workers - Recommended)

- **100 devices**: ~3 seconds
- **500 devices**: ~3-4 seconds
- **1000 devices**: ~6-7 seconds
- **5000 devices**: ~30-40 seconds

## Monitoring

Check queue status:

```bash
php artisan queue:monitor
```

View failed jobs:

```bash
php artisan queue:failed
```

## Troubleshooting

### Jobs not processing

Make sure queue worker is running:

```bash
php artisan queue:work --queue=ping
```

### Too slow

- Increase number of queue workers
- Reduce batch size (but increases total batches)
- Reduce ping timeout (but may miss slow devices)

### Warning threshold

Adjust in `PingAllDevicesJob.php`:

```php
protected $warningThreshold = 1000; // Change to desired milliseconds
```

