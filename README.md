# HỆ THỐNG THU NGÂN POS NHÀ HÀNG - AURA RESTAURANT (v4.2.0-PRO)

> Hệ thống phần mềm bán hàng & quản lý bàn chuyên nghiệp dành cho thu ngân nhà hàng đứng quầy order món cho bàn, in tạm tính, xuất bill gửi bếp và thanh toán.

---

## 📱 ỨNG DỤNG DI ĐỘNG FLUTTER (ANDROID / IOS / WINDOWS)

Dự án Flutter hoàn chỉnh nằm tại thư mục: `d:\Sale\mobile_app`
- Tái hiện **100% giao diện điện thoại** theo đúng hình chụp bạn đã gửi:
  - Header Dark Navy thương hiệu AURA RESTAURANT, trạng thái hoạt động, Avatar Thu Hằng.
  - Tab chuyển đổi nhanh: *Sơ đồ bàn (F1)* và *Thực đơn món (F2)*.
  - Bộ lọc cuộn ngang các khu vực: *Tất cả (24), Tầng 1 (8), Tầng 2 (8), Phòng VIP (4), Sân vườn (4)*.
  - Lưới 2 cột thẻ bàn trực quan: *BÀN 01, BÀN 02 (Chờ tính - vàng nhạt), BÀN 03 (Đang chọn - viền xanh nổi bật + tích xanh), VIP 01, MANG VỀ, BÀN 04-06 (Bàn trống)*.
  - Thanh thông tin nổi cố định đáy màn hình (Sticky Floating Order Bar): Hiển thị *BÀN 03 • 4 món • 461,700 đ*, nút *Báo Bếp* và nút *Xem Đơn & Tính Tiền >*.
  - Modal Bottom Sheet vuốt lên để xem toàn bộ danh sách 4 món, ghi chú bếp, tiền tạm tính, giảm giá hội viên 5%, VAT 8%, nút Báo Bếp và Thanh Toán.
  - Thanh điều hướng đáy 5 tab: *Phòng bàn, Thực đơn, Bếp & Bar, Đơn hàng, Cá nhân*.

