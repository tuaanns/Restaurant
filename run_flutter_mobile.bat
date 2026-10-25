@echo off
chcp 65001 > nul
title KHỞI CHẠY APP FLUTTER AURA RESTAURANT POS (ANDROID / IOS / WINDOWS / WEB)
cls
echo =========================================================================
echo    APP FLUTTER AURA RESTAURANT POS (ANDROID / IOS / WINDOWS DESKTOP)
echo =========================================================================
echo.
echo Bạn muốn khởi chạy ứng dụng Flutter trên thiết bị nào?
echo.
echo [1] Chạy trên Windows Desktop (Mặc định - Mở ngay trên máy)
echo [2] Chạy trên Trình duyệt Web (Chrome)
echo [3] Chạy trên Thiết bị Android / iOS Emulator
echo.

set /p choice="Nhập lựa chọn của bạn (1, 2 hoặc 3): "

if "%choice%"=="2" (
    echo Đang khởi chạy Flutter Web trên Chrome...
    cd /d "%~dp0mobile_app"
    flutter run -d chrome
) else if "%choice%"=="3" (
    echo Đang tìm thiết bị Android / iOS...
    cd /d "%~dp0mobile_app"
    flutter run
) else (
    echo Đang khởi chạy Flutter trên Windows Desktop...
    cd /d "%~dp0mobile_app"
    flutter run -d windows
)

pause
