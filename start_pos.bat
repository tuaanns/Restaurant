@echo off
chcp 65001 > nul
title KHỞI CHẠY HỆ THỐNG POS NHÀ HÀNG AURA (HỖ TRỢ MẠNG LAN)
cls
echo ================================================================
echo    HỆ THỐNG THU NGÂN POS NHÀ HÀNG AURA RESTAURANT
echo    Hỗ trợ đa thiết bị trong mạng nội bộ LAN / Wi-Fi
echo ================================================================
echo.

:: Lấy địa chỉ IP mạng nội bộ của máy chủ
set LOCAL_IP=127.0.0.1
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /r /c:"IPv4.*192\." /c:"IPv4.*10\." /c:"IPv4.*172\."') do (
    if not defined DETECTED_IP (
        set DETECTED_IP=%%a
    )
)
if defined DETECTED_IP (
    set LOCAL_IP=%DETECTED_IP: =%
)

:: Kiểm tra và khởi động MySQL (XAMPP) nếu chưa chạy
netstat -ano | findstr 3306 > nul
if errorlevel 1 (
    if exist "C:\xampp\mysql\bin\mysqld.exe" (
        echo [*] Đang khởi động MySQL CSDL...
        start "MySQL Database" /min "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --standalone
        timeout /t 2 > nul
    )
)

echo [1/2] Đang khởi động Backend Laravel API (Port 8000, Host 0.0.0.0) ...
start "Backend Laravel API (Port 8000)" cmd /k "cd /d %~dp0backend && php artisan serve --host=0.0.0.0 --port=8000"

timeout /t 2 > nul

echo [2/2] Đang khởi động Frontend ReactJS (Port 5173, Host 0.0.0.0) ...
start "Frontend React Vite (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 > nul

echo.
echo ================================================================
echo  ĐÃ KHỞI CHẠY THÀNH CÔNG!
echo.
echo  * Trên máy thu ngân chính:
echo    - Truy cập: http://localhost:5173
echo.
echo  * Trên các máy khác (iPad, điện thoại nhân viên, máy bàn phụ):
echo    - Kết nối chung mạng Wi-Fi với máy chủ này
echo    - Mở trình duyệt và truy cập: http://%LOCAL_IP%:5173
echo ================================================================
echo.

start http://localhost:5173
pause
