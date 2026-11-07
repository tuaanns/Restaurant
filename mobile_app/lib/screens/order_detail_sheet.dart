import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/i18n_service.dart';
import '../services/print_service.dart';
import '../widgets/kitchen_ticket_dialog.dart';
import '../widgets/prebill_dialog.dart';
import '../widgets/payment_dialog.dart';
import '../widgets/promotion_dialog.dart';
import '../widgets/split_order_dialog.dart';

class OrderDetailSheet extends StatefulWidget {
  final DiningTable table;
  final VoidCallback onOrderUpdated;
  final VoidCallback? onOpenMenu;
  final List<DiningTable>? allTables;

  const OrderDetailSheet({
    super.key,
    required this.table,
    required this.onOrderUpdated,
    this.onOpenMenu,
    this.allTables,
  });

  @override
  State<OrderDetailSheet> createState() => _OrderDetailSheetState();
}

class _OrderDetailSheetState extends State<OrderDetailSheet> {
  final currencyFormat = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');
  late List<OrderItemData> items;
  PromotionModel? _selectedPromotion;

  @override
  void initState() {
    super.initState();
    I18n.currentLocale.addListener(_onLocaleChanged);
    _refreshItems();
  }

  @override
  void dispose() {
    I18n.currentLocale.removeListener(_onLocaleChanged);
    super.dispose();
  }

  void _onLocaleChanged() {
    if (mounted) setState(() {});
  }

  void _refreshItems() {
    setState(() {
      items = ApiService.getTableItems(widget.table.id);
    });
  }

