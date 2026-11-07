import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:intl/intl.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/i18n_service.dart';

class PrintService {
  static final numFormat = NumberFormat('#,###', 'en_US');

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

  /// In phiếu tạm tính hoặc hóa đơn thanh toán chuẩn khổ K80 (80mm) từ điện thoại / máy tính
  /// Đồng bộ hoàn toàn form với giao diện web (PreBillModal.jsx)
  static Future<void> printReceipt({
    required DiningTable table,
    required List<OrderItemData> items,
    PromotionModel? promotion,
    bool isPreBill = true,
    String? cashierName,
  }) async {
    final now = DateTime.now();
    final dateStr = '${now.day}/${now.month}/${now.year}';
    final timeStr = DateFormat('HH:mm').format(now);
    final dateCode = DateFormat('yyyyMMdd').format(now);
    final orderCode = 'ORD-$dateCode-${table.id.toString().padLeft(3, '0')}-003';

    final int subtotal = items.fold(0, (sum, it) => sum + it.subtotal);
    int promoDiscount = promotion != null ? promotion.calculateDiscount(subtotal) : 0;
    if (promotion != null && subtotal < promotion.minOrderAmount) {
      promoDiscount = 0;
    }
    final int afterPromo = (subtotal - promoDiscount).clamp(0, subtotal);
    final int discount = (afterPromo * 0.05).round();
    final int vat = ((afterPromo - discount) * 0.08).round();
    final int total = afterPromo - discount + vat;
    final totalInWords = numberToVietnameseWords(total);

    final defaultTitle = I18n.t('tablePrefix').isNotEmpty ? I18n.t('tablePrefix') : 'BÀN';
    String tableNumStr = table.name.replaceAll(RegExp(r'^BÀN\s*', caseSensitive: false), '').trim();
    if (tableNumStr.isEmpty) tableNumStr = '01';

    // Chuẩn khổ K80: chiều rộng 72mm-80mm
    const pageFormat = PdfPageFormat(
      72 * PdfPageFormat.mm,
      double.infinity,
      marginAll: 3.5 * PdfPageFormat.mm,
    );

    pw.ThemeData? theme;
    try {
      final regular = await PdfGoogleFonts.robotoRegular();
      final bold = await PdfGoogleFonts.robotoBold();
      theme = pw.ThemeData.withFont(base: regular, bold: bold);
    } catch (_) {}

    final doc = pw.Document();

    doc.addPage(
      pw.Page(
        pageFormat: pageFormat,
        theme: theme,
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.stretch,
            children: [
              // 1. THÔNG TIN NHÀ HÀNG
              pw.Center(
                child: pw.Text(
                  'NHÀ HÀNG',
                  style: pw.TextStyle(fontSize: 11, fontWeight: pw.FontWeight.bold),
                ),
              ),
              pw.SizedBox(height: 1),
              pw.Center(
                child: pw.Text(
                  'QUÁN TRÀ',
                  style: pw.TextStyle(fontSize: 13.5, fontWeight: pw.FontWeight.bold),
                ),
              ),
              pw.SizedBox(height: 1),
              pw.Center(
                child: pw.Text(
                  'ĐC: 103 Trần Hưng Đạo, Đặc khu Phú Quốc, Tỉnh An Giang',
                  style: const pw.TextStyle(fontSize: 7.5),
                  textAlign: pw.TextAlign.center,
                ),
              ),
              pw.Center(
                child: pw.Text('Hotline: 1900 6868', style: pw.TextStyle(fontSize: 7.8, fontWeight: pw.FontWeight.bold)),
              ),
              pw.SizedBox(height: 6),

              // 2. KHỐI TIÊU ĐỀ: BÀN (BÊN TRÁI) & PHIẾU TẠM TÍNH (BÊN PHẢI) - GIỐNG 100% WEB
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                crossAxisAlignment: pw.CrossAxisAlignment.center,
                children: [
                  pw.Container(
                    padding: const pw.EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: pw.BoxDecoration(
                      border: pw.Border.all(width: 1.2),
                      borderRadius: pw.BorderRadius.circular(16),
                    ),
                    child: pw.Column(
                      mainAxisSize: pw.MainAxisSize.min,
                      children: [
                        pw.Text(defaultTitle, style: pw.TextStyle(fontSize: 8.5, fontWeight: pw.FontWeight.bold)),
                        pw.Text(
                          tableNumStr,
                          style: pw.TextStyle(fontSize: 13, fontWeight: pw.FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.end,
                    children: [
                      pw.Text(
                        isPreBill ? 'PHIẾU TẠM TÍNH' : 'HÓA ĐƠN THANH TOÁN',
                        style: pw.TextStyle(fontSize: 11, fontWeight: pw.FontWeight.bold),
                      ),
                      pw.SizedBox(height: 1),
                      pw.Text('Mã HĐ: $orderCode', style: pw.TextStyle(fontSize: 7.8, fontWeight: pw.FontWeight.bold)),
                      pw.Text('Ngày bán: $dateStr', style: const pw.TextStyle(fontSize: 7.5)),
                      pw.Text(timeStr, style: const pw.TextStyle(fontSize: 7.5)),
                    ],
                  ),
                ],
              ),
              pw.SizedBox(height: 6),

              // 3. BẢNG MÓN ĂN KẺ KHUNG VIỀN ĐẦY ĐỦ (GIỐNG FORM WEB)
              pw.Table(
                border: pw.TableBorder.all(width: 1),
                columnWidths: const {
                  0: pw.FlexColumnWidth(4.2),
                  1: pw.FlexColumnWidth(2.3),
                  2: pw.FlexColumnWidth(1.1),
                  3: pw.FlexColumnWidth(2.4),
                },
                children: [
                  pw.TableRow(
                    children: [
                      pw.Padding(
                        padding: const pw.EdgeInsets.all(2.5),
                        child: pw.Text('Tên Hàng', style: pw.TextStyle(fontSize: 7.8, fontWeight: pw.FontWeight.bold)),
                      ),
                      pw.Padding(
                        padding: const pw.EdgeInsets.all(2.5),
                        child: pw.Text('Đ.Giá', textAlign: pw.TextAlign.right, style: pw.TextStyle(fontSize: 7.8, fontWeight: pw.FontWeight.bold)),
                      ),
                      pw.Padding(
                        padding: const pw.EdgeInsets.all(2.5),
                        child: pw.Text('SL', textAlign: pw.TextAlign.center, style: pw.TextStyle(fontSize: 7.8, fontWeight: pw.FontWeight.bold)),
                      ),
                      pw.Padding(
                        padding: const pw.EdgeInsets.all(2.5),
                        child: pw.Text('Thành tiền', textAlign: pw.TextAlign.right, style: pw.TextStyle(fontSize: 7.8, fontWeight: pw.FontWeight.bold)),
                      ),
                    ],
                  ),
                  if (items.isEmpty)
                    pw.TableRow(
                      children: [
                        pw.Padding(
                          padding: const pw.EdgeInsets.symmetric(vertical: 8, horizontal: 2),
                          child: pw.Text(
                            'Bàn chưa có món ăn nào được gọi',
                            textAlign: pw.TextAlign.center,
                            style: pw.TextStyle(fontSize: 7.5, fontStyle: pw.FontStyle.italic),
                          ),
                        ),
                        pw.SizedBox(),
                        pw.SizedBox(),
                        pw.SizedBox(),
                      ],
                    )
                  else
                    ...items.map(
                      (it) => pw.TableRow(
                        children: [
                          pw.Padding(
                            padding: const pw.EdgeInsets.all(2),
                            child: pw.Column(
                              crossAxisAlignment: pw.CrossAxisAlignment.start,
                              children: [
                                pw.Text(I18n.formatDishName(it.name), style: pw.TextStyle(fontSize: 7.5, fontWeight: pw.FontWeight.bold)),
                                if (it.unit.isNotEmpty)
                                  pw.Text('(${I18n.formatDishUnit(it.unit)})', style: const pw.TextStyle(fontSize: 6.5)),
                              ],
                            ),
                          ),
                          pw.Padding(
                            padding: const pw.EdgeInsets.all(2),
                            child: pw.Text(numFormat.format(it.price), textAlign: pw.TextAlign.right, style: const pw.TextStyle(fontSize: 7.5)),
                          ),
                          pw.Padding(
                            padding: const pw.EdgeInsets.all(2),
                            child: pw.Text('${it.quantity}', textAlign: pw.TextAlign.center, style: pw.TextStyle(fontSize: 7.5, fontWeight: pw.FontWeight.bold)),
                          ),
                          pw.Padding(
                            padding: const pw.EdgeInsets.all(2),
                            child: pw.Text(numFormat.format(it.subtotal), textAlign: pw.TextAlign.right, style: pw.TextStyle(fontSize: 7.5, fontWeight: pw.FontWeight.bold)),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
              pw.SizedBox(height: 6),

              // 4. KHỐI TỔNG KẾT TIỀN THỰC TẾ (GIỐNG FORM WEB)
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Text('Tổng tiền hàng:', style: const pw.TextStyle(fontSize: 8)),
                  pw.Text(numFormat.format(subtotal), style: pw.TextStyle(fontSize: 8.5, fontWeight: pw.FontWeight.bold)),
                ],
              ),
              if (promoDiscount > 0) ...[
                pw.SizedBox(height: 1),
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text('Khuyến mãi:', style: const pw.TextStyle(fontSize: 8)),
                    pw.Text('-${numFormat.format(promoDiscount)}', style: const pw.TextStyle(fontSize: 8)),
                  ],
                ),
              ],
              if (discount > 0) ...[
                pw.SizedBox(height: 1),
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text('Chiết khấu TV (5%):', style: const pw.TextStyle(fontSize: 8)),
                    pw.Text('-${numFormat.format(discount)}', style: const pw.TextStyle(fontSize: 8)),
                  ],
                ),
              ],
              if (vat > 0) ...[
                pw.SizedBox(height: 1),
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text('VAT (8%):', style: const pw.TextStyle(fontSize: 8)),
                    pw.Text('+${numFormat.format(vat)}', style: const pw.TextStyle(fontSize: 8)),
                  ],
                ),
              ],
              pw.SizedBox(height: 2),
              pw.Divider(thickness: 1, borderStyle: pw.BorderStyle.dashed),
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Text('TỔNG CỘNG:', style: pw.TextStyle(fontSize: 9.5, fontWeight: pw.FontWeight.bold)),
                  pw.Text('${numFormat.format(total)} đ', style: pw.TextStyle(fontSize: 10.5, fontWeight: pw.FontWeight.bold)),
                ],
              ),
              pw.SizedBox(height: 3),
              pw.Center(
                child: pw.Text(
                  totalInWords,
                  style: pw.TextStyle(fontSize: 7.5, fontStyle: pw.FontStyle.italic),
                  textAlign: pw.TextAlign.center,
                ),
              ),
              pw.SizedBox(height: 6),

              // 5. MÃ VIETQR CHUYỂN KHOẢN (AURA RESTAURANT)
              pw.Center(
                child: pw.BarcodeWidget(
                  barcode: pw.Barcode.qrCode(),
                  data: 'https://img.vietqr.io/image/970422-19006888-compact2.png?amount=$total&addInfo=QUAN%20TRA%20BAN%20$tableNumStr&accountName=QUAN%20TRA',
                  width: 70,
                  height: 70,
                ),
              ),
              pw.SizedBox(height: 2),
              pw.Center(
                child: pw.Text('VietQR - MB BANK (19006888)', style: pw.TextStyle(fontSize: 7, fontWeight: pw.FontWeight.bold)),
              ),
              pw.SizedBox(height: 6),

              // 6. LỜI CẢM ƠN
              pw.Center(
                child: pw.Text(
                  'Xin Cám Ơn & Hẹn Gặp Lại!!!',
                  style: pw.TextStyle(fontSize: 8, fontStyle: pw.FontStyle.italic, fontWeight: pw.FontWeight.bold),
                ),
              ),
              pw.SizedBox(height: 1),
              pw.Center(
                child: pw.Text(
                  'Wifi: AURA_RESTAURANT - Pass: 88888888',
                  style: const pw.TextStyle(fontSize: 7),
                ),
              ),
            ],
          );
        },
      ),
    );

    // Mở hộp thoại in chuẩn của hệ điều hành (Android Print Spooler / Web Print / AirPrint)
    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => doc.save(),
      name: '${isPreBill ? "PhieuTamTinh" : "HoaDon"}_${table.name}_$orderCode',
    );
  }

  /// In phiếu báo bếp K80 - Đồng bộ hoàn toàn form với web (KitchenTicketModal.jsx)
  static Future<void> printKitchenTicket({
    required DiningTable table,
    required List<OrderItemData> items,
  }) async {
    final now = DateTime.now();
    final timeStr = DateFormat('HH:mm - dd/MM/yyyy').format(now);
    final ticketCode = 'BEP-${((table.id + 100) * 892 % 900000 + 100000)}';
    final pendingItems = items.where((it) => it.status == 'new_pending').toList();
    final itemsToDisplay = pendingItems.isNotEmpty ? pendingItems : items;

    const pageFormat = PdfPageFormat(
      72 * PdfPageFormat.mm,
      double.infinity,
      marginAll: 3.5 * PdfPageFormat.mm,
    );

    pw.ThemeData? theme;
    try {
      final regular = await PdfGoogleFonts.robotoRegular();
      final bold = await PdfGoogleFonts.robotoBold();
      theme = pw.ThemeData.withFont(base: regular, bold: bold);
    } catch (_) {}

    final doc = pw.Document();

    doc.addPage(
      pw.Page(
        pageFormat: pageFormat,
        theme: theme,
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.stretch,
            children: [
              // Header
              pw.Center(
                child: pw.Text('QUÁN TRÀ', style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold)),
              ),
              pw.Center(
                child: pw.Text(I18n.t('branchName'), style: const pw.TextStyle(fontSize: 8)),
              ),
              pw.SizedBox(height: 3),
              pw.Divider(thickness: 1, borderStyle: pw.BorderStyle.dashed),
              pw.Center(
                child: pw.Text('PHIẾU BÁO BẾP / BAR', style: pw.TextStyle(fontSize: 11.5, fontWeight: pw.FontWeight.bold)),
              ),
              pw.Divider(thickness: 1, borderStyle: pw.BorderStyle.dashed),
              pw.SizedBox(height: 3),

              // Info
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Text('BÀN: ${I18n.formatTableName(table.name)}', style: pw.TextStyle(fontSize: 10, fontWeight: pw.FontWeight.bold)),
                  pw.Text('Mã: $ticketCode', style: const pw.TextStyle(fontSize: 8)),
                ],
              ),
              pw.Text('Thời gian: $timeStr', style: const pw.TextStyle(fontSize: 7.5)),
              pw.Text('Thu ngân: ${ApiService.currentUser?.name ?? "Thu Hằng (Ca sáng)"}', style: const pw.TextStyle(fontSize: 7.5)),
              pw.SizedBox(height: 4),
              pw.Divider(thickness: 1, borderStyle: pw.BorderStyle.dashed),

              // Bảng món ăn: STT, Tên món, SL
              pw.Table(
                columnWidths: const {
                  0: pw.FlexColumnWidth(1.2),
                  1: pw.FlexColumnWidth(6.5),
                  2: pw.FlexColumnWidth(1.8),
                },
                children: [
                  pw.TableRow(
                    decoration: const pw.BoxDecoration(border: pw.Border(bottom: pw.BorderSide(width: 0.8))),
                    children: [
                      pw.Padding(padding: const pw.EdgeInsets.symmetric(vertical: 2), child: pw.Text('STT', style: pw.TextStyle(fontSize: 8, fontWeight: pw.FontWeight.bold))),
                      pw.Padding(padding: const pw.EdgeInsets.symmetric(vertical: 2), child: pw.Text('Tên món', style: pw.TextStyle(fontSize: 8, fontWeight: pw.FontWeight.bold))),
                      pw.Padding(padding: const pw.EdgeInsets.symmetric(vertical: 2), child: pw.Text('SL', textAlign: pw.TextAlign.center, style: pw.TextStyle(fontSize: 8, fontWeight: pw.FontWeight.bold))),
                    ],
                  ),
                  ...itemsToDisplay.asMap().entries.map((entry) {
                    final idx = entry.key + 1;
                    final it = entry.value;
                    return pw.TableRow(
                      children: [
                        pw.Padding(padding: const pw.EdgeInsets.symmetric(vertical: 3), child: pw.Text('$idx.', style: const pw.TextStyle(fontSize: 8))),
                        pw.Padding(
                          padding: const pw.EdgeInsets.symmetric(vertical: 3),
                          child: pw.Column(
                            crossAxisAlignment: pw.CrossAxisAlignment.start,
                            children: [
                              pw.Text(I18n.formatDishName(it.name), style: pw.TextStyle(fontSize: 8.5, fontWeight: pw.FontWeight.bold)),
                              if (it.note.isNotEmpty)
                                pw.Text('Ghi chú: ${it.note}', style: pw.TextStyle(fontSize: 7, fontStyle: pw.FontStyle.italic)),
                            ],
                          ),
                        ),
                        pw.Padding(padding: const pw.EdgeInsets.symmetric(vertical: 3), child: pw.Text('${it.quantity}', textAlign: pw.TextAlign.center, style: pw.TextStyle(fontSize: 9, fontWeight: pw.FontWeight.bold))),
                      ],
                    );
                  }),
                ],
              ),
              pw.SizedBox(height: 6),
              pw.Divider(thickness: 1, borderStyle: pw.BorderStyle.dashed),
              pw.SizedBox(height: 4),
              pw.Center(
                child: pw.Text('*** XIN CẢM ƠN - BẾP LÀM NGAY ***', style: pw.TextStyle(fontSize: 8, fontWeight: pw.FontWeight.bold)),
              ),
            ],
          );
        },
      ),
    );

    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => doc.save(),
      name: 'BaoBep_${table.name}_$ticketCode',
    );
  }

  /// Tự động in phiếu báo bếp K80 trực tiếp ngầm, không mở màn hình cấu hình khổ in
  static Future<void> autoPrintKitchenTicket({
    required DiningTable table,
    required List<OrderItemData> items,
  }) async {
    final now = DateTime.now();
    final timeStr = DateFormat('HH:mm - dd/MM/yyyy').format(now);
    final ticketCode = 'BEP-${((table.id + 100) * 892 % 900000 + 100000)}';
    final pendingItems = items.where((it) => it.status == 'new_pending').toList();
    final itemsToDisplay = pendingItems.isNotEmpty ? pendingItems : items;

    const pageFormat = PdfPageFormat(
      72 * PdfPageFormat.mm,
      double.infinity,
      marginAll: 3.5 * PdfPageFormat.mm,
    );

    pw.ThemeData? theme;
    try {
      final regular = await PdfGoogleFonts.robotoRegular();
      final bold = await PdfGoogleFonts.robotoBold();
      theme = pw.ThemeData.withFont(base: regular, bold: bold);
    } catch (_) {}

    final doc = pw.Document();

    doc.addPage(
      pw.Page(
        pageFormat: pageFormat,
        theme: theme,
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.stretch,
            children: [
              // Header
              pw.Center(
                child: pw.Text('QUÁN TRÀ', style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold)),
              ),
              pw.Center(
                child: pw.Text(I18n.t('branchName'), style: const pw.TextStyle(fontSize: 8)),
              ),
              pw.SizedBox(height: 3),
              pw.Divider(thickness: 1, borderStyle: pw.BorderStyle.dashed),
              pw.Center(
                child: pw.Text('PHIẾU BÁO BẾP / BAR', style: pw.TextStyle(fontSize: 11.5, fontWeight: pw.FontWeight.bold)),
              ),
              pw.Divider(thickness: 1, borderStyle: pw.BorderStyle.dashed),
              pw.SizedBox(height: 3),

              // Info
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Text('BÀN: ${I18n.formatTableName(table.name)}', style: pw.TextStyle(fontSize: 10, fontWeight: pw.FontWeight.bold)),
                  pw.Text('Mã: $ticketCode', style: const pw.TextStyle(fontSize: 8)),
                ],
              ),
              pw.Text('Thời gian: $timeStr', style: const pw.TextStyle(fontSize: 7.5)),
              pw.Text('Thu ngân: ${ApiService.currentUser?.name ?? "Thu Hằng (Ca sáng)"}', style: const pw.TextStyle(fontSize: 7.5)),
              pw.SizedBox(height: 4),
              pw.Divider(thickness: 1, borderStyle: pw.BorderStyle.dashed),

              // Bảng món ăn: STT, Tên món, SL
              pw.Table(
                columnWidths: const {
                  0: pw.FlexColumnWidth(1.2),
                  1: pw.FlexColumnWidth(6.5),
                  2: pw.FlexColumnWidth(1.8),
                },
                children: [
                  pw.TableRow(
                    decoration: const pw.BoxDecoration(border: pw.Border(bottom: pw.BorderSide(width: 0.8))),
                    children: [
                      pw.Padding(padding: const pw.EdgeInsets.symmetric(vertical: 2), child: pw.Text('STT', style: pw.TextStyle(fontSize: 8, fontWeight: pw.FontWeight.bold))),
                      pw.Padding(padding: const pw.EdgeInsets.symmetric(vertical: 2), child: pw.Text('Tên món', style: pw.TextStyle(fontSize: 8, fontWeight: pw.FontWeight.bold))),
                      pw.Padding(padding: const pw.EdgeInsets.symmetric(vertical: 2), child: pw.Text('SL', textAlign: pw.TextAlign.center, style: pw.TextStyle(fontSize: 8, fontWeight: pw.FontWeight.bold))),
                    ],
                  ),
                  ...itemsToDisplay.asMap().entries.map((entry) {
                    final idx = entry.key + 1;
                    final it = entry.value;
                    return pw.TableRow(
                      children: [
                        pw.Padding(padding: const pw.EdgeInsets.symmetric(vertical: 3), child: pw.Text('$idx.', style: const pw.TextStyle(fontSize: 8))),
                        pw.Padding(
                          padding: const pw.EdgeInsets.symmetric(vertical: 3),
                          child: pw.Column(
                            crossAxisAlignment: pw.CrossAxisAlignment.start,
                            children: [
                              pw.Text(I18n.formatDishName(it.name), style: pw.TextStyle(fontSize: 8.5, fontWeight: pw.FontWeight.bold)),
                              if (it.note.isNotEmpty)
                                pw.Text('Ghi chú: ${it.note}', style: pw.TextStyle(fontSize: 7, fontStyle: pw.FontStyle.italic)),
                            ],
                          ),
                        ),
                        pw.Padding(padding: const pw.EdgeInsets.symmetric(vertical: 3), child: pw.Text('${it.quantity}', textAlign: pw.TextAlign.center, style: pw.TextStyle(fontSize: 9, fontWeight: pw.FontWeight.bold))),
                      ],
                    );
                  }),
                ],
              ),
              pw.SizedBox(height: 6),
              pw.Divider(thickness: 1, borderStyle: pw.BorderStyle.dashed),
              pw.SizedBox(height: 4),
              pw.Center(
                child: pw.Text('*** XIN CẢM ƠN - BẾP LÀM NGAY ***', style: pw.TextStyle(fontSize: 8, fontWeight: pw.FontWeight.bold)),
              ),
            ],
          );
        },
      ),
    );

    try {
      final printers = await Printing.listPrinters();
      if (printers.isNotEmpty) {
        final targetPrinter = printers.firstWhere((p) => p.isDefault, orElse: () => printers.first);
        await Printing.directPrintPdf(
          printer: targetPrinter,
          onLayout: (format) async => doc.save(),
          name: 'BaoBep_${table.name}_$ticketCode',
        );
      }
    } catch (_) {
      // In ngầm không bắt buộc mở hộp thoại khổ in
    }
  }

  /// In phiếu hóa đơn test cho mục Cài đặt máy in
  static Future<void> printTestBill() async {
    const pageFormat = PdfPageFormat(
      72 * PdfPageFormat.mm,
      double.infinity,
      marginAll: 3.5 * PdfPageFormat.mm,
    );

    pw.ThemeData? theme;
    try {
      final regular = await PdfGoogleFonts.robotoRegular();
      final bold = await PdfGoogleFonts.robotoBold();
      theme = pw.ThemeData.withFont(base: regular, bold: bold);
    } catch (_) {}

    final doc = pw.Document();
    doc.addPage(
      pw.Page(
        pageFormat: pageFormat,
        theme: theme,
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.stretch,
            children: [
              pw.Center(
                child: pw.Text('QUÁN TRÀ', style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold)),
              ),
              pw.Center(
                child: pw.Text('PHIẾU IN TEST MÁY IN K80', style: pw.TextStyle(fontSize: 10, fontWeight: pw.FontWeight.bold)),
              ),
              pw.SizedBox(height: 4),
              pw.Divider(thickness: 1, borderStyle: pw.BorderStyle.dashed),
              pw.Text('Máy in: K80 Thermal Printer (80mm)', style: const pw.TextStyle(fontSize: 7.5)),
              pw.Text('Thời gian: ${DateFormat('dd/MM/yyyy HH:mm:ss').format(DateTime.now())}', style: const pw.TextStyle(fontSize: 7.5)),
              pw.Text('Trạng thái kết nối: Hoạt động tốt', style: const pw.TextStyle(fontSize: 7.5)),
              pw.SizedBox(height: 4),
              pw.Divider(thickness: 1, borderStyle: pw.BorderStyle.dashed),
              pw.Center(
                child: pw.Text('KIỂM TRA IN TỪ ĐIỆN THOẠI THÀNH CÔNG!', style: pw.TextStyle(fontSize: 8.5, fontWeight: pw.FontWeight.bold)),
              ),
            ],
          );
        },
      ),
    );

    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => doc.save(),
      name: 'TestPrint_K80',
    );
  }
}
