<?php

use App\Models\DiningTable;
use App\Models\KitchenTicket;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "========================================================\n";
echo "   TIẾN TRÌNH DỌN DẸP DỮ LIỆU BÁN HÀNG THỬ NGHIỆM\n";
echo "========================================================\n\n";

$ordersCount = Order::count();
$itemsCount = OrderItem::count();
$ticketsCount = KitchenTicket::count();
$occupiedTables = DiningTable::where('status', '!=', 'empty')->count();

echo "Hiện tại trong CSDL:\n";
echo " - Số đơn hàng: $ordersCount\n";
echo " - Số món trong đơn: $itemsCount\n";
echo " - Số phiếu in bếp: $ticketsCount\n";
echo " - Số bàn đang có khách: $occupiedTables\n\n";

echo "Đang tiến hành dọn dẹp...\n";

// Tắt foreign key check để truncate an toàn
Schema::disableForeignKeyConstraints();

KitchenTicket::truncate();
OrderItem::truncate();
Order::truncate();

// Đưa toàn bộ bàn về trạng thái Trống (empty)
DiningTable::query()->update([
    'status' => 'empty',
    'guest_count' => 0,
    'started_at' => null,
    'notes' => null,
]);

Schema::enableForeignKeyConstraints();

// Đồng thời dọn dẹp file CSDL dự phòng SQLite nếu có
if (file_exists(__DIR__ . '/database/database.sqlite')) {
    try {
        $sqlite = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');
        $sqlite->exec("DELETE FROM orders;");
        $sqlite->exec("DELETE FROM order_items;");
        $sqlite->exec("DELETE FROM kitchen_tickets;");
        $sqlite->exec("UPDATE dining_tables SET status = 'empty', guest_count = 0, started_at = NULL, notes = NULL;");
        echo " - File SQLite dự phòng (database.sqlite): Đã dọn dẹp sạch sẽ!\n";
    } catch (\Exception $e) {
        // ignore
    }
}

echo "\n>>> KẾT QUẢ SAU KHI DỌN DẸP:\n";
echo " - Số đơn hàng: " . Order::count() . " (Đã xóa hết, doanh thu về 0đ)\n";
echo " - Số món trong đơn: " . OrderItem::count() . "\n";
echo " - Số phiếu in bếp: " . KitchenTicket::count() . "\n";
echo " - Số bàn đang có khách: " . DiningTable::where('status', '!=', 'empty')->count() . " (Tất cả bàn đã về màu xanh trống)\n";
echo " - Danh mục món ăn: " . \App\Models\Category::count() . " nhóm (Được giữ nguyên vẹn)\n";
echo " - Món ăn thực đơn: " . \App\Models\Product::count() . " món (Được giữ nguyên vẹn)\n";
echo " - Tài khoản người dùng: " . \App\Models\User::count() . " tài khoản (Được giữ nguyên vẹn)\n\n";
echo "========================================================\n";
echo "   HỆ THỐNG ĐÃ SẴN SÀNG 100% ĐỂ BÀN GIAO CHO KHÁCH HÀNG!\n";
echo "========================================================\n";
