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
        name: 'Quản lý: Hoàng Nam',
        username: 'admin',
        role: 'admin',
        shift: 'Toàn ca (Quản lý nhà hàng)',
        phone: '0901.888.999',
        email: 'admin@aura.vn',
      );
      return currentUser!;
    } else if (u == 'minhtri' || u.contains('tri')) {
      if (p != '123456') {
        throw Exception('Mật khẩu không chính xác (mặc định: 123456)');
      }
      currentUser = User(
        id: 3,
        name: 'Minh Trí',
        username: 'minhtri',
        role: 'cashier',
        shift: 'Ca chiều (15:00 - 23:00)',
        phone: '0987.654.321',
        email: 'minhtri@aura.vn',
      );
      return currentUser!;
    } else if (u == 'thuhang' || u.contains('hang')) {
      if (p != '123456') {
        throw Exception('Mật khẩu thu ngân không chính xác (mặc định: 123456)');
      }
      currentUser = User(
        id: 2,
        name: 'Thu Hằng',
        username: 'thuhang',
        role: 'cashier',
        shift: 'Ca sáng (07:00 - 15:00)',
        phone: '0912.345.678',
        email: 'thuhang@aura.vn',
      );
      return currentUser!;
    }

    throw Exception('Tài khoản hoặc mật khẩu không chính xác!');
  }

  static void logout() {
    currentUser = null;
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
          .timeout(const Duration(seconds: 3));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List list = data['categories'] ?? [];
        return list.map((e) => Category.fromJson(e)).toList();
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
        id: 4,
        name: 'MANG VỀ',
        areaCode: 'floor_1',
        capacity: 1,
        status: 'empty',
        guestCount: 0,
        isTakeaway: true,
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

  // --- MOCK MENU ---
  static List<Category> getMockMenu() {
    return [
      Category(
        id: 1,
        name: 'Món xào & Cơm',
        code: 'rice_noodles',
        products: [
          Product(
            id: 1,
            categoryId: 1,
            name: 'Mì xào bò thượng hạng',
            code: 'MXB01',
            price: 110000,
            unit: 'phần',
            description: 'Bò mềm sốt tiêu tỏi, mì trứng xào rau củ tươi xanh',
            isPopular: true,
          ),
          Product(
            id: 2,
            categoryId: 1,
            name: 'Cơm chiên hải sản Hoàng Kim',
            code: 'CCHS01',
            price: 125000,
            unit: 'phần',
            description: 'Tôm mực tươi rói đảo cùng trứng muối thơm lừng',
            isPopular: true,
          ),
        ],
      ),
      Category(
        id: 2,
        name: 'Món bò & Gà',
        code: 'meat',
        products: [
          Product(
            id: 3,
            categoryId: 2,
            name: 'Bò lúc lắc khoai tây chiên',
            code: 'BLL01',
            price: 185000,
            unit: 'phần',
            description: 'Thịt bò Úc mềm mọng đậm vị sốt bơ tỏi',
            isPopular: true,
          ),
          Product(
            id: 4,
            categoryId: 2,
            name: 'Gà nướng thảo mộc mật ong',
            code: 'GN01',
            price: 165000,
            unit: 'nửa con',
            description: 'Gà ta da giòn rụm ướp sốt mật ong rừng',
          ),
        ],
      ),
      Category(
        id: 3,
        name: 'Hải sản & Khai vị',
        code: 'seafood',
        products: [
          Product(
            id: 5,
            categoryId: 3,
            name: 'Tôm sú hoàng bào sốt phô mai',
            code: 'TS01',
            price: 245000,
            unit: 'phần',
            description: 'Tôm sú tươi nướng đẫm sốt phô mai kéo sợi',
            isPopular: true,
          ),
          Product(
            id: 6,
            categoryId: 3,
            name: 'Salad cá hồi xông khói sốt chanh leo',
            code: 'SK01',
            price: 135000,
            unit: 'dĩa',
            description: 'Cá hồi Na Uy kết hợp rau củ Đà Lạt thanh mát',
          ),
        ],
      ),
      Category(
        id: 4,
        name: 'Món lẩu đặc biệt',
        code: 'hotpot',
        products: [
          Product(
            id: 7,
            categoryId: 4,
            name: 'Lẩu hải sản chua cay Thái Tomyum',
            code: 'LHS01',
            price: 385000,
            unit: 'nồi',
            description: 'Nước dùng đậm đà chua cay, đầy đặn tôm mực nấm',
            isPopular: true,
          ),
        ],
      ),
      Category(
        id: 5,
        name: 'Đồ uống & Tráng miệng',
        code: 'drinks',
        products: [
          Product(
            id: 8,
            categoryId: 5,
            name: 'Trà đào cam sả thanh nhiệt',
            code: 'TD01',
            price: 45000,
            unit: 'ly',
            description: 'Vị trà đào thơm ngát kết hợp cam tươi và sả',
            isPopular: true,
          ),
          Product(
            id: 9,
            categoryId: 5,
            name: 'Nước cam ép tươi nguyên chất',
            code: 'CE01',
            price: 45000,
            unit: 'ly',
            description: '100% cam sành vắt tươi mát',
          ),
          Product(
            id: 10,
            categoryId: 5,
            name: 'Bia Heineken lon 330ml',
            code: 'KEN01',
            price: 28000,
            unit: 'lon',
            description: 'Ướp lạnh phục vụ kèm đá',
          ),
        ],
      ),
      Category(
        id: 6,
        name: 'Dịch vụ & Khác',
        code: 'other',
        products: [
          Product(
            id: 11,
            categoryId: 6,
            name: 'Khăn lạnh thơm cao cấp',
            code: 'KL01',
            price: 5000,
            unit: 'cái',
            description: 'Khăn vải không dệt tiệt trùng hương trà xanh',
          ),
        ],
      ),
    ];
  }
}
