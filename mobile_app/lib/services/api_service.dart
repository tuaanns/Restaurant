import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/models.dart';

class ApiService {
  // Đổi theo IP máy chủ LAN (vd: 192.168.1.4:8000) khi chạy trên điện thoại thật, hoặc 10.0.2.2 cho Android Emulator
  static String baseUrl = 'http://192.168.1.4:8000/api/pos';

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

    // Dữ liệu fallback chuẩn 100% theo hình chụp
    return getMockTables();
  }

  static List<DiningTable> getMockTables() {
    return [
      DiningTable(
        id: 1,
        name: 'BÀN 01',
        areaCode: 'floor_1',
        capacity: 4,
        status: 'occupied',
        guestCount: 4,
        duration: '45p',
        notes: '3 món đã gửi bếp',
        totalAmount: 485000,
        itemCount: 3,
      ),
      DiningTable(
        id: 2,
        name: 'BÀN 02',
        areaCode: 'floor_1',
        capacity: 2,
        status: 'billing',
        guestCount: 2,
        duration: 'Chờ tính',
        notes: 'Đã in tạm tính',
        totalAmount: 320000,
        itemCount: 2,
      ),
      DiningTable(
        id: 3,
        name: 'BÀN 03',
        areaCode: 'floor_1',
        capacity: 4,
        status: 'occupied',
        guestCount: 3,
        duration: '1h 10p',
        notes: '4 món',
        totalAmount: 461700,
        itemCount: 4,
      ),
      DiningTable(
        id: 9,
        name: 'VIP 01',
        areaCode: 'vip',
        capacity: 8,
        status: 'occupied',
        guestCount: 8,
        duration: '2h 05p',
        notes: '8 món',
        isVip: true,
        totalAmount: 2450000,
        itemCount: 8,
      ),
      DiningTable(
        id: 4,
        name: 'MANG VỀ',
        areaCode: 'floor_1',
        capacity: 1,
        status: 'occupied',
        guestCount: 1,
        duration: null,
        notes: 'Chờ đóng gói (Đơn #108)',
        isTakeaway: true,
        totalAmount: 185000,
        itemCount: 2,
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
        id: 13,
        name: 'BÀN 08',
        areaCode: 'floor_2',
        capacity: 4,
        status: 'empty',
        guestCount: 0,
      ),
    ];
  }

  static List<OrderItemData> getTable3Items() {
    return [
      OrderItemData(
        id: 1,
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
}
