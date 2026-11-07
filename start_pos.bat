@echo off
title AURA RESTAURANT POS
cls
echo ================================================================
echo    HE THONG THU NGAN POS NHA HANG AURA
echo ================================================================
echo.

REM Kiem tra MySQL (Chinh xac cong 3306, tranh nham voi 33060)
netstat -ano | findstr /r ":3306[^0-9]" >nul
if errorlevel 1 (
    if exist "C:\xampp\mysql\bin\mysqld.exe" (
        echo [*] Dang khoi dong CSDL MySQL...
        start "MySQL_Aura" /min "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --standalone
        ping 127.0.0.1 -n 4 >nul
    )
)

echo [1/2] Dang khoi dong Backend API tai cong 8000...
start "Aura_Backend_API" cmd /k "cd /d %~dp0backend && php artisan serve --host=0.0.0.0 --port=8000"

ping 127.0.0.1 -n 3 >nul

echo [2/2] Dang khoi dong Frontend POS tai cong 5173...
start "Aura_Frontend_POS" cmd /k "cd /d %~dp0frontend && npm run dev"

ping 127.0.0.1 -n 3 >nul

echo.
echo ================================================================
echo    HE THONG DA KHOI DONG THANH CONG!
echo.
echo    * May thu ngan: http://localhost:5173
echo    * Thiet bi khac (iPad, Dien thoai): 
echo      Xem dia chi IP hien thi trong cua so Aura_Frontend_POS
echo ================================================================
echo.
echo Dang tu dong mo trinh duyet...

REM Mo dung 1 tab trinh duyet duy nhat
start "" "http://localhost:5173"

echo.
echo He thong dang hoat dong. KHONG TAT CUA SO NAY trong gio ban hang.
echo.
pause
