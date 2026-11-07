<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Area;
use App\Models\DiningTable;
use App\Models\Category;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\KitchenTicket;
use App\Models\Promotion;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PosController extends Controller
{
    /**
     * Lấy danh sách sơ đồ bàn, khu vực và thống kê trạng thái
     */
    public function getTables(Request $request)
    {
        $areas = Area::with(['tables' => function ($query) {
            $query->orderBy('sort_order');
        }])->orderBy('sort_order')->get();

        $allTables = DiningTable::with(['area', 'activeOrder.items', 'activeOrder.customer'])
            ->orderBy('sort_order')
            ->get();

        // Thống kê nhanh
        $totalTables = $allTables->count();
        $emptyCount = $allTables->where('status', 'empty')->count();
        $occupiedCount = $allTables->where('status', 'occupied')->count();
        $billingCount = $allTables->where('status', 'billing')->count();

        $areaStats = [];
        foreach ($areas as $area) {
            $areaStats[$area->code] = [
                'id' => $area->id,
                'name' => $area->name,
                'code' => $area->code,
                'total' => $area->tables->count(),
            ];
        }

        return response()->json([
            'success' => true,
            'summary' => [
                'total' => $totalTables,
                'empty' => $emptyCount,
                'occupied' => $occupiedCount,
                'billing' => $billingCount,
            ],
            'areas' => $areas,
            'area_stats' => $areaStats,
            'tables' => $allTables->map(function ($table) {
                $order = ($table->status !== 'empty') ? $table->activeOrder : null;
                $activeOrderData = null;
                if ($order && $table->status !== 'empty') {
                    $activeOrderData = [
                        'id' => $order->id,
                        'order_code' => $order->order_code,
                        'item_count' => $order->items->sum('quantity'),
                        'subtotal' => (float)$order->subtotal,
                        'discount_percent' => (float)$order->discount_percent,
                        'discount_amount' => (float)$order->discount_amount,
                        'vat_percent' => (float)$order->vat_percent,
                        'vat_amount' => (float)$order->vat_amount,
                        'total_amount' => (float)$order->total_amount,
                        'created_at' => $order->created_at->format('H:i'),
                        'has_new_items' => $order->items->where('status', 'new_pending')->count() > 0,
                    ];
                }

                // Tính thời gian ngồi
                $duration = null;
                if ($table->started_at) {
                    $diffMinutes = (int)round($table->started_at->diffInMinutes(Carbon::now()));
                    if ($diffMinutes >= 60) {
                        $hours = floor($diffMinutes / 60);
                        $mins = $diffMinutes % 60;
                        $duration = "{$hours}h " . sprintf("%02dp", $mins);
                    } else {
                        $duration = "{$diffMinutes}p";
                    }
                }

                return [
                    'id' => $table->id,
                    'area_id' => $table->area_id,
                    'area_code' => $table->area ? $table->area->code : null,
                    'name' => $table->name,
                    'capacity' => $table->capacity,
                    'status' => $table->status, // empty, occupied, billing
                    'guest_count' => $table->guest_count,
                    'started_at' => $table->started_at ? $table->started_at->format('H:i') : null,
                    'duration' => $duration,
                    'notes' => $table->notes,
                    'is_takeaway' => $table->is_takeaway,
                    'is_vip' => $table->is_vip,
                    'order' => $activeOrderData,
                ];
            })
        ]);
    }

    /**
     * Lấy toàn bộ thực đơn theo danh mục
     */
    public function getMenu(Request $request)
    {
        $categories = Category::with(['products' => function ($q) {
            $q->where('is_active', true)->orderBy('id');
        }])->orderBy('sort_order')->get();

        $allProducts = Product::where('is_active', true)->get();

        return response()->json([
            'success' => true,
            'categories' => $categories,
            'products' => $allProducts,
        ]);
    }

    /**
     * Lấy danh sách khách hàng
     */
    public function getCustomers()
    {
        $customers = Customer::all();
        return response()->json([
            'success' => true,
            'customers' => $customers
        ]);
    }

    /**
     * Lấy chi tiết đơn của bàn (hoặc tạo đơn mới nếu bàn trống)
     */
    public function getTableOrder($tableId)
    {
        $table = DiningTable::with('area')->findOrFail($tableId);
        
        $order = Order::with(['items', 'customer', 'promotion'])
            ->where('table_id', $tableId)
            ->whereIn('status', ['active', 'billing'])
            ->latest()
            ->first();

        // Nếu bàn trống hoặc chưa có order thì khởi tạo order rỗng nhưng KHÔNG tự ý đổi trạng thái bàn thành occupied
        if (!$order) {
            $orderCount = Order::whereDate('created_at', Carbon::today())->count() + 1;
            $uniqueCode = 'ORD-' . date('Ymd') . '-' . sprintf('%03d', $table->id) . '-' . sprintf('%03d', $orderCount);
            if (Order::where('order_code', $uniqueCode)->exists()) {
                $uniqueCode = 'ORD-' . date('Ymd') . '-' . sprintf('%03d', $table->id) . '-' . strtoupper(substr(uniqid(), -4));
            }

            $hour = (int)date('H');
            $shift = ($hour >= 6 && $hour < 14) ? 'Ca sáng (06:00 - 14:00)' : (($hour >= 14 && $hour < 22) ? 'Ca chiều (14:00 - 22:00)' : 'Ca đêm (22:00 - 06:00)');

            $order = Order::create([
                'order_code' => $uniqueCode,
                'table_id' => $table->id,
                'customer_id' => null,
                'promotion_id' => null,
                'cashier_name' => 'Thu Hằng',
                'shift' => $shift,
                'order_type' => $table->is_takeaway ? 'takeaway' : 'dine_in',
                'subtotal' => 0,
                'discount_percent' => 0,
                'discount_amount' => 0,
                'promotion_discount_amount' => 0,
                'vat_percent' => 8,
                'vat_amount' => 0,
                'total_amount' => 0,
                'status' => 'active',
            ]);
            // Giữ nguyên trạng thái bàn (nếu đang trống thì vẫn là empty cho đến khi order món)
        }

        $order->load(['items', 'customer', 'promotion']);

        // Nếu đơn chưa có món, luôn đồng bộ created_at theo thời gian hiện tại
        if ($order->items->isEmpty()) {
            $order->created_at = now();
            $order->save();
        }

        $hasItems = $order->items && $order->items->isNotEmpty();

        $tableData = $table->toArray();
        $tableData['started_at'] = $table->started_at ? $table->started_at->format('H:i') : ($hasItems && $order->created_at ? $order->created_at->format('H:i') : null);

        $orderData = $order->toArray();
        $orderData['created_time'] = $hasItems && $order->created_at ? $order->created_at->format('H:i') : null;

        return response()->json([
            'success' => true,
            'table' => $tableData,
            'order' => $orderData,
        ]);
    }

    /**
     * Thêm món vào bàn
     */
    public function addItem(Request $request, $orderId)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'nullable|integer|min:1',
            'note' => 'nullable|string',
        ]);

        $order = Order::findOrFail($orderId);
        $product = Product::findOrFail($request->product_id);
        $quantity = $request->input('quantity', 1);
        $note = $request->input('note', '');

        // Kiểm tra xem món đó với cùng note đã có chưa
        $existingItem = OrderItem::where('order_id', $order->id)
            ->where('product_id', $product->id)
            ->where('note', $note)
            ->where('status', 'new_pending')
            ->first();

        if ($existingItem) {
            $existingItem->quantity += $quantity;
            $existingItem->subtotal = $existingItem->quantity * $existingItem->price;
            $existingItem->save();
        } else {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'product_name' => $product->name,
                'unit' => $product->unit,
                'quantity' => $quantity,
                'price' => $product->price,
                'subtotal' => $product->price * $quantity,
                'note' => $note,
                'status' => 'new_pending', // Mới thêm (Chưa báo quầy)
                'is_auto_added' => false,
            ]);
        }

        $order->recalculateTotals();

        // Cập nhật bàn
        if ($order->table) {
            $tableUpdate = [
                'status' => 'occupied',
                'notes' => $order->items()->count() . ' món',
            ];
            if (!$order->table->started_at) {
                $tableUpdate['started_at'] = now();
            }
            $order->table->update($tableUpdate);
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã thêm món vào order',
            'order' => $order->fresh(['items', 'customer', 'table'])
        ]);
    }

    /**
     * Cập nhật số lượng hoặc ghi chú của món
     */
    public function updateItem(Request $request, $itemId)
    {
        $item = OrderItem::with('order')->findOrFail($itemId);

        if ($request->has('quantity')) {
            $qty = (int)$request->input('quantity');
            if ($qty <= 0) {
                $item->delete();
            } else {
                $item->quantity = $qty;
                $item->subtotal = $qty * $item->price;
                $item->save();
            }
        }

        if ($request->has('note')) {
            $item->note = $request->input('note');
            $item->save();
        }

        $order = $item->order;
        $order->recalculateTotals();

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật món thành công',
            'order' => $order->fresh(['items', 'customer', 'table'])
        ]);
    }

    /**
     * Xóa món khỏi order
     * Nếu sau khi xóa mà order còn 0 món -> reset bàn về trạng thái 'empty'
     */
    public function deleteItem($itemId)
    {
        $item = OrderItem::with('order')->findOrFail($itemId);
        $order = $item->order;
        $item->delete();

        $order->recalculateTotals();

        // Nếu không còn món nào, reset trạng thái bàn về empty
        $remainingItems = $order->items()->count();
        if ($remainingItems === 0 && $order->table) {
            $order->table->update([
                'status' => 'empty',
                'guest_count' => 0,
                'started_at' => null,
                'notes' => null,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa món',
            'order' => $order->fresh(['items', 'customer', 'table'])
        ]);
    }

    /**
     * Huỷ toàn bộ order (xoá sạch món, reset bàn về empty)
     */
    public function clearOrder($orderId)
    {
        $order = Order::with(['items', 'table'])->findOrFail($orderId);

        // Xoá tất cả items
        $order->items()->delete();

        // Reset totals về 0
        $order->update([
            'subtotal' => 0,
            'discount_amount' => 0,
            'promotion_id' => null,
            'promotion_code' => null,
            'promotion_name' => null,
            'promotion_discount_amount' => 0,
            'vat_amount' => 0,
            'total_amount' => 0,
            'status' => 'active',
        ]);

        // Reset trạng thái bàn về empty
        if ($order->table) {
            $order->table->update([
                'status' => 'empty',
                'guest_count' => 0,
                'started_at' => null,
                'notes' => null,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã huỷ toàn bộ order',
            'order' => $order->fresh(['items', 'customer', 'table'])
        ]);
    }

    /**
     * Báo Bếp (F10)
     */
    public function sendToKitchen(Request $request, $orderId)
    {
        $order = Order::with(['items', 'table'])->findOrFail($orderId);

        // Lấy danh sách các món chưa gửi bếp
        $pendingItems = $order->items()->where('status', 'new_pending')->get();

        if ($pendingItems->isEmpty()) {
            // Nếu không có món new_pending, lấy tất cả để in lại phiếu báo bếp
            $itemsToPrint = $order->items;
        } else {
            $itemsToPrint = $pendingItems;
            // Đánh dấu thành Đã gửi bếp
            $order->items()->where('status', 'new_pending')->update([
                'status' => 'sent_kitchen',
                'sent_to_kitchen_at' => Carbon::now(),
            ]);
        }

        // Tạo phiếu báo bếp
        $ticketCode = 'BEP-' . date('His') . '-' . ($order->table ? $order->table->name : 'MV');
        $kitchenTicket = KitchenTicket::create([
            'order_id' => $order->id,
            'ticket_code' => $ticketCode,
            'table_name' => $order->table ? $order->table->name : 'Mang Về',
            'items_json' => json_encode($itemsToPrint->map(function ($it) {
                return [
                    'name' => $it->product_name,
                    'quantity' => $it->quantity,
                    'unit' => $it->unit,
                    'note' => $it->note,
                ];
            })),
            'printed_at' => Carbon::now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã gửi bếp thành công!',
            'ticket' => [
                'ticket_code' => $ticketCode,
                'table_name' => $order->table ? $order->table->name : 'Mang Về',
                'printed_at' => Carbon::now()->format('d/m/Y H:i:s'),
                'cashier' => $order->cashier_name,
                'items' => $itemsToPrint,
            ],
            'order' => $order->fresh(['items', 'customer', 'table'])
        ]);
    }

    /**
     * Lấy danh sách các món đang chế biến tại Bếp (KDS)
     */
    public function getKitchenItems(Request $request)
    {
        $items = OrderItem::whereHas('order', function ($query) {
            $query->whereIn('status', ['active', 'billing']);
        })
        ->whereIn('status', ['sent_kitchen', 'cooking', 'done'])
        ->with('order.table')
        ->orderBy('sent_to_kitchen_at', 'desc')
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function ($it) {
            $tableName = $it->order && $it->order->table ? $it->order->table->name : 'Mang Về';
            $status = 'pending';
            if ($it->status === 'cooking') $status = 'cooking';
            if ($it->status === 'done') $status = 'done';

            return [
                'id' => $it->id,
                'order_id' => $it->order_id,
                'table_name' => $tableName,
                'dish_name' => $it->product_name,
                'quantity' => (int) $it->quantity,
                'note' => (string) ($it->note ?? ''),
                'time' => $it->sent_to_kitchen_at ? $it->sent_to_kitchen_at->format('H:i') : ($it->created_at ? $it->created_at->format('H:i') : date('H:i')),
                'status' => $status,
            ];
        });

        return response()->json([
            'success' => true,
            'items' => $items,
        ]);
    }

    /**
     * Cập nhật trạng thái chế biến món ăn tại Bếp (pending -> cooking -> done)
     */
    public function updateKitchenItemStatus(Request $request, $itemId)
    {
        $status = $request->input('status'); // 'pending', 'cooking', 'done'
        $dbStatus = 'sent_kitchen';
        if ($status === 'cooking') $dbStatus = 'cooking';
        if ($status === 'done') $dbStatus = 'done';

        OrderItem::where('id', $itemId)->update(['status' => $dbStatus]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái món thành công!',
        ]);
    }

    /**
     * In Tạm Tính
     */
    public function printPreBill(Request $request, $orderId)
    {
        $order = Order::with(['items', 'table', 'customer'])->findOrFail($orderId);
        
        $order->update([
            'status' => 'billing',
            'printed_prebill_at' => Carbon::now(),
        ]);

        if ($order->table) {
            $order->table->update([
                'status' => 'billing',
                'notes' => 'Đã in tạm tính',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã in tạm tính thành công!',
            'order' => $order->fresh(['items', 'customer', 'table'])
        ]);
    }

    /**
     * Thanh Toán (F9)
     */
    public function checkout(Request $request, $orderId)
    {
        $request->validate([
            'payment_method' => 'required|string', // cash, qr_banking, card
            'paid_amount' => 'nullable|numeric',
        ]);

        $order = Order::with(['items', 'table', 'customer'])->findOrFail($orderId);

        $paidAmount = (float)$request->input('paid_amount', $order->total_amount);
        $changeAmount = max(0, $paidAmount - $order->total_amount);

        $order->update([
            'status' => 'paid',
            'payment_method' => $request->payment_method,
            'paid_amount' => $paidAmount,
            'change_amount' => $changeAmount,
            'paid_at' => Carbon::now(),
        ]);

        // Giải phóng bàn về trạng thái Trống
        if ($order->table) {
            $order->table->update([
                'status' => 'empty',
                'guest_count' => 0,
                'started_at' => null,
                'notes' => null,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Thanh toán thành công!',
            'receipt' => [
                'order_code' => $order->order_code,
                'table_name' => $order->table ? $order->table->name : 'Mang Về',
                'cashier' => $order->cashier_name,
                'shift' => $order->shift,
                'customer' => $order->customer ? $order->customer->name : 'Khách lẻ',
                'phone' => $order->customer ? $order->customer->phone : '',
                'items' => $order->items,
                'subtotal' => $order->subtotal,
                'discount_amount' => $order->discount_amount,
                'promotion_name' => $order->promotion_name,
                'promotion_discount_amount' => $order->promotion_discount_amount,
                'vat_amount' => $order->vat_amount,
                'total_amount' => $order->total_amount,
                'paid_amount' => $paidAmount,
                'change_amount' => $changeAmount,
                'payment_method' => $request->payment_method,
                'paid_at' => Carbon::now()->format('d/m/Y H:i:s'),
            ]
        ]);
    }

    /**
     * Cập nhật thông tin khách hàng cho Order
     */
    public function updateCustomer(Request $request, $orderId)
    {
        $order = Order::findOrFail($orderId);
        $customerId = $request->input('customer_id');

        if ($customerId) {
            $customer = Customer::findOrFail($customerId);
            $order->customer_id = $customer->id;
            $order->discount_percent = $customer->discount_percent;
        } else {
            $order->customer_id = null;
            $order->discount_percent = 0;
        }

        $order->save();
        $order->recalculateTotals();

        return response()->json([
            'success' => true,
            'order' => $order->fresh(['items', 'customer', 'table', 'promotion'])
        ]);
    }

    /**
     * Lấy danh sách chương trình khuyến mãi đang hoạt động (POS)
     */
    public function getPromotions()
    {
        $promos = Promotion::where('is_active', true)->orderBy('id', 'desc')->get();
        return response()->json([
            'success' => true,
            'promotions' => $promos
        ]);
    }

    /**
     * Áp dụng hoặc hủy chương trình khuyến mãi cho Order
     */
    public function applyPromotion(Request $request, $orderId)
    {
        $order = Order::findOrFail($orderId);
        $promoId = $request->input('promotion_id');

        if ($promoId) {
            $promo = Promotion::findOrFail($promoId);
            $order->promotion_id = $promo->id;
            $order->promotion_code = $promo->code;
            $order->promotion_name = $promo->name;
        } else {
            $order->promotion_id = null;
            $order->promotion_code = null;
            $order->promotion_name = null;
            $order->promotion_discount_amount = 0;
        }

        $order->save();
        $order->recalculateTotals();

        return response()->json([
            'success' => true,
            'message' => $promoId ? 'Đã áp dụng khuyến mãi thành công!' : 'Đã hủy áp dụng khuyến mãi',
            'order' => $order->fresh(['items', 'customer', 'table', 'promotion'])
        ]);
    }

    /**
     * Chuyển Bàn
     */
    public function transferTable(Request $request)
    {
        $request->validate([
            'from_table_id' => 'required|exists:dining_tables,id',
            'to_table_id' => 'required|exists:dining_tables,id',
        ]);

        $fromTable = DiningTable::findOrFail($request->from_table_id);
        $toTable = DiningTable::findOrFail($request->to_table_id);

        $order = Order::where('table_id', $fromTable->id)
            ->whereIn('status', ['active', 'billing'])
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Bàn gốc hiện không có đơn nào đang mở.'
            ], 400);
        }

        // Chuyển đơn sang bàn mới
        $order->table_id = $toTable->id;
        $order->save();

        // Cập nhật trạng thái hai bàn
        $toTable->update([
            'status' => $fromTable->status,
            'guest_count' => $fromTable->guest_count,
            'started_at' => $fromTable->started_at,
            'notes' => $fromTable->notes,
        ]);

        $fromTable->update([
            'status' => 'empty',
            'guest_count' => 0,
            'started_at' => null,
            'notes' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Đã chuyển từ {$fromTable->name} sang {$toTable->name}",
            'to_table_id' => $toTable->id
        ]);
    }

    /**
     * Tách đơn sang bàn mới
     */
    public function splitOrder(Request $request)
    {
        $request->validate([
            'from_table_id' => 'required|exists:dining_tables,id',
            'to_table_id' => 'required|exists:dining_tables,id',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $fromTable = DiningTable::findOrFail($request->from_table_id);
        $toTable = DiningTable::findOrFail($request->to_table_id);

        $fromOrder = Order::with('items')->where('table_id', $fromTable->id)
            ->whereIn('status', ['active', 'billing'])
            ->first();

        if (!$fromOrder) {
            return response()->json([
                'success' => false,
                'message' => 'Bàn gốc hiện không có đơn nào đang mở.'
            ], 400);
        }

        // Tạo hoặc lấy order cho bàn đích
        $toOrder = Order::where('table_id', $toTable->id)
            ->whereIn('status', ['active', 'billing'])
            ->first();

        if (!$toOrder) {
            $toOrder = Order::create([
                'table_id' => $toTable->id,
                'user_id' => $fromOrder->user_id ?? 1,
                'order_code' => 'ORD-' . date('Ymd') . '-' . str_pad($toTable->id, 3, '0', STR_PAD_LEFT) . '-' . rand(100, 999),
                'order_type' => 'dine_in',
                'status' => 'active',
                'customer_id' => $fromOrder->customer_id,
                'customer_name' => $fromOrder->customer_name,
                'customer_phone' => $fromOrder->customer_phone,
                'subtotal' => 0,
                'vat_percent' => $fromOrder->vat_percent ?? 8,
                'vat_amount' => 0,
                'discount_percent' => $fromOrder->discount_percent ?? 0,
                'discount_amount' => 0,
                'total_amount' => 0,
                'opened_at' => now(),
            ]);
            $toTable->update([
                'status' => 'occupied',
                'guest_count' => 2,
                'started_at' => now(),
            ]);
        }

        $movedCount = 0;
        foreach ($request->items as $splitItem) {
            $orderItem = OrderItem::where('order_id', $fromOrder->id)
                ->where('id', $splitItem['item_id'])
                ->first();

            if (!$orderItem) continue;

            $qtyToMove = min((int)$splitItem['quantity'], $orderItem->quantity);
            if ($qtyToMove <= 0) continue;

            $existingTargetItem = OrderItem::where('order_id', $toOrder->id)
                ->where('product_id', $orderItem->product_id)
                ->where('status', $orderItem->status)
                ->first();

            if ($existingTargetItem) {
                $existingTargetItem->quantity += $qtyToMove;
                $existingTargetItem->subtotal = $existingTargetItem->quantity * $existingTargetItem->price;
                $existingTargetItem->save();
            } else {
                OrderItem::create([
                    'order_id' => $toOrder->id,
                    'product_id' => $orderItem->product_id,
                    'product_name' => $orderItem->product_name,
                    'product_code' => $orderItem->product_code,
                    'unit' => $orderItem->unit,
                    'price' => $orderItem->price,
                    'quantity' => $qtyToMove,
                    'subtotal' => $qtyToMove * $orderItem->price,
                    'status' => $orderItem->status,
                    'note' => $orderItem->note,
                    'category_id' => $orderItem->category_id,
                ]);
            }

            if ($orderItem->quantity <= $qtyToMove) {
                $orderItem->delete();
            } else {
                $orderItem->quantity -= $qtyToMove;
                $orderItem->subtotal = $orderItem->quantity * $orderItem->price;
                $orderItem->save();
            }
            $movedCount += $qtyToMove;
        }

        $fromOrder->recalculateTotals();
        $toOrder->recalculateTotals();

        $remainingCount = OrderItem::where('order_id', $fromOrder->id)->count();
        if ($remainingCount === 0) {
            $fromOrder->update(['status' => 'cancelled']);
            $fromTable->update([
                'status' => 'empty',
                'guest_count' => 0,
                'started_at' => null,
                'notes' => null,
            ]);
        } else {
            $fromTable->update([
                'notes' => $remainingCount . ' món',
            ]);
        }

        $toRemainingCount = OrderItem::where('order_id', $toOrder->id)->count();
        $toTable->update([
            'notes' => $toRemainingCount . ' món',
        ]);

        return response()->json([
            'success' => true,
            'message' => "Đã tách thành công $movedCount phần món sang {$toTable->name}!",
            'from_table_id' => $fromTable->id,
            'to_table_id' => $toTable->id,
        ]);
    }

    /**
     * Đặt lại trạng thái dữ liệu bàn về trống ban đầu
     */
    public function resetDemo()
    {
        \App\Models\Order::where('status', 'active')->update(['status' => 'completed']);
        \App\Models\DiningTable::query()->update([
            'status' => 'empty',
            'guest_count' => 0,
            'started_at' => null,
            'notes' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã khôi phục trạng thái ban đầu: tất cả các bàn đều trống!'
        ]);
    }
}
