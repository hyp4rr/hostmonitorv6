# PostgreSQL Database Backup Script
Write-Host "Creating database backup..." -ForegroundColor Cyan

# Generate backup filename with timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "database_backup_$timestamp.sql"

Write-Host "Backup file: $backupFile" -ForegroundColor Yellow

# Common PostgreSQL installation paths
$pgDumpPaths = @(
    "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe",
    "C:\Program Files\PostgreSQL\17\bin\pg_dump.exe",
    "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe",
    "C:\Program Files\PostgreSQL\15\bin\pg_dump.exe",
    "C:\PostgreSQL\18\bin\pg_dump.exe",
    "C:\PostgreSQL\17\bin\pg_dump.exe"
)

# Find pg_dump
$pgDumpPath = $null
foreach ($path in $pgDumpPaths) {
    if (Test-Path $path) {
        $pgDumpPath = $path
        break
    }
}

if (-not $pgDumpPath) {
    Write-Host "`n✗ ERROR: Could not find pg_dump.exe" -ForegroundColor Red
    Write-Host "`nPlease locate your PostgreSQL installation and run:" -ForegroundColor Yellow
    Write-Host '"C:\Path\To\PostgreSQL\bin\pg_dump.exe" -U hyper -h 127.0.0.1 -p 5432 -F p -f' $backupFile 'hostmonitordb' -ForegroundColor White
    Write-Host "`nOr set PGPASSWORD environment variable to avoid password prompt:" -ForegroundColor Yellow
    Write-Host '$env:PGPASSWORD = "your_password"' -ForegroundColor White
    pause
    exit 1
}

Write-Host "Found pg_dump at: $pgDumpPath" -ForegroundColor Green
Write-Host "`nCreating backup... (you may be prompted for password)" -ForegroundColor Cyan

# Run pg_dump
& $pgDumpPath -U hyper -h 127.0.0.1 -p 5432 -F p -f $backupFile hostmonitordb

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Backup created successfully!" -ForegroundColor Green
    Write-Host "File: $backupFile" -ForegroundColor Yellow
    
    $fileInfo = Get-Item $backupFile
    $fileSizeMB = [math]::Round($fileInfo.Length / 1MB, 2)
    Write-Host "Size: $fileSizeMB MB" -ForegroundColor Yellow
    Write-Host "Location: $($fileInfo.FullName)" -ForegroundColor Yellow
} else {
    Write-Host "`n✗ Backup failed with error code: $LASTEXITCODE" -ForegroundColor Red
}

Write-Host "`nPress any key to continue..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
