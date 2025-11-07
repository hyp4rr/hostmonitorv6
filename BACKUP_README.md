# Database Backup Guide

## Quick Backup

### Option 1: PowerShell (Recommended)
```powershell
.\backup_database.ps1
```

### Option 2: Batch File
```cmd
backup_database.bat
```

## Manual Backup

If the scripts don't work, you can manually backup using pg_dump:

### Find PostgreSQL Installation
Common locations:
- `C:\Program Files\PostgreSQL\18\bin\`
- `C:\Program Files\PostgreSQL\17\bin\`
- `C:\PostgreSQL\18\bin\`

### Run Backup Command
```cmd
"C:\Program Files\PostgreSQL\18\bin\pg_dump.exe" -U hyper -h 127.0.0.1 -p 5432 -F p -f database_backup.sql hostmonitordb
```

## Database Information
- **Database Name:** hostmonitordb
- **Username:** hyper
- **Host:** 127.0.0.1
- **Port:** 5432
- **Type:** PostgreSQL 18.0

## Backup File Format
- **Filename:** `database_backup_YYYYMMDD_HHMMSS.sql`
- **Format:** Plain SQL (human-readable)
- **Location:** Project root directory

## Restore Database

To restore from a backup:

```cmd
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U hyper -h 127.0.0.1 -p 5432 -d hostmonitordb -f database_backup_YYYYMMDD_HHMMSS.sql
```

Or create a new database first:
```cmd
# Create new database
"C:\Program Files\PostgreSQL\18\bin\createdb.exe" -U hyper -h 127.0.0.1 -p 5432 hostmonitordb_restored

# Restore backup
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U hyper -h 127.0.0.1 -p 5432 -d hostmonitordb_restored -f database_backup_YYYYMMDD_HHMMSS.sql
```

## Avoid Password Prompts

Set the PGPASSWORD environment variable:

### PowerShell
```powershell
$env:PGPASSWORD = "your_password"
.\backup_database.ps1
```

### CMD
```cmd
set PGPASSWORD=your_password
backup_database.bat
```

## Automated Backups

### Windows Task Scheduler
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., Daily at 2 AM)
4. Action: Start a program
5. Program: `powershell.exe`
6. Arguments: `-File "C:\Users\hyper\Herd\hostmonitorv6\backup_database.ps1"`

## Backup Best Practices

✅ **Keep multiple backups** - Don't overwrite old backups  
✅ **Store offsite** - Copy to cloud storage or external drive  
✅ **Test restores** - Verify backups work before you need them  
✅ **Automate** - Schedule regular backups  
✅ **Document** - Keep notes on backup procedures  

## Current Database Tables (12)

1. branches
2. devices
3. locations
4. hardware_models
5. hardware_details
6. brands
7. alerts
8. monitoring_history
9. users
10. activity_logs
11. migrations
12. sessions

## Backup Size Estimate

- **Small deployment** (< 100 devices): ~1-5 MB
- **Medium deployment** (100-1000 devices): ~5-50 MB
- **Large deployment** (1000+ devices): ~50-500 MB

*Size depends on monitoring history retention*
