import 'dart:convert';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;
import '../models/models.dart';

class ApiService {
  // Tự động nhận diện host đang truy cập (localhost:8088 -> localhost:8000, mobile -> LAN IP:8000)
  static String get baseHost {
    if (kIsWeb) {
      final host = Uri.base.host;
      if (host.isNotEmpty) {
        return '$host:8000';
      }
    }
    return '192.168.1.34:8000';
  }

  static String get baseUrl => 'http://$baseHost/api/pos';
  static String get authUrl => 'http://$baseHost/api/auth';

  // Current logged in user
  static User? currentUser;

  // In-memory active order cache for offline/instant responsiveness (bắt đầu trống hết)
  static final Map<int, List<OrderItemData>> _tableItemsCache = {};

  // --- AUTHENTICATION ---
  static Future<User> login(String username, String password) async {
    final u = username.toLowerCase().trim();
    final p = password.trim();

    try {
      final res = await http.post(
        Uri.parse('$authUrl/login'),
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        body: json.encode({'username': username, 'password': password}),
      ).timeout(const Duration(seconds: 3));

      final data = json.decode(res.body);
      if (res.statusCode == 200 && data['success'] == true && data['user'] != null) {
        currentUser = User.fromJson(data['user']);
        return currentUser!;
      } else {
        final msg = data['message'] ?? 'Tên đăng nhập hoặc mật khẩu không chính xác!';
        throw Exception(msg);
      }
    } catch (e) {
      if (e.toString().contains('không chính xác') || e.toString().contains('không đúng')) {
        rethrow;
      }
    }

    // Fallback Offline Authentication khi mất kết nối mạng
    if (u == 'admin') {
      if (p != 'admin123' && p != 'admin') {
        throw Exception('Mật khẩu quản lý không chính xác (mặc định: admin123)');
      }
      currentUser = User(
        id: 1,
        name: 'Tuấn Admin',
        username: 'admin',
        role: 'admin',
        shift: 'Toàn ca (Quản lý nhà hàng)',
        phone: '0949.085.842',
        email: 'admin@aura.vn',
      );
      return currentUser!;
    } else if (u == 'tuan' || u == 'thuhang') {
      if (p != '123456') {
        throw Exception('Mật khẩu không chính xác (mặc định: 123456)');
      }
      currentUser = User(
        id: 2,
        name: 'Tuấn',
        username: 'tuan',
        role: 'cashier',
        shift: 'Ca sáng (07:00 - 15:00)',
        phone: '0949.085.842',
        email: 'tuan@aura.vn',
      );
      return currentUser!;
    }

    throw Exception('Tài khoản hoặc mật khẩu không chính xác!');
  }

  static void logout() {
    currentUser = null;
  }

