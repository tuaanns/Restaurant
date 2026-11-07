<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::get('/', function (Request $request) {
    $host = $request->getHost();
    return response('<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AURA RESTAURANT - Cổng Điều Hướng</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body {
            background-color: #0b1320;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            width: 100%;
            max-width: 480px;
            background: #131f33;
            border: 1px solid #1e2d4a;
            border-radius: 20px;
            padding: 32px 24px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
            text-align: center;
        }
        .logo-box {
            width: 68px;
            height: 68px;
            background: linear-gradient(135deg, #00b4d8, #009688);
            border-radius: 18px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            margin-bottom: 16px;
            box-shadow: 0 8px 24px rgba(0, 150, 136, 0.35);
        }
        h1 { font-size: 22px; font-weight: 800; letter-spacing: 1px; margin-bottom: 6px; }
        p.subtitle { color: #94a3b8; font-size: 13px; margin-bottom: 26px; }
        .notice {
            background: rgba(16, 185, 129, 0.12);
            border: 1px solid rgba(16, 185, 129, 0.3);
            color: #34d399;
            padding: 10px 14px;
            border-radius: 10px;
            font-size: 12.5px;
            font-weight: 600;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        .btn-group { display: flex; flex-direction: column; gap: 12px; }
        .btn {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 18px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 700;
            font-size: 14px;
            transition: all 0.2s ease;
        }
        .btn-primary {
            background: #009688;
            color: #ffffff;
            box-shadow: 0 4px 14px rgba(0, 150, 136, 0.35);
        }
        .btn-primary:hover { background: #00796b; transform: translateY(-1px); }
        .btn-secondary {
            background: #1e293b;
            color: #e2e8f0;
            border: 1px solid #334155;
        }
        .btn-secondary:hover { background: #27354f; }
        .btn-download {
            background: #0284c7;
            color: #ffffff;
        }
        .btn-download:hover { background: #0369a1; }
        .btn-content { display: flex; align-items: center; gap: 12px; text-align: left; }
        .btn-icon { font-size: 20px; }
        .btn-title { font-size: 14px; font-weight: 700; }
        .btn-desc { font-size: 11px; opacity: 0.8; font-weight: 400; margin-top: 2px; }
        .btn-arrow { font-size: 16px; opacity: 0.7; }
        .footer { margin-top: 24px; color: #64748b; font-size: 11.5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo-box">🍽️</div>
        <h1>AURA RESTAURANT</h1>
        <p class="subtitle">Cổng Điều Hướng Hệ Thống Bán Hàng & Phục Vụ</p>

        <div class="notice">
            <span>🟢 Cổng 8000 là Máy Chủ API (Backend) đang hoạt động tốt!</span>
        </div>

        <div class="btn-group">
            <a href="http://' . $host . ':8088" class="btn btn-primary">
                <div class="btn-content">
                    <span class="btn-icon">📱</span>
                    <div>
                        <div class="btn-title">MỞ APP FLUTTER (PORT 8088)</div>
                        <div class="btn-desc">App di động gọi món, báo bếp, in bill, thanh toán</div>
                    </div>
                </div>
                <span class="btn-arrow">→</span>
            </a>

            <a href="http://' . $host . ':5173" class="btn btn-secondary">
                <div class="btn-content">
                    <span class="btn-icon">💻</span>
                    <div>
                        <div class="btn-title">MỞ WEB POS THU NGÂN (PORT 5173)</div>
                        <div class="btn-desc">Giao diện POS màn hình máy thu ngân PC</div>
                    </div>
                </div>
                <span class="btn-arrow">→</span>
            </a>

            <a href="http://' . $host . ':5173/app-aura-pos.apk" class="btn btn-download">
                <div class="btn-content">
                    <span class="btn-icon">📲</span>
                    <div>
                        <div class="btn-title">TẢI FILE CÀI ĐẶT APK (ANDROID)</div>
                        <div class="btn-desc">Cài đặt trực tiếp file app vào điện thoại Android</div>
                    </div>
                </div>
                <span class="btn-arrow">⬇</span>
            </a>
        </div>

        <div class="footer">
            IP Hiện Tại: <strong>' . $host . '</strong> • Hệ thống kết nối thời gian thực
        </div>
    </div>
</body>
</html>', 200, ['Content-Type' => 'text/html; charset=UTF-8']);
});

