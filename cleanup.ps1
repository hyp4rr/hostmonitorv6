Write-Host "Cleaning up unnecessary files..." -ForegroundColor Green

# Remove deprecated context files
Write-Host "Removing deprecated context files..." -ForegroundColor Yellow
Remove-Item resources/js/contexts/branch-context.tsx -ErrorAction SilentlyContinue

# Remove example test files
Write-Host "Removing example test files..." -ForegroundColor Yellow
Remove-Item tests/Feature/ExampleTest.php -ErrorAction SilentlyContinue
Remove-Item tests/Unit/ExampleTest.php -ErrorAction SilentlyContinue

# Remove unused Laravel files
Write-Item "Removing unused Laravel files..." -ForegroundColor Yellow
Remove-Item resources/js/components/Welcome.tsx -ErrorAction SilentlyContinue
Remove-Item resources/js/pages/Welcome.tsx -ErrorAction SilentlyContinue

# Clear caches
Write-Host "Clearing caches..." -ForegroundColor Yellow
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Clear logs
Write-Host "Clearing log files..." -ForegroundColor Yellow
Remove-Item storage/logs/*.log -ErrorAction SilentlyContinue

# Clean build artifacts
Write-Host "Cleaning build artifacts..." -ForegroundColor Yellow
Remove-Item public/build/* -Recurse -ErrorAction SilentlyContinue
Remove-Item node_modules/.vite -Recurse -ErrorAction SilentlyContinue

# Remove unused node modules (optional - requires reinstall)
# Write-Host "Removing node_modules (will need to run npm install)..." -ForegroundColor Yellow
# Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "`nCleanup complete!" -ForegroundColor Green
Write-Host "Run 'npm install' if you removed node_modules" -ForegroundColor Cyan
Write-Host "Run 'php artisan migrate:fresh --seed' to reset database" -ForegroundColor Cyan
