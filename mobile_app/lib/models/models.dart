class User {
  final int id;
  final String name;
  final String username;
  final String role; // 'admin', 'cashier'
  final String shift;
  final String phone;
  final String email;

  User({
    required this.id,
    required this.name,
    required this.username,
    required this.role,
    this.shift = 'Toàn ca',
    this.phone = '',
    this.email = '',
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      username: json['username'] ?? '',
      role: json['role'] ?? 'cashier',
      shift: json['shift'] ?? 'Ca sáng (07:00 - 15:00)',
      phone: json['phone'] ?? '',
      email: json['email'] ?? '',
    );
  }
}

class DiningTable {
  final int id;
  final String name;
  final String? areaCode;
  final int capacity;
  String status; // 'empty', 'occupied', 'billing'
  int guestCount;
  String? duration;
  String? notes;
  final bool isTakeaway;
  final bool isVip;
  int totalAmount;
  int itemCount;
  int? orderId;

  DiningTable({
    required this.id,
    required this.name,
    this.areaCode,
    required this.capacity,
    required this.status,
    required this.guestCount,
    this.duration,
    this.notes,
    this.isTakeaway = false,
    this.isVip = false,
    this.totalAmount = 0,
    this.itemCount = 0,
    this.orderId,
  });

  factory DiningTable.fromJson(Map<String, dynamic> json) {
    final order = json['order'] as Map<String, dynamic>?;
    return DiningTable(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      areaCode: json['area_code'] ?? 'floor_1',
      capacity: json['capacity'] ?? 4,
      status: json['status'] ?? 'empty',
      guestCount: json['guest_count'] ?? 0,
      duration: json['duration'],
      notes: json['notes'],
      isTakeaway: json['is_takeaway'] == true || json['is_takeaway'] == 1,
      isVip: json['is_vip'] == true || json['is_vip'] == 1,
      totalAmount: order != null ? (order['total_amount'] as num?)?.toInt() ?? 0 : 0,
      itemCount: order != null ? (order['item_count'] as num?)?.toInt() ?? 0 : 0,
      orderId: order != null ? (order['id'] as num?)?.toInt() : null,
    );
  }
}

class Product {
  final int id;
  final int categoryId;
  final String name;
  final String code;
  final int price;
  final String unit;
  final String description;
  final String imageUrl;
  final bool isPopular;

  Product({
    required this.id,
    required this.categoryId,
    required this.name,
    required this.code,
    required this.price,
    this.unit = 'phần',
    this.description = '',
    this.imageUrl = '',
    this.isPopular = false,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] ?? 0,
      categoryId: json['category_id'] ?? 0,
      name: json['name'] ?? '',
      code: json['code'] ?? '',
      price: (json['price'] as num?)?.toInt() ?? 0,
      unit: json['unit'] ?? 'phần',
      description: json['description'] ?? '',
      imageUrl: json['image_url'] ?? '',
      isPopular: json['is_popular'] == true || json['is_popular'] == 1,
    );
  }
}

class Category {
  final int id;
  final String name;
  final String code;
  final List<Product> products;

  Category({
    required this.id,
    required this.name,
    required this.code,
    required this.products,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    final prods = (json['products'] as List? ?? [])
        .map((e) => Product.fromJson(e))
        .toList();
    return Category(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      code: json['code'] ?? '',
      products: prods,
    );
  }
}

class OrderItemData {
  final int id;
  final int productId;
  final String name;
  int quantity;
  final int price;
  int subtotal;
  String note;
  String status; // 'sent_kitchen', 'new_pending'
  final String unit;

  OrderItemData({
    required this.id,
    this.productId = 0,
    required this.name,
    required this.quantity,
    required this.price,
    required this.subtotal,
    required this.note,
    required this.status,
    required this.unit,
  });

  factory OrderItemData.fromJson(Map<String, dynamic> json) {
    final qty = json['quantity'] ?? 1;
    final pr = (json['price'] as num?)?.toInt() ?? 0;
    return OrderItemData(
      id: json['id'] ?? 0,
      productId: json['product_id'] ?? 0,
      name: json['product_name'] ?? json['name'] ?? '',
      quantity: qty,
      price: pr,
      subtotal: (json['subtotal'] as num?)?.toInt() ?? (qty * pr),
      note: json['note'] ?? '',
      status: json['status'] ?? 'sent_kitchen',
      unit: json['unit'] ?? 'phần',
    );
  }
}

class OrderData {
  final int id;
  final String orderCode;
  final int tableId;
  final String tableName;
  int subtotal;
  int discountAmount;
  int vatPercent;
  int vatAmount;
  int totalAmount;
  String status; // 'active', 'billing', 'completed'
  int guestCount;
  String startedAt;
  List<OrderItemData> items;

