import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'models/models.dart';
import 'services/api_service.dart';
import 'screens/order_detail_sheet.dart';

void main() {
  runApp(const AuraPosMobileApp());
}

class AuraPosMobileApp extends StatelessWidget {
  const AuraPosMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Aura Restaurant POS',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        fontFamily: 'Roboto',
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF009688),
          primary: const Color(0xFF009688),
          surface: const Color(0xFFF8FAFC),
        ),
        scaffoldBackgroundColor: const Color(0xFFF1F5F9),
        useMaterial3: true,
      ),
      home: const PosMainScreen(),
    );
  }
}

class PosMainScreen extends StatefulWidget {
  const PosMainScreen({super.key});

  @override
  State<PosMainScreen> createState() => _PosMainScreenState();
}

class _PosMainScreenState extends State<PosMainScreen> {
  int _selectedNavIndex = 0;
  String _selectedArea = 'all';
  int _selectedTableId = 3; // BÀN 03 mặc định được chọn
  bool _isLoading = false;

  List<DiningTable> _tables = [];
  final currencyFormat = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');

  @override
  void initState() {
    super.initState();
    _loadTables();
  }

  Future<void> _loadTables() async {
    setState(() => _isLoading = true);
    final data = await ApiService.fetchTables();
    setState(() {
      _tables = data;
      _isLoading = false;
    });
  }

  void _openOrderDetail(DiningTable table) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => OrderDetailSheet(
        table: table,
        onOrderUpdated: _loadTables,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final selectedTable = _tables.firstWhere(
      (t) => t.id == _selectedTableId,
      orElse: () => ApiService.getMockTables()[2],
    );

    final filteredTables = _tables.where((t) {
      if (_selectedArea == 'all') return true;
      return t.areaCode == _selectedArea;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      body: SafeArea(
        child: Stack(
          children: [
            Column(
              children: [
                // 1. Top App Header Bar (Dark Navy #0B1320)
                _buildTopAppBar(),

                // 2. View Switcher (Sơ đồ bàn / Thực đơn món)
                _buildViewSwitcher(),

                // 3. Floor / Area Filter Chips
                _buildAreaFilterChips(),

                // 4. Status Stats Bar
                _buildStatusBar(),

                // 5. 2-Column Tables Grid
                Expanded(
                  child: _isLoading
                      ? const Center(
                          child: CircularProgressIndicator(color: Color(0xFF009688)),
                        )
                      : RefreshIndicator(
                          onRefresh: _loadTables,
                          color: const Color(0xFF009688),
                          child: GridView.builder(
                            padding: const EdgeInsets.fromLTRB(14, 8, 14, 140),
                            gridDelegate:
                                const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              crossAxisSpacing: 12,
                              mainAxisSpacing: 12,
                              childAspectRatio: 1.08,
                            ),
                            itemCount: filteredTables.length,
                            itemBuilder: (context, index) {
                              final table = filteredTables[index];
                              return _buildTableCard(table);
                            },
                          ),
                        ),
                ),
              ],
            ),

            // 6. Floating Sticky Order Bar (Bottom Summary)
            Positioned(
              left: 12,
              right: 12,
              bottom: 8,
              child: _buildFloatingOrderBar(selectedTable),
            ),
          ],
        ),
      ),

      // 7. Bottom Navigation Bar (5 tabs)
      bottomNavigationBar: _buildBottomNavigationBar(),
    );
  }

