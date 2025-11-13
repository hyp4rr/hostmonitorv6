# Quick Setup: Optimized Ping System

## What Changed?

Your ping system now has **smart resource management** to prevent computer slowdown:
- ✅ Limits concurrent processes (max 30 by default)
- ✅ Adds delays between batches (50ms by default)
- ✅ Monitors CPU and throttles automatically
- ✅ Fully configurable via `.env` file

## Quick Start (3 Steps)

### Step 1: Add Configuration to `.env`

Copy these lines to your `.env` file (or keep defaults):

```env
# Ping System Configuration (Optimized for most systems)
PING_MAX_CONCURRENT=30
PING_BATCH_DELAY_MS=50
PING_CPU_AWARE_THROTTLING=true
PING_TIMEOUT_MS=200
PING_QUEUE_BATCH_SIZE=100
PING_RECOMMENDED_WORKERS=2
```

### Step 2: Start Queue Workers

Run the optimized batch file (starts 2 workers):

```bash
start_ping_workers.bat
```

### Step 3: Ping Devices

```bash
php artisan devices:ping-all
```

That's it! The system will now ping devices without slowing down your computer.

## If Your Computer is Slow

Edit your `.env` file and reduce these values:

```env
PING_MAX_CONCURRENT=10      # Reduce from 30 to 10
PING_BATCH_DELAY_MS=100     # Increase from 50 to 100
```

Then restart the workers.

## If You Want Faster Pings

Edit your `.env` file and increase these values:

```env
PING_MAX_CONCURRENT=50      # Increase from 30 to 50
PING_BATCH_DELAY_MS=20      # Reduce from 50 to 20
```

And start more workers by editing `start_ping_workers.bat`.

## Need Help?

See the full guide: `PING_SYSTEM_GUIDE.md`

## Performance Comparison

| System Type | Settings | Time for 2000 devices |
|-------------|----------|----------------------|
| **Low-End** | 10 concurrent, 100ms delay | 5-8 minutes |
| **Balanced** (default) | 30 concurrent, 50ms delay | 2-4 minutes |
| **High-End** | 50 concurrent, 20ms delay | 1-2 minutes |

**The default settings work well for most systems!**
