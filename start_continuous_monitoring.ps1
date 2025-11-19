# PowerShell script to run continuous device monitoring
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Continuous Device Monitoring" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will run monitoring continuously every 30 seconds" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Change to project directory
Set-Location $PSScriptRoot

$checkCount = 0
$maxChecks = 10000  # Run for a very long time

while ($checkCount -lt $maxChecks) {
    $checkCount++
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "`n📊 Check #$checkCount - $timestamp" -ForegroundColor Green
    
    try {
        & php artisan devices:monitor
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠️  Error occurred, will retry in 5 seconds..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        } else {
            Write-Host "✅ Monitoring completed successfully" -ForegroundColor Green
            Write-Host "⏳ Waiting 30 seconds until next check..." -ForegroundColor Cyan
            Start-Sleep -Seconds 30
        }
    } catch {
        Write-Host "❌ Exception: $_" -ForegroundColor Red
        Write-Host "⏳ Waiting 5 seconds before retry..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
}

Write-Host "`n⚠️  Maximum check limit reached. Restart to continue." -ForegroundColor Yellow

