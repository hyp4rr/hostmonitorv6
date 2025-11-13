# PowerShell script to start multiple queue workers for faster ping processing
# This will run 4 workers in parallel for maximum speed

Write-Host "🚀 Starting Multiple Queue Workers for Fast Ping Processing" -ForegroundColor Green
Write-Host "=" * 60

$workerCount = 4
$jobs = @()

Write-Host "`n📊 Configuration:" -ForegroundColor Cyan
Write-Host "   Workers: $workerCount"
Write-Host "   Queue: default"
Write-Host "   Tries: 1 (no retries)"
Write-Host ""

# Start workers
for ($i = 1; $i -le $workerCount; $i++) {
    Write-Host "✅ Starting Worker #$i..." -ForegroundColor Green
    
    $job = Start-Job -ScriptBlock {
        param($workerId)
        Set-Location $using:PWD
        php artisan queue:work --queue=default --tries=1 --name="worker-$workerId"
    } -ArgumentList $i
    
    $jobs += $job
    Start-Sleep -Milliseconds 500
}

Write-Host "`n✅ All $workerCount workers started!" -ForegroundColor Green
Write-Host "`n📋 Worker Status:" -ForegroundColor Cyan
Get-Job | Format-Table -AutoSize

Write-Host "`n💡 Commands:" -ForegroundColor Yellow
Write-Host "   View worker output:  Get-Job | Receive-Job -Keep"
Write-Host "   Stop all workers:    Get-Job | Stop-Job; Get-Job | Remove-Job"
Write-Host "   Check queue status:  php artisan queue:monitor"
Write-Host ""

Write-Host "⏳ Workers are running in background. Press Ctrl+C to stop monitoring." -ForegroundColor Cyan
Write-Host "   (Workers will continue running even after you close this window)" -ForegroundColor Yellow
Write-Host ""

# Monitor workers
try {
    while ($true) {
        Start-Sleep -Seconds 5
        
        $runningCount = (Get-Job | Where-Object { $_.State -eq 'Running' }).Count
        
        if ($runningCount -eq 0) {
            Write-Host "`n⚠️  All workers have stopped!" -ForegroundColor Red
            break
        }
        
        Write-Host "$(Get-Date -Format 'HH:mm:ss') - $runningCount workers running..." -ForegroundColor Gray
    }
} catch {
    Write-Host "`n⚠️  Monitoring stopped. Workers are still running in background." -ForegroundColor Yellow
}

Write-Host "`n📊 Final Status:" -ForegroundColor Cyan
Get-Job | Format-Table -AutoSize

Write-Host "`n💡 To stop all workers, run: Get-Job | Stop-Job; Get-Job | Remove-Job" -ForegroundColor Yellow
