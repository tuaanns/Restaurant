import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/i18n_service.dart';
import '../services/print_service.dart';
import '../widgets/add_dish_dialog.dart';
import '../widgets/kitchen_ticket_dialog.dart';

class MenuScreen extends StatefulWidget {
  final List<DiningTable> tables;
  final int selectedTableId;
  final Function(int) onTableSelected;
  final VoidCallback onOrderUpdated;
  final VoidCallback onOpenOrderDetail;

  const MenuScreen({
    super.key,
    required this.tables,
    required this.selectedTableId,
    required this.onTableSelected,
    required this.onOrderUpdated,
    required this.onOpenOrderDetail,
  });

  @override
  State<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends State<MenuScreen> {
  final currencyFormat = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');
  final TextEditingController _searchController = TextEditingController();
  List<Category> _categories = [];
  bool _isLoading = true;
  String _selectedCategoryCode = 'all';
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    I18n.currentLocale.addListener(_onLocaleChanged);
    _loadMenu();
  }

  @override
  void dispose() {
    I18n.currentLocale.removeListener(_onLocaleChanged);
    _searchController.dispose();
    super.dispose();
  }

  void _onLocaleChanged() {
    if (mounted) setState(() {});
  }

  Future<void> _loadMenu() async {
    setState(() => _isLoading = true);
    final cats = await ApiService.fetchMenu();
    if (mounted) {
      setState(() {
        _categories = cats;
        _isLoading = false;
      });
    }
  }

  List<Product> get _filteredProducts {
    List<Product> list = [];
    for (var cat in _categories) {
      if (_selectedCategoryCode == 'all' || cat.code == _selectedCategoryCode) {
        list.addAll(cat.products);
      }
    }

    if (_searchQuery.trim().isNotEmpty) {
      final q = _searchQuery.toLowerCase().trim();
      list = list.where((p) => p.name.toLowerCase().contains(q) || p.code.toLowerCase().contains(q)).toList();
    }
    return list;
  }

