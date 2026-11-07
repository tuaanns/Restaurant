import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/i18n_service.dart';
import '../services/print_service.dart';

class PreBillDialog extends StatelessWidget {
  final DiningTable table;
  final List<OrderItemData> items;
  final PromotionModel? promotion;
  final VoidCallback onPrinted;

  const PreBillDialog({
    super.key,
    required this.table,
    required this.items,
    this.promotion,
    required this.onPrinted,
  });

  /// Chuyển đổi số tiền thành chữ Tiếng Việt chuẩn theo văn phong hóa đơn tài chính
  static String _readNumberGroup(int n, bool isLastGroup) {
    const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    final h = n ~/ 100;
    final t = (n % 100) ~/ 10;
    final u = n % 10;
    var res = '';

    if (h > 0 || !isLastGroup) res += '${digits[h]} trăm ';

    if (t > 1) {
      res += '${digits[t]} mươi ';
      if (u == 1) {
        res += 'mốt ';
      } else if (u == 5) {
        res += 'lăm ';
      } else if (u > 0) {
        res += '${digits[u]} ';
      }
    } else if (t == 1) {
      res += 'mười ';
      if (u == 5) {
        res += 'lăm ';
      } else if (u > 0) {
        res += '${digits[u]} ';
      }
    } else if (t == 0 && u > 0) {
      if (h > 0 || !isLastGroup) res += 'lẻ ';
      res += '${digits[u]} ';
    }

    return res.trim();
  }

  static String numberToVietnameseWords(int num) {
    if (num == 0) return 'Không đồng chẵn';
    num = num.abs();
    const scales = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ'];
    final groups = <int>[];

    while (num > 0) {
      groups.add(num % 1000);
      num ~/= 1000;
    }

    final words = <String>[];
    for (int i = groups.length - 1; i >= 0; i--) {
      final grp = groups[i];
      if (grp > 0) {
        final grpStr = _readNumberGroup(grp, i == groups.length - 1);
        words.add('$grpStr ${scales[i]}');
      }
    }

    var full = words.join(' ').replaceAll(RegExp(r'\s+'), ' ').trim();
    if (full.isEmpty) return 'Không đồng chẵn';
    return '${full[0].toUpperCase()}${full.substring(1)} đồng chẵn';
  }

  Map<String, String> _getTableBadge(String tableName) {
    final defaultTitle = I18n.t('tablePrefix').isNotEmpty ? I18n.t('tablePrefix') : 'BÀN';
    if (tableName.isEmpty) return {'title': defaultTitle, 'num': '---'};

    final clean = tableName.replaceAll(RegExp(r'^BÀN\s*', caseSensitive: false), '').trim();
    if (clean.isNotEmpty && clean != tableName) {
      final numStr = int.tryParse(clean) != null ? clean.padLeft(2, '0') : clean;
      return {'title': defaultTitle, 'num': numStr};
    }
    return {'title': defaultTitle, 'num': tableName};
  }