  Future<void> _handleDirectSendKitchen() async {
    if (items.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Bàn chưa có món nào để báo bếp!'),
          backgroundColor: Color(0xFFEF4444),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    final pendingItems = items.where((it) => it.status == 'new_pending').toList();
    final itemsToPrint = pendingItems.isNotEmpty ? pendingItems : items;

    // 1. Gửi lệnh báo bếp lên hệ thống & KDS
    await ApiService.sendToKitchen(widget.table.id, orderId: widget.table.orderId, tableName: widget.table.name);

    // 2. Kích hoạt in lệnh báo bếp trực tiếp K80 ngầm, không mở popup hỏi khổ in
    try {
      await PrintService.autoPrintKitchenTicket(
        table: widget.table,
        items: itemsToPrint,
      );
    } catch (_) {}

    _refreshItems();
    widget.onOrderUpdated();

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Đã tự động gửi & in báo bếp thành công cho ${I18n.formatTableName(widget.table.name)} (${itemsToPrint.length} món)!',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ),
            ],
          ),
          backgroundColor: const Color(0xFF009688),
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 3),
        ),
      );
    }
  }

  void _openKitchenTicket() {
    showDialog(
      context: context,
      builder: (ctx) => KitchenTicketDialog(
        table: widget.table,
        items: items,
        onSentSuccess: () {
          _refreshItems();
          widget.onOrderUpdated();
        },
      ),
    );
  }

  void _openPreBill() {
    showDialog(
      context: context,
      builder: (ctx) => PreBillDialog(
        table: widget.table,
        items: items,
        promotion: _selectedPromotion,
        onPrinted: () {
          widget.onOrderUpdated();
        },
      ),
    );
  }

  void _openPromotionDialog(int subtotal) {
    showDialog(
      context: context,
      builder: (ctx) => PromotionDialog(
        subtotal: subtotal,
        currentPromotion: _selectedPromotion,
        onSelectPromotion: (promo) {
          setState(() {
            _selectedPromotion = promo;
          });
        },
      ),
    );
  }

  void _openSplitOrder() {
    showDialog(
      context: context,
      builder: (ctx) => SplitOrderDialog(
        table: widget.table,
        items: items,
        allTables: widget.allTables ?? ApiService.getMockTables(),
        onSplitSuccess: () {
          _refreshItems();
          widget.onOrderUpdated();
          if (items.isEmpty) {
            Navigator.pop(context); // đóng sheet nếu đã chuyển hết món
          }
        },
      ),
    );
  }

  void _openPayment() {
    showDialog(
      context: context,
      builder: (ctx) => PaymentDialog(
        table: widget.table,
        items: items,
        promotion: _selectedPromotion,
        onCheckoutSuccess: () {
          Navigator.pop(context); // close sheet
          widget.onOrderUpdated();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final int subtotal = items.fold(0, (sum, it) => sum + it.subtotal);
    int promoDiscount = _selectedPromotion != null ? _selectedPromotion!.calculateDiscount(subtotal) : 0;
    if (_selectedPromotion != null && subtotal < _selectedPromotion!.minOrderAmount) {
      promoDiscount = 0;
    }
    final int afterPromo = (subtotal - promoDiscount).clamp(0, subtotal);
    final int memberDiscount = (afterPromo * 0.05).round();
    final int vat = ((afterPromo - memberDiscount) * 0.08).round();
    final int total = afterPromo - memberDiscount + vat;

    final hasNewItems = items.any((it) => it.status == 'new_pending');

    return Container(
      height: MediaQuery.of(context).size.height * 0.90,
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
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFF009688),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.table_restaurant, color: Colors.white, size: 16),
                      const SizedBox(width: 6),
                      Text(
                        I18n.formatTableName(widget.table.name),
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${I18n.t('orderNum')} #${widget.table.id + 100} • ${widget.table.guestCount > 0 ? widget.table.guestCount : 2} ${I18n.t('tableGuests')}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                      Text(
                        '${I18n.t('orderTime')}: ${widget.table.duration ?? I18n.t('justSeated')}',
                        style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                      ),
                    ],
                  ),
                ),
                if (widget.onOpenMenu != null)
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFE0F2FE),
                      foregroundColor: const Color(0xFF0284C7),
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    icon: const Icon(Icons.add, size: 14),
                    label: Text(I18n.t('addDishBtn'), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    onPressed: () {
                      Navigator.pop(context);
                      widget.onOpenMenu!();
                    },
                  ),
                const SizedBox(width: 4),
                IconButton(
                  icon: const Icon(Icons.close, color: Color(0xFF94A3B8)),
                  onPressed: () => Navigator.pop(context),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
          ),

          const Divider(height: 1, color: Color(0xFFE2E8F0)),

          // Items List
          Expanded(
            child: items.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.receipt_long_outlined, size: 48, color: Color(0xFFCBD5E1)),
                        const SizedBox(height: 8),
                        Text(I18n.t('noItemsOnTable'), style: const TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text(I18n.t('tapAddDishToOrder'), style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                        const SizedBox(height: 12),
                        if (widget.onOpenMenu != null)
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF009688),
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            onPressed: () {
                              Navigator.pop(context);
                              widget.onOpenMenu!();
                            },
                            child: Text(I18n.t('openMenuToOrder')),
                          ),
                      ],
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    itemCount: items.length,
                    separatorBuilder: (context, index) => const Divider(height: 12, color: Color(0xFFF1F5F9)),
                    itemBuilder: (context, idx) {
                      final it = items[idx];
                      final isSent = it.status == 'sent_kitchen';

                      return Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Quantity +/- Buttons
                          Container(
                            decoration: BoxDecoration(
                              color: const Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            ),
                            child: Row(
                              children: [
                                InkWell(
                                  onTap: () {
                                    ApiService.updateItemQuantity(widget.table.id, it.id, it.quantity - 1);
                                    _refreshItems();
                                    widget.onOrderUpdated();
                                  },
                                  child: const Padding(
                                    padding: EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                                    child: Icon(Icons.remove, size: 14, color: Color(0xFF64748B)),
                                  ),
                                ),
                                Text(
                                  '${it.quantity}',
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5),
                                ),
                                InkWell(
                                  onTap: () {
                                    ApiService.updateItemQuantity(widget.table.id, it.id, it.quantity + 1);
                                    _refreshItems();
                                    widget.onOrderUpdated();
                                  },
                                  child: const Padding(
                                    padding: EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                                    child: Icon(Icons.add, size: 14, color: Color(0xFF009688)),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 10),

                          // Dish details
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  I18n.formatDishName(it.name),
                                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Color(0xFF1E293B)),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  currencyFormat.format(it.price),
                                  style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                                ),
                                if (it.note.isNotEmpty)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 2),
                                    child: Row(
                                      children: [
                                        const Icon(Icons.edit_note_rounded, size: 14, color: Color(0xFFEA580C)),
                                        const SizedBox(width: 3),
                                        Expanded(
                                          child: Text(
                                            it.note,
                                            style: const TextStyle(fontSize: 11, color: Color(0xFFEA580C)),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                              ],
                            ),
                          ),

                          // Price & Status Badge
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                currencyFormat.format(it.subtotal),
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A)),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: isSent ? const Color(0xFFECFDF5) : const Color(0xFFFFFBEB),
                                      borderRadius: BorderRadius.circular(4),
                                      border: Border.all(
                                        color: isSent ? const Color(0xFFA7F3D0) : const Color(0xFFFCD34D),
                                      ),
                                    ),
                                    child: Text(
                                      isSent ? I18n.t('itemSentKitchen') : I18n.t('itemNewPending'),
                                      style: TextStyle(
                                        fontSize: 9.5,
                                        fontWeight: FontWeight.bold,
                                        color: isSent ? const Color(0xFF059669) : const Color(0xFFB45309),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                  InkWell(
                                    onTap: () {
                                      ApiService.removeItem(widget.table.id, it.id);
                                      _refreshItems();
                                      widget.onOrderUpdated();
                                    },
                                    child: const Icon(Icons.delete_outline, size: 16, color: Color(0xFF94A3B8)),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ],
                      );
                    },
                  ),
          ),

          const Divider(height: 1, color: Color(0xFFE2E8F0)),

          // Price Calculation Summary (With Promotion CTKM Banner)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            color: const Color(0xFFF8FAFC),
            child: Column(
              children: [
                // CTKM Banner
                Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                  decoration: BoxDecoration(
                    color: _selectedPromotion != null ? const Color(0xFFE6F7F5) : Colors.white,
                    borderRadius: BorderRadius.circular(7),
                    border: Border.all(
                      color: _selectedPromotion != null ? const Color(0xFF80CBC4) : const Color(0xFFCBD5E1),
                      width: 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.card_giftcard_rounded,
                        size: 16,
                        color: _selectedPromotion != null ? const Color(0xFF009688) : const Color(0xFF64748B),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: InkWell(
                          onTap: items.isEmpty ? null : () => _openPromotionDialog(subtotal),
                          child: Text(
                            _selectedPromotion != null
                                ? (_selectedPromotion!.name.isNotEmpty ? _selectedPromotion!.name : _selectedPromotion!.code)
                                : I18n.t('applyPromotion'),
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: _selectedPromotion != null ? FontWeight.bold : FontWeight.w600,
                              color: _selectedPromotion != null ? const Color(0xFF00796B) : const Color(0xFF475569),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ),
                      if (_selectedPromotion != null) ...[
                        Text(
                          '-${currencyFormat.format(promoDiscount)}',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF009688),
                          ),
                        ),
                        const SizedBox(width: 6),
                        InkWell(
                          onTap: () {
                            setState(() {
                              _selectedPromotion = null;
                            });
                          },
                          child: const Icon(Icons.cancel, size: 16, color: Color(0xFFEF4444)),
                        ),
                      ] else ...[
                        InkWell(
                          onTap: items.isEmpty ? null : () => _openPromotionDialog(subtotal),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: const Color(0xFFE0F2FE),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              I18n.t('choosePromotion'),
                              style: const TextStyle(
                                fontSize: 10.5,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF0284C7),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),

                // Tạm tính
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('${I18n.t('subtotalPrice')} (${items.length} ${I18n.t('tableItems')}):', style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B))),
                    Text(currencyFormat.format(subtotal), style: const TextStyle(fontSize: 11.5, color: Color(0xFF334155), fontWeight: FontWeight.w600)),
                  ],
                ),

                // Promotion Discount (if applied)
                if (_selectedPromotion != null && promoDiscount > 0) ...[
                  const SizedBox(height: 3),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(I18n.t('promoDiscount'), style: const TextStyle(fontSize: 11.5, color: Color(0xFF009688), fontWeight: FontWeight.w600)),
                      Text('-${currencyFormat.format(promoDiscount)}', style: const TextStyle(fontSize: 11.5, color: Color(0xFF009688), fontWeight: FontWeight.w700)),
                    ],
                  ),
                ],

                // Chiết khấu hội viên (5%)
                const SizedBox(height: 3),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('${I18n.t('memberDiscount')} (5%):', style: const TextStyle(fontSize: 11.5, color: Color(0xFF009688))),
                    Text('-${currencyFormat.format(memberDiscount)}', style: const TextStyle(fontSize: 11.5, color: Color(0xFF009688))),
                  ],
                ),

                // Thuế VAT (8%)
                const SizedBox(height: 3),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(I18n.t('vatTaxRate'), style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B))),
                    Text('+${currencyFormat.format(vat)}', style: const TextStyle(fontSize: 11.5, color: Color(0xFF334155))),
                  ],
                ),

                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(I18n.t('totalPayment').trim(), style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                    Text(currencyFormat.format(total), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF009688))),
                  ],
                ),
              ],
            ),
          ),

          // Action Buttons: Row 1: [Báo Bếp] [In Tạm Tính] [Tách Đơn], Row 2: [THANH TOÁN (F9)]
          Container(
            padding: const EdgeInsets.all(12),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Row 1: 3 Action buttons
                Row(
                  children: [
                    // 1. Báo Bếp Button
                    Expanded(
                      child: OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: hasNewItems ? const Color(0xFF00796B) : const Color(0xFF475569),
                          backgroundColor: hasNewItems ? const Color(0xFFE6F7F5) : Colors.white,
                          side: BorderSide(
                            color: hasNewItems ? const Color(0xFF009688) : const Color(0xFFCBD5E1),
                            width: hasNewItems ? 1.5 : 1,
                          ),
                          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        icon: Icon(
                          Icons.notifications_active_outlined,
                          size: 15,
                          color: hasNewItems ? const Color(0xFF00897B) : const Color(0xFF64748B),
                        ),
                        label: Text(
                          I18n.t('btnKitchen'),
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: hasNewItems ? const Color(0xFF00897B) : const Color(0xFF334155),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        onPressed: items.isEmpty ? null : _handleDirectSendKitchen,
                      ),
                    ),
                    const SizedBox(width: 6),

                    // 2. In Tạm Tính Button
                    Expanded(
                      child: OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFF334155),
                          backgroundColor: Colors.white,
                          side: const BorderSide(color: Color(0xFFCBD5E1)),
                          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        icon: const Icon(Icons.print_outlined, size: 15, color: Color(0xFF64748B)),
                        label: Text(
                          I18n.t('printPreBillBtn'),
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF334155)),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        onPressed: items.isEmpty ? null : _openPreBill,
                      ),
                    ),
                    const SizedBox(width: 6),

                    // 3. Tách Đơn Button
                    Expanded(
                      child: OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFF334155),
                          backgroundColor: Colors.white,
                          side: const BorderSide(color: Color(0xFFCBD5E1)),
                          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        icon: const Icon(Icons.content_cut_rounded, size: 15, color: Color(0xFF64748B)),
                        label: Text(
                          I18n.t('splitOrder'),
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF334155)),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        onPressed: items.isEmpty ? null : _openSplitOrder,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                // Row 2: Full-width THANH TOÁN (F9)
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF009688),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                      elevation: 1,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    onPressed: items.isEmpty ? null : _openPayment,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.payment_rounded, size: 18),
                            const SizedBox(width: 8),
                            Text(
                              I18n.t('payBtnText'),
                              style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w900, letterSpacing: 0.3),
                            ),
                          ],
                        ),
                        Text(
                          currencyFormat.format(total),
                          style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w900),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