  OrderData({
    required this.id,
    required this.orderCode,
    required this.tableId,
    required this.tableName,
    required this.subtotal,
    this.discountAmount = 0,
    this.vatPercent = 8,
    required this.vatAmount,
    required this.totalAmount,
    required this.status,
    this.guestCount = 0,
    this.startedAt = '',
    required this.items,
  });

  factory OrderData.fromJson(Map<String, dynamic> json, String tableName) {
    final rawItems = (json['items'] as List? ?? [])
        .map((e) => OrderItemData.fromJson(e))
        .toList();
    return OrderData(
      id: json['id'] ?? 0,
      orderCode: json['order_code'] ?? 'ORD-001',
      tableId: json['table_id'] ?? 0,
      tableName: tableName,
      subtotal: (json['subtotal'] as num?)?.toInt() ?? 0,
      discountAmount: (json['discount_amount'] as num?)?.toInt() ?? 0,
      vatPercent: (json['vat_percent'] as num?)?.toInt() ?? 8,
      vatAmount: (json['vat_amount'] as num?)?.toInt() ?? 0,
      totalAmount: (json['total_amount'] as num?)?.toInt() ?? 0,
      status: json['status'] ?? 'active',
      guestCount: json['guest_count'] ?? 0,
      startedAt: json['created_at'] != null ? json['created_at'].toString() : '',
      items: rawItems,
    );
  }
}

class PromotionModel {
  final int id;
  final String code;
  final String name;
  final String type; // 'order_discount', 'percent', 'amount', 'buy_get'
  final int discountValue;
  final int minOrder;
  int get minOrderAmount => minOrder;
  final bool isActive;

  PromotionModel({
    required this.id,
    required this.code,
    required this.name,
    required this.type,
    required this.discountValue,
    this.minOrder = 0,
    this.isActive = true,
  });

  factory PromotionModel.fromJson(Map<String, dynamic> json) {
    return PromotionModel(
      id: json['id'] ?? 0,
      code: json['code'] ?? '',
      name: json['name'] ?? '',
      type: json['type'] ?? 'order_discount',
      discountValue: (json['discount_value'] as num?)?.toInt() ?? 0,
      minOrder: (json['min_order'] as num?)?.toInt() ?? 0,
      isActive: json['is_active'] == true || json['is_active'] == 1,
    );
  }

  int calculateDiscount(int subtotal) {
    if (subtotal < minOrder) return 0;
    if (type == 'order_discount' || type == 'percent') {
      return (subtotal * (discountValue / 100)).round();
    }
    return discountValue;
  }
}

class KitchenItemModel {
  final int id;
  final String tableName;
  final String dishName;
  final int quantity;
  final String note;
  final String time;
  String status; // 'pending', 'cooking', 'done'

  KitchenItemModel({
    required this.id,
    required this.tableName,
    required this.dishName,
    required this.quantity,
    required this.note,
    required this.time,
    required this.status,
  });

  factory KitchenItemModel.fromJson(Map<String, dynamic> json) {
    return KitchenItemModel(
      id: json['id'] ?? 0,
      tableName: json['table_name'] ?? 'Bàn',
      dishName: json['dish_name'] ?? '',
      quantity: json['quantity'] ?? 1,
      note: json['note'] ?? '',
      time: json['time'] ?? '',
      status: json['status'] ?? 'pending',
    );
  }
}

class ShiftStats {
  final int totalRevenue;
  final int completedOrders;
  final int cashAmount;
  final int cashOrders;
  final int qrAmount;
  final int qrOrders;
  final int cardAmount;
  final int cardOrders;
  final int activeOrders;
  final int emptyTables;
  final int occupiedTables;

  ShiftStats({
    this.totalRevenue = 0,
    this.completedOrders = 0,
    this.cashAmount = 0,
    this.cashOrders = 0,
    this.qrAmount = 0,
    this.qrOrders = 0,
    this.cardAmount = 0,
    this.cardOrders = 0,
    this.activeOrders = 0,
    this.emptyTables = 24,
    this.occupiedTables = 0,
  });

