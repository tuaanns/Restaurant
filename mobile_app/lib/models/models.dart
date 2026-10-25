class DiningTable {
  final int id;
  final String name;
  final String? areaCode;
  final int capacity;
  final String status; // 'empty', 'occupied', 'billing'
  final int guestCount;
  final String? duration;
  final String? notes;
  final bool isTakeaway;
  final bool isVip;
  final int totalAmount;
  final int itemCount;

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
    );
  }
}

class OrderItemData {
  final int id;
  final String name;
  final int quantity;
  final int price;
  final int subtotal;
  final String note;
  final String status; // 'sent_kitchen', 'new_pending'
  final String unit;

  OrderItemData({
    required this.id,
    required this.name,
    required this.quantity,
    required this.price,
    required this.subtotal,
    required this.note,
    required this.status,
    required this.unit,
  });

  factory OrderItemData.fromJson(Map<String, dynamic> json) {
    return OrderItemData(
      id: json['id'] ?? 0,
      name: json['product_name'] ?? json['name'] ?? '',
      quantity: json['quantity'] ?? 1,
      price: (json['price'] as num?)?.toInt() ?? 0,
      subtotal: (json['subtotal'] as num?)?.toInt() ?? 0,
      note: json['note'] ?? '',
      status: json['status'] ?? 'sent_kitchen',
      unit: json['unit'] ?? 'phần',
    );
  }
}
