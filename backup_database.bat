@echo off
echo Creating database backup...
set BACKUP_DATE=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DATE=%BACKUP_DATE: =0%
set BACKUP_FILE=database_backup_%BACKUP_DATE%.sql

echo Backup file: %BACKUP_FILE%

REM Try to find pg_dump in common PostgreSQL installation paths
set PGDUMP_PATH=

if exist "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe" (
    set PGDUMP_PATH=C:\Program Files\PostgreSQL\18\bin\pg_dump.exe
) else if exist "C:\Program Files\PostgreSQL\17\bin\pg_dump.exe" (
    set PGDUMP_PATH=C:\Program Files\PostgreSQL\17\bin\pg_dump.exe
) else if exist "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe" (
    set PGDUMP_PATH=C:\Program Files\PostgreSQL\16\bin\pg_dump.exe
) else if exist "C:\Program Files\PostgreSQL\15\bin\pg_dump.exe" (
    set PGDUMP_PATH=C:\Program Files\PostgreSQL\15\bin\pg_dump.exe
) else if exist "C:\PostgreSQL\18\bin\pg_dump.exe" (
    set PGDUMP_PATH=C:\PostgreSQL\18\bin\pg_dump.exe
)

if "%PGDUMP_PATH%"=="" (
    echo ERROR: Could not find pg_dump.exe
    echo Please locate your PostgreSQL installation and run:
    echo "C:\Path\To\PostgreSQL\bin\pg_dump.exe" -U hyper -h 127.0.0.1 -p 5432 -F p -f %BACKUP_FILE% hostmonitordb
    pause
    exit /b 1
)

echo Found pg_dump at: %PGDUMP_PATH%
echo.
echo Creating backup... (you may be prompted for password)
"%PGDUMP_PATH%" -U hyper -h 127.0.0.1 -p 5432 -F p -f %BACKUP_FILE% hostmonitordb

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Backup created successfully: %BACKUP_FILE%
    echo File size:
    dir %BACKUP_FILE% | find "%BACKUP_FILE%"
) else (
    echo.
    echo ✗ Backup failed with error code: %ERRORLEVEL%
)

echo.
pause