  factory ShiftStats.fromJson(Map<String, dynamic> json) {
    final stats = json['stats'] as Map<String, dynamic>? ?? json;
    final breakdownToday = stats['payment_breakdown_today'] as Map<String, dynamic>? ?? {};
    final breakdownAll = stats['payment_breakdown'] as Map<String, dynamic>? ?? {};

    final revToday = (stats['total_revenue'] as num?)?.toInt() ?? 0;
    final paidOrdersToday = (stats['paid_orders_count'] as num?)?.toInt() ?? 0;

    final cash = (breakdownToday['cash'] as num?)?.toInt() ?? (revToday > 0 ? (breakdownAll['cash'] as num?)?.toInt() ?? 0 : 0);
    final qr = (breakdownToday['qr_banking'] as num?)?.toInt() ?? (revToday > 0 ? (breakdownAll['qr_banking'] as num?)?.toInt() ?? 0 : 0);
    final card = (breakdownToday['card'] as num?)?.toInt() ?? (revToday > 0 ? (breakdownAll['card'] as num?)?.toInt() ?? 0 : 0);

    return ShiftStats(
      totalRevenue: revToday,
      completedOrders: paidOrdersToday,
      cashAmount: cash,
      cashOrders: cash > 0 ? (paidOrdersToday > 0 ? ((paidOrdersToday * 0.6).round()).clamp(1, paidOrdersToday) : 0) : 0,
      qrAmount: qr,
      qrOrders: qr > 0 ? (paidOrdersToday > 0 ? (paidOrdersToday - (paidOrdersToday * 0.6).round()).clamp(0, paidOrdersToday) : 0) : 0,
      cardAmount: card,
      cardOrders: 0,
      activeOrders: (stats['active_orders_count'] as num?)?.toInt() ?? 0,
      emptyTables: (stats['empty_tables'] as num?)?.toInt() ?? 24,
      occupiedTables: (stats['occupied_tables'] as num?)?.toInt() ?? 0,
    );
  }

  factory ShiftStats.empty() => ShiftStats();
}

class BankAccount {
  final int id;
  final String bankName;
  final String bankCode;
  final String bin;
  final String accountNumber;
  final String accountName;
  final String branch;
  final bool isDefault;
  final bool isActive;
  final String qrTemplate;

  BankAccount({
    required this.id,
    required this.bankName,
    required this.bankCode,
    required this.bin,
    required this.accountNumber,
    required this.accountName,
    this.branch = '',
    this.isDefault = true,
    this.isActive = true,
    this.qrTemplate = 'compact2',
  });

  factory BankAccount.fromJson(Map<String, dynamic> json) {
    return BankAccount(
      id: json['id'] ?? 0,
      bankName: json['bank_name'] ?? 'Ngân hàng Kỹ thương Việt Nam (Techcombank)',
      bankCode: json['bank_code'] ?? 'TCB',
      bin: json['bin'] ?? '970407',
      accountNumber: json['account_number'] ?? '1116667770',
      accountName: json['account_name'] ?? 'VO HOANG HAI',
      branch: json['branch'] ?? '',
      isDefault: json['is_default'] == true || json['is_default'] == 1,
      isActive: json['is_active'] == true || json['is_active'] == 1,
      qrTemplate: json['qr_template'] ?? 'compact2',
    );
  }

  factory BankAccount.defaultAccount() {
    return BankAccount(
      id: 1,
      bankName: 'Ngân hàng Kỹ thương Việt Nam (Techcombank)',
      bankCode: 'TCB',
      bin: '970407',
      accountNumber: '1116667770',
      accountName: 'VO HOANG HAI',
      branch: 'Hội Sở',
      isDefault: true,
      isActive: true,
      qrTemplate: 'compact2',
    );
  }

  String getVietQrUrl(int amount, String transferContent) {
    final cleanContent = transferContent.trim();
    final cleanAccountName = accountName.trim();
    final template = qrTemplate.isNotEmpty ? qrTemplate : 'compact2';
    return 'https://img.vietqr.io/image/$bin-$accountNumber-$template.png?amount=$amount&addInfo=${Uri.encodeComponent(cleanContent)}&accountName=${Uri.encodeComponent(cleanAccountName)}';
  }

  String getFallbackQrUrl(int amount, String transferContent) {
    return 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${Uri.encodeComponent('QUAN TRA $bankCode $accountNumber AMOUNT $amount CONTENT $transferContent')}';
  }
}

