<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Area;
use App\Models\DiningTable;
use App\Models\Category;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 0. Tạo Tài Khoản Người Dùng & Phân Quyền (Admin & Thu Ngân)
        User::create([
            'name' => 'Quản lý: Hoàng Nam',
            'username' => 'admin',
            'email' => 'admin@aura.vn',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'shift' => 'Toàn ca (Quản lý nhà hàng)',
            'phone' => '0901.888.999',
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Thu Hằng',
            'username' => 'thuhang',
            'email' => 'thuhang@aura.vn',
            'password' => Hash::make('123456'),
            'role' => 'cashier',
            'shift' => 'Ca sáng (07:00 - 15:00)',
            'phone' => '0912.345.678',
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Minh Trí',
            'username' => 'minhtri',
            'email' => 'minhtri@aura.vn',
            'password' => Hash::make('123456'),
            'role' => 'cashier',
            'shift' => 'Ca chiều (15:00 - 23:00)',
            'phone' => '0987.654.321',
            'is_active' => true,
        ]);

        // 1. Tạo Khu Vực
        $areaFloor1 = Area::create(['name' => 'Tầng 1', 'code' => 'floor_1', 'sort_order' => 1]);
        $areaFloor2 = Area::create(['name' => 'Tầng 2', 'code' => 'floor_2', 'sort_order' => 2]);
        $areaVip = Area::create(['name' => 'Phòng VIP', 'code' => 'vip', 'sort_order' => 3]);
        $areaGarden = Area::create(['name' => 'Sân vườn', 'code' => 'garden', 'sort_order' => 4]);

        // 2. Tạo Danh mục món
        $catRiceNoodles = Category::create(['name' => 'Món xào & Cơm', 'code' => 'rice_noodles', 'sort_order' => 1]);
        $catMeat = Category::create(['name' => 'Món bò & Gà', 'code' => 'meat', 'sort_order' => 2]);
        $catSeafood = Category::create(['name' => 'Hải sản & Khai vị', 'code' => 'seafood', 'sort_order' => 3]);
        $catHotpot = Category::create(['name' => 'Món lẩu đặc biệt', 'code' => 'hotpot', 'sort_order' => 4]);
        $catDrinks = Category::create(['name' => 'Đồ uống & Tráng miệng', 'code' => 'drinks', 'sort_order' => 5]);
        $catOther = Category::create(['name' => 'Dịch vụ & Khác', 'code' => 'other', 'sort_order' => 6]);

        // 3. Tạo Món ăn
        $pMiXaoBo = Product::create([
            'category_id' => $catRiceNoodles->id,
            'name' => 'Mì xào bò thượng hạng',
            'code' => 'MXB01',
            'price' => 110000,
            'unit' => 'phần',
            'description' => 'Bò mềm sốt tiêu tỏi, mì trứng xào rau củ tươi xanh',
            'is_popular' => true,
        ]);

        $pComChien = Product::create([
            'category_id' => $catRiceNoodles->id,
            'name' => 'Cơm chiên hải sản Hoàng Kim',
            'code' => 'CCHS02',
            'price' => 125000,
            'unit' => 'phần',
            'description' => 'Cơm dẻo chiên sốt trứng muối hoàng kim, mực tôm tươi',
            'is_popular' => true,
        ]);

        $pNuocCam = Product::create([
            'category_id' => $catDrinks->id,
            'name' => 'Nước cam ép tươi',
            'code' => 'NC03',
            'price' => 45000,
            'unit' => 'ly',
            'description' => 'Cam sành tươi vắt nguyên chất bổ sung vitamin C',
            'is_popular' => true,
        ]);

        $pKhanLanh = Product::create([
            'category_id' => $catOther->id,
            'name' => 'Khăn lạnh thơm cao cấp',
            'code' => 'KL04',
            'price' => 5000,
            'unit' => 'cái',
            'description' => 'Khăn lạnh ướp hương hoa nhài tự nhiên',
            'is_popular' => false,
        ]);

        Product::create([
            'category_id' => $catMeat->id,
            'name' => 'Bò nướng tảng sốt tiêu xanh',
            'code' => 'BNT05',
            'price' => 220000,
            'unit' => 'phần',
            'description' => 'Bò Mỹ thượng hạng nướng chín vừa mọng nước',
            'is_popular' => true,
        ]);

        Product::create([
            'category_id' => $catSeafood->id,
            'name' => 'Mực một nắng nướng sa tế',
            'code' => 'MNN06',
            'price' => 185000,
            'unit' => 'dĩa',
            'description' => 'Mực tươi giòn ngọt chấm muối ớt xanh',
            'is_popular' => true,
        ]);

        Product::create([
            'category_id' => $catHotpot->id,
            'name' => 'Lẩu Thái Tomyum hải sản',
            'code' => 'LT07',
            'price' => 350000,
            'unit' => 'nồi',
            'description' => 'Nước dùng chua cay đậm đà, tôm sú, mực, ngao, nấm',
            'is_popular' => true,
        ]);

        Product::create([
            'category_id' => $catDrinks->id,
            'name' => 'Trà đào cam sả thanh nhiệt',
            'code' => 'TD08',
            'price' => 40000,
            'unit' => 'ly',
            'description' => 'Trà đào thơm nồng quyện lát cam vàng và sả tươi',
            'is_popular' => true,
        ]);

        Product::create([
            'category_id' => $catDrinks->id,
            'name' => 'Bia Heineken Silver (Lon)',
            'code' => 'BIA09',
            'price' => 28000,
            'unit' => 'lon',
            'description' => 'Bia ướp lạnh sảng khoái nhẹ êm',
            'is_popular' => false,
        ]);

        // 4. Tạo Khách hàng
        $custHoang = Customer::create([
            'name' => 'Anh Hoàng',
            'phone' => '0912.888.xxx',
            'membership_tier' => 'Hội viên Kim Cương',
            'discount_percent' => 5,
        ]);

        Customer::create([
            'name' => 'Chị Phương Linh',
            'phone' => '0988.666.888',
            'membership_tier' => 'Hội viên Vàng',
            'discount_percent' => 10,
        ]);

        Customer::create([
            'name' => 'Khách Vãng Lai',
            'phone' => '',
            'membership_tier' => 'Khách mới',
            'discount_percent' => 0,
        ]);

        // 5. Tạo Các Bàn theo đúng hình ảnh mẫu:
        // Tầng 1: 8 bàn
        $t1 = DiningTable::create([
            'area_id' => $areaFloor1->id,
            'name' => 'BÀN 01',
            'capacity' => 4,
            'status' => 'occupied',
            'guest_count' => 4,
            'started_at' => Carbon::now()->subMinutes(45),
            'notes' => '3 món đã gửi bếp',
            'sort_order' => 1,
        ]);

        $t2 = DiningTable::create([
            'area_id' => $areaFloor1->id,
            'name' => 'BÀN 02',
            'capacity' => 2,
            'status' => 'billing',
            'guest_count' => 2,
            'started_at' => Carbon::now()->subMinutes(80),
            'notes' => 'Đã in tạm tính',
            'sort_order' => 2,
        ]);

        $t3 = DiningTable::create([
            'area_id' => $areaFloor1->id,
            'name' => 'BÀN 03',
            'capacity' => 4,
            'status' => 'occupied',
            'guest_count' => 3,
            'started_at' => Carbon::now()->subMinutes(70),
            'notes' => '4 món',
            'sort_order' => 3,
        ]);

        $tTakeaway = DiningTable::create([
            'area_id' => $areaFloor1->id,
            'name' => 'MANG VỀ',
            'capacity' => 1,
            'status' => 'occupied',
            'guest_count' => 1,
            'started_at' => Carbon::now()->subMinutes(15),
            'notes' => 'Chờ đóng gói (Đơn #108)',
            'is_takeaway' => true,
            'sort_order' => 4,
        ]);

        $t4 = DiningTable::create([
            'area_id' => $areaFloor1->id,
            'name' => 'BÀN 04',
            'capacity' => 4,
            'status' => 'empty',
            'guest_count' => 0,
            'sort_order' => 5,
        ]);

        $t5 = DiningTable::create([
            'area_id' => $areaFloor1->id,
            'name' => 'BÀN 05',
            'capacity' => 6,
            'status' => 'empty',
            'guest_count' => 0,
            'sort_order' => 6,
        ]);

        $t6 = DiningTable::create([
            'area_id' => $areaFloor1->id,
            'name' => 'BÀN 06',
            'capacity' => 2,
            'status' => 'empty',
            'guest_count' => 0,
            'sort_order' => 7,
        ]);

        $t7 = DiningTable::create([
            'area_id' => $areaFloor1->id,
            'name' => 'BÀN 07',
            'capacity' => 4,
            'status' => 'empty',
            'guest_count' => 0,
            'sort_order' => 8,
        ]);

        // Phòng VIP: 4 bàn
        $tVip1 = DiningTable::create([
            'area_id' => $areaVip->id,
            'name' => 'VIP 01',
            'capacity' => 8,
            'status' => 'occupied',
            'guest_count' => 8,
            'started_at' => Carbon::now()->subMinutes(125),
            'notes' => '8 món',
            'is_vip' => true,
            'sort_order' => 9,
        ]);

        DiningTable::create([
            'area_id' => $areaVip->id,
            'name' => 'VIP 02',
            'capacity' => 10,
            'status' => 'empty',
            'guest_count' => 0,
            'is_vip' => true,
            'sort_order' => 10,
        ]);

        DiningTable::create([
            'area_id' => $areaVip->id,
            'name' => 'VIP 03',
            'capacity' => 12,
            'status' => 'empty',
            'guest_count' => 0,
            'is_vip' => true,
            'sort_order' => 11,
        ]);

        DiningTable::create([
            'area_id' => $areaVip->id,
            'name' => 'VIP 04',
            'capacity' => 8,
            'status' => 'empty',
            'guest_count' => 0,
            'is_vip' => true,
            'sort_order' => 12,
        ]);

        // Tầng 2: 8 bàn
        for ($i = 8; $i <= 15; $i++) {
            DiningTable::create([
                'area_id' => $areaFloor2->id,
                'name' => sprintf('BÀN %02d', $i),
                'capacity' => ($i % 2 == 0) ? 4 : 6,
                'status' => ($i === 11) ? 'occupied' : (($i === 12) ? 'billing' : 'empty'),
                'guest_count' => ($i === 11) ? 5 : (($i === 12) ? 3 : 0),
                'sort_order' => 12 + $i,
            ]);
        }

        // Sân vườn: 4 bàn
        for ($i = 1; $i <= 4; $i++) {
            DiningTable::create([
                'area_id' => $areaGarden->id,
                'name' => 'VƯỜN ' . $i,
                'capacity' => 6,
                'status' => ($i === 1) ? 'occupied' : 'empty',
                'guest_count' => ($i === 1) ? 4 : 0,
                'sort_order' => 30 + $i,
            ]);
        }

        // 6. Tạo Order Chi tiết cho BÀN 03 (GIỐNG HÌNH CHỤP 100%)
        $order3 = Order::create([
            'order_code' => 'ORD-20261011-003',
            'table_id' => $t3->id,
            'customer_id' => $custHoang->id,
            'cashier_name' => 'Thu Hằng',
            'shift' => 'Ca sáng (07:00 - 15:00)',
            'order_type' => 'dine_in',
            'subtotal' => 450000,
            'discount_percent' => 5,
            'discount_amount' => 22500,
            'vat_percent' => 8,
            'vat_amount' => 34200,
            'total_amount' => 461700,
            'status' => 'active',
            'created_at' => Carbon::today()->setTime(11, 30),
        ]);

        // 4 Món chi tiết của BÀN 03:
        // 1. Mì xào bò thượng hạng: 2 x 110,000 = 220,000 đ
        OrderItem::create([
            'order_id' => $order3->id,
            'product_id' => $pMiXaoBo->id,
            'product_name' => 'Mì xào bò thượng hạng',
            'unit' => 'phần',
            'quantity' => 2,
            'price' => 110000,
            'subtotal' => 220000,
            'note' => 'Ít hành tây, làm mềm',
            'status' => 'sent_kitchen',
            'is_auto_added' => false,
            'sent_to_kitchen_at' => Carbon::now()->subMinutes(50),
        ]);

        // 2. Cơm chiên hải sản Hoàng Kim: 1 x 125,000 = 125,000 đ
        OrderItem::create([
            'order_id' => $order3->id,
            'product_id' => $pComChien->id,
            'product_name' => 'Cơm chiên hải sản Hoàng Kim',
            'unit' => 'phần',
            'quantity' => 1,
            'price' => 125000,
            'subtotal' => 125000,
            'note' => 'Cay nhẹ',
            'status' => 'sent_kitchen',
            'is_auto_added' => false,
            'sent_to_kitchen_at' => Carbon::now()->subMinutes(50),
        ]);

        // 3. Nước cam ép tươi: 2 x 45,000 = 90,000 đ
        OrderItem::create([
            'order_id' => $order3->id,
            'product_id' => $pNuocCam->id,
            'product_name' => 'Nước cam ép tươi',
            'unit' => 'ly',
            'quantity' => 2,
            'price' => 45000,
            'subtotal' => 90000,
            'note' => 'Không đường, nhiều đá',
            'status' => 'new_pending', // Mới thêm (Chưa báo quầy)
            'is_auto_added' => false,
        ]);

        // 4. Khăn lạnh thơm cao cấp: 3 x 5,000 = 15,000 đ
        OrderItem::create([
            'order_id' => $order3->id,
            'product_id' => $pKhanLanh->id,
            'product_name' => 'Khăn lạnh thơm cao cấp',
            'unit' => 'cái',
            'quantity' => 3,
            'price' => 5000,
            'subtotal' => 15000,
            'note' => 'Tự động tính',
            'status' => 'sent_kitchen',
            'is_auto_added' => true,
            'sent_to_kitchen_at' => Carbon::now()->subMinutes(50),
        ]);

        // Tạo order cho Bàn 01 (485,000 đ)
        $order1 = Order::create([
            'order_code' => 'ORD-20261011-001',
            'table_id' => $t1->id,
            'cashier_name' => 'Thu Hằng',
            'shift' => 'Ca sáng (07:00 - 15:00)',
            'order_type' => 'dine_in',
            'subtotal' => 485000,
            'total_amount' => 485000,
            'status' => 'active',
            'created_at' => Carbon::now()->subMinutes(45),
        ]);
        OrderItem::create([
            'order_id' => $order1->id,
            'product_id' => $pMiXaoBo->id,
            'product_name' => 'Mì xào bò thượng hạng',
            'quantity' => 2,
            'price' => 110000,
            'subtotal' => 220000,
            'status' => 'sent_kitchen',
        ]);
        OrderItem::create([
            'order_id' => $order1->id,
            'product_id' => $pComChien->id,
            'product_name' => 'Cơm chiên hải sản Hoàng Kim',
            'quantity' => 2,
            'price' => 125000,
            'subtotal' => 250000,
            'status' => 'sent_kitchen',
        ]);
        OrderItem::create([
            'order_id' => $order1->id,
            'product_id' => $pKhanLanh->id,
            'product_name' => 'Khăn lạnh thơm cao cấp',
            'quantity' => 3,
            'price' => 5000,
            'subtotal' => 15000,
            'status' => 'sent_kitchen',
        ]);

        // Tạo order cho Bàn 02 (320,000 đ)
        $order2 = Order::create([
            'order_code' => 'ORD-20261011-002',
            'table_id' => $t2->id,
            'cashier_name' => 'Thu Hằng',
            'shift' => 'Ca sáng (07:00 - 15:00)',
            'order_type' => 'dine_in',
            'subtotal' => 320000,
            'total_amount' => 320000,
            'status' => 'billing',
            'printed_prebill_at' => Carbon::now()->subMinutes(10),
            'created_at' => Carbon::now()->subMinutes(80),
        ]);

        // Tạo order cho VIP 01 (2,450,000 đ)
        $orderVip = Order::create([
            'order_code' => 'ORD-20261011-VIP1',
            'table_id' => $tVip1->id,
            'cashier_name' => 'Thu Hằng',
            'shift' => 'Ca sáng (07:00 - 15:00)',
            'order_type' => 'dine_in',
            'subtotal' => 2450000,
            'total_amount' => 2450000,
            'status' => 'active',
            'created_at' => Carbon::now()->subMinutes(125),
        ]);

        // Tạo order Mang Về #108 (185,000 đ)
        $orderTakeaway = Order::create([
            'order_code' => 'Đơn #108',
            'table_id' => $tTakeaway->id,
            'cashier_name' => 'Thu Hằng',
            'shift' => 'Ca sáng (07:00 - 15:00)',
            'order_type' => 'takeaway',
            'subtotal' => 185000,
            'total_amount' => 185000,
            'status' => 'active',
            'created_at' => Carbon::now()->subMinutes(15),
        ]);
    }
}