  // --- REAL-TIME SHIFT STATS ---
  static Future<ShiftStats> fetchShiftStats() async {
    try {
      final response = await http
          .get(Uri.parse('http://$baseHost/api/admin/stats'))
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['stats'] != null) {
          return ShiftStats.fromJson(data);
        }
      }
    } catch (_) {}

    return ShiftStats.empty();
  }

  // --- TABLES ---
  static Future<List<DiningTable>> fetchTables() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/tables'))
          .timeout(const Duration(seconds: 3));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List list = data['tables'] ?? [];
        return list.map((e) => DiningTable.fromJson(e)).toList();
      }
    } catch (_) {}

    return getMockTables();
  }

  // --- MENU ---
  static Future<List<Category>> fetchMenu() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/menu'))
          .timeout(const Duration(seconds: 8));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List list = data['categories'] ?? [];
        if (list.isNotEmpty) {
          return list.map((e) => Category.fromJson(e)).toList();
        }
      }
    } catch (_) {}

    return getMockMenu();
  }

  // --- TABLE ORDER ITEMS ---
  static List<OrderItemData> getTableItems(int tableId) {
    if (!_tableItemsCache.containsKey(tableId)) {
      _tableItemsCache[tableId] = [];
    }
    return _tableItemsCache[tableId]!;
  }

  static void addDishToTable(int tableId, Product product, int quantity, String note) {
    final list = getTableItems(tableId);
    final existingIdx = list.indexWhere((it) => it.productId == product.id && it.note == note && it.status == 'new_pending');
    if (existingIdx >= 0) {
      final it = list[existingIdx];
      it.quantity += quantity;
      it.subtotal = it.quantity * it.price;
    } else {
      list.add(OrderItemData(
        id: DateTime.now().millisecondsSinceEpoch % 100000,
        productId: product.id,
        name: product.name,
        quantity: quantity,
        price: product.price,
        subtotal: quantity * product.price,
        note: note,
        status: 'new_pending',
        unit: product.unit,
      ));
    }
    _tableItemsCache[tableId] = list;

    // Asynchronously call backend if table has orderId
    _asyncAddBackendItem(tableId, product.id, quantity, note);
  }

  static void _asyncAddBackendItem(int tableId, int productId, int quantity, String note) async {
    try {
      await http.post(
        Uri.parse('$baseUrl/tables/$tableId/order'),
      ).then((res) {
        if (res.statusCode == 200) {
          final data = json.decode(res.body);
          final orderId = data['order']?['id'];
          if (orderId != null) {
            http.post(
              Uri.parse('$baseUrl/orders/$orderId/items'),
              headers: {'Content-Type': 'application/json'},
              body: json.encode({'product_id': productId, 'quantity': quantity, 'note': note}),
            );
          }
        }
      });
    } catch (_) {}
  }

  static void updateItemQuantity(int tableId, int itemId, int quantity) {
    final list = getTableItems(tableId);
    final idx = list.indexWhere((it) => it.id == itemId);
    if (idx >= 0) {
      if (quantity <= 0) {
        list.removeAt(idx);
      } else {
        list[idx].quantity = quantity;
        list[idx].subtotal = quantity * list[idx].price;
      }
    }
  }

  static void removeItem(int tableId, int itemId) {
    final list = getTableItems(tableId);
    list.removeWhere((it) => it.id == itemId);
  }

  // Centralized Kitchen items list
  static final List<KitchenItemModel> kitchenItems = [];

  // --- ACTIONS: BÁO BẾP ---
  static Future<bool> sendToKitchen(int tableId, {int? orderId, String? tableName}) async {
    // 1. Update local cache
    final list = getTableItems(tableId);
    final now = DateTime.now();
    final timeStr = '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
    final resolvedTableName = tableName ?? 'Bàn $tableId';

    for (var it in list) {
      it.status = 'sent_kitchen';

      // Add to kitchenItems if not already there
      final existingIdx = kitchenItems.indexWhere((k) => k.id == it.id);
      if (existingIdx >= 0) {
        kitchenItems[existingIdx].status = 'pending';
      } else {
        kitchenItems.insert(
          0,
          KitchenItemModel(
            id: it.id,
            tableName: resolvedTableName,
            dishName: it.name,
            quantity: it.quantity,
            note: it.note,
            time: timeStr,
            status: 'pending',
          ),
        );
      }
    }

    // 2. Call backend if orderId available
    if (orderId != null) {
      try {
        await http.post(Uri.parse('$baseUrl/orders/$orderId/send-kitchen')).timeout(const Duration(seconds: 3));
      } catch (_) {}
    }
    return true;
  }

  // --- KITCHEN ITEMS: FETCH & UPDATE ---
  static Future<List<KitchenItemModel>> fetchKitchenItems({List<DiningTable>? tables}) async {
    // 1. Thử lấy từ backend
    try {
      final res = await http.get(Uri.parse('$baseUrl/kitchen/items')).timeout(const Duration(seconds: 3));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        if (data['success'] == true && data['items'] != null) {
          final List list = data['items'];
          final backendItems = list.map((e) => KitchenItemModel.fromJson(e)).toList();

          kitchenItems.clear();
          kitchenItems.addAll(backendItems);
          return kitchenItems;
        }
      }
    } catch (_) {}

    // 2. Đồng bộ từ local _tableItemsCache và tables nếu offline hoặc backend chưa có
    if (tables != null && tables.isNotEmpty) {
      for (var t in tables) {
        final items = getTableItems(t.id);
        for (var it in items) {
          if (it.status == 'sent_kitchen') {
            final exists = kitchenItems.any((k) => k.id == it.id);
            if (!exists) {
              final now = DateTime.now();
              final timeStr = '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
              kitchenItems.add(
                KitchenItemModel(
                  id: it.id,
                  tableName: t.name,
                  dishName: it.name,
                  quantity: it.quantity,
                  note: it.note,
                  time: timeStr,
                  status: 'pending',
                ),
              );
            }
          }
        }
      }
    }

    return kitchenItems;
  }

  static Future<void> updateKitchenStatus(int itemId, String newStatus) async {
    // 1. Cập nhật local
    final idx = kitchenItems.indexWhere((k) => k.id == itemId);
    if (idx >= 0) {
      kitchenItems[idx].status = newStatus;
    }

    // 2. Gọi backend
    try {
      await http.patch(
        Uri.parse('$baseUrl/kitchen/items/$itemId/status'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'status': newStatus}),
      ).timeout(const Duration(seconds: 3));
    } catch (_) {}
  }

  // --- ACTIONS: IN TẠM TÍNH (PRE-BILL) ---
  static Future<bool> printPreBill(int tableId, {int? orderId}) async {
    if (orderId != null) {
      try {
        await http.post(Uri.parse('$baseUrl/orders/$orderId/print-prebill')).timeout(const Duration(seconds: 3));
      } catch (_) {}
    }
    return true;
  }

  // --- ACTIONS: THANH TOÁN (CHECKOUT) ---
  static Future<bool> checkout(int tableId, {int? orderId, String paymentMethod = 'cash', int paidAmount = 0}) async {
    // 1. Clear local items
    _tableItemsCache[tableId] = [];

    // 2. Call backend
    if (orderId != null) {
      try {
        await http.post(
          Uri.parse('$baseUrl/orders/$orderId/checkout'),
          headers: {'Content-Type': 'application/json'},
          body: json.encode({
            'payment_method': paymentMethod,
            'paid_amount': paidAmount,
          }),
        ).timeout(const Duration(seconds: 4));
      } catch (_) {}
    }
    return true;
  }

  // --- PROMOTIONS ---
  static List<PromotionModel> getMockPromotions() {
    return [
      PromotionModel(
        id: 4,
        code: 'KM000004',
        name: 'TRI AN KHACH HANG (Giảm 15%)',
        type: 'order_discount',
        discountValue: 15,
        minOrder: 150000,
        isActive: true,
      ),
      PromotionModel(
        id: 1,
        code: 'KM000014',
        name: 'CTKM KHAI TRƯƠNG (Giảm 10%)',
        type: 'order_discount',
        discountValue: 10,
        minOrder: 200000,
        isActive: true,
      ),
      PromotionModel(
        id: 5,
        code: 'VIP05',
        name: 'Khách Hàng Thân Thiết (VIP 5%)',
        type: 'order_discount',
        discountValue: 5,
        minOrder: 0,
        isActive: true,
      ),
      PromotionModel(
        id: 2,
        code: 'KM000013',
        name: 'Combo Giờ Vàng (Giảm 25.000 đ)',
        type: 'amount',
        discountValue: 25000,
        minOrder: 100000,
        isActive: true,
      ),
    ];
  }

  static Future<List<PromotionModel>> getPromotions() async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/promotions')).timeout(const Duration(seconds: 3));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        if (data['promotions'] != null) {
          final list = (data['promotions'] as List)
              .map((e) => PromotionModel.fromJson(e))
              .where((p) => p.isActive)
              .toList();
          if (list.isNotEmpty) return list;
        }
      }
    } catch (_) {}
    return getMockPromotions();
  }

  // --- TÁCH ĐƠN (SPLIT ORDER) ---
  static bool splitOrderItems(int sourceTableId, int? targetTableId, Map<int, int> splitQuantities) {
    final sourceItems = _tableItemsCache[sourceTableId] ?? [];
    List<OrderItemData> targetItems = [];
    if (targetTableId != null) {
      targetItems = _tableItemsCache[targetTableId] ?? [];
    }

    final List<OrderItemData> remainingItems = [];

    for (var it in sourceItems) {
      final splitQty = splitQuantities[it.id] ?? 0;
      if (splitQty <= 0) {
        remainingItems.add(it);
      } else if (splitQty < it.quantity) {
        // Keep partial
        remainingItems.add(OrderItemData(
          id: it.id,
          productId: it.productId,
          name: it.name,
          quantity: it.quantity - splitQty,
          price: it.price,
          subtotal: (it.quantity - splitQty) * it.price,
          note: it.note,
          status: it.status,
          unit: it.unit,
        ));
        // Move split portion
        targetItems.add(OrderItemData(
          id: DateTime.now().millisecondsSinceEpoch % 100000 + targetItems.length,
          productId: it.productId,
          name: it.name,
          quantity: splitQty,
          price: it.price,
          subtotal: splitQty * it.price,
          note: it.note,
          status: it.status,
          unit: it.unit,
        ));
      } else {
        // Move full item
        targetItems.add(it);
      }
    }

    _tableItemsCache[sourceTableId] = remainingItems;
    if (targetTableId != null) {
      _tableItemsCache[targetTableId] = targetItems;
    }
    return true;
  }

  static List<OrderItemData> getTable3Items() {
    return [
      OrderItemData(
        id: 1,
        productId: 1,
        name: 'Mì xào bò thượng hạng',
        quantity: 2,
        price: 110000,
        subtotal: 220000,
        note: 'Ít hành tây, làm mềm',
        status: 'sent_kitchen',
        unit: 'phần',
      ),
      OrderItemData(
        id: 2,
        productId: 2,
        name: 'Cơm chiên hải sản Hoàng Kim',
        quantity: 1,
        price: 125000,
        subtotal: 125000,
        note: 'Cay nhẹ',
        status: 'sent_kitchen',
        unit: 'phần',
      ),
      OrderItemData(
        id: 3,
        productId: 8,
        name: 'Nước cam ép tươi',
        quantity: 2,
        price: 45000,
        subtotal: 90000,
        note: 'Không đường, nhiều đá',
        status: 'new_pending',
        unit: 'ly',
      ),
      OrderItemData(
        id: 4,
        productId: 11,
        name: 'Khăn lạnh thơm cao cấp',
        quantity: 3,
        price: 5000,
        subtotal: 15000,
        note: 'Tự động tính',
        status: 'sent_kitchen',
        unit: 'cái',
      ),
    ];
  }

  // --- MOCK TABLES (Tất cả bàn ban đầu đều trống) ---
  static List<DiningTable> getMockTables() {
    return [
      DiningTable(
        id: 4,
        name: 'MANG VỀ',
        areaCode: 'floor_1',
        capacity: 1,
        status: 'empty',
        guestCount: 0,
        isTakeaway: true,
      ),
      DiningTable(
        id: 1,
        name: 'BÀN 01',
        areaCode: 'floor_1',
        capacity: 4,
        status: 'empty',
        guestCount: 0,
      ),
      DiningTable(
        id: 2,
        name: 'BÀN 02',
        areaCode: 'floor_1',
        capacity: 2,
        status: 'empty',
        guestCount: 0,
      ),
      DiningTable(
        id: 3,
        name: 'BÀN 03',
        areaCode: 'floor_1',
        capacity: 4,
        status: 'empty',
        guestCount: 0,
      ),
      DiningTable(
        id: 5,
        name: 'BÀN 04',
        areaCode: 'floor_1',
        capacity: 4,
        status: 'empty',
        guestCount: 0,
      ),
      DiningTable(
        id: 6,
        name: 'BÀN 05',
        areaCode: 'floor_1',
        capacity: 6,
        status: 'empty',
        guestCount: 0,
      ),
      DiningTable(
        id: 7,
        name: 'BÀN 06',
        areaCode: 'floor_1',
        capacity: 2,
        status: 'empty',
        guestCount: 0,
      ),
      DiningTable(
        id: 8,
        name: 'BÀN 07',
        areaCode: 'floor_1',
        capacity: 4,
        status: 'empty',
        guestCount: 0,
      ),
      DiningTable(
        id: 9,
        name: 'VIP 01',
        areaCode: 'vip',
        capacity: 8,
        status: 'empty',
        guestCount: 0,
        isVip: true,
      ),
      DiningTable(
        id: 10,
        name: 'VIP 02',
        areaCode: 'vip',
        capacity: 10,
        status: 'empty',
        guestCount: 0,
        isVip: true,
      ),
      DiningTable(
        id: 13,
        name: 'BÀN 08',
        areaCode: 'floor_2',
        capacity: 4,
        status: 'empty',
        guestCount: 0,
      ),
      DiningTable(
        id: 14,
        name: 'BÀN 09',
        areaCode: 'floor_2',
        capacity: 4,
        status: 'empty',
        guestCount: 0,
      ),
    ];
  }

  // --- MOCK MENU (Đồng bộ đầy đủ 13 danh mục & 83 món ăn từ hệ thống) ---
  static List<Category> getMockMenu() {
    return [
      Category(
        id: 1,
        name: "Món chính",
        code: "CAT_MAIN",
        products: [
          Product(
            id: 1,
            categoryId: 1,
            name: "Cơm pilaf truyền thống",
            code: "MC01",
            price: 190000,
            unit: "phần",
            description: "Cơm, thịt bò, cà rốt, hành tây",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 2,
            categoryId: 1,
            name: "Kazan kebab",
            code: "MC02",
            price: 280000,
            unit: "phần",
            description: "Thịt, khoai tây, hành tây",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 3,
            categoryId: 1,
            name: "Bò hầm Goulash",
            code: "MC03",
            price: 190000,
            unit: "phần",
            description: "Thịt bò, hành tây, cà rốt, sốt",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 4,
            categoryId: 1,
            name: "Bánh Manti hấp nhân thịt bò",
            code: "MC04",
            price: 190000,
            unit: "phần",
            description: "Bột, thịt bò, hành tây",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 5,
            categoryId: 1,
            name: "Thịt bò xào cay",
            code: "MC05",
            price: 250000,
            unit: "phần",
            description: "Thịt bò, ớt, hành tây, rau củ",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 6,
            categoryId: 1,
            name: "Lagman Uyghur",
            code: "MC06",
            price: 190000,
            unit: "tô",
            description: "Mì kéo tay, thịt bò, rau củ",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 7,
            categoryId: 1,
            name: "Đùi gà ăn kèm khoai tây chiên",
            code: "MC07",
            price: 180000,
            unit: "phần",
            description: "Đùi gà, khoai tây chiên, rau củ",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 8,
            categoryId: 1,
            name: "Mì Lagman chiên",
            code: "MC08",
            price: 200000,
            unit: "dĩa",
            description: "Mì, thịt bò, rau củ",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 9,
            categoryId: 1,
            name: "Kurdak (thịt hầm kiểu Trung Á)",
            code: "MC09",
            price: 280000,
            unit: "phần",
            description: "Thịt, khoai tây, hành tây, cà rốt",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 10,
            categoryId: 1,
            name: "Cánh gà chiên giòn",
            code: "MC10",
            price: 220000,
            unit: "phần",
            description: "Cánh gà, gia vị",
            imageUrl: "",
            isPopular: false,
          ),
        ],
      ),
      Category(
        id: 2,
        name: "Thịt nướng",
        code: "CAT_BBQ",
        products: [
          Product(
            id: 11,
            categoryId: 2,
            name: "Kebab cừu xay nướng xiên",
            code: "BBQ11",
            price: 140000,
            unit: "xiên",
            description: "Thịt cừu xay, hành tây",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 12,
            categoryId: 2,
            name: "Kebab bò xay nướng xiên",
            code: "BBQ12",
            price: 140000,
            unit: "xiên",
            description: "Thịt bò xay, hành tây",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 13,
            categoryId: 2,
            name: "Phi lê gà nướng xiên",
            code: "BBQ13",
            price: 130000,
            unit: "xiên",
            description: "Phi lê gà",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 14,
            categoryId: 2,
            name: "Cánh gà nướng xiên",
            code: "BBQ14",
            price: 130000,
            unit: "xiên",
            description: "Cánh gà",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 15,
            categoryId: 2,
            name: "Thịt nướng xiên thập cẩm",
            code: "BBQ15",
            price: 1800000,
            unit: "mẹt",
            description: "Cừu, bò, gà, rau củ",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 16,
            categoryId: 2,
            name: "Thịt cừu nướng xiên miếng",
            code: "BBQ16",
            price: 160000,
            unit: "xiên",
            description: "Thịt cừu, hành tây; khẩu phần 120 g",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 17,
            categoryId: 2,
            name: "Thịt bò nướng xiên miếng",
            code: "BBQ17",
            price: 160000,
            unit: "xiên",
            description: "Thịt bò, hành tây; khẩu phần 120 g",
            imageUrl: "",
            isPopular: false,
          ),
        ],
      ),
      Category(
        id: 3,
        name: "Súp",
        code: "CAT_SOUPS",
        products: [
          Product(
            id: 18,
            categoryId: 3,
            name: "Súp Lagman",
            code: "SUP18",
            price: 160000,
            unit: "tô",
            description: "Mì, thịt bò, rau củ",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 19,
            categoryId: 3,
            name: "Súp Shurpa thịt cừu",
            code: "SUP19",
            price: 190000,
            unit: "tô",
            description: "Thịt cừu, khoai tây, cà rốt, hành tây",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 20,
            categoryId: 3,
            name: "Súp Shurpa thịt bò",
            code: "SUP20",
            price: 170000,
            unit: "tô",
            description: "Thịt bò, khoai tây, cà rốt, hành tây",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 21,
            categoryId: 3,
            name: "Súp Manpar",
            code: "SUP21",
            price: 160000,
            unit: "tô",
            description: "Mì nhà làm, thịt, rau củ",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 22,
            categoryId: 3,
            name: "Súp Borscht củ dền",
            code: "SUP22",
            price: 160000,
            unit: "tô",
            description: "Thịt bò, củ dền, bắp cải, khoai tây",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 23,
            categoryId: 3,
            name: "Súp Mastava",
            code: "SUP23",
            price: 150000,
            unit: "tô",
            description: "Cơm, thịt bò, khoai tây, cà rốt",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 24,
            categoryId: 3,
            name: "Súp Chuchvara nhân thịt bò",
            code: "SUP24",
            price: 160000,
            unit: "tô",
            description: "Bánh bột nhân thịt bò, hành tây, nước dùng",
            imageUrl: "",
            isPopular: false,
          ),
        ],
      ),
      Category(
        id: 4,
        name: "Salad",
        code: "CAT_SALAD",
        products: [
          Product(
            id: 25,
            categoryId: 4,
            name: "Salad Caesar tôm",
            code: "SL25",
            price: 150000,
            unit: "dĩa",
            description: "Tôm, xà lách, phô mai, bánh mì giòn, sốt Caesar",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 26,
            categoryId: 4,
            name: "Salad Caesar gà",
            code: "SL26",
            price: 150000,
            unit: "dĩa",
            description: "Gà, xà lách, phô mai, bánh mì giòn, sốt Caesar",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 27,
            categoryId: 4,
            name: "Salad Achuchuk",
            code: "SL27",
            price: 80000,
            unit: "dĩa",
            description: "Cà chua, hành tây, ớt cay, rau thơm",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 28,
            categoryId: 4,
            name: "Salad Night Zhor",
            code: "SL28",
            price: 150000,
            unit: "dĩa",
            description: "Thịt, rau củ, hành tây, rau thơm, sốt",
            imageUrl: "",
            isPopular: false,
          ),
        ],
      ),
      Category(
        id: 5,
        name: "Món ăn kèm",
        code: "CAT_SIDES",
        products: [
          Product(
            id: 29,
            categoryId: 5,
            name: "Cơm trắng",
            code: "AK29",
            price: 50000,
            unit: "chén",
            description: "Cơm trắng dẻo thơm",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 30,
            categoryId: 5,
            name: "Mì sợi",
            code: "AK30",
            price: 50000,
            unit: "chén",
            description: "Mì sợi tươi luộc chín",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 31,
            categoryId: 5,
            name: "Khoai tây nghiền",
            code: "AK31",
            price: 60000,
            unit: "phần",
            description: "Khoai tây, bơ, sữa, muối",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 32,
            categoryId: 5,
            name: "Khoai tây kiểu đồng quê",
            code: "AK32",
            price: 90000,
            unit: "dĩa",
            description: "Khoai tây, gia vị",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 33,
            categoryId: 5,
            name: "Khoai tây chiên",
            code: "AK33",
            price: 90000,
            unit: "dĩa",
            description: "Khoai tây chiên giòn rụm",
            imageUrl: "",
            isPopular: false,
          ),
        ],
      ),
      Category(
        id: 6,
        name: "Bánh",
        code: "CAT_PASTRIES",
        products: [
          Product(
            id: 34,
            categoryId: 6,
            name: "Samsa nhân gà",
            code: "BH34",
            price: 90000,
            unit: "cái",
            description: "Bột, thịt gà, hành tây, gia vị",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 35,
            categoryId: 6,
            name: "Samsa nhân bò",
            code: "BH35",
            price: 100000,
            unit: "cái",
            description: "Bột, thịt bò, hành tây, gia vị",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 36,
            categoryId: 6,
            name: "Cheburek nhân bò",
            code: "BH36",
            price: 80000,
            unit: "cái",
            description: "Bột, thịt bò, hành tây, gia vị",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 37,
            categoryId: 6,
            name: "Bánh mì dẹt truyền thống",
            code: "BH37",
            price: 70000,
            unit: "cái",
            description: "Bột mì, nước, muối",
            imageUrl: "",
            isPopular: false,
          ),
        ],
      ),
      Category(
        id: 7,
        name: "Trà",
        code: "CAT_TEA",
        products: [
          Product(
            id: 38,
            categoryId: 7,
            name: "Trà chanh dây",
            code: "TR38",
            price: 70000,
            unit: "ấm",
            description: "Trà, chanh dây, đường",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 39,
            categoryId: 7,
            name: "Trà Tashkent",
            code: "TR39",
            price: 80000,
            unit: "ấm",
            description: "Trà, chanh, bạc hà, gia vị",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 40,
            categoryId: 7,
            name: "Trà sữa",
            code: "TR40",
            price: 70000,
            unit: "ly",
            description: "Trà, sữa",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 41,
            categoryId: 7,
            name: "Trà chanh",
            code: "TR41",
            price: 70000,
            unit: "ly",
            description: "Trà, chanh, đường",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 42,
            categoryId: 7,
            name: "Trà đen",
            code: "TR42",
            price: 50000,
            unit: "ấm",
            description: "Trà đen truyền thống",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 43,
            categoryId: 7,
            name: "Trà xanh",
            code: "TR43",
            price: 50000,
            unit: "ấm",
            description: "Trà xanh thanh mát",
            imageUrl: "",
            isPopular: false,
          ),
        ],
      ),
      Category(
        id: 8,
        name: "Pizza",
        code: "CAT_PIZZA",
        products: [
          Product(
            id: 44,
            categoryId: 8,
            name: "Pizza Pepperoni",
            code: "PZ44",
            price: 340000,
            unit: "cái",
            description: "Sốt cà chua, phô mai mozzarella, xúc xích pepperoni; 30 cm",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 45,
            categoryId: 8,
            name: "Pizza thập cẩm thịt",
            code: "PZ45",
            price: 320000,
            unit: "cái",
            description: "Sốt cà chua, mozzarella, bò, gà, xúc xích, thịt xông khói; 30 cm",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 46,
            categoryId: 8,
            name: "Pizza gà nấm",
            code: "PZ46",
            price: 320000,
            unit: "cái",
            description: "Sốt cà chua, mozzarella, gà, nấm; 30 cm",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 47,
            categoryId: 8,
            name: "Pizza Margherita",
            code: "PZ47",
            price: 280000,
            unit: "cái",
            description: "Sốt cà chua, mozzarella, húng quế; 30 cm",
            imageUrl: "",
            isPopular: false,
          ),
        ],
      ),
      Category(
        id: 9,
        name: "Sushi cuộn",
        code: "CAT_SUSHI_ROLL",
        products: [
          Product(
            id: 48,
            categoryId: 9,
            name: "Sushi cuộn cá hồi nướng",
            code: "SR48",
            price: 290000,
            unit: "cuộn",
            description: "Cơm sushi, rong biển, cá hồi, dưa chuột, sốt unagi, mè",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 49,
            categoryId: 9,
            name: "Sushi cuộn Philadelphia bơ",
            code: "SR49",
            price: 290000,
            unit: "cuộn",
            description: "Cơm sushi, rong biển, phô mai kem, bơ, cá hồi, sốt đặc biệt",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 50,
            categoryId: 9,
            name: "Sushi cuộn nướng",
            code: "SR50",
            price: 280000,
            unit: "cuộn",
            description: "Cơm sushi, rong biển, gà luộc, dưa chuột, phô mai kem, gừng, mè, sốt đặc biệt",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 51,
            categoryId: 9,
            name: "Sushi cuộn lươn phô mai kem",
            code: "SR51",
            price: 300000,
            unit: "cuộn",
            description: "Cơm sushi, rong biển, phô mai kem, dưa chuột, lươn nướng, mè trắng",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 52,
            categoryId: 9,
            name: "Sushi cuộn Kanada",
            code: "SR52",
            price: 320000,
            unit: "cuộn",
            description: "Cơm sushi, tôm, phô mai kem, dưa chuột, trứng cá chuồn, sốt đặc biệt",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 53,
            categoryId: 9,
            name: "Sushi cuộn California nướng",
            code: "SR53",
            price: 290000,
            unit: "cuộn",
            description: "Cơm sushi, rong biển, dưa chuột, bơ, thanh cua, tobiko, sốt unagi, mè",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 54,
            categoryId: 9,
            name: "Sushi cuộn California cá hồi",
            code: "SR53B",
            price: 320000,
            unit: "cuộn",
            description: "Cơm sushi, rong biển, bơ, dưa chuột, cá hồi, trứng cá chuồn",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 55,
            categoryId: 9,
            name: "Sushi cuộn Dragon",
            code: "SR54",
            price: 360000,
            unit: "cuộn",
            description: "Cơm sushi, rong biển, phô mai kem, dưa chuột, sốt unagi, trứng cá chuồn, mè",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 56,
            categoryId: 9,
            name: "Sushi cuộn Philadelphia",
            code: "SR55",
            price: 280000,
            unit: "cuộn",
            description: "Cơm sushi, rong biển, phô mai kem, dưa chuột, cá hồi, sốt đặc biệt",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 57,
            categoryId: 9,
            name: "Sushi cuộn gà Star",
            code: "SR56",
            price: 280000,
            unit: "cuộn",
            description: "Cơm sushi, rong biển, gà luộc, dưa chuột, hạt hướng dương, sốt mayonnaise, sốt đặc biệt",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 58,
            categoryId: 9,
            name: "Sushi cuộn Mummy",
            code: "SR57",
            price: 270000,
            unit: "cuộn",
            description: "Cơm sushi, rong biển, phô mai kem, dưa chuột, cá hồi chiên giòn, sốt đặc biệt",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 59,
            categoryId: 9,
            name: "Sushi cuộn cá hồi dưa chuột không rong biển",
            code: "SR58",
            price: 280000,
            unit: "cuộn",
            description: "Cơm sushi, cá hồi, dưa chuột, phô mai kem, mè trắng",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 60,
            categoryId: 9,
            name: "Sushi cuộn California tôm",
            code: "SR59",
            price: 320000,
            unit: "cuộn",
            description: "Cơm sushi, rong biển, tôm chiên, bơ, dưa chuột, trứng cá chuồn, tobiko",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 61,
            categoryId: 9,
            name: "Sushi cuộn California thanh cua",
            code: "SR68",
            price: 320000,
            unit: "cuộn",
            description: "Cơm sushi, rong biển, bơ, dưa chuột, thanh cua, trứng cá chuồn",
            imageUrl: "",
            isPopular: false,
          ),
        ],
      ),
      Category(
        id: 10,
        name: "Set sushi",
        code: "CAT_SUSHI_SET",
        products: [
          Product(
            id: 62,
            categoryId: 10,
            name: "Set sushi 1",
            code: "SS60",
            price: 990000,
            unit: "set",
            description: "California, cá hồi, thanh cua, dưa chuột, sốt mayonnaise, sốt đặc biệt",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 63,
            categoryId: 10,
            name: "Set sushi 2",
            code: "SS61",
            price: 990000,
            unit: "set",
            description: "California nướng; California cá hồi; California tôm; California thanh cua",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 64,
            categoryId: 10,
            name: "Set sushi 3",
            code: "SS62",
            price: 750000,
            unit: "set",
            description: "California nướng, California Dragon",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 65,
            categoryId: 10,
            name: "Set sushi 4",
            code: "SS63",
            price: 1250000,
            unit: "set",
            description: "California, Kanada, Philadelphia, unagi, chicken roll; mỗi loại 8 miếng",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 66,
            categoryId: 10,
            name: "Set sushi 5",
            code: "SS64",
            price: 800000,
            unit: "set",
            description: "California, Philadelphia, Kanada",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 67,
            categoryId: 10,
            name: "Set sushi 6",
            code: "SS65",
            price: 1090000,
            unit: "set",
            description: "Philadelphia, Philadelphia nướng, chicken roll nướng, California; mỗi loại 8 miếng",
            imageUrl: "",
            isPopular: false,
          ),
        ],
      ),
      Category(
        id: 11,
        name: "Sushi & Nigiri",
        code: "CAT_NIGIRI",
        products: [
          Product(
            id: 68,
            categoryId: 11,
            name: "Set sushi mini",
            code: "SN66",
            price: 390000,
            unit: "set",
            description: "Cơm sushi, rong biển, cá ngừ, tôm, cá hồi, lươn; mỗi loại một miếng",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 69,
            categoryId: 11,
            name: "Set sushi nigiri cao cấp",
            code: "SN67",
            price: 1200000,
            unit: "set",
            description: "Cá ngừ, lươn, tôm, cá hồi, mực",
            imageUrl: "",
            isPopular: false,
          ),
        ],
      ),
      Category(
        id: 12,
        name: "Nước ép & Sinh tố",
        code: "CAT_JUICES",
        products: [
          Product(
            id: 70,
            categoryId: 12,
            name: "Nước cam",
            code: "NS69",
            price: 60000,
            unit: "ly",
            description: "Cam tươi vắt nguyên chất",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 71,
            categoryId: 12,
            name: "Sinh tố xoài",
            code: "NS70",
            price: 60000,
            unit: "ly",
            description: "Xoài, sữa hoặc nền sinh tố",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 72,
            categoryId: 12,
            name: "Sinh tố xoài chanh dây",
            code: "NS71",
            price: 60000,
            unit: "ly",
            description: "Xoài, chanh dây, đá xay",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 73,
            categoryId: 12,
            name: "Nước ép dứa",
            code: "NS72",
            price: 60000,
            unit: "ly",
            description: "Dứa tươi ép nguyên chất",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 74,
            categoryId: 12,
            name: "Nước ép dưa hấu",
            code: "NS73",
            price: 60000,
            unit: "ly",
            description: "Dưa hấu tươi mát",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 75,
            categoryId: 12,
            name: "Sinh tố chuối",
            code: "NS74",
            price: 60000,
            unit: "ly",
            description: "Chuối, sữa hoặc nền sinh tố",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 76,
            categoryId: 12,
            name: "Nước compote trái cây nhà làm",
            code: "NS75",
            price: 70000,
            unit: "ly",
            description: "Trái cây/trái cây sấy, nước, đường",
            imageUrl: "",
            isPopular: false,
          ),
        ],
      ),
      Category(
        id: 13,
        name: "Nước ngọt & Nước suối",
        code: "CAT_DRINKS",
        products: [
          Product(
            id: 77,
            categoryId: 13,
            name: "Coca-Cola",
            code: "NN74",
            price: 30000,
            unit: "lon",
            description: "Nước ngọt có gas Coca-Cola lon",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 78,
            categoryId: 13,
            name: "Fanta",
            code: "NN75",
            price: 30000,
            unit: "lon",
            description: "Nước ngọt hương cam Fanta lon",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 79,
            categoryId: 13,
            name: "7UP",
            code: "NN76",
            price: 30000,
            unit: "lon",
            description: "Nước ngọt chanh 7UP thanh mát lon",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 80,
            categoryId: 13,
            name: "Mirinda",
            code: "NN77",
            price: 30000,
            unit: "lon",
            description: "Nước ngọt Mirinda hương vị trái cây",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 81,
            categoryId: 13,
            name: "Pepsi",
            code: "NN78",
            price: 30000,
            unit: "lon",
            description: "Nước ngọt có gas Pepsi lon",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 82,
            categoryId: 13,
            name: "Nước suối Aquafina",
            code: "NN79",
            price: 20000,
            unit: "chai",
            description: "Nước uống tinh khiết đóng chai (500 ml)",
            imageUrl: "",
            isPopular: false,
          ),
          Product(
            id: 83,
            categoryId: 13,
            name: "Nước suối Aquafina (1.5L)",
            code: "NN79B",
            price: 30000,
            unit: "chai",
            description: "Nước uống tinh khiết chai lớn 1.5 L",
            imageUrl: "",
            isPopular: false,
          ),
        ],
      ),
    ];
  }
}
