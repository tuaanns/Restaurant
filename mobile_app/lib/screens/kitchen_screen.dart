import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/i18n_service.dart';

class KitchenScreen extends StatefulWidget {
  final List<DiningTable> tables;
  final VoidCallback onRefresh;

  const KitchenScreen({
    super.key,
    required this.tables,
    required this.onRefresh,
  });

  @override
  State<KitchenScreen> createState() => _KitchenScreenState();
}

class _KitchenScreenState extends State<KitchenScreen> {
  String _filterStatus = 'all'; // 'all', 'pending', 'cooking', 'done'
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    I18n.currentLocale.addListener(_onLocaleChanged);
    _loadKitchenData();
  }

  @override
  void didUpdateWidget(covariant KitchenScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    _loadKitchenData();
  }

  @override
  void dispose() {
    I18n.currentLocale.removeListener(_onLocaleChanged);
    super.dispose();
  }

  void _onLocaleChanged() {
    if (mounted) setState(() {});
  }

  Future<void> _loadKitchenData() async {
    setState(() => _isLoading = true);
    await ApiService.fetchKitchenItems(tables: widget.tables);
    if (mounted) {
      setState(() => _isLoading = false);
    }
  }

  List<KitchenItemModel> get _filteredList {
    if (_filterStatus == 'all') return ApiService.kitchenItems;
    return ApiService.kitchenItems.where((it) => it.status == _filterStatus).toList();
  }

  Future<void> _updateStatus(KitchenItemModel item, String newStatus) async {
    await ApiService.updateKitchenStatus(item.id, newStatus);
    setState(() {});
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              newStatus == 'cooking' ? Icons.soup_kitchen_rounded : Icons.check_circle_rounded,
              color: Colors.white,
              size: 18,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                newStatus == 'cooking'
                    ? 'Bắt đầu nấu: ${item.dishName} (${item.tableName})'
                    : 'Đã hoàn tất ra món: ${item.dishName} (${item.tableName})',
              ),
            ),
          ],
        ),
        backgroundColor: newStatus == 'cooking' ? const Color(0xFF0284C7) : const Color(0xFF1B5E20),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final pendingCount = ApiService.kitchenItems.where((it) => it.status == 'pending').length;
    final cookingCount = ApiService.kitchenItems.where((it) => it.status == 'cooking').length;
    final doneCount = ApiService.kitchenItems.where((it) => it.status == 'done').length;

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
                      color: const Color(0xFFF59E0B),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.local_fire_department, color: Colors.white, size: 20),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${I18n.t('navKitchen').toUpperCase()} (KDS)',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                            letterSpacing: 0.5,
                          ),
                        ),
                        const Text(
                          'Theo dõi tiến độ chế biến và ra món các bàn',
                          style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.refresh, color: Color(0xFF94A3B8)),
                    onPressed: () async {
                      await _loadKitchenData();
                      widget.onRefresh();
                    },
                  ),
                ],
              ),
            ),

            // Status Filter Tabs
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              child: Row(
                children: [
                  _buildTab('all', '${I18n.t('kFilterAll')} (${ApiService.kitchenItems.length})', null),
                  const SizedBox(width: 6),
                  _buildTab('pending', '${I18n.t('kFilterPending')} ($pendingCount)', const Color(0xFFF59E0B)),
                  const SizedBox(width: 6),
                  _buildTab('cooking', '${I18n.t('kFilterCooking')} ($cookingCount)', const Color(0xFF0284C7)),
                  const SizedBox(width: 6),
                  _buildTab('done', '${I18n.t('kFilterDone')} ($doneCount)', const Color(0xFF1B5E20)),
                ],
              ),
            ),

            const Divider(height: 1, color: Color(0xFFE2E8F0)),

            // Kitchen Items List
            Expanded(
              child: _filteredList.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.check_circle_outline, size: 48, color: Color(0xFFCBD5E1)),
                          const SizedBox(height: 8),
                          Text(I18n.t('kNoItems'), style: const TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                        ],
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.all(12),
                      itemCount: _filteredList.length,
                      separatorBuilder: (context, index) => const SizedBox(height: 10),
                      itemBuilder: (context, idx) {
                        final item = _filteredList[idx];
                        return _buildKitchenCard(item);
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTab(String key, String title, Color? color) {
    final isSelected = _filterStatus == key;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _filterStatus = key),
        borderRadius: BorderRadius.circular(6),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 7),
          decoration: BoxDecoration(
            color: isSelected ? (color ?? const Color(0xFF0F172A)) : const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(6),
            border: Border.all(
              color: isSelected ? (color ?? const Color(0xFF0F172A)) : const Color(0xFFE2E8F0),
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

  Widget _buildKitchenCard(KitchenItemModel item) {
    Color statusColor;
    String statusText;
    IconData statusIcon;

    if (item.status == 'pending') {
      statusColor = const Color(0xFFD97706);
      statusText = I18n.t('kWaitingPrep');
      statusIcon = Icons.timer_outlined;
    } else if (item.status == 'cooking') {
      statusColor = const Color(0xFF0284C7);
      statusText = I18n.t('kFilterCooking');
      statusIcon = Icons.soup_kitchen_outlined;
    } else {
      statusColor = const Color(0xFF059669);
      statusText = I18n.t('kFilterDone');
      statusIcon = Icons.check_circle_outline;
    }

    return Container(
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Table & Time Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF0B1320),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.table_restaurant, color: Colors.white, size: 12),
                    const SizedBox(width: 4),
                    Text(
                      I18n.formatTableName(item.tableName),
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                    ),
                  ],
                ),
              ),
              Row(
                children: [
                  const Icon(Icons.access_time, size: 12, color: Color(0xFF94A3B8)),
                  const SizedBox(width: 4),
                  Text(item.time, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(color: statusColor.withValues(alpha: 0.3)),
                    ),
                    child: Row(
                      children: [
                        Icon(statusIcon, color: statusColor, size: 11),
                        const SizedBox(width: 3),
                        Text(
                          statusText,
                          style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 10),

          // Dish name and quantity
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(6),
                ),
                alignment: Alignment.center,
                child: Text(
                  '${item.quantity}x',
                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: Color(0xFF1B5E20)),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      I18n.formatDishName(item.dishName),
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5, color: Color(0xFF0F172A)),
                    ),
                    if (item.note.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 3),
                        child: Text(
                          '• ${item.note}',
                          style: const TextStyle(color: Color(0xFFEA580C), fontSize: 11.5, fontWeight: FontWeight.w500),
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 10),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
          const SizedBox(height: 8),

          // Action Buttons
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              if (item.status == 'pending')
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0284C7),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                    elevation: 0,
                  ),
                  icon: const Icon(Icons.soup_kitchen, size: 14),
                  label: Text(I18n.t('kStartCook'), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  onPressed: () => _updateStatus(item, 'cooking'),
                ),
              if (item.status == 'cooking')
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1B5E20),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                    elevation: 0,
                  ),
                  icon: const Icon(Icons.check_circle, size: 14),
                  label: Text(I18n.t('kFinishCook'), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  onPressed: () => _updateStatus(item, 'done'),
                ),
              if (item.status == 'done')
                OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF059669),
                    side: const BorderSide(color: Color(0xFF10B981)),
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                  ),
                  icon: const Icon(Icons.done_all, size: 13),
                  label: Text(I18n.t('kServed'), style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold)),
                  onPressed: null,
                ),
            ],
          ),
        ],
      ),
    );
  }
}
