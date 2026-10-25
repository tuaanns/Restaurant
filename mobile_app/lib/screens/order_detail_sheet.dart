import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/models.dart';
import '../services/api_service.dart';

class OrderDetailSheet extends StatefulWidget {
  final DiningTable table;
  final VoidCallback onOrderUpdated;

  const OrderDetailSheet({
    super.key,
    required this.table,
    required this.onOrderUpdated,
  });

  @override
  State<OrderDetailSheet> createState() => _OrderDetailSheetState();
}

class _OrderDetailSheetState extends State<OrderDetailSheet> {
  final currencyFormat = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');
  late List<OrderItemData> items;

  @override
  void initState() {
    super.initState();
    items = ApiService.getTable3Items();
  }

  void _sendKitchen() {
    setState(() {
      items = items
          .map((e) => OrderItemData(
                id: e.id,
                name: e.name,
                quantity: e.quantity,
                price: e.price,
                subtotal: e.subtotal,
                note: e.note,
                status: 'sent_kitchen',
                unit: e.unit,
              ))
          .toList();
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('🔔 Đã gửi toàn bộ món cho bếp làm ngay!'),
        backgroundColor: Color(0xFF009688),
      ),
    );
    widget.onOrderUpdated();
  }

  void _checkout() {
    Navigator.pop(context);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF0B1626),
        title: const Text('Thanh Toán Thành Công!',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: Text(
          'Đã hoàn tất thanh toán hóa đơn bàn ${widget.table.name} (461,700 đ).\nBàn đã được chuyển về trạng thái Trống.',
          style: const TextStyle(color: Color(0xFF94A3B8)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('ĐÓNG', style: TextStyle(color: Color(0xFF00C292))),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    int subtotal = items.fold(0, (sum, it) => sum + it.subtotal);
    int discount = (subtotal * 0.05).round();
    int vat = ((subtotal - discount) * 0.08).round();
    int total = subtotal - discount + vat;

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Drag Handle
          Container(
            margin: const EdgeInsets.only(top: 10, bottom: 6),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey.shade300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        widget.table.name,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w800,
                          fontSize: 14,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'Giờ vào: 11:30',
                      style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),

          // Customer Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: const Color(0xFFF8FAFC),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(Icons.person, size: 14, color: Color(0xFF64748B)),
                    SizedBox(width: 6),
                    Text(
                      'Anh Hoàng (0912.888.xxx)',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
                Text(
                  'Bảng giá chung ⌄',
                  style: TextStyle(fontSize: 11.5, color: Color(0xFF64748B)),
                ),
              ],
            ),
          ),

          const Divider(height: 1),

          // Items List
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: items.length,
              separatorBuilder: (context, index) => const Divider(height: 16),
              itemBuilder: (context, index) {
                final item = items[index];
                final isSentKitchen = item.status == 'sent_kitchen';
                final isWarningNote = item.note.contains('Không') || item.note.contains('nhiều');

                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            '${index + 1}. ${item.name}',
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 13.5,
                            ),
                          ),
                        ),
                        Text(
                          currencyFormat.format(item.subtotal),
                          style: const TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 13.5,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 3),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        if (item.note.isNotEmpty)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: isWarningNote
                                  ? const Color(0xFFFEF3C7)
                                  : const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              item.note,
                              style: TextStyle(
                                fontSize: 11,
                                color: isWarningNote
                                    ? const Color(0xFFD97706)
                                    : const Color(0xFF64748B),
                              ),
                            ),
                          )
                        else
                          const SizedBox(),
                        Text(
                          '${currencyFormat.format(item.price)}/${item.unit}',
                          style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        if (isSentKitchen)
                          const Row(
                            children: [
                              Icon(Icons.check_circle, size: 12, color: Color(0xFF009688)),
                              SizedBox(width: 4),
                              Text(
                                'Đã gửi bếp',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFF009688),
                                ),
                              ),
                            ],
                          )
                        else
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFEF3C7),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text(
                              '🕒 Mới thêm (Chưa báo quầy)',
                              style: TextStyle(
                                fontSize: 10.5,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFFB45309),
                              ),
                            ),
                          ),
                        Text(
                          'Số lượng: ${item.quantity}',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ],
                );
              },
            ),
          ),

          // Total & Actions
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -3),
                )
              ],
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Tạm tính (${items.length} món):',
                        style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                    Text(currencyFormat.format(subtotal),
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('🌱 Giảm giá hội viên (5%):',
                        style: TextStyle(fontSize: 12, color: Color(0xFF009688))),
                    Text('-${currencyFormat.format(discount)}',
                        style: const TextStyle(
                            fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF009688))),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Thuế VAT (8%):',
                        style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                    Text(currencyFormat.format(vat),
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                  ],
                ),
                const Divider(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'TỔNG THANH TOÁN:',
                      style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
                    ),
                    Text(
                      currencyFormat.format(total),
                      style: const TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 18,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        icon: const Icon(Icons.notifications_active_outlined, size: 15),
                        label: const Text('Báo Bếp'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFF009688),
                          side: const BorderSide(color: Color(0xFF009688)),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        onPressed: _sendKitchen,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      flex: 2,
                      child: ElevatedButton.icon(
                        icon: const Icon(Icons.credit_card, size: 16),
                        label: Text('Thanh Toán (${currencyFormat.format(total)})'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF009688),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          elevation: 2,
                        ),
                        onPressed: _checkout,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
