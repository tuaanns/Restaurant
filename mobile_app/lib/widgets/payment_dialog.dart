import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/i18n_service.dart';
import '../services/print_service.dart';

class PaymentDialog extends StatefulWidget {
  final DiningTable table;
  final List<OrderItemData> items;
  final PromotionModel? promotion;
  final VoidCallback onCheckoutSuccess;

  const PaymentDialog({
    super.key,
    required this.table,
    required this.items,
    this.promotion,
    required this.onCheckoutSuccess,
  });

  @override
  State<PaymentDialog> createState() => _PaymentDialogState();
}

class _PaymentDialogState extends State<PaymentDialog> {
  final currencyFormat = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');
  String _selectedMethod = 'cash'; // 'cash', 'qr_banking', 'card'
  int _cashGiven = 0;
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    final total = _calcTotal();
    _cashGiven = total;
  }

  int _calcTotal() {
    int subtotal = widget.items.fold(0, (sum, it) => sum + it.subtotal);
    int promoDiscount = widget.promotion != null ? widget.promotion!.calculateDiscount(subtotal) : 0;
    if (widget.promotion != null && subtotal < widget.promotion!.minOrderAmount) {
      promoDiscount = 0;
    }
    int afterPromo = (subtotal - promoDiscount).clamp(0, subtotal);
    int discount = (afterPromo * 0.05).round();
    int vat = ((afterPromo - discount) * 0.08).round();
    return afterPromo - discount + vat;
  }

  @override
  Widget build(BuildContext context) {
    final totalAmount = _calcTotal();
    final changeAmount = _cashGiven > totalAmount ? _cashGiven - totalAmount : 0;

    final quickAmounts = [
      totalAmount,
      200000,
      300000,
      500000,
      1000000,
      2000000,
    ];

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      backgroundColor: Colors.white,
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 440),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: const BoxDecoration(
                  color: Color(0xFF0B1320),
                  borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1B5E20),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.payment, color: Colors.white, size: 18),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'THANH TOÁN: ${I18n.formatTableName(widget.table.name)}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 2),
                          const Text(
                            'Chọn hình thức và hoàn tất đơn',
                            style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                          ),
                        ],
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

              // Total Highlight Card
              Container(
                margin: const EdgeInsets.all(16),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('CẦN THANH TOÁN', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.bold)),
                        SizedBox(height: 4),
                        Text('(Đã gồm 8% VAT & CK)', style: TextStyle(color: Color(0xFF64748B), fontSize: 10)),
                      ],
                    ),
                    Text(
                      currencyFormat.format(totalAmount),
                      style: const TextStyle(
                        color: Color(0xFF34D399),
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),

              // Payment Method Selector
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Phương thức thanh toán:',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF475569)),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        _buildMethodOption('cash', 'Tiền mặt', Icons.payments_outlined),
                        const SizedBox(width: 8),
                        _buildMethodOption('qr_banking', 'QR VietQR', Icons.qr_code_2),
                        const SizedBox(width: 8),
                        _buildMethodOption('card', 'Quẹt thẻ', Icons.credit_card),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 14),

              // Method Details Content
              if (_selectedMethod == 'cash') ...[
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Tiền khách đưa:',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF475569)),
                      ),
                      const SizedBox(height: 8),
                      // Quick Cash Buttons
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: quickAmounts.map((amt) {
                          final isSelected = _cashGiven == amt;
                          return InkWell(
                            onTap: () => setState(() => _cashGiven = amt),
                            borderRadius: BorderRadius.circular(6),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                              decoration: BoxDecoration(
                                color: isSelected ? const Color(0xFF1B5E20) : const Color(0xFFF1F5F9),
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(
                                  color: isSelected ? const Color(0xFF1B5E20) : const Color(0xFFCBD5E1),
                                ),
                              ),
                              child: Text(
                                amt == totalAmount ? 'Đủ tiền (${currencyFormat.format(amt)})' : currencyFormat.format(amt),
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: isSelected ? Colors.white : const Color(0xFF334155),
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 12),

                      // Change Display
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Tiền thừa trả khách:',
                              style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Color(0xFF64748B)),
                            ),
                            Text(
                              currencyFormat.format(changeAmount),
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                                color: changeAmount > 0 ? const Color(0xFFEA580C) : const Color(0xFF0F172A),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ] else if (_selectedMethod == 'qr_banking') ...[
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF0FDF4),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFFBBF7D0)),
                    ),
                    child: Column(
                      children: [
                        Container(
                          width: 140,
                          height: 140,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: const Color(0xFF86EFAC)),
                          ),
                          alignment: Alignment.center,
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.qr_code_2, size: 80, color: Color(0xFF047857)),
                              Text(
                                'QUÁN TRÀ - ${I18n.formatTableName(widget.table.name)}',
                                style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 10),
                        const Text(
                          'Ngân hàng: MB Bank (Quân Đội)',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF065F46)),
                        ),
                        const Text(
                          'STK: 0901888999 - Chủ TK: QUAN TRA',
                          style: TextStyle(fontSize: 11, color: Color(0xFF047857)),
                        ),
                        Text(
                          'Số tiền: ${currencyFormat.format(totalAmount)}',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF047857)),
                        ),
                      ],
                    ),
                  ),
                ),
              ] else ...[
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.credit_card, size: 36, color: Color(0xFF1B5E20)),
                        SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Máy POS Ngân Hàng',
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                              ),
                              SizedBox(height: 2),
                              Text(
                                'Vui lòng đưa thẻ của khách quẹt vào máy POS bàn thu ngân.',
                                style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],

              const SizedBox(height: 16),
              const Divider(height: 1, color: Color(0xFFE2E8F0)),

              // Action Buttons
              Padding(
                padding: const EdgeInsets.all(14),
                child: Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFF64748B),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Hủy', style: TextStyle(fontWeight: FontWeight.w600)),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      flex: 2,
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF1B5E20),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        icon: _isProcessing
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                              )
                            : const Icon(Icons.check_circle_rounded, size: 16),
                        label: Text(
                          _isProcessing ? 'Đang xử lý...' : 'XÁC NHẬN THANH TOÁN',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5),
                        ),
                        onPressed: _isProcessing
                            ? null
                            : () async {
                                setState(() => _isProcessing = true);
                                await ApiService.checkout(
                                  widget.table.id,
                                  orderId: widget.table.orderId,
                                  paymentMethod: _selectedMethod,
                                  paidAmount: _cashGiven,
                                );
                                widget.table.status = 'empty';
                                widget.table.guestCount = 0;
                                widget.table.notes = null;
                                widget.table.duration = null;
                                widget.table.totalAmount = 0;
                                widget.table.itemCount = 0;

                                if (context.mounted) {
                                  Navigator.pop(context);
                                  showDialog(
                                    context: context,
                                    builder: (ctx) => AlertDialog(
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                      backgroundColor: const Color(0xFF0B1626),
                                      title: const Row(
                                        children: [
                                          Icon(Icons.check_circle, color: Color(0xFF66BB6A), size: 24),
                                          SizedBox(width: 8),
                                          Text('Thanh Toán Thành Công!', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                                        ],
                                      ),
                                      content: Text(
                                        'Hóa đơn bàn ${I18n.formatTableName(widget.table.name)} (${currencyFormat.format(totalAmount)}) đã hoàn tất.\nBàn đã được chuyển về trạng thái Trống sẵn sàng đón khách mới!',
                                        style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                                      ),
                                      actions: [
                                        OutlinedButton.icon(
                                          style: OutlinedButton.styleFrom(
                                            foregroundColor: const Color(0xFF66BB6A),
                                            side: const BorderSide(color: Color(0xFF66BB6A)),
                                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                          ),
                                          icon: const Icon(Icons.print_outlined, size: 16),
                                          label: const Text('IN HÓA ĐƠN', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                                          onPressed: () {
                                            PrintService.printReceipt(
                                              table: widget.table,
                                              items: widget.items,
                                              promotion: widget.promotion,
                                              isPreBill: false,
                                            );
                                          },
                                        ),
                                        ElevatedButton(
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: const Color(0xFF1B5E20),
                                            foregroundColor: Colors.white,
                                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                          ),
                                          onPressed: () {
                                            Navigator.pop(ctx);
                                            widget.onCheckoutSuccess();
                                          },
                                          child: const Text('HOÀN TẤT', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                                        ),
                                      ],
                                    ),
                                  );
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
      ),
    );
  }

  Widget _buildMethodOption(String code, String title, IconData icon) {
    final isSelected = _selectedMethod == code;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _selectedMethod = code),
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF1B5E20) : const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: isSelected ? const Color(0xFF1B5E20) : const Color(0xFFCBD5E1),
              width: 1.2,
            ),
          ),
          child: Column(
            children: [
              Icon(icon, color: isSelected ? Colors.white : const Color(0xFF475569), size: 20),
              const SizedBox(height: 4),
              Text(
                title,
                style: TextStyle(
                  fontSize: 10.5,
                  fontWeight: FontWeight.bold,
                  color: isSelected ? Colors.white : const Color(0xFF334155),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

