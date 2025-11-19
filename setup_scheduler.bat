@echo off
echo ========================================
echo Laravel Scheduler Auto-Setup
echo ========================================
echo.
echo This will create a Windows Task Scheduler task
echo that runs Laravel scheduler every minute.
echo.
echo NOTE: This requires Administrator privileges!
echo.
pause

powershell -ExecutionPolicy Bypass -File "%~dp0setup_scheduler.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Setup failed! Make sure you ran as Administrator.
    pause
    exit /b 1
)

