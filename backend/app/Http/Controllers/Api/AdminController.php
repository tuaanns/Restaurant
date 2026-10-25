<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Category;
use App\Models\DiningTable;
use App\Models\Area;
use App\Models\User;
use App\Models\Customer;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    /**
     * Báo cáo thống kê doanh thu & hoạt động nhà hàng
     */
    public function getStats()
    {
        $today = Carbon::today();

        // Tổng doanh thu từ các đơn đã thanh toán hoặc tạm tính
        $todayOrders = Order::whereDate('created_at', $today)->get();
        $totalRevenue = $todayOrders->where('status', 'paid')->sum('total_amount');
        if ($totalRevenue == 0) {
            $totalRevenue = $todayOrders->sum('total_amount');
        }

        $paidOrdersCount = $todayOrders->where('status', 'paid')->count();
        $activeOrdersCount = $todayOrders->where('status', 'active')->count();

        // Top món bán chạy
        $topProducts = OrderItem::select('product_name', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(subtotal) as total_sales'))
            ->groupBy('product_name')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get();

        // Thống kê theo phương thức thanh toán
        $paymentMethods = [
            'cash' => Order::where('payment_method', 'cash')->sum('total_amount'),
            'qr_banking' => Order::where('payment_method', 'qr_banking')->sum('total_amount'),
            'card' => Order::where('payment_method', 'card')->sum('total_amount'),
        ];

        // Số bàn đang phục vụ
        $occupiedTables = DiningTable::where('status', 'occupied')->count();
        $billingTables = DiningTable::where('status', 'billing')->count();
        $emptyTables = DiningTable::where('status', 'empty')->count();

        return response()->json([
            'success' => true,
            'stats' => [
                'total_revenue' => (float)$totalRevenue,
                'paid_orders_count' => $paidOrdersCount,
                'active_orders_count' => $activeOrdersCount,
                'total_orders_today' => $todayOrders->count(),
                'occupied_tables' => $occupiedTables,
                'billing_tables' => $billingTables,
                'empty_tables' => $emptyTables,
                'top_products' => $topProducts,
                'payment_breakdown' => $paymentMethods,
                'cashiers_count' => User::where('role', 'cashier')->count(),
            ]
        ]);
    }

    /**
     * Thêm món mới vào thực đơn (lưu vào CSDL)
     * Mã món tự động sinh theo format: MON + số thứ tự tăng dần (VD: MON001, MON002...)
     */
    public function addProduct(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string',
            'price' => 'required|numeric|min:0',
            'unit' => 'nullable|string',
        ]);

        // Tự động sinh mã món theo ID tiếp theo
        $lastProduct = Product::orderBy('id', 'desc')->first();
        $nextNum = $lastProduct ? ($lastProduct->id + 1) : 1;
        $autoCode = 'MON' . str_pad($nextNum, 3, '0', STR_PAD_LEFT);

        $product = Product::create([
            'category_id' => $request->category_id,
            'name' => $request->name,
            'code' => $autoCode,
            'price' => $request->price,
            'unit' => $request->input('unit', 'phần'),
            'description' => $request->input('description', ''),
            'is_active' => true,
            'is_popular' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã thêm món mới vào thực đơn thành công!',
            'product' => $product
        ]);
    }

    /**
     * Import danh sách món ăn từ Excel / CSV (hàng loạt)
     */
    public function importProducts(Request $request)
    {
        $request->validate([
            'products' => 'required|array',
            'products.*.name' => 'required|string',
        ]);

        $imported = 0;
        $createdProducts = [];
        $productsData = $request->products;

        $lastProduct = Product::orderBy('id', 'desc')->first();
        $nextNum = $lastProduct ? ($lastProduct->id + 1) : 1;

        $categoriesByName = Category::all()->keyBy(function($item) {
            return mb_strtolower(trim($item->name));
        });
        $defaultCat = Category::orderBy('id')->first();

        DB::beginTransaction();
        try {
            foreach ($productsData as $row) {
                $name = trim($row['name'] ?? '');
                if (!$name) continue;

                $categoryId = $row['category_id'] ?? null;
                $categoryName = trim($row['category_name'] ?? '');

                if (!$categoryId && $categoryName) {
                    $lookupKey = mb_strtolower($categoryName);
                    if ($categoriesByName->has($lookupKey)) {
                        $categoryId = $categoriesByName->get($lookupKey)->id;
                    } else {
                        $newCat = Category::create([
                            'name' => $categoryName,
                            'code' => Str::slug($categoryName, '_') ?: ('cat_' . (Category::count() + 1)),
                            'sort_order' => Category::count() + 1
                        ]);
                        $categoriesByName->put($lookupKey, $newCat);
                        $categoryId = $newCat->id;
                    }
                }

                if (!$categoryId) {
                    $categoryId = $defaultCat ? $defaultCat->id : 1;
                }

                // Mã món
                $code = trim($row['code'] ?? '');
                if (!$code) {
                    $code = 'MON' . str_pad($nextNum, 3, '0', STR_PAD_LEFT);
                    $nextNum++;
                } else {
                    $exists = Product::where('code', $code)->exists();
                    if ($exists) {
                        $code = $code . '_' . Str::random(3);
                    }
                }

                $price = isset($row['price']) ? floatval($row['price']) : 0;
                $unit = !empty($row['unit']) ? trim($row['unit']) : 'phần';
                $description = $row['description'] ?? '';

                $product = Product::create([
                    'category_id' => $categoryId,
                    'name' => $name,
                    'code' => $code,
                    'price' => max(0, $price),
                    'unit' => $unit,
                    'description' => $description,
                    'is_active' => true,
                    'is_popular' => false,
                ]);

                $createdProducts[] = $product;
                $imported++;
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi import món ăn: ' . $e->getMessage()
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => "Đã nhập thành công {$imported} món ăn vào thực đơn!",
            'imported_count' => $imported,
            'products' => $createdProducts
        ]);
    }

    /**
     * Xóa món khỏi thực đơn (CSDL)
     */
    public function deleteProduct($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa món khỏi thực đơn!'
        ]);
    }

    /**
     * Sửa thông tin món ăn
     */
    public function updateProduct(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $product->update($request->only(['name', 'price', 'unit', 'category_id', 'description', 'is_popular']));
        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật món!',
            'product' => $product->fresh()
        ]);
    }

    // ============================================================
    //  CATEGORY (NHÓM THỰC ĐƠN) CRUD
    // ============================================================

    /**
     * Lấy danh sách tất cả nhóm thực đơn
     */
    public function getCategories()
    {
        $categories = Category::withCount('products')->orderBy('sort_order')->get();
        return response()->json([
            'success' => true,
            'categories' => $categories
        ]);
    }

    /**
     * Thêm nhóm thực đơn mới
     */
    public function addCategory(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'icon' => 'nullable|string|max:10',
            'sort_order' => 'nullable|integer',
        ]);

        $category = Category::create([
            'name' => $request->name,
            'icon' => $request->input('icon', '🍽️'),
            'sort_order' => $request->input('sort_order', Category::max('sort_order') + 1),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã thêm nhóm mới thành công!',
            'category' => $category
        ]);
    }

    /**
     * Sửa nhóm thực đơn
     */
    public function updateCategory(Request $request, $id)
    {
        $category = Category::findOrFail($id);
        $request->validate([
            'name' => 'required|string|max:100',
            'icon' => 'nullable|string|max:10',
            'sort_order' => 'nullable|integer',
        ]);
        $category->update($request->only(['name', 'icon', 'sort_order']));
        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật nhóm!',
            'category' => $category->fresh()->loadCount('products')
        ]);
    }

    /**
     * Xóa nhóm thực đơn
     * Không cho xóa nếu nhóm có món ăn liên kết
     */
    public function deleteCategory($id)
    {
        $category = Category::withCount('products')->findOrFail($id);
        if ($category->products_count > 0) {
            return response()->json([
                'success' => false,
                'message' => "Không thể xóa! Nhóm này đang có {$category->products_count} món ăn. Hãy chuyển hoặc xóa các món trước."
            ], 422);
        }
        $category->delete();
        return response()->json([
            'success' => true,
            'message' => 'Đã xóa nhóm thực đơn!'
        ]);
    }

    /**
     * Quản lý Khách hàng - Danh sách
     */
    public function getCustomers()
    {
        $customers = Customer::withCount('orders')
            ->withSum(['orders as total_spent' => function ($q) {
                $q->where('status', 'paid');
            }], 'total_amount')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'customers' => $customers
        ]);
    }

    /**
     * Thêm khách hàng mới
     */
    public function addCustomer(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:150',
            'phone' => 'nullable|string|max:30',
            'membership_tier' => 'nullable|string|max:50',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
        ]);

        $customer = Customer::create([
            'name' => $request->name,
            'phone' => $request->phone ?: null,
            'membership_tier' => $request->membership_tier ?: 'Khách mới',
            'discount_percent' => $request->discount_percent ?: 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã thêm khách hàng thành công!',
            'customer' => $customer
        ]);
    }

    /**
     * Import danh sách khách hàng từ Excel / CSV (hàng loạt)
     */
    public function importCustomers(Request $request)
    {
        $request->validate([
            'customers' => 'required|array',
            'customers.*.name' => 'required|string',
        ]);

        $imported = 0;
        $createdCustomers = [];
        $customersData = $request->customers;

        DB::beginTransaction();
        try {
            foreach ($customersData as $row) {
                $name = trim($row['name'] ?? '');
                if (!$name) continue;

                $phone = !empty($row['phone']) ? trim($row['phone']) : null;
                $tier = !empty($row['membership_tier']) ? trim($row['membership_tier']) : 'Hội viên';
                $discount = isset($row['discount_percent']) ? floatval($row['discount_percent']) : 0;

                // Nếu có SĐT, kiểm tra xem khách đã tồn tại chưa để cập nhật hoặc tạo mới
                if ($phone) {
                    $customer = Customer::where('phone', $phone)->first();
                    if ($customer) {
                        $customer->update([
                            'name' => $name,
                            'membership_tier' => $tier,
                            'discount_percent' => max(0, min(100, $discount)),
                        ]);
                        $createdCustomers[] = $customer;
                        $imported++;
                        continue;
                    }
                }

                $customer = Customer::create([
                    'name' => $name,
                    'phone' => $phone,
                    'membership_tier' => $tier,
                    'discount_percent' => max(0, min(100, $discount)),
                ]);

                $createdCustomers[] = $customer;
                $imported++;
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi import khách hàng: ' . $e->getMessage()
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => "Đã nhập thành công {$imported} khách hàng!",
            'imported_count' => $imported,
            'customers' => $createdCustomers
        ]);
    }

    /**
     * Cập nhật thông tin khách hàng
     */
    public function updateCustomer(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);
        $request->validate([
            'name' => 'required|string|max:150',
            'phone' => 'nullable|string|max:30',
            'membership_tier' => 'nullable|string|max:50',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
        ]);

        $customer->update([
            'name' => $request->name,
            'phone' => $request->phone ?: null,
            'membership_tier' => $request->membership_tier ?: 'Khách mới',
            'discount_percent' => $request->discount_percent ?: 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật khách hàng!',
            'customer' => $customer
        ]);
    }

    /**
     * Xóa khách hàng
     */
    public function deleteCustomer($id)
    {
        $customer = Customer::findOrFail($id);
        $customer->delete();
        return response()->json([
            'success' => true,
            'message' => 'Đã xóa khách hàng!'
        ]);
    }

    /**
     * ─── QUẢN LÝ PHÒNG/BÀN (TABLES) ───
     */
    public function getTables()
    {
        $tables = DiningTable::with('area')
            ->orderBy('area_id')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return response()->json([
            'success' => true,
            'tables' => $tables
        ]);
    }

    public function addTable(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'area_id' => 'required|exists:areas,id',
            'capacity' => 'nullable|integer|min:1',
            'sort_order' => 'nullable|integer',
            'notes' => 'nullable|string|max:255',
            'status' => 'nullable|string'
        ]);

        $maxSort = DiningTable::where('area_id', $request->area_id)->max('sort_order') ?? 0;
        $table = DiningTable::create([
            'name' => $request->name,
            'area_id' => $request->area_id,
            'capacity' => $request->capacity ?: 4,
            'sort_order' => $request->sort_order !== null ? intval($request->sort_order) : ($maxSort + 1),
            'notes' => $request->notes,
            'status' => $request->status ?: 'empty',
            'guest_count' => 0,
            'is_takeaway' => false,
            'is_vip' => false
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã thêm phòng/bàn thành công!',
            'table' => $table->load('area')
        ]);
    }

    public function updateTable(Request $request, $id)
    {
        $table = DiningTable::findOrFail($id);
        $request->validate([
            'name' => 'required|string|max:100',
            'area_id' => 'required|exists:areas,id',
            'capacity' => 'nullable|integer|min:1',
            'sort_order' => 'nullable|integer',
            'notes' => 'nullable|string|max:255',
            'status' => 'nullable|string'
        ]);

        $table->update([
            'name' => $request->name,
            'area_id' => $request->area_id,
            'capacity' => $request->capacity ?: $table->capacity,
            'sort_order' => $request->sort_order !== null ? intval($request->sort_order) : $table->sort_order,
            'notes' => $request->notes,
            'status' => $request->status ?: $table->status
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật phòng/bàn!',
            'table' => $table->fresh()->load('area')
        ]);
    }

    public function deleteTable($id)
    {
        $table = DiningTable::findOrFail($id);
        if ($table->status === 'occupied' || $table->status === 'billing') {
            return response()->json([
                'success' => false,
                'message' => 'Bàn đang có khách hoặc chờ thanh toán! Không thể xóa.'
            ], 422);
        }

        $table->delete();
        return response()->json([
            'success' => true,
            'message' => 'Đã xóa phòng/bàn!'
        ]);
    }

    public function importTables(Request $request)
    {
        $request->validate([
            'tables' => 'required|array',
            'tables.*.name' => 'required|string|max:100',
        ]);

        $imported = 0;
        $tablesData = $request->tables;

        foreach ($tablesData as $row) {
            $areaId = $row['area_id'] ?? null;
            if (!$areaId && !empty($row['area_name'])) {
                $area = Area::firstOrCreate(
                    ['name' => trim($row['area_name'])],
                    ['code' => Str::slug($row['area_name'], '_'), 'sort_order' => Area::count() + 1]
                );
                $areaId = $area->id;
            }

            if (!$areaId) {
                $defaultArea = Area::first();
                $areaId = $defaultArea ? $defaultArea->id : 1;
            }

            DiningTable::create([
                'name' => trim($row['name']),
                'area_id' => $areaId,
                'capacity' => isset($row['capacity']) && intval($row['capacity']) > 0 ? intval($row['capacity']) : 4,
                'sort_order' => isset($row['sort_order']) && intval($row['sort_order']) > 0 ? intval($row['sort_order']) : ($imported + 1),
                'notes' => $row['notes'] ?? null,
                'status' => $row['status'] ?? 'empty',
                'guest_count' => 0,
                'is_takeaway' => false,
                'is_vip' => false
            ]);
            $imported++;
        }

        return response()->json([
            'success' => true,
            'message' => "Đã import thành công {$imported} phòng/bàn!",
            'imported_count' => $imported
        ]);
    }

    /**
     * ─── QUẢN LÝ KHU VỰC (AREAS) ───
     */
    public function getAreas()
    {
        $areas = Area::withCount('tables')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return response()->json([
            'success' => true,
            'areas' => $areas
        ]);
    }

    public function addArea(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'nullable|string|max:50|unique:areas,code',
            'sort_order' => 'nullable|integer'
        ]);

        $code = $request->code ?: Str::slug($request->name, '_');
        $baseCode = $code;
        $counter = 1;
        while (Area::where('code', $code)->exists()) {
            $code = $baseCode . '_' . $counter++;
        }

        $area = Area::create([
            'name' => $request->name,
            'code' => $code,
            'sort_order' => $request->sort_order ?: (Area::max('sort_order') + 1)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã thêm khu vực mới!',
            'area' => $area->loadCount('tables')
        ]);
    }

    public function updateArea(Request $request, $id)
    {
        $area = Area::findOrFail($id);
        $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'nullable|string|max:50|unique:areas,code,' . $id,
            'sort_order' => 'nullable|integer'
        ]);

        $area->update([
            'name' => $request->name,
            'code' => $request->code ?: $area->code,
            'sort_order' => $request->sort_order !== null ? $request->sort_order : $area->sort_order
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật khu vực!',
            'area' => $area->fresh()->loadCount('tables')
        ]);
    }

    public function deleteArea($id)
    {
        $area = Area::withCount('tables')->findOrFail($id);
        if ($area->tables_count > 0) {
            return response()->json([
                'success' => false,
                'message' => "Khu vực này đang có {$area->tables_count} phòng/bàn. Hãy chuyển hoặc xóa các bàn trước."
            ], 422);
        }

        $area->delete();
        return response()->json([
            'success' => true,
            'message' => 'Đã xóa khu vực!'
        ]);
    }
}
