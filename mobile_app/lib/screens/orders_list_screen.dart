import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/models.dart';
import '../services/i18n_service.dart';

class OrderSummaryModel {
  final int id;
  final String orderCode;
  final String tableName;
  final int tableId;
  final int guestCount;
  final int itemCount;
  final int totalAmount;
  final String status; // 'active', 'billing', 'completed'
  final String time;

  OrderSummaryModel({
    required this.id,
    required this.orderCode,
    required this.tableName,
    required this.tableId,
    required this.guestCount,
    required this.itemCount,
    required this.totalAmount,
    required this.status,
    required this.time,
  });
}

class OrdersListScreen extends StatefulWidget {
  final List<DiningTable> tables;
  final Function(DiningTable) onSelectTable;

  const OrdersListScreen({
    super.key,
    required this.tables,
    required this.onSelectTable,
  });

  @override
  State<OrdersListScreen> createState() => _OrdersListScreenState();
}

class _OrdersListScreenState extends State<OrdersListScreen> {
  final currencyFormat = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');
  String _selectedFilter = 'all'; // 'all', 'active', 'billing', 'completed'

  @override
  void initState() {
    super.initState();
    I18n.currentLocale.addListener(_onLocaleChanged);
  }

  @override
  void dispose() {
    I18n.currentLocale.removeListener(_onLocaleChanged);
    super.dispose();
  }

  void _onLocaleChanged() {
    if (mounted) setState(() {});
  }

  List<OrderSummaryModel> get _allOrders {
    List<OrderSummaryModel> list = [];

    // Derive active orders from tables
    for (var t in widget.tables) {
      if (t.status == 'occupied') {
        list.add(OrderSummaryModel(
          id: t.id + 100,
          orderCode: '#ORD-${t.id + 100}',
          tableName: t.name,
          tableId: t.id,
          guestCount: t.guestCount > 0 ? t.guestCount : 2,
          itemCount: t.itemCount > 0 ? t.itemCount : 2,
          totalAmount: t.totalAmount > 0 ? t.totalAmount : 228420,
          status: 'active',
          time: t.duration ?? '30p trước',
        ));
      } else if (t.status == 'billing') {
        list.add(OrderSummaryModel(
          id: t.id + 100,
          orderCode: '#ORD-${t.id + 100}',
          tableName: t.name,
          tableId: t.id,
          guestCount: t.guestCount > 0 ? t.guestCount : 4,
          itemCount: t.itemCount > 0 ? t.itemCount : 6,
          totalAmount: t.totalAmount > 0 ? t.totalAmount : 1890000,
          status: 'billing',
          time: 'Chờ tính',
        ));
      }
    }

    return list;
  }

  List<OrderSummaryModel> get _filteredOrders {
    if (_selectedFilter == 'all') return _allOrders;
    return _allOrders.where((o) => o.status == _selectedFilter).toList();
  }

  @override
  Widget build(BuildContext context) {
    final activeCount = _allOrders.where((o) => o.status == 'active').length;
    final billingCount = _allOrders.where((o) => o.status == 'billing').length;
    final completedCount = _allOrders.where((o) => o.status == 'completed').length;

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      body: SafeArea(
        child: Column(
          children: [
            // Top App Bar
            Container(
              color: const Color(0xFF0B1320),
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1B5E20),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.receipt_long, color: Colors.white, size: 20),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          I18n.t('navOrders').toUpperCase(),
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                            letterSpacing: 0.5,
                          ),
                        ),
                        Text(
                          I18n.t('oFollowOrders'),
                          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Filter Tabs
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              child: Row(
                children: [
                  _buildTab('all', '${I18n.t('kFilterAll')} (${_allOrders.length})'),
                  const SizedBox(width: 6),
                  _buildTab('active', '${I18n.t('oDining')} ($activeCount)'),
                  const SizedBox(width: 6),
                  _buildTab('billing', '${I18n.t('oPendingBilling')} ($billingCount)'),
                  const SizedBox(width: 6),
                  _buildTab('completed', '${I18n.t('oCompleted')} ($completedCount)'),
                ],
              ),
            ),

            const Divider(height: 1, color: Color(0xFFE2E8F0)),

            // Orders list
            Expanded(
              child: _filteredOrders.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.receipt_outlined, size: 48, color: Color(0xFFCBD5E1)),
                          const SizedBox(height: 8),
                          Text(I18n.t('oNoOrders'), style: const TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                        ],
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.all(12),
                      itemCount: _filteredOrders.length,
                      separatorBuilder: (context, index) => const SizedBox(height: 10),
                      itemBuilder: (context, idx) {
                        final order = _filteredOrders[idx];
                        return _buildOrderCard(order);
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTab(String key, String title) {
    final isSelected = _selectedFilter == key;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _selectedFilter = key),
        borderRadius: BorderRadius.circular(6),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 7),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(6),
            border: Border.all(
              color: isSelected ? const Color(0xFF0F172A) : const Color(0xFFE2E8F0),
            ),
          ),
          alignment: Alignment.center,
          child: Text(
            title,
            style: TextStyle(
              fontSize: 10.5,
              fontWeight: FontWeight.bold,
              color: isSelected ? Colors.white : const Color(0xFF475569),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildOrderCard(OrderSummaryModel order) {
    Color statusColor;
    String statusText;
    Color statusBg;

    if (order.status == 'active') {
      statusColor = const Color(0xFF1B5E20);
      statusBg = const Color(0xFFECFDF5);
      statusText = I18n.t('oDining');
    } else if (order.status == 'billing') {
      statusColor = const Color(0xFFD97706);
      statusBg = const Color(0xFFFFFBEB);
      statusText = I18n.t('oPendingBilling');
    } else {
      statusColor = const Color(0xFF64748B);
      statusBg = const Color(0xFFF1F5F9);
      statusText = I18n.t('oCompleted');
    }

    return InkWell(
      onTap: () {
        final table = widget.tables.firstWhere(
          (t) => t.id == order.tableId,
          orElse: () => widget.tables.first,
        );
        widget.onSelectTable(table);
      },
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: const Color(0xFFE2E8F0)),
          boxShadow: const [
            BoxShadow(color: Color(0x06000000), blurRadius: 4, offset: Offset(0, 2)),
          ],
        ),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0B1320),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        order.orderCode,
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      I18n.formatTableName(order.tableName),
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0F172A)),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: statusBg,
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: statusColor.withValues(alpha: 0.3)),
                  ),
                  child: Text(
                    statusText,
                    style: TextStyle(color: statusColor, fontSize: 10.5, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.people_outline, size: 14, color: Color(0xFF64748B)),
                    const SizedBox(width: 4),
                    Text('${order.guestCount} ${I18n.t('tableGuests')}', style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B))),
                    const SizedBox(width: 12),
                    const Icon(Icons.fastfood_outlined, size: 14, color: Color(0xFF64748B)),
                    const SizedBox(width: 4),
                    Text('${order.itemCount} ${I18n.t('tableItems')}', style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B))),
                    const SizedBox(width: 12),
                    const Icon(Icons.access_time, size: 14, color: Color(0xFF64748B)),
                    const SizedBox(width: 4),
                    Text(order.time, style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B))),
                  ],
                ),
                Text(
                  currencyFormat.format(order.totalAmount),
                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: Color(0xFF1B5E20)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
