@echo off
echo ========================================
echo Remove Laravel Scheduler Task
echo ========================================
echo.
echo This will remove the scheduled task.
echo.
echo NOTE: This requires Administrator privileges!
echo.
pause

powershell -ExecutionPolicy Bypass -File "%~dp0remove_scheduler.ps1"

