import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/i18n_service.dart';

class SplitOrderDialog extends StatefulWidget {
  final DiningTable table;
  final List<OrderItemData> items;
  final List<DiningTable> allTables;
  final VoidCallback onSplitSuccess;

  const SplitOrderDialog({
    super.key,
    required this.table,
    required this.items,
    required this.allTables,
    required this.onSplitSuccess,
  });

  @override
  State<SplitOrderDialog> createState() => _SplitOrderDialogState();
}

class _SplitOrderDialogState extends State<SplitOrderDialog> {
  final currencyFormat = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');
  late Map<int, int> _splitQuantities;
  int? _targetTableId; // null means create sub-bill

  @override
  void initState() {
    super.initState();
    // Default 0 for all items
    _splitQuantities = {for (var it in widget.items) it.id: 0};
  }

  int get _splitSubtotal {
    int sum = 0;
    for (var it in widget.items) {
      final qty = _splitQuantities[it.id] ?? 0;
      sum += qty * it.price;
    }
    return sum;
  }

  int get _originalSubtotal {
    return widget.items.fold(0, (sum, it) => sum + it.subtotal);
  }

  int get _totalSplitItemsCount {
    return _splitQuantities.values.fold(0, (sum, q) => sum + q);
  }

  @override
  Widget build(BuildContext context) {
    final emptyTables = widget.allTables
        .where((t) => t.id != widget.table.id && t.status == 'empty')
        .toList();

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      backgroundColor: Colors.white,
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 460),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header (Dark bar)
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
                    child: const Icon(Icons.content_cut_rounded, color: Color(0xFF38BDF8), size: 18),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${I18n.t('splitOrderTitle').toUpperCase()} - ${I18n.formatTableName(widget.table.name)}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 13.5,
                          ),
                        ),
                        Text(
                          I18n.t('splitOrderDesc'),
                          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10.5),
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

            // Target selector: [Đơn phụ mới (#SUB)] / [Bàn trống]
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              color: const Color(0xFFF8FAFC),
              child: Row(
                children: [
                  Text(
                    I18n.t('splitToTable'),
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: const Color(0xFFCBD5E1)),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<int?>(
                          value: _targetTableId,
                          isDense: true,
                          style: const TextStyle(fontSize: 12, color: Color(0xFF0F172A), fontWeight: FontWeight.w600),
                          items: [
                            DropdownMenuItem<int?>(
                              value: null,
                              child: Text(I18n.t('splitNewBill')),
                            ),
                            ...emptyTables.map((t) => DropdownMenuItem<int?>(
                                  value: t.id,
                                  child: Text('${I18n.formatTableName(t.name)} (${I18n.t('tableEmpty')})'),
                                )),
                          ],
                          onChanged: (val) => setState(() => _targetTableId = val),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const Divider(height: 1, color: Color(0xFFE2E8F0)),

            // Items to split list
            Flexible(
              child: Container(
                constraints: const BoxConstraints(maxHeight: 280),
                child: ListView.separated(
                  padding: const EdgeInsets.all(12),
                  shrinkWrap: true,
                  itemCount: widget.items.length,
                  separatorBuilder: (context, index) => const Divider(height: 10, color: Color(0xFFF1F5F9)),
                  itemBuilder: (context, idx) {
                    final it = widget.items[idx];
                    final splitQty = _splitQuantities[it.id] ?? 0;
                    final isChecked = splitQty > 0;

                    return Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: isChecked ? const Color(0xFFF0FDF4) : Colors.white,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: isChecked ? const Color(0xFF86EFAC) : const Color(0xFFE2E8F0),
                        ),
                      ),
                      child: Row(
                        children: [
                          Checkbox(
                            value: isChecked,
                            activeColor: const Color(0xFF009688),
                            onChanged: (val) {
                              setState(() {
                                _splitQuantities[it.id] = (val == true) ? 1 : 0;
                              });
                            },
                          ),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  I18n.formatDishName(it.name),
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5, color: Color(0xFF0F172A)),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  '${currencyFormat.format(it.price)} / ${I18n.formatDishUnit(it.unit)} (Có: ${it.quantity})',
                                  style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                                ),
                              ],
                            ),
                          ),
                          // Stepper
                          Container(
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: const Color(0xFFCBD5E1)),
                              color: Colors.white,
                            ),
                            child: Row(
                              children: [
                                InkWell(
                                  onTap: splitQty > 0
                                      ? () => setState(() => _splitQuantities[it.id] = splitQty - 1)
                                      : null,
                                  child: const Padding(
                                    padding: EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                                    child: Icon(Icons.remove, size: 14, color: Color(0xFF64748B)),
                                  ),
                                ),
                                Container(
                                  constraints: const BoxConstraints(minWidth: 26),
                                  alignment: Alignment.center,
                                  child: Text(
                                    '$splitQty',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 13,
                                      color: isChecked ? const Color(0xFF009688) : const Color(0xFF94A3B8),
                                    ),
                                  ),
                                ),
                                InkWell(
                                  onTap: splitQty < it.quantity
                                      ? () => setState(() => _splitQuantities[it.id] = splitQty + 1)
                                      : null,
                                  child: const Padding(
                                    padding: EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                                    child: Icon(Icons.add, size: 14, color: Color(0xFF009688)),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
            ),

            const Divider(height: 1, color: Color(0xFFE2E8F0)),

            // Subtotal Preview Banner
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              color: const Color(0xFFF8FAFC),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Đơn hiện tại còn lại:', style: TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                      Text(
                        currencyFormat.format(_originalSubtotal - _splitSubtotal),
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                      ),
                    ],
                  ),
                  Container(width: 1, height: 26, color: const Color(0xFFCBD5E1)),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('Tách sang đơn mới ($_totalSplitItemsCount món):', style: const TextStyle(fontSize: 11, color: Color(0xFF0284C7))),
                      Text(
                        currencyFormat.format(_splitSubtotal),
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF0284C7)),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const Divider(height: 1, color: Color(0xFFE2E8F0)),

            // Action Buttons
            Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF475569),
                        padding: const EdgeInsets.symmetric(vertical: 11),
                        side: const BorderSide(color: Color(0xFFCBD5E1)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      onPressed: () => Navigator.pop(context),
                      child: Text(
                        I18n.t('cancel'),
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
                        padding: const EdgeInsets.symmetric(vertical: 11),
                        elevation: 1,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      icon: const Icon(Icons.content_cut_rounded, size: 16),
                      label: Text(
                        I18n.t('confirmSplit'),
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                      onPressed: _totalSplitItemsCount == 0
                          ? null
                          : () {
                              ApiService.splitOrderItems(
                                widget.table.id,
                                _targetTableId,
                                _splitQuantities,
                              );
                              Navigator.pop(context);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Row(
                                    children: [
                                      const Icon(Icons.check_circle_rounded, color: Colors.white, size: 18),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          '${I18n.t('splitSuccess')} ($_totalSplitItemsCount món -> ${currencyFormat.format(_splitSubtotal)})',
                                        ),
                                      ),
                                    ],
                                  ),
                                  backgroundColor: const Color(0xFF009688),
                                  behavior: SnackBarBehavior.floating,
                                ),
                              );
                              widget.onSplitSuccess();
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

