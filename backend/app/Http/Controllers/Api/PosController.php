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
        
        $order = Order::with(['items', 'customer'])
            ->where('table_id', $tableId)
            ->whereIn('status', ['active', 'billing'])
            ->latest()
            ->first();

        // Nếu bàn trống hoặc chưa có order thì khởi tạo order rỗng nhưng KHÔNG tự ý đổi trạng thái bàn thành occupied
        if (!$order) {
            $order = Order::create([
                'order_code' => 'ORD-' . date('Ymd') . '-' . sprintf('%03d', $table->id),
                'table_id' => $table->id,
                'customer_id' => null,
                'cashier_name' => 'Thu Hằng',
                'shift' => 'Ca sáng (07:00 - 15:00)',
                'order_type' => $table->is_takeaway ? 'takeaway' : 'dine_in',
                'subtotal' => 0,
                'discount_percent' => 0,
                'discount_amount' => 0,
                'vat_percent' => 8,
                'vat_amount' => 0,
                'total_amount' => 0,
                'status' => 'active',
            ]);
            // Giữ nguyên trạng thái bàn (nếu đang trống thì vẫn là empty cho đến khi order món)
        }

        $order->load(['items', 'customer']);

        return response()->json([
            'success' => true,
            'table' => $table,
            'order' => $order,
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
            $order->table->update([
                'status' => 'occupied',
                'notes' => $order->items()->count() . ' món',
            ]);
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
            'order' => $order->fresh(['items', 'customer', 'table'])
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
