@echo off
chcp 65001 > nul
title APP FLUTTER - QUÁN TRÀ POS

echo [*] Đang kiểm tra máy chủ Flutter App (cổng 8088)...
netstat -ano | findstr ":8088 " >nul
if errorlevel 1 (
    echo [*] Khởi động máy chủ Flutter App...
    start /min "Flutter_App_Server" cmd /c "php -S 0.0.0.0:8088 -t "%~dp0mobile_app\build\web""
    timeout /t 2 /nobreak >nul
)

echo [*] Đang mở App dưới dạng cửa sổ ứng dụng Mobile...
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="http://localhost:8088" --window-size=420,900
