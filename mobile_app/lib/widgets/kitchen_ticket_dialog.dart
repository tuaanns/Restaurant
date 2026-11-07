import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/i18n_service.dart';
import '../services/print_service.dart';

class KitchenTicketDialog extends StatelessWidget {
  final DiningTable table;
  final List<OrderItemData> items;
  final VoidCallback onSentSuccess;

  const KitchenTicketDialog({
    super.key,
    required this.table,
    required this.items,
    required this.onSentSuccess,
  });

  @override
  Widget build(BuildContext context) {
    final pendingItems = items.where((it) => it.status == 'new_pending').toList();
    final itemsToDisplay = pendingItems.isNotEmpty ? pendingItems : items;
    final now = DateTime.now();
    final timeStr = DateFormat('HH:mm - dd/MM/yyyy').format(now);
    final ticketCode = 'BEP-${((table.id + 100) * 892 % 900000 + 100000)}';

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      backgroundColor: Colors.white,
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 420),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Modal Header (Dark bar matching web KitchenTicketModal)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: const BoxDecoration(
                color: Color(0xFF0B1320),
                borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.notifications_active, color: Color(0xFF00C292), size: 18),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      I18n.t('kTicketTitle'),
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                        letterSpacing: 0.3,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Color(0xFF94A3B8), size: 20),
                    onPressed: () => Navigator.pop(context),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
            ),

            // Thermal Ticket Preview (K80 80mm standard paper bill preview matching web)
            Flexible(
              child: Container(
                color: const Color(0xFFF1F5F9),
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(14),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFCBD5E1)),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0x0A000000),
                          blurRadius: 6,
                          offset: Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Restaurant Header
                        const Center(
                          child: Text(
                            'QUÁN TRÀ',
                            style: TextStyle(
                              fontWeight: FontWeight.w900,
                              fontSize: 16,
                              letterSpacing: 0.8,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Center(
                          child: Text(
                            I18n.t('branchName'),
                            style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        const SizedBox(height: 8),

                        // Title Bar
                        Container(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          decoration: const BoxDecoration(
                            border: Border.symmetric(
                              horizontal: BorderSide(color: Color(0xFF0F172A), width: 1.2),
                            ),
                          ),
                          child: Center(
                            child: Text(
                              I18n.t('kTicketHeader'),
                              style: const TextStyle(
                                fontWeight: FontWeight.w900,
                                fontSize: 13.5,
                                letterSpacing: 0.8,
                                color: Color(0xFF0F172A),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 10),

                        // Meta details
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            RichText(
                              text: TextSpan(
                                style: const TextStyle(fontSize: 12, color: Color(0xFF0F172A)),
                                children: [
                                  TextSpan(
                                    text: '${I18n.t('tablePrefix')}: ',
                                    style: const TextStyle(fontWeight: FontWeight.bold),
                                  ),
                                  TextSpan(
                                    text: I18n.formatTableName(table.name),
                                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF009688)),
                                  ),
                                ],
                              ),
                            ),
                            Text(
                              '${I18n.t('kTicketCode')} $ticketCode',
                              style: const TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              '${I18n.t('orderTime')}: $timeStr',
                              style: const TextStyle(fontSize: 11, color: Color(0xFF475569)),
                            ),
                            Text(
                              '${I18n.t('kTicketStaff')} ${ApiService.currentUser?.name ?? "Thu Hằng"}',
                              style: const TextStyle(fontSize: 11, color: Color(0xFF475569)),
                            ),
                          ],
                        ),

                        const SizedBox(height: 8),
                        const Text(
                          '------------------------------------------------',
                          style: TextStyle(color: Color(0xFFCBD5E1), letterSpacing: 1),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 4),

                        // Table Column Headers: [STT] [Tên món] [SL]
                        Row(
                          children: [
                            SizedBox(
                              width: 30,
                              child: Text(
                                I18n.t('kTicketStt'),
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11.5, color: Color(0xFF0F172A)),
                              ),
                            ),
                            Expanded(
                              child: Text(
                                I18n.t('kTicketDish'),
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11.5, color: Color(0xFF0F172A)),
                              ),
                            ),
                            SizedBox(
                              width: 36,
                              child: Text(
                                I18n.t('kTicketQty'),
                                textAlign: TextAlign.center,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11.5, color: Color(0xFF0F172A)),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          '------------------------------------------------',
                          style: TextStyle(color: Color(0xFFCBD5E1), letterSpacing: 1),
                          textAlign: TextAlign.center,
                        ),

                        // Items List
                        if (itemsToDisplay.isEmpty)
                          const Padding(
                            padding: EdgeInsets.symmetric(vertical: 16),
                            child: Center(
                              child: Text(
                                'Không có món nào cần báo bếp!',
                                style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                              ),
                            ),
                          )
                        else
                          ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: itemsToDisplay.length,
                            itemBuilder: (context, idx) {
                              final it = itemsToDisplay[idx];
                              return Padding(
                                padding: const EdgeInsets.symmetric(vertical: 4),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        SizedBox(
                                          width: 30,
                                          child: Text(
                                            '${idx + 1}.',
                                            style: const TextStyle(fontSize: 12, color: Color(0xFF475569)),
                                          ),
                                        ),
                                        Expanded(
                                          child: Text(
                                            I18n.formatDishName(it.name),
                                            style: const TextStyle(
                                              fontSize: 12.5,
                                              fontWeight: FontWeight.bold,
                                              color: Color(0xFF0F172A),
                                            ),
                                          ),
                                        ),
                                        SizedBox(
                                          width: 36,
                                          child: Text(
                                            '${it.quantity}',
                                            textAlign: TextAlign.center,
                                            style: const TextStyle(
                                              fontSize: 14,
                                              fontWeight: FontWeight.w900,
                                              color: Color(0xFF0F172A),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    if (it.note.isNotEmpty)
                                      Padding(
                                        padding: const EdgeInsets.only(left: 30, top: 2),
                                        child: Text(
                                          '• ${I18n.t('notePrefix')}: ${it.note}',
                                          style: const TextStyle(
                                            fontSize: 11,
                                            color: Color(0xFFEA580C),
                                            fontStyle: FontStyle.italic,
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                              );
                            },
                          ),

                        const SizedBox(height: 6),
                        const Text(
                          '------------------------------------------------',
                          style: TextStyle(color: Color(0xFFCBD5E1), letterSpacing: 1),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 6),

                        // Footer Note: *** XIN CẢM ƠN - BẾP LÀM NGAY ***
                        Center(
                          child: Text(
                            I18n.t('kTicketFooter'),
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF475569),
                              letterSpacing: 0.3,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),

            const Divider(height: 1, color: Color(0xFFE2E8F0)),

            // Action Buttons: [Đóng] [In & Gửi Bếp]
            Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF475569),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        side: const BorderSide(color: Color(0xFFCBD5E1)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      onPressed: () => Navigator.pop(context),
                      child: Text(
                        I18n.t('close'),
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF009688),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        elevation: 2,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      icon: const Icon(Icons.print_outlined, size: 17),
                      label: Text(
                        I18n.t('kPrintAndSend'),
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                      onPressed: itemsToDisplay.isEmpty
                          ? null
                          : () async {
                              // Kích hoạt giao diện in phiếu báo bếp K80 từ điện thoại
                              await PrintService.printKitchenTicket(
                                table: table,
                                items: itemsToDisplay,
                              );
                              await ApiService.sendToKitchen(table.id, orderId: table.orderId, tableName: table.name);
                              if (context.mounted) {
                                Navigator.pop(context);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Row(
                                      children: [
                                        const Icon(Icons.check_circle_rounded, color: Colors.white, size: 18),
                                        const SizedBox(width: 8),
                                        Expanded(
                                          child: Text(
                                            '${I18n.t('kSentSuccess')} (${I18n.formatTableName(table.name)})',
                                          ),
                                        ),
                                      ],
                                    ),
                                    backgroundColor: const Color(0xFF009688),
                                    behavior: SnackBarBehavior.floating,
                                  ),
                                );
                                onSentSuccess();
                              }
                            },
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
