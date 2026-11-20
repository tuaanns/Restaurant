@echo off
title APP FLUTTER - QUAN TRA POS
cls

set "PATH=D:\php-8.5.1-nts-Win32-vs17-x64;C:\xampp\php;%PATH%"

echo ================================================================
echo    KHOI DONG APP FLUTTER - QUAN TRA POS
echo ================================================================
echo.

REM 1. Kiem tra va khoi dong MySQL (cong 3306)
netstat -ano | findstr /r ":3306[^0-9]" >nul
if errorlevel 1 (
    if exist "C:\xampp\mysql\bin\mysqld.exe" (
        echo [*] Dang khoi dong MySQL...
        start "MySQL_Aura" /min "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --standalone
        ping 127.0.0.1 -n 4 >nul
    )
)

REM 2. Kiem tra va khoi dong Laravel Backend API (cong 8000)
netstat -ano | findstr /r ":8000[^0-9]" >nul
if errorlevel 1 (
    echo [*] Dang khoi dong Backend API tai cong 8000...
    start "Aura_Backend_API" /min cmd /k "cd /d %~dp0backend && php artisan serve --host=0.0.0.0 --port=8000"
    ping 127.0.0.1 -n 3 >nul
)

REM 3. Kiem tra va khoi dong Flutter App Web Server (cong 8088)
netstat -ano | findstr /r ":8088[^0-9]" >nul
if errorlevel 1 (
    echo [*] Dang khoi dong may chu Flutter App tai cong 8088...
    start "Flutter_App_Server" /min cmd /k "cd /d %~dp0mobile_app\build\web && php -S 0.0.0.0:8088"
    ping 127.0.0.1 -n 3 >nul
)

echo [*] Dang mo App giao dien Mobile tren Chrome...
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="http://localhost:8088" --window-size=420,900
) else (
    start "" "http://localhost:8088"
)

echo.
echo ================================================================
echo    APP FLUTTER DA DUOC KHOI DONG THANH CONG!
echo    URL: http://localhost:8088
echo ================================================================
echo.
ping 127.0.0.1 -n 4 >nul