#### Cách khởi chạy App Flutter:
1. Nhấp đúp vào file [run_flutter_mobile.bat](file:///d:/Sale/run_flutter_mobile.bat) tại thư mục `d:\Sale`.
2. Hoặc chạy qua dòng lệnh:
   ```bash
   cd d:\Sale\mobile_app
   flutter run -d chrome     # Chạy trên trình duyệt
   # hoặc
   flutter run -d windows    # Chạy trên Windows Desktop
   # hoặc kết nối điện thoại Android/iOS:
   flutter run
   ```

---

## 🔐 TÀI KHOẢN ĐĂNG NHẬP & PHÂN QUYỀN (LƯU TRONG CSDL)

Hệ thống đã tích hợp trang đăng nhập và phân quyền 2 Role lưu trực tiếp trong bảng `users` của CSDL:

| Vai trò (Role) | Tên đăng nhập | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin` | `admin123` | Toàn quyền hệ thống: Xem báo cáo doanh thu, quản lý danh sách nhân viên & phân quyền, thêm/xóa món ăn trong CSDL, chuyển đổi qua lại giữa màn hình POS và Admin Portal. |
| **Thu ngân 1 (Cashier)** | `thuhang` | `123456` | Đứng quầy order món, in tạm tính, gửi bếp, thanh toán bill, chuyển bàn. Ca sáng (07:00 - 15:00). |
| **Thu ngân 2 (Cashier)** | `minhtri` | `123456` | Đứng quầy order món, in tạm tính, gửi bếp, thanh toán bill. Ca chiều (15:00 - 23:00). |

> **Tính năng menu xổ xuống tại góc thu ngân:**
> - Bấm vào tên thu ngân ở góc phải trên cùng sẽ xổ xuống menu hiển thị: Tên nhân viên, Vai trò, Ca trực, Email.
> - Nút **Đăng xuất (Logout)** để thoát phiên làm việc và trở về trang đăng nhập.
> - Với tài khoản **Admin**, menu xổ xuống có thêm nút chuyển đổi nhanh **Bảng Điều Khiển Quản Trị (Admin Dashboard)**.

---

## 📸 Giao diện được thiết kế chuẩn xác 100% theo hình mẫu:
- **Thanh Header phong cách Dark Navy**: Hiển thị tên nhà hàng, chi nhánh Tràng Tiền, tab chuyển *Sơ đồ bàn (F1)*, *Thực đơn món (F2)*, ô tìm kiếm nhanh (F3), trạng thái máy in hóa đơn & bếp, thông tin ca thu ngân Thu Hằng.
- **Bộ lọc khu vực**: *Tất cả (24)*, *Tầng 1 (8)*, *Tầng 2 (8)*, *Phòng VIP (4)*, *Sân vườn (4)*. Thống kê bàn: Trống: 16 | Có khách: 6 | Chờ thanh toán: 2.
- **Lưới thẻ bàn trực quan**:
  - **BÀN 01**: 45p, 4 khách, 3 món đã gửi bếp, 485,000 đ.
  - **BÀN 02**: Chờ tính, 2 khách, Đã in tạm tính, 320,000 đ (thẻ màu vàng nhạt).
  - **BÀN 03 (Đang chọn)**: Viền xanh nổi bật kèm tích xanh, 1h 10p, 3 khách, 4 món, 461,700 đ.
  - **MANG VỀ**: Thẻ xanh đen, Đơn #108, Chờ đóng gói, 185,000 đ.
  - **VIP 01**: 2h 05p, 8 khách, 8 món, 2,450,000 đ.
  - **BÀN 04 - 10**: Thẻ bàn trống, 4 chỗ / 6 chỗ.
- **Cột chi tiết đơn bên phải (Order Panel)**:
  - Thông tin Bàn 03, Giờ vào 11:30, Chuyển bàn, Huỷ món.
  - Khách hàng: Anh Hoàng (0912.888.xxx), Bảng giá chung (Niêm yết).
  - Danh sách 4 món:
    1. **Mì xào bò thượng hạng** (2 x 110,000 = 220,000 đ) - Ít hành tây, làm mềm - Đã gửi bếp
    2. **Cơm chiên hải sản Hoàng Kim** (1 x 125,000 = 125,000 đ) - Cay nhẹ - Đã gửi bếp
    3. **Nước cam ép tươi** (2 x 45,000 = 90,000 đ) - Không đường, nhiều đá - Mới thêm (Chưa báo quầy)
    4. **Khăn lạnh thơm cao cấp** (3 x 5,000 = 15,000 đ) - Tự động tính
  - Tính tiền chuẩn:
    - Tạm tính (4 món): 450,000 đ
    - Giảm giá hội viên (5%): -22,500 đ
    - Thuế VAT (8%): 34,200 đ
    - **TỔNG THANH TOÁN: 461,700 đ**
  - Cụm nút thao tác:
    - **Báo Bếp (F10)**: Xuất phiếu order bếp chuẩn khổ nhiệt K80 và đổi trạng thái món thành *Đã gửi bếp*.
    - **In Tạm Tính**: Xuất phiếu tạm tính cho khách xem trước, đổi trạng thái bàn sang *Chờ tính*.
    - **Tách Đơn**: Tách hóa đơn.
    - **THANH TOÁN (F9)**: Mở popup thanh toán (Tiền mặt, VietQR, Thẻ POS), tính tiền thối và hoàn tất đơn.
- **Thanh trạng thái bên dưới (Footer)**: Hotline 1900 6888, Phím tắt F1 - F10.

---

## 🚀 CÁCH KHỞI CHẠY HỆ THỐNG

### Cách 1: Chạy nhanh bằng 1 click chuột (Khuyến nghị)
Nhấp đúp chuột vào file:
```
D:\Sale\start_pos.bat
```
File này sẽ tự động chạy cả Laravel Backend (port 8000), React Frontend (port 5173) và mở trình duyệt cho bạn trải nghiệm ngay.

---

### Cách 2: Chạy thủ công bằng dòng lệnh

#### 1. Khởi động Backend (Laravel):
Mở terminal PowerShell trong thư mục `d:\Sale\backend`:
```powershell
cd d:\Sale\backend
php artisan serve --port=8000
```
Backend API sẽ lắng nghe tại: `http://127.0.0.1:8000/api/pos`

#### 2. Khởi động Frontend (ReactJS):
Mở một cửa sổ terminal khác trong thư mục `d:\Sale\frontend`:
```powershell
cd d:\Sale\frontend
npm run dev
```
Truy cập giao diện tại: `http://localhost:5173`

---

## 🗄️ CẤU HÌNH DATABASE (MYSQL & SQLITE)

Hệ thống hỗ trợ 100% cả **MySQL** và **SQLite**:

1. **Chế độ SQLite (Mặc định)**:
   - Đã được tạo sẵn và migrate đầy đủ dữ liệu mẫu tại `backend/database/database.sqlite`.
   - Chạy được ngay tức thì mà không cần cài đặt thêm mật khẩu cơ sở dữ liệu.

2. **Chế độ MySQL**:
   - Nếu bạn muốn kết nối trực tiếp vào MySQL Service đang chạy trên máy (Port 3307):
   - Mở file [backend/.env](file:///d:/Sale/backend/.env) và cập nhật thông số:
     ```env
     DB_CONNECTION=mysql
     DB_HOST=127.0.0.1
     DB_PORT=3307
     DB_DATABASE=aura_pos
     DB_USERNAME=root
     DB_PASSWORD=mật_khẩu_mysql_của_bạn
     ```
   - Sau đó chạy lệnh tạo bảng và nạp dữ liệu:
     ```powershell
     cd d:\Sale\backend
     php artisan migrate:fresh --seed
     ```
   - Hoặc bạn có thể import trực tiếp file SQL đã được xuất sẵn tại:
     [backend/database/aura_pos_mysql.sql](file:///d:/Sale/backend/database/aura_pos_mysql.sql) vào phpMyAdmin / Navicat / HeidiSQL.