  Future<void> _handleDirectSendKitchen(DiningTable table) async {
    final items = ApiService.getTableItems(table.id);
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
    await ApiService.sendToKitchen(table.id, orderId: table.orderId, tableName: table.name);

    // 2. Tự động kích hoạt in lệnh báo bếp trực tiếp K80 ngầm, không mở popup hỏi khổ in
    try {
      await PrintService.autoPrintKitchenTicket(
        table: table,
        items: itemsToPrint,
      );
    } catch (_) {}

    setState(() {});
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
                  'Đã tự động gửi & in báo bếp thành công cho ${I18n.formatTableName(table.name)} (${itemsToPrint.length} món)!',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ),
            ],
          ),
          backgroundColor: const Color(0xFF1B5E20),
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 3),
        ),
      );
    }
  }

  void _openAddDish(Product product) {
    showDialog(
      context: context,
      builder: (ctx) => AddDishDialog(
        product: product,
        tables: widget.tables,
        initialTableId: widget.selectedTableId,
        onDishAdded: (targetTable, {bool autoOpenKitchen = true}) {
          widget.onTableSelected(targetTable.id);
          setState(() {});
          widget.onOrderUpdated();
          if (autoOpenKitchen) {
            _handleDirectSendKitchen(targetTable);
          }
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final currentTable = widget.tables.firstWhere(
      (t) => t.id == widget.selectedTableId,
      orElse: () => widget.tables.isNotEmpty ? widget.tables.first : ApiService.getMockTables()[0],
    );

    final tableItems = ApiService.getTableItems(currentTable.id);
    final totalOrderAmount = tableItems.fold(0, (sum, it) => sum + it.subtotal);
    final totalItemsCount = tableItems.fold(0, (sum, it) => sum + it.quantity);
    final pendingItemsCount = tableItems.where((it) => it.status == 'new_pending').fold(0, (sum, it) => sum + it.quantity);

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      body: SafeArea(
        child: Stack(
          children: [
            Column(
              children: [
                // Top App Header
                Container(
                  color: const Color(0xFF0B1320),
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 10),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 32,
                            height: 32,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: const Color(0xFFD4AF37), width: 1.2),
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(7),
                              child: Image.asset('assets/images/logo.png', fit: BoxFit.cover),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  I18n.t('f2Menu'),
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 15,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                                Text(
                                  '${I18n.t('appName')} • ${I18n.t('branchName')}',
                                  style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                                ),
                              ],
                            ),
                          ),
                          // Table Selector Pill
                          InkWell(
                            onTap: () {
                              _showPickTableDialog();
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: const Color(0xFF1E293B),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: const Color(0xFF1B5E20), width: 1),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.table_restaurant, color: Color(0xFF66BB6A), size: 14),
                                  const SizedBox(width: 4),
                                  Text(
                                    I18n.formatTableName(currentTable.name),
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11.5),
                                  ),
                                  const SizedBox(width: 2),
                                  const Icon(Icons.arrow_drop_down, color: Color(0xFF94A3B8), size: 16),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),

                      // Search input
                      Container(
                        height: 38,
                        decoration: BoxDecoration(
                          color: const Color(0xFF131F33),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFF1E2D4A)),
                        ),
                        child: TextField(
                          controller: _searchController,
                          onChanged: (val) => setState(() => _searchQuery = val),
                          style: const TextStyle(color: Colors.white, fontSize: 13),
                          decoration: InputDecoration(
                            prefixIcon: const Icon(Icons.search, color: Color(0xFF94A3B8), size: 18),
                            suffixIcon: _searchQuery.isNotEmpty
                                ? IconButton(
                                    icon: const Icon(Icons.close, color: Color(0xFF94A3B8), size: 16),
                                    onPressed: () {
                                      _searchController.clear();
                                      setState(() => _searchQuery = '');
                                    },
                                  )
                                : null,
                            hintText: I18n.t('search'),
                            hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
                            border: InputBorder.none,
                            contentPadding: const EdgeInsets.symmetric(vertical: 8),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Category Tabs Filter
                Container(
                  color: Colors.white,
                  height: 44,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    children: [
                      _buildCategoryChip('all', '${I18n.t('all')} (${_categories.fold<int>(0, (sum, c) => sum + c.products.length)})'),
                      ..._categories.map((c) => _buildCategoryChip(c.code, '${I18n.formatCategoryName(c.name)} (${c.products.length})')),
                    ],
                  ),
                ),

                const Divider(height: 1, color: Color(0xFFE2E8F0)),

                // Dishes Grid
                Expanded(
                  child: _isLoading
                      ? const Center(child: CircularProgressIndicator(color: Color(0xFF1B5E20)))
                      : _filteredProducts.isEmpty
                          ? Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(Icons.search_off, size: 48, color: Color(0xFFCBD5E1)),
                                  const SizedBox(height: 8),
                                  Text(
                                    'Không tìm thấy món nào với từ khóa "$_searchQuery"',
                                    style: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
                                  ),
                                ],
                              ),
                            )
                          : GridView.builder(
                              padding: const EdgeInsets.fromLTRB(12, 12, 12, 90),
                              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                crossAxisSpacing: 10,
                                mainAxisSpacing: 10,
                                childAspectRatio: 1.4,
                              ),
                              itemCount: _filteredProducts.length,
                              itemBuilder: (context, index) {
                                final p = _filteredProducts[index];
                                return _buildDishCard(p);
                              },
                            ),
                ),
              ],
            ),

            // Floating Order Summary Bar
            if (totalItemsCount > 0)
              Positioned(
                left: 12,
                right: 12,
                bottom: 8,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.25),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFFD4AF37), width: 1.2),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x33D4AF37),
                              blurRadius: 4,
                              offset: Offset(0, 1),
                            ),
                          ],
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(7),
                          child: Image.asset('assets/images/logo.png', fit: BoxFit.cover),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              '${I18n.formatTableName(currentTable.name)} • $totalItemsCount ${I18n.t('tableItems')}',
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12.5),
                            ),
                            Text(
                              currencyFormat.format(totalOrderAmount),
                              style: const TextStyle(color: Color(0xFF34D399), fontWeight: FontWeight.w900, fontSize: 13),
                            ),
                          ],
                        ),
                      ),
                      // Button 1: In Báo Bếp trực tiếp
                      OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          backgroundColor: pendingItemsCount > 0 ? const Color(0xFF2E7D32) : const Color(0xFF1E293B),
                          foregroundColor: Colors.white,
                          side: BorderSide(
                            color: pendingItemsCount > 0 ? const Color(0xFF66BB6A) : const Color(0xFF334155),
                            width: pendingItemsCount > 0 ? 1.5 : 1,
                          ),
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        icon: Icon(
                          Icons.notifications_active,
                          size: 14,
                          color: pendingItemsCount > 0 ? const Color(0xFFA5D6A7) : const Color(0xFF94A3B8),
                        ),
                        label: Text(
                          pendingItemsCount > 0 ? 'Báo Bếp ($pendingItemsCount)' : I18n.t('btnKitchen'),
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11.5),
                        ),
                        onPressed: () => _handleDirectSendKitchen(currentTable),
                      ),
                      const SizedBox(width: 6),
                      // Button 2: Xem Đơn & Tính Tiền
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF1B5E20),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        icon: const Icon(Icons.receipt_long, size: 14),
                        label: Text(I18n.t('btnCheckout'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11.5)),
                        onPressed: widget.onOpenOrderDetail,
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryChip(String code, String label) {
    final isSelected = _selectedCategoryCode == code;
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: InkWell(
        onTap: () => setState(() => _selectedCategoryCode = code),
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF1B5E20) : const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isSelected ? const Color(0xFF1B5E20) : const Color(0xFFE2E8F0),
            ),
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: TextStyle(
              fontSize: 11.5,
              fontWeight: FontWeight.w600,
              color: isSelected ? Colors.white : const Color(0xFF475569),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDishCard(Product product) {
    return InkWell(
      onTap: () => _openAddDish(product),
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: const Color(0xFFE2E8F0)),
          boxShadow: const [
            BoxShadow(color: Color(0x06000000), blurRadius: 4, offset: Offset(0, 1)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Top Row: Dish Name + Circular Plus Icon
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    I18n.formatDishName(product.name, product.code),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                      color: Color(0xFF0F172A),
                      height: 1.25,
                    ),
                  ),
                ),
                const SizedBox(width: 6),
                Container(
                  width: 26,
                  height: 26,
                  decoration: const BoxDecoration(
                    color: Color(0xFFF1F5F9),
                    shape: BoxShape.circle,
                  ),
                  child: const Center(
                    child: Icon(Icons.add, size: 14, color: Color(0xFF1B5E20)),
                  ),
                ),
              ],
            ),

            // Middle Row: Product Code • Unit
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Text(
                '${product.code} • ${I18n.formatDishUnit(product.unit)}',
                style: const TextStyle(
                  fontSize: 11,
                  color: Color(0xFF94A3B8),
                  fontWeight: FontWeight.w500,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),

            // Bottom Row: Price + "+ Thêm" Pill Button
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Text(
                  currencyFormat.format(product.price),
                  style: const TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 13.5,
                    color: Color(0xFF1B5E20),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    '+ ${I18n.t('add')}',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF64748B),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showPickTableDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(I18n.t('selectTable'), style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
        content: SizedBox(
          width: 320,
          child: ListView.separated(
            shrinkWrap: true,
            itemCount: widget.tables.length,
            separatorBuilder: (context, index) => const Divider(height: 1),
            itemBuilder: (context, idx) {
              final t = widget.tables[idx];
              final isCur = t.id == widget.selectedTableId;
              return ListTile(
                dense: true,
                leading: Icon(
                  Icons.table_restaurant,
                  color: isCur ? const Color(0xFF1B5E20) : const Color(0xFF64748B),
                ),
                title: Text(I18n.formatTableName(t.name), style: TextStyle(fontWeight: isCur ? FontWeight.bold : FontWeight.normal)),
                subtitle: Text(t.status == 'occupied' ? '${I18n.t('statusOccupied')} (${t.notes ?? ""})' : I18n.t('tableEmpty')),
                trailing: isCur ? const Icon(Icons.check, color: Color(0xFF1B5E20)) : null,
                onTap: () {
                  Navigator.pop(ctx);
                  widget.onTableSelected(t.id);
                  setState(() {});
                },
              );
            },
          ),
        ),
      ),
    );
  }
}
