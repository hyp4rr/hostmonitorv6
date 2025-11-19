@echo off
echo ========================================
echo Starting Laravel Scheduler Loop
echo ========================================
echo.
echo This will run schedule:run every minute
echo Press Ctrl+C to stop
echo.

cd /d "%~dp0"

:loop
php artisan schedule:run
timeout /t 60 /nobreak >nul
goto loop

