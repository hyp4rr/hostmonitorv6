@echo off
echo ========================================
echo Starting Continuous Device Monitoring
echo ========================================
echo.
echo This will run monitoring continuously every 30 seconds
echo Press Ctrl+C to stop
echo.

cd /d "%~dp0"

:loop
php artisan devices:monitor --continuous --interval=30
if %ERRORLEVEL% NEQ 0 (
    echo Error occurred, restarting in 5 seconds...
    timeout /t 5 /nobreak >nul
)
goto loop