  @override
  Widget build(BuildContext context) {
    final numFormat = NumberFormat('#,###', 'en_US');
    final now = DateTime.now();
    final dateStr = '${now.day}/${now.month}/${now.year}';
    final timeStr = DateFormat('HH:mm').format(now);
    final dateCode = DateFormat('yyyyMMdd').format(now);
    final tableBadge = _getTableBadge(table.name);
    final orderCode = 'ORD-$dateCode-${table.id.toString().padLeft(3, '0')}-003';

    // Tính toán chi phí
    final int subtotal = items.fold(0, (sum, it) => sum + it.subtotal);
    int promoDiscount = promotion != null ? promotion!.calculateDiscount(subtotal) : 0;
    if (promotion != null && subtotal < promotion!.minOrderAmount) {
      promoDiscount = 0;
    }
    final int afterPromo = (subtotal - promoDiscount).clamp(0, subtotal);
    final int discount = (afterPromo * 0.05).round(); // Chiết khấu thành viên 5%
    final int vat = ((afterPromo - discount) * 0.08).round(); // VAT 8%
    final int total = afterPromo - discount + vat;

    final String totalInWords = numberToVietnameseWords(total);

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      backgroundColor: Colors.white,
      insetPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 18),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 420),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // 1. Header Bar (#064E3B xanh rêu đậm chuẩn Web POS PreBillModal)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
              decoration: const BoxDecoration(
                color: Color(0xFF064E3B),
                borderRadius: BorderRadius.vertical(top: Radius.circular(14)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.print_outlined, color: Colors.white, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      I18n.t('preBillTitle'),
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 15,
                        letterSpacing: 0.3,
                      ),
                    ),
                  ),
                  InkWell(
                    onTap: () => Navigator.pop(context),
                    child: const Icon(Icons.close, color: Colors.white, size: 20),
                  ),
                ],
              ),
            ),

            // 2. Vùng xem trước giấy in (#F1F5F9 nền xám nhạt)
            Flexible(
              child: Container(
                color: const Color(0xFFF1F5F9),
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                  child: Center(
                    child: Container(
                      width: 320,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x0F000000),
                            blurRadius: 8,
                            offset: Offset(0, 2),
                          ),
                        ],
                      ),
                      padding: const EdgeInsets.fromLTRB(14, 16, 14, 20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // THÔNG TIN NHÀ HÀNG
                          const Center(
                            child: Text(
                              'NHÀ HÀNG',
                              style: TextStyle(
                                fontFamily: 'serif',
                                fontSize: 15,
                                fontWeight: FontWeight.bold,
                                color: Colors.black,
                                letterSpacing: 0.4,
                              ),
                            ),
                          ),
                          const SizedBox(height: 2),
                          const Center(
                            child: Text(
                              'QUÁN TRÀ',
                              style: TextStyle(
                                fontFamily: 'serif',
                                fontSize: 17,
                                fontWeight: FontWeight.w900,
                                color: Colors.black,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                          const SizedBox(height: 3),
                          const Center(
                            child: Text(
                              'ĐC: 103 Trần Hưng Đạo, Đặc khu Phú Quốc, Tỉnh An Giang',
                              textAlign: TextAlign.center,
                              style: TextStyle(fontFamily: 'serif', fontSize: 11, color: Colors.black),
                            ),
                          ),
                          const SizedBox(height: 2),
                          const Center(
                            child: Text(
                              'Hotline: 1900 6868',
                              style: TextStyle(fontFamily: 'serif', fontSize: 11.5, fontWeight: FontWeight.w600, color: Colors.black),
                            ),
                          ),
                          const SizedBox(height: 12),

                          // KHỐI TIÊU ĐỀ: BÀN (BÊN TRÁI) & PHIẾU TẠM TÍNH (BÊN PHẢI)
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              // Badge Bàn hình quả trám/oval bo tròn
                              Container(
                                decoration: BoxDecoration(
                                  border: Border.all(color: Colors.black, width: 1.5),
                                  borderRadius: BorderRadius.circular(24),
                                ),
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                constraints: const BoxConstraints(minWidth: 48),
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      tableBadge['title']!,
                                      style: const TextStyle(
                                        fontFamily: 'serif',
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.black,
                                      ),
                                    ),
                                    Text(
                                      tableBadge['num']!,
                                      style: const TextStyle(
                                        fontFamily: 'serif',
                                        fontSize: 17,
                                        fontWeight: FontWeight.w900,
                                        color: Colors.black,
                                        height: 1.1,
                                      ),
                                    ),
                                  ],
                                ),
                              ),

                              // Phiếu tạm tính, mã HĐ, ngày bán
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  const Text(
                                    'PHIẾU TẠM TÍNH',
                                    style: TextStyle(
                                      fontFamily: 'serif',
                                      fontSize: 15,
                                      fontWeight: FontWeight.w900,
                                      color: Colors.black,
                                      letterSpacing: 0.3,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  RichText(
                                    text: TextSpan(
                                      style: const TextStyle(fontFamily: 'serif', fontSize: 11.5, color: Colors.black),
                                      children: [
                                        const TextSpan(text: 'Mã HĐ: '),
                                        TextSpan(text: orderCode, style: const TextStyle(fontWeight: FontWeight.w900)),
                                      ],
                                    ),
                                  ),
                                  Text(
                                    'Ngày bán: $dateStr',
                                    style: const TextStyle(fontFamily: 'serif', fontSize: 11, color: Colors.black),
                                  ),
                                  Text(
                                    timeStr,
                                    style: const TextStyle(fontFamily: 'serif', fontSize: 11, color: Colors.black),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),

                          // BẢNG MÓN ĂN KẺ KHUNG VIỀN ĐẦY ĐỦ
                          Container(
                            decoration: BoxDecoration(
                              border: Border.all(color: Colors.black, width: 1.5),
                            ),
                            child: Column(
                              children: [
                                // Header row
                                Container(
                                  color: Colors.white,
                                  child: Row(
                                    children: [
                                      Expanded(
                                        flex: 42,
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                                          decoration: const BoxDecoration(
                                            border: Border(right: BorderSide(color: Colors.black, width: 1.5)),
                                          ),
                                          child: Text(
                                            I18n.t('dishColName'),
                                            style: const TextStyle(fontFamily: 'serif', fontWeight: FontWeight.bold, fontSize: 11.5, color: Colors.black),
                                          ),
                                        ),
                                      ),
                                      Expanded(
                                        flex: 23,
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                                          decoration: const BoxDecoration(
                                            border: Border(right: BorderSide(color: Colors.black, width: 1.5)),
                                          ),
                                          child: Text(
                                            I18n.t('dishColPrice'),
                                            textAlign: TextAlign.right,
                                            style: const TextStyle(fontFamily: 'serif', fontWeight: FontWeight.bold, fontSize: 11.5, color: Colors.black),
                                          ),
                                        ),
                                      ),
                                      Expanded(
                                        flex: 11,
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 2, vertical: 4),
                                          decoration: const BoxDecoration(
                                            border: Border(right: BorderSide(color: Colors.black, width: 1.5)),
                                          ),
                                          child: Text(
                                            I18n.t('dishColQty'),
                                            textAlign: TextAlign.center,
                                            style: const TextStyle(fontFamily: 'serif', fontWeight: FontWeight.bold, fontSize: 11.5, color: Colors.black),
                                          ),
                                        ),
                                      ),
                                      Expanded(
                                        flex: 24,
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                                          child: Text(
                                            I18n.t('dishColSubtotal'),
                                            textAlign: TextAlign.right,
                                            style: const TextStyle(fontFamily: 'serif', fontWeight: FontWeight.bold, fontSize: 11.5, color: Colors.black),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),

                                // Empty row hoặc danh sách món
                                if (items.isEmpty)
                                  Container(
                                    width: double.infinity,
                                    padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
                                    decoration: const BoxDecoration(
                                      border: Border(top: BorderSide(color: Colors.black, width: 1)),
                                    ),
                                    child: Text(
                                      I18n.t('emptyOrderNotice'),
                                      textAlign: TextAlign.center,
                                      style: const TextStyle(
                                        fontFamily: 'serif',
                                        color: Color(0xFF64748B),
                                        fontStyle: FontStyle.italic,
                                        fontSize: 11.5,
                                      ),
                                    ),
                                  )
                                else
                                  ...items.map((item) {
                                    return Container(
                                      decoration: const BoxDecoration(
                                        border: Border(top: BorderSide(color: Colors.black, width: 1)),
                                      ),
                                      child: Row(
                                        crossAxisAlignment: CrossAxisAlignment.center,
                                        children: [
                                          Expanded(
                                            flex: 42,
                                            child: Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                                              decoration: const BoxDecoration(
                                                border: Border(right: BorderSide(color: Colors.black, width: 1)),
                                              ),
                                              child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Text(
                                                    I18n.formatDishName(item.name),
                                                    style: const TextStyle(fontFamily: 'serif', fontSize: 11.5, color: Colors.black),
                                                  ),
                                                  Text(
                                                    '(${I18n.formatDishUnit(item.unit.isNotEmpty ? item.unit : "Phần")})',
                                                    style: const TextStyle(fontFamily: 'serif', fontSize: 10, color: Color(0xFF64748B)),
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ),
                                          Expanded(
                                            flex: 23,
                                            child: Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                                              decoration: const BoxDecoration(
                                                border: Border(right: BorderSide(color: Colors.black, width: 1)),
                                              ),
                                              child: Text(
                                                numFormat.format(item.price),
                                                textAlign: TextAlign.right,
                                                style: const TextStyle(fontFamily: 'serif', fontSize: 11.5, color: Colors.black),
                                              ),
                                            ),
                                          ),
                                          Expanded(
                                            flex: 11,
                                            child: Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 2, vertical: 4),
                                              decoration: const BoxDecoration(
                                                border: Border(right: BorderSide(color: Colors.black, width: 1)),
                                              ),
                                              child: Text(
                                                '${item.quantity}',
                                                textAlign: TextAlign.center,
                                                style: const TextStyle(fontFamily: 'serif', fontSize: 11.5, fontWeight: FontWeight.w600, color: Colors.black),
                                              ),
                                            ),
                                          ),
                                          Expanded(
                                            flex: 24,
                                            child: Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                                              child: Text(
                                                numFormat.format(item.subtotal),
                                                textAlign: TextAlign.right,
                                                style: const TextStyle(fontFamily: 'serif', fontSize: 11.5, fontWeight: FontWeight.w600, color: Colors.black),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    );
                                  }),
                              ],
                            ),
                          ),
                          const SizedBox(height: 10),

                          // KHỐI TỔNG KẾT TIỀN THỰC TẾ
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                I18n.t('orderSubtotal'),
                                style: const TextStyle(fontFamily: 'serif', fontSize: 12, color: Colors.black),
                              ),
                              Text(
                                numFormat.format(subtotal),
                                style: const TextStyle(fontFamily: 'serif', fontSize: 13.5, fontWeight: FontWeight.w800, color: Colors.black),
                              ),
                            ],
                          ),
                          if (promotion != null && promoDiscount > 0) ...[
                            const SizedBox(height: 3),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    '${promotion!.name.isNotEmpty ? promotion!.name : promotion!.code}:',
                                    style: const TextStyle(fontFamily: 'serif', fontSize: 12, color: Color(0xFF1B5E20), fontWeight: FontWeight.w600),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                Text(
                                  '-${numFormat.format(promoDiscount)}',
                                  style: const TextStyle(fontFamily: 'serif', fontSize: 12, color: Color(0xFF1B5E20), fontWeight: FontWeight.w600),
                                ),
                              ],
                            ),
                          ],
                          if (discount > 0) ...[
                            const SizedBox(height: 3),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Chiết khấu:',
                                  style: TextStyle(fontFamily: 'serif', fontSize: 12, color: Colors.black),
                                ),
                                Text(
                                  '-${numFormat.format(discount)}',
                                  style: const TextStyle(fontFamily: 'serif', fontSize: 12, fontWeight: FontWeight.w600, color: Colors.black),
                                ),
                              ],
                            ),
                          ],
                          if (vat > 0) ...[
                            const SizedBox(height: 3),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'VAT 8%:',
                                  style: TextStyle(fontFamily: 'serif', fontSize: 12, color: Colors.black),
                                ),
                                Text(
                                  numFormat.format(vat),
                                  style: const TextStyle(fontFamily: 'serif', fontSize: 12, fontWeight: FontWeight.w600, color: Colors.black),
                                ),
                              ],
                            ),
                          ],
                          const SizedBox(height: 4),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                I18n.t('orderTotal'),
                                style: const TextStyle(fontFamily: 'serif', fontSize: 15, fontWeight: FontWeight.w900, color: Colors.black),
                              ),
                              Text(
                                numFormat.format(total),
                                style: const TextStyle(fontFamily: 'serif', fontSize: 16, fontWeight: FontWeight.w900, color: Colors.black),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),

                          // Bằng chữ
                          Center(
                            child: Text(
                              totalInWords,
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                fontFamily: 'serif',
                                fontStyle: FontStyle.italic,
                                fontSize: 11,
                                color: Colors.black,
                              ),
                            ),
                          ),
                          const SizedBox(height: 12),

                          // MÃ VIETQR CHUYỂN KHOẢN (AURA RESTAURANT)
                          Center(
                            child: Image.network(
                              'https://img.vietqr.io/image/970422-19006888-compact2.png?amount=$total&addInfo=${Uri.encodeComponent('QUAN TRA BAN ${tableBadge['num']}')}&accountName=QUAN%20TRA',
                              width: 140,
                              height: 140,
                              fit: BoxFit.contain,
                              errorBuilder: (context, error, stackTrace) {
                                return Image.network(
                                  'https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${Uri.encodeComponent('QUAN TRA PAYMENT AMOUNT $total')}',
                                  width: 140,
                                  height: 140,
                                  fit: BoxFit.contain,
                                );
                              },
                            ),
                          ),
                          const SizedBox(height: 10),

                          // LỜI CẢM ƠN
                          Center(
                            child: Text(
                              I18n.t('thankYouReceipt'),
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                fontFamily: 'serif',
                                fontStyle: FontStyle.italic,
                                fontSize: 11.5,
                                fontWeight: FontWeight.w500,
                                color: Colors.black,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),

            // 3. Nút thao tác dưới Modal ([Đóng] bên trái, [In Phiếu Tạm Tính] màu xanh rêu bên phải)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
                borderRadius: BorderRadius.vertical(bottom: Radius.circular(14)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF475569),
                      backgroundColor: Colors.white,
                      side: const BorderSide(color: Color(0xFFCBD5E1)),
                      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                    ),
                    onPressed: () => Navigator.pop(context),
                    child: Text(
                      I18n.t('close'),
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                  ),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF064E3B),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                      elevation: 1,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                    ),
                    icon: const Icon(Icons.print_outlined, size: 16),
                    label: Text(
                      I18n.t('printPreBillAction'),
                      style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold),
                    ),
                    onPressed: () async {
                      // Kích hoạt giao diện in hóa đơn chuẩn máy in K80 (Android / iOS / Web)
                      await PrintService.printReceipt(
                        table: table,
                        items: items,
                        promotion: promotion,
                        isPreBill: true,
                      );
                      await ApiService.printPreBill(table.id, orderId: table.orderId);
                      table.status = 'billing';
                      table.duration = 'Chờ tính';
                      if (context.mounted) {
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Row(
                              children: [
                                const Icon(Icons.print_outlined, color: Colors.white, size: 18),
                                const SizedBox(width: 8),
                                Text('Đã in phiếu tạm tính cho ${I18n.formatTableName(table.name)}!'),
                              ],
                            ),
                            backgroundColor: const Color(0xFF064E3B),
                            behavior: SnackBarBehavior.floating,
                          ),
                        );
                        onPrinted();
                      }
                    },
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
