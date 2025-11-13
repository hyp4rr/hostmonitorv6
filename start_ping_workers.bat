@echo off
REM Batch script to start multiple queue workers for faster ping processing
REM Optimized for better system performance - uses 2 workers by default

echo ========================================
echo Starting Queue Workers (Optimized)
echo ========================================
echo.
echo This will start 2 queue workers to balance speed and system load.
echo For more workers, edit this file or start them manually.
echo.

echo Starting Worker 1...
start "Queue Worker 1" cmd /k "php artisan queue:work --queue=default --tries=1 --name=worker-1"
timeout /t 1 /nobreak >nul

echo Starting Worker 2...
start "Queue Worker 2" cmd /k "php artisan queue:work --queue=default --tries=1 --name=worker-2"
timeout /t 1 /nobreak >nul

echo.
echo ========================================
echo 2 Queue Workers Started!
echo ========================================
echo.
echo Each worker is running in a separate window.
echo Close the windows to stop the workers.
echo.
echo Now you can run: php artisan devices:ping-all
echo.
echo TIP: For low-end systems, use 1 worker.
echo      For high-end systems, you can start 3-4 workers.
echo.
pause
