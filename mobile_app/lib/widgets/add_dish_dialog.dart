import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/i18n_service.dart';

typedef DishAddedCallback = void Function(DiningTable targetTable, {bool autoOpenKitchen});

class AddDishDialog extends StatefulWidget {
  final Product product;
  final List<DiningTable> tables;
  final int initialTableId;
  final DishAddedCallback onDishAdded;

  const AddDishDialog({
    super.key,
    required this.product,
    required this.tables,
    required this.initialTableId,
    required this.onDishAdded,
  });

  @override
  State<AddDishDialog> createState() => _AddDishDialogState();
}

class _AddDishDialogState extends State<AddDishDialog> {
  final currencyFormat = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');
  int _quantity = 1;
  late int _selectedTableId;
  final TextEditingController _noteController = TextEditingController();

  final List<String> _quickNotes = [
    'Ít cay',
    'Không cay',
    'Không hành',
    'Ít đường',
    'Nhiều đá',
    'Làm nhanh',
  ];

  @override
  void initState() {
    super.initState();
    _selectedTableId = widget.initialTableId;
  }

  @override
  void dispose() {
    _noteController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final subtotal = _quantity * widget.product.price;
    final targetTable = widget.tables.firstWhere(
      (t) => t.id == _selectedTableId,
      orElse: () => widget.tables.first,
    );

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      backgroundColor: Colors.white,
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 420),
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
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.add_shopping_cart, color: Color(0xFF66BB6A), size: 18),
                    ),
                    const SizedBox(width: 10),
                    const Expanded(
                      child: Text(
                        'GỌI MÓN VÀO BÀN',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
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

              // Product Info Card
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        color: const Color(0xFFE0F2FE),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      alignment: Alignment.center,
                      child: const Icon(Icons.restaurant, color: Color(0xFF0284C7), size: 28),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            I18n.formatDishName(widget.product.name, widget.product.code),
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0F172A)),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${currencyFormat.format(widget.product.price)} / ${I18n.formatDishUnit(widget.product.unit)}',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1B5E20)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const Divider(height: 1, color: Color(0xFFE2E8F0)),

              // Table Selector & Quantity Controls
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Table Selector
                    Text(
                      I18n.t('orderForTableTitle'),
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF475569)),
                    ),
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFFCBD5E1)),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<int>(
                          value: _selectedTableId,
                          isExpanded: true,
                          items: widget.tables.map((t) {
                            return DropdownMenuItem<int>(
                              value: t.id,
                              child: Text(
                                '${I18n.formatTableName(t.name)} (${t.status == "occupied" ? I18n.t("statusOccupied") : I18n.t("tableEmpty")})',
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                              ),
                            );
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) setState(() => _selectedTableId = val);
                          },
                        ),
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Quantity Counter
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          I18n.t('portionQuantity'),
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF475569)),
                        ),
                        Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: const Color(0xFFCBD5E1)),
                          ),
                          child: Row(
                            children: [
                              IconButton(
                                icon: const Icon(Icons.remove, size: 18),
                                onPressed: _quantity > 1 ? () => setState(() => _quantity--) : null,
                                constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
                                padding: EdgeInsets.zero,
                              ),
                              Container(
                                constraints: const BoxConstraints(minWidth: 40),
                                alignment: Alignment.center,
                                child: Text(
                                  '$_quantity',
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.add, size: 18, color: Color(0xFF1B5E20)),
                                onPressed: () => setState(() => _quantity++),
                                constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
                                padding: EdgeInsets.zero,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 16),

                    // Note input & quick tags
                    Text(
                      I18n.t('kitchenNotes'),
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF475569)),
                    ),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _noteController,
                      decoration: InputDecoration(
                        hintText: 'Ví dụ: Ít cay, không đường, làm mềm...',
                        hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      ),
                      style: const TextStyle(fontSize: 12.5),
                    ),
                    const SizedBox(height: 8),

                    // Quick Note Chips
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: _quickNotes.map((note) {
                        return InkWell(
                          onTap: () {
                            if (_noteController.text.isEmpty) {
                              _noteController.text = note;
                            } else {
                              _noteController.text += ', $note';
                            }
                          },
                          borderRadius: BorderRadius.circular(4),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            ),
                            child: Text(
                              '+ $note',
                              style: const TextStyle(fontSize: 10.5, color: Color(0xFF475569), fontWeight: FontWeight.w500),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),

              const Divider(height: 1, color: Color(0xFFE2E8F0)),

              // Bottom Confirmation Bar
              Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.table_restaurant, size: 16, color: Color(0xFF1B5E20)),
                            const SizedBox(width: 6),
                            Text(
                              '${I18n.t('orderForTableTitle')}: ${I18n.formatTableName(targetTable.name)}',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5, color: Color(0xFF1E293B)),
                            ),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(I18n.t('totalPrice'), style: const TextStyle(fontSize: 10.5, color: Color(0xFF64748B))),
                            Text(
                              currencyFormat.format(subtotal),
                              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(0xFF1B5E20)),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        // Nút 1: Thêm tiếp (nếu nhân viên muốn order tiếp món khác trước khi in báo bếp)
                        Expanded(
                          flex: 2,
                          child: OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              foregroundColor: const Color(0xFF475569),
                              backgroundColor: Colors.white,
                              side: const BorderSide(color: Color(0xFFCBD5E1)),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            icon: const Icon(Icons.add, size: 15),
                            label: Text(
                              I18n.t('addMore'),
                              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12),
                            ),
                            onPressed: () => _handleAddDish(targetTable, autoOpenKitchen: false),
                          ),
                        ),
                        const SizedBox(width: 8),
                        // Nút 2: Nút chính In & Báo Bếp ngay lập tức - Tự động hiển thị popup báo bếp không cần bấm rườm rà
                        Expanded(
                          flex: 3,
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF1B5E20),
                              foregroundColor: Colors.white,
                              elevation: 2,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            icon: const Icon(Icons.notifications_active, size: 16),
                            label: Text(
                              '${I18n.t('orderAndKitchen')} ${I18n.formatTableName(targetTable.name)}',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            onPressed: () => _handleAddDish(targetTable, autoOpenKitchen: true),
                          ),
                        ),
                      ],
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

  void _handleAddDish(DiningTable targetTable, {required bool autoOpenKitchen}) {
    final subtotal = _quantity * widget.product.price;
    ApiService.addDishToTable(
      _selectedTableId,
      widget.product,
      _quantity,
      _noteController.text.trim(),
    );
    targetTable.status = 'occupied';
    targetTable.itemCount += _quantity;
    targetTable.totalAmount += subtotal;

    Navigator.pop(context);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle_rounded, color: Colors.white, size: 18),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Đã thêm $_quantity x ${I18n.formatDishName(widget.product.name, widget.product.code)} vào ${I18n.formatTableName(targetTable.name)}!',
              ),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF1B5E20),
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 2),
      ),
    );
    widget.onDishAdded(targetTable, autoOpenKitchen: autoOpenKitchen);
  }
}

