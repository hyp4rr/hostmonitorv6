@echo off
echo Testing Laravel Scheduler...
echo.
cd /d "%~dp0"
php artisan schedule:list
echo.
echo Running schedule:run once...
php artisan schedule:run
echo.
echo Done! If you see tasks executed above, the scheduler is working.
echo.
pause

