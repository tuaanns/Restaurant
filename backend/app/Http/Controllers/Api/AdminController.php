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
use App\Models\Promotion;
use App\Models\CashTransaction;
use App\Models\BankAccount;
use App\Services\CashBookService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    protected CashBookService $cashBookService;

    public function __construct(CashBookService $cashBookService)
    {
        $this->cashBookService = $cashBookService;
    }

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

    /**
     * Quản lý Khuyến Mãi (Admin)
     */
    public function getPromotions()
    {
        $promotions = Promotion::orderBy('id', 'desc')->get();
        return response()->json([
            'success' => true,
            'promotions' => $promotions
        ]);
    }

    public function addPromotion(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:150',
            'type' => 'required|string',
            'discount_value' => 'required|numeric|min:0',
            'min_order' => 'nullable|numeric|min:0',
        ]);

        $lastPromo = Promotion::orderBy('id', 'desc')->first();
        $nextNum = $lastPromo ? ($lastPromo->id + 1) : 1;
        $autoCode = 'KM' . str_pad($nextNum, 6, '0', STR_PAD_LEFT);

        $promotion = Promotion::create([
            'code' => $request->input('code') ?: $autoCode,
            'name' => $request->name,
            'type' => $request->type,
            'discount_value' => $request->discount_value,
            'min_order' => $request->input('min_order', 0),
            'from_date' => $request->input('from_date', date('d/m/Y')),
            'to_date' => $request->input('to_date', '31/12/2026'),
            'is_active' => $request->input('is_active', true),
            'budget_used' => 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã thêm chương trình khuyến mãi!',
            'promotion' => $promotion
        ]);
    }

    public function updatePromotion(Request $request, $id)
    {
        $promo = Promotion::findOrFail($id);
        $promo->update($request->only([
            'name', 'type', 'discount_value', 'min_order',
            'from_date', 'to_date', 'is_active', 'budget_used'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật chương trình khuyến mãi!',
            'promotion' => $promo
        ]);
    }

    public function deletePromotion($id)
    {
        $promo = Promotion::findOrFail($id);
        $promo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa chương trình khuyến mãi!'
        ]);
    }

    /**
     * Báo cáo chi tiết: Báo cáo cuối ngày, Bán hàng, Hàng hóa
     */
    public function getReports(Request $request)
    {
        $type = $request->input('type', 'sales'); // 'end_of_day', 'sales', 'goods'
        $date = $request->input('date'); // YYYY-MM-DD
        $search = $request->input('search');
        $status = $request->input('status'); // all, paid, active
        $fromTime = trim($request->input('from_time') ?: '00:00');
        $toTime = trim($request->input('to_time') ?: '23:59');
        $fromTimeFormatted = strlen($fromTime) === 5 ? "{$fromTime}:00" : $fromTime;
        $toTimeFormatted = strlen($toTime) === 5 ? "{$toTime}:59" : $toTime;

        $query = Order::with(['items.product.category', 'table.area', 'customer', 'promotion']);

        if ($date) {
            $fromDateTime = "{$date} {$fromTimeFormatted}";
            $toDateTime = "{$date} {$toTimeFormatted}";
            $query->whereBetween('created_at', [$fromDateTime, $toDateTime]);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('order_code', 'like', "%{$search}%")
                  ->orWhereHas('customer', function ($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%")
                         ->orWhere('phone', 'like', "%{$search}%");
                  })
                  ->orWhereHas('table', function ($tq) use ($search) {
                      $tq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $orders = $query->orderBy('id', 'desc')->get();

        // Nếu ngày được chọn chưa có đơn nào, lấy thêm đơn hôm nay hoặc đơn gần nhất để báo cáo luôn có dữ liệu thật
        if ($orders->isEmpty() && !$date) {
            $orders = Order::with(['items.product.category', 'table.area', 'customer', 'promotion'])
                ->orderBy('id', 'desc')
                ->limit(20)
                ->get();
        }

        // Calculate summary statistics
        $totalRevenue = 0;
        $totalItems = 0;
        $totalDiscount = 0;
        $totalVat = 0;
        $totalPaid = 0;
        $paymentMethods = [
            'cash' => 0,
            'qr_banking' => 0,
            'card' => 0,
            'other' => 0,
        ];

        // Format orders for report
        $formattedOrders = [];
        $goodsMap = [];

        foreach ($orders as $order) {
            $itemCount = $order->items ? $order->items->sum('quantity') : 0;
            $rev = (float)$order->total_amount;
            if ($rev == 0 && $order->subtotal > 0) {
                $rev = (float)$order->subtotal;
            }
            $totalRevenue += $rev;
            $totalItems += (int)$itemCount;
            $totalDiscount += (float)($order->discount_amount + $order->promotion_discount_amount);
            $totalVat += (float)$order->vat_amount;
            $totalPaid += (float)($order->paid_amount ?: $rev);

            $pm = $order->payment_method ?: 'cash';
            if (isset($paymentMethods[$pm])) {
                $paymentMethods[$pm] += $rev;
            } else {
                $paymentMethods['other'] += $rev;
            }

            $created = $order->created_at ? $order->created_at->copy()->timezone('Asia/Ho_Chi_Minh') : \Carbon\Carbon::now('Asia/Ho_Chi_Minh');

            $orderRow = [
                'id' => $order->id,
                'order_code' => $order->order_code ?: ('ORD-' . str_pad($order->id, 5, '0', STR_PAD_LEFT)),
                'created_at' => $created->format('d/m/Y H:i'),
                'created_time' => $created->format('H:i'),
                'table_name' => $order->table ? $order->table->name : 'Mang về',
                'area_name' => ($order->table && $order->table->area) ? $order->table->area->name : 'Sảnh chính',
                'customer_name' => $order->customer ? $order->customer->name : 'Khách lẻ',
                'customer_phone' => $order->customer ? $order->customer->phone : '',
                'cashier_name' => $order->cashier_name ?: 'Thu Hằng',
                'shift' => $order->shift ?: 'Toàn ca (Quản lý nhà hàng)',
                'total_items_count' => (int)$itemCount,
                'subtotal' => (float)$order->subtotal,
                'other_fee' => (float)($order->surcharge_amount ?? 0),
                'vat_amount' => (float)$order->vat_amount,
                'discount_amount' => (float)($order->discount_amount + $order->promotion_discount_amount),
                'total_amount' => $rev,
                'paid_amount' => (float)($order->paid_amount ?: $rev),
                'payment_method' => $order->payment_method ?: 'cash',
                'status' => $order->status,
                'items' => $order->items ? $order->items->map(function ($it) {
                    return [
                        'id' => $it->id,
                        'product_id' => $it->product_id,
                        'product_name' => $it->product_name,
                        'product_code' => ($it->product && $it->product->code) ? $it->product->code : ('MON' . str_pad($it->product_id ?: $it->id, 3, '0', STR_PAD_LEFT)),
                        'category_name' => ($it->product && $it->product->category) ? $it->product->category->name : 'Món ăn',
                        'quantity' => (int)$it->quantity,
                        'price' => (float)$it->price,
                        'subtotal' => (float)$it->subtotal,
                        'unit' => ($it->product && $it->product->unit) ? $it->product->unit : 'phần',
                    ];
                }) : []
            ];

            $formattedOrders[] = $orderRow;

            // Aggregate goods
            foreach ($orderRow['items'] as $item) {
                $pName = $item['product_name'];
                if (!isset($goodsMap[$pName])) {
                    $goodsMap[$pName] = [
                        'product_code' => $item['product_code'],
                        'product_name' => $pName,
                        'category_name' => $item['category_name'],
                        'unit' => $item['unit'],
                        'quantity' => 0,
                        'price' => $item['price'],
                        'revenue' => 0,
                    ];
                }
                $goodsMap[$pName]['quantity'] += $item['quantity'];
                $goodsMap[$pName]['revenue'] += $item['subtotal'];
            }
        }

        // Calculate goods share percentage
        $goodsList = array_values($goodsMap);
        usort($goodsList, function ($a, $b) {
            return $b['quantity'] <=> $a['quantity'];
        });

        foreach ($goodsList as &$g) {
            $g['percentage'] = $totalRevenue > 0 ? round(($g['revenue'] / $totalRevenue) * 100, 1) : 0;
        }

        // 4. Hạch toán số liệu Thu / Chi trong Sổ Quỹ có ghi nhận vào Kết quả kinh doanh
        $reportDate = $date ?: Carbon::today()->format('Y-m-d');
        $cashExpenseQuery = CashTransaction::where('type', 'payment')
            ->where('is_business_result', true)
            ->whereBetween('transacted_at', ["{$reportDate} 00:00:00", "{$reportDate} 23:59:59"]);
        $cashIncomeQuery = CashTransaction::where('type', 'receipt')
            ->where('is_business_result', true)
            ->whereBetween('transacted_at', ["{$reportDate} 00:00:00", "{$reportDate} 23:59:59"]);

        $operatingExpenses = (float)$cashExpenseQuery->sum('amount');
        $otherIncome = (float)$cashIncomeQuery->sum('amount');
        $netProfit = $totalRevenue + $otherIncome - $operatingExpenses;

        return response()->json([
            'success' => true,
            'report_type' => $type,
            'date' => $reportDate,
            'orders' => $formattedOrders,
            'goods' => $goodsList,
            'summary' => [
                'total_orders' => count($formattedOrders),
                'total_revenue' => $totalRevenue,
                'total_items' => $totalItems,
                'total_discount' => $totalDiscount,
                'total_vat' => $totalVat,
                'total_paid' => $totalPaid,
                'payment_breakdown' => $paymentMethods,
                'operating_expenses' => $operatingExpenses,
                'other_income' => $otherIncome,
                'net_profit' => $netProfit,
                'branch_name' => 'QUÁN TRÀ',
                'branch_address' => '103 Trần Hưng Đạo, Đặc khu Phú Quốc, Tỉnh An Giang',
            ]
        ]);
    }

    /**
     * Lấy danh sách phiếu thu / phiếu chi trong Sổ quỹ
     */
    public function getCashTransactions(Request $request)
    {
        $result = $this->cashBookService->getTransactionsSummary($request->all());
        return response()->json(array_merge(['success' => true], $result));
    }

    /**
     * Tạo phiếu thu / phiếu chi mới
     */
    public function createCashTransaction(Request $request)
    {
        $request->validate([
            'type' => 'required|in:receipt,payment',
            'payment_method' => 'required|in:cash,bank',
            'category' => 'required|string',
            'amount' => 'required|numeric|min:0',
        ]);

        $transaction = $this->cashBookService->createTransaction($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Lập ' . ($transaction->type === 'receipt' ? 'phiếu thu' : 'phiếu chi') . ' thành công!',
            'transaction' => $transaction
        ]);
    }

    /**
     * Xóa phiếu thu / chi
     */
    public function deleteCashTransaction($id)
    {
        $item = CashTransaction::findOrFail($id);
        $code = $item->code;
        $this->cashBookService->deleteTransaction((int)$id);

        return response()->json([
            'success' => true,
            'message' => "Đã xóa phiếu {$code} thành công!"
        ]);
    }

    /**
     * Danh sách tài khoản ngân hàng của quán
     */
    public function getBankAccounts()
    {
        try {
            $accounts = BankAccount::orderBy('is_default', 'desc')
                ->orderBy('id', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'bank_accounts' => $accounts
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'is_db_offline' => true,
                'message' => 'Cơ sở dữ liệu MySQL chưa khởi động (Vui lòng bật MySQL trong XAMPP).',
                'bank_accounts' => []
            ], 200);
        }
    }

    /**
     * Lấy tài khoản ngân hàng mặc định đang áp dụng (dùng cho POS VietQR)
     */
    public function getDefaultBankAccount()
    {
        try {
            $account = BankAccount::where('is_default', true)->where('is_active', true)->first();
            if (!$account) {
                $account = BankAccount::where('is_active', true)->first();
            }

            return response()->json([
                'success' => true,
                'bank_account' => $account
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'is_db_offline' => true,
                'message' => 'Cơ sở dữ liệu MySQL chưa khởi động.',
                'bank_account' => null
            ], 200);
        }
    }

    /**
     * Thêm tài khoản ngân hàng mới
     */
    public function createBankAccount(Request $request)
    {
        $request->validate([
            'bank_name' => 'required|string|max:191',
            'bank_code' => 'required|string|max:50',
            'bin' => 'required|string|max:20',
            'account_number' => 'required|string|max:50',
            'account_name' => 'required|string|max:191',
        ]);

        try {
            $isDefault = filter_var($request->input('is_default', false), FILTER_VALIDATE_BOOLEAN);

            // Nếu đặt làm mặc định hoặc hệ thống chưa có tài khoản mặc định nào
            $hasAnyDefault = BankAccount::where('is_default', true)->exists();
            if ($isDefault || !$hasAnyDefault) {
                BankAccount::query()->update(['is_default' => false]);
                $isDefault = true;
            }

            $account = BankAccount::create([
                'bank_name' => trim($request->input('bank_name')),
                'bank_code' => strtoupper(trim($request->input('bank_code'))),
                'bin' => trim($request->input('bin')),
                'account_number' => trim($request->input('account_number')),
                'account_name' => strtoupper(trim($request->input('account_name'))),
                'branch' => $request->input('branch'),
                'is_default' => $isDefault,
                'is_active' => filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN),
                'qr_template' => $request->input('qr_template', 'compact2'),
                'notes' => $request->input('notes'),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Đã thêm tài khoản ngân hàng thành công!',
                'bank_account' => $account
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'is_db_offline' => true,
                'message' => 'Cơ sở dữ liệu MySQL chưa khởi động (Vui lòng bật MySQL trong XAMPP).'
            ], 503);
        }
    }

    /**
     * Cập nhật thông tin tài khoản ngân hàng
     */
    public function updateBankAccount(Request $request, $id)
    {
        $request->validate([
            'bank_name' => 'required|string|max:191',
            'bank_code' => 'required|string|max:50',
            'bin' => 'required|string|max:20',
            'account_number' => 'required|string|max:50',
            'account_name' => 'required|string|max:191',
        ]);

        try {
            $account = BankAccount::findOrFail($id);
            $isDefault = filter_var($request->input('is_default', $account->is_default), FILTER_VALIDATE_BOOLEAN);

            if ($isDefault && !$account->is_default) {
                BankAccount::where('id', '!=', $id)->update(['is_default' => false]);
            }

            $account->update([
                'bank_name' => trim($request->input('bank_name')),
                'bank_code' => strtoupper(trim($request->input('bank_code'))),
                'bin' => trim($request->input('bin')),
                'account_number' => trim($request->input('account_number')),
                'account_name' => strtoupper(trim($request->input('account_name'))),
                'branch' => $request->input('branch'),
                'is_default' => $isDefault,
                'is_active' => filter_var($request->input('is_active', $account->is_active), FILTER_VALIDATE_BOOLEAN),
                'qr_template' => $request->input('qr_template', $account->qr_template ?: 'compact2'),
                'notes' => $request->input('notes'),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Đã cập nhật thông tin tài khoản ngân hàng!',
                'bank_account' => $account
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'is_db_offline' => true,
                'message' => 'Cơ sở dữ liệu MySQL chưa khởi động (Vui lòng bật MySQL trong XAMPP).'
            ], 503);
        }
    }

    /**
     * Đặt tài khoản làm mặc định nhận tiền VietQR
     */
    public function setDefaultBankAccount($id)
    {
        try {
            $account = BankAccount::findOrFail($id);

            BankAccount::query()->update(['is_default' => false]);
            $account->update(['is_default' => true, 'is_active' => true]);

            return response()->json([
                'success' => true,
                'message' => "Đã đặt tài khoản {$account->bank_code} - {$account->account_number} làm mặc định nhận thanh toán QR!",
                'bank_account' => $account
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'is_db_offline' => true,
                'message' => 'Cơ sở dữ liệu MySQL chưa khởi động (Vui lòng bật MySQL trong XAMPP).'
            ], 503);
        }
    }

    /**
     * Xóa tài khoản ngân hàng
     */
    public function deleteBankAccount($id)
    {
        try {
            $account = BankAccount::findOrFail($id);
            $wasDefault = $account->is_default;
            $name = "{$account->bank_code} - {$account->account_number}";

            $account->delete();

            if ($wasDefault) {
                $fallback = BankAccount::where('is_active', true)->first();
                if ($fallback) {
                    $fallback->update(['is_default' => true]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Đã xóa tài khoản ngân hàng {$name} thành công!"
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'is_db_offline' => true,
                'message' => 'Cơ sở dữ liệu MySQL chưa khởi động (Vui lòng bật MySQL trong XAMPP).'
            ], 503);
        }
    }
}
