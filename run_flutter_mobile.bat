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
echo [1] Chạy App Flutter ngay (Mở cửa sổ Chrome chuyên biệt - Khuyên dùng)
echo [2] Chạy trên Thiết bị Android / Máy ảo Emulator
echo [3] Chạy trên Windows Desktop (Yêu cầu Visual Studio C++)
echo.

set /p choice="Nhập lựa chọn của bạn (1, 2 hoặc 3, mặc định là 1): "

if "%choice%"=="2" (
    echo Đang tìm thiết bị Android / iOS...
    cd /d "%~dp0mobile_app"
    D:\flutter\bin\flutter.bat run
) else if "%choice%"=="3" (
    echo Đang khởi chạy Flutter trên Windows Desktop...
    cd /d "%~dp0mobile_app"
    D:\flutter\bin\flutter.bat run -d windows
) else (
    echo Đang khởi chạy Flutter App trên Chrome...
    cd /d "%~dp0mobile_app"
    D:\flutter\bin\flutter.bat run -d chrome --web-port 8088
)

pause