  // --- TOP APP BAR ---
  Widget _buildTopAppBar() {
    return Container(
      color: const Color(0xFF0B1320),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              // Logo icon
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: const Color(0xFF004D40),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFF00796B), width: 1.2),
                ),
                child: const Icon(Icons.menu_book, color: Color(0xFF00C292), size: 20),
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Text(
                        'AURA RESTAURANT',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w800,
                          fontSize: 14.5,
                          letterSpacing: 0.3,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        width: 7,
                        height: 7,
                        decoration: const BoxDecoration(
                          color: Color(0xFF10B981),
                          shape: BoxShape.circle,
                        ),
                      ),
                    ],
                  ),
                  const Text(
                    'Chi nhánh 01 - Tràng Tiền',
                    style: TextStyle(
                      color: Color(0xFF00B488),
                      fontSize: 11.5,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ],
          ),

          // Action buttons & Avatar
          Row(
            children: [
              _circleButton(Icons.search, () {}),
              const SizedBox(width: 8),
              Stack(
                children: [
                  _circleButton(Icons.notifications_none, () {}),
                  Positioned(
                    top: 6,
                    right: 6,
                    child: Container(
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(
                        color: Color(0xFF10B981),
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 8),
              Container(
                width: 32,
                height: 32,
                decoration: const BoxDecoration(
                  color: Color(0xFF00897B),
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: const Text(
                  'TH',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _circleButton(IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          color: const Color(0xFF17263C),
          shape: BoxShape.circle,
          border: Border.all(color: const Color(0xFF243650), width: 0.8),
        ),
        child: Icon(icon, color: const Color(0xFF94A3B8), size: 16),
      ),
    );
  }

  // --- VIEW SWITCHER TABS ---
  Widget _buildViewSwitcher() {
    return Container(
      color: const Color(0xFF0B1320),
      padding: const EdgeInsets.fromLTRB(14, 0, 14, 10),
      child: Container(
        padding: const EdgeInsets.all(3),
        decoration: BoxDecoration(
          color: const Color(0xFF131F33),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 7),
                decoration: BoxDecoration(
                  color: const Color(0xFF009688),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.grid_view, color: Colors.white, size: 15),
                    SizedBox(width: 6),
                    Text(
                      'Sơ đồ bàn (F1)',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 12.5,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 7),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.menu_book_outlined,
                        color: Color(0xFF94A3B8), size: 15),
                    SizedBox(width: 6),
                    Text(
                      'Thực đơn món (F2)',
                      style: TextStyle(
                        color: Color(0xFF94A3B8),
                        fontWeight: FontWeight.w600,
                        fontSize: 12.5,
                      ),
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

  // --- AREA FILTER HORIZONTAL CHIPS ---
  Widget _buildAreaFilterChips() {
    final areas = [
      {'code': 'all', 'label': 'Tất cả (24)'},
      {'code': 'floor_1', 'label': 'Tầng 1 (8)'},
      {'code': 'floor_2', 'label': 'Tầng 2 (8)'},
      {'code': 'vip', 'label': 'Phòng VIP (4)'},
      {'code': 'garden', 'label': 'Sân vườn (4)'},
    ];

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 14),
        child: Row(
          children: areas.map((a) {
            final isSelected = _selectedArea == a['code'];
            return GestureDetector(
              onTap: () => setState(() => _selectedArea = a['code']!),
              child: Container(
                margin: const EdgeInsets.only(right: 8),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: BoxDecoration(
                  color: isSelected ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: isSelected ? const Color(0xFF0F172A) : const Color(0xFFE2E8F0),
                  ),
                ),
                child: Text(
                  a['label']!,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: isSelected ? Colors.white : const Color(0xFF475569),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  // --- STATS BAR ---
  Widget _buildStatusBar() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(14, 0, 14, 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              _statusIndicator(const Color(0xFF94A3B8), 'Trống: 16'),
              const SizedBox(width: 10),
              _statusIndicator(const Color(0xFF009688), 'Có khách: 6'),
              const SizedBox(width: 10),
              _statusIndicator(const Color(0xFFF59E0B), 'Chờ thanh toán: 2'),
            ],
          ),
          GestureDetector(
            onTap: _loadTables,
            child: const Row(
              children: [
                Text(
                  'Làm mới',
                  style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                ),
                SizedBox(width: 2),
                Icon(Icons.refresh, size: 13, color: Color(0xFF64748B)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _statusIndicator(Color color, String text) {
    return Row(
      children: [
        Container(
          width: 7,
          height: 7,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 4),
        Text(
          text,
          style: const TextStyle(fontSize: 11, color: Color(0xFF475569), fontWeight: FontWeight.w500),
        ),
      ],
    );
  }

  // --- TABLE CARD WIDGET ---
  Widget _buildTableCard(DiningTable table) {
    final isSelected = table.id == _selectedTableId;
    final isBilling = table.status == 'billing';
    final isOccupied = table.status == 'occupied';
    final isEmpty = table.status == 'empty';
    final isTakeaway = table.isTakeaway;
    final isVip = table.isVip;

    // Card Colors
    Color cardBg = Colors.white;
    Color borderColor = const Color(0xFFE2E8F0);
    Color textColor = const Color(0xFF0F172A);
    Color subtextColor = const Color(0xFF64748B);

    if (isTakeaway) {
      cardBg = const Color(0xFF14233C);
      borderColor = const Color(0xFF1E3557);
      textColor = Colors.white;
      subtextColor = const Color(0xFF94A3B8);
    } else if (isBilling) {
      cardBg = const Color(0xFFFFFDF0);
      borderColor = const Color(0xFFFDE047);
      textColor = const Color(0xFF713F12);
      subtextColor = const Color(0xFFA16207);
    } else if (isSelected) {
      borderColor = const Color(0xFF009688);
    }

    return GestureDetector(
      onTap: () {
        setState(() => _selectedTableId = table.id);
        if (!isEmpty) {
          _openOrderDetail(table);
        }
      },
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: cardBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isSelected ? const Color(0xFF009688) : borderColor,
                width: isSelected ? 2.2 : 1.2,
              ),
              boxShadow: [
                BoxShadow(
                  color: isSelected
                      ? const Color(0xFF009688).withValues(alpha: 0.18)
                      : Colors.black.withValues(alpha: 0.02),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                )
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Top Line: Name & Duration badge
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        if (isTakeaway) ...[
                          const Icon(Icons.shopping_bag_outlined,
                              size: 14, color: Color(0xFF38BDF8)),
                          const SizedBox(width: 4),
                          const Text(
                            'MANG VỀ',
                            style: TextStyle(
                              color: Color(0xFF38BDF8),
                              fontWeight: FontWeight.w800,
                              fontSize: 13,
                            ),
                          ),
                        ] else if (isVip) ...[
                          const Icon(Icons.star, size: 13, color: Color(0xFFF59E0B)),
                          const SizedBox(width: 4),
                          Text(
                            table.name,
                            style: TextStyle(
                              color: textColor,
                              fontWeight: FontWeight.w800,
                              fontSize: 13,
                            ),
                          ),
                        ] else ...[
                          Text(
                            table.name,
                            style: TextStyle(
                              color: textColor,
                              fontWeight: FontWeight.w800,
                              fontSize: 13.5,
                            ),
                          ),
                        ],
                      ],
                    ),

                    // Badge
                    if (table.duration != null && !isTakeaway)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                        decoration: BoxDecoration(
                          color: isBilling
                              ? const Color(0xFFFEF3C7)
                              : const Color(0xFFE6F7F5),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          table.duration!,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: isBilling
                                ? const Color(0xFFB45309)
                                : const Color(0xFF00796B),
                          ),
                        ),
                      )
                    else if (isTakeaway)
                      const Text(
                        'Đơn #108',
                        style: TextStyle(fontSize: 10, color: Color(0xFF93C5FD)),
                      )
                    else if (isBilling)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF3C7),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          'Chờ tính',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFB45309),
                          ),
                        ),
                      )
                    else if (isEmpty)
                      Text(
                        '${table.capacity} chỗ',
                        style: TextStyle(fontSize: 10, color: subtextColor),
                      ),
                  ],
                ),

                // Middle: Selected label or Guests / Notes
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (isSelected)
                      const Text(
                        '(ĐANG CHỌN)',
                        style: TextStyle(
                          color: Color(0xFF009688),
                          fontSize: 10.5,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    if (!isEmpty && !isTakeaway)
                      Text(
                        '👥 ${table.guestCount} khách${table.itemCount > 0 ? ' • ${table.itemCount} món' : ''}',
                        style: TextStyle(fontSize: 11, color: subtextColor),
                      ),
                    if (table.notes != null)
                      Text(
                        table.notes!,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 11,
                          color: isBilling
                              ? const Color(0xFFA16207)
                              : subtextColor,
                        ),
                      ),
                    if (isEmpty)
                      Text(
                        'Bàn trống',
                        style: TextStyle(fontSize: 11, color: subtextColor),
                      ),
                  ],
                ),

                // Bottom row: Amount & Dot indicator
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    if (!isEmpty)
                      Text(
                        currencyFormat.format(table.totalAmount),
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: textColor,
                        ),
                      )
                    else
                      Text(
                        '--',
                        style: TextStyle(fontSize: 13, color: subtextColor),
                      ),

                    // Dot indicator
                    if (isSelected)
                      GestureDetector(
                        onTap: () => _openOrderDetail(table),
                        child: const Text(
                          'CHI TIẾT →',
                          style: TextStyle(
                            color: Color(0xFF009688),
                            fontWeight: FontWeight.w700,
                            fontSize: 10.5,
                          ),
                        ),
                      )
                    else
                      Container(
                        width: 7,
                        height: 7,
                        decoration: BoxDecoration(
                          color: isOccupied
                              ? const Color(0xFF009688)
                              : isBilling
                                  ? const Color(0xFFF59E0B)
                                  : const Color(0xFFCBD5E1),
                          shape: BoxShape.circle,
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),

          // Green checkmark badge on top right for selected card
          if (isSelected)
            Positioned(
              top: -6,
              right: -6,
              child: Container(
                width: 18,
                height: 18,
                decoration: const BoxDecoration(
                  color: Color(0xFF009688),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check, color: Colors.white, size: 12),
              ),
            ),
        ],
      ),
    );
  }

  // --- FLOATING STICKY ORDER BAR ---
  Widget _buildFloatingOrderBar(DiningTable table) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF0F1D30),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF1E3557), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.35),
            blurRadius: 16,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Top Row: Table name & Total amount
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 7,
                    height: 7,
                    decoration: const BoxDecoration(
                      color: Color(0xFF10B981),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    '${table.name} • ${table.itemCount > 0 ? table.itemCount : 4} món',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
              Row(
                children: [
                  const Text(
                    'TỔNG THANH TOÁN: ',
                    style: TextStyle(color: Color(0xFF94A3B8), fontSize: 10.5),
                  ),
                  Text(
                    currencyFormat.format(table.totalAmount > 0 ? table.totalAmount : 461700),
                    style: const TextStyle(
                      color: Color(0xFF38BDF8),
                      fontWeight: FontWeight.w900,
                      fontSize: 13.5,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 2),
          const Align(
            alignment: Alignment.centerLeft,
            child: Text(
              'Anh Hoàng (0912.888.xxx)',
              style: TextStyle(color: Color(0xFF64748B), fontSize: 10.5),
            ),
          ),
          const SizedBox(height: 8),

          // Bottom Buttons Row
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  icon: const Icon(Icons.notifications_none, size: 14),
                  label: const Text('Báo Bếp'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white,
                    side: const BorderSide(color: Color(0xFF243B5C)),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    backgroundColor: const Color(0xFF172942),
                    textStyle: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold),
                  ),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('🔔 Đã gửi thông báo cho quầy bếp!'),
                        backgroundColor: Color(0xFF009688),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                flex: 2,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF009688),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  onPressed: () => _openOrderDetail(table),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.receipt_long, size: 14),
                      SizedBox(width: 6),
                      Text(
                        'Xem Đơn & Tính Tiền',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                      SizedBox(width: 4),
                      Icon(Icons.chevron_right, size: 16),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // --- BOTTOM NAVIGATION BAR ---
  Widget _buildBottomNavigationBar() {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFE2E8F0), width: 1)),
      ),
      child: BottomNavigationBar(
        currentIndex: _selectedNavIndex,
        onTap: (index) => setState(() => _selectedNavIndex = index),
        backgroundColor: Colors.white,
        selectedItemColor: const Color(0xFF009688),
        unselectedItemColor: const Color(0xFF94A3B8),
        selectedFontSize: 10.5,
        unselectedFontSize: 10.5,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.grid_view),
            label: 'Phòng bàn',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.menu_book),
            label: 'Thực đơn',
          ),
          BottomNavigationBarItem(
            icon: Stack(
              clipBehavior: Clip.none,
              children: [
                Icon(Icons.local_fire_department),
                Positioned(
                  top: -2,
                  right: -2,
                  child: CircleAvatar(
                    radius: 3,
                    backgroundColor: Color(0xFFF59E0B),
                  ),
                )
              ],
            ),
            label: 'Bếp & Bar',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.receipt_outlined),
            label: 'Đơn hàng',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            label: 'Cá nhân',
          ),
        ],
      ),
    );
  }
}
