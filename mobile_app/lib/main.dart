import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'models/models.dart';
import 'services/api_service.dart';
import 'services/i18n_service.dart';
import 'screens/order_detail_sheet.dart';
import 'screens/login_screen.dart';
import 'screens/menu_screen.dart';
import 'screens/kitchen_screen.dart';
import 'screens/orders_list_screen.dart';
import 'screens/profile_screen.dart';
import 'services/print_service.dart';
import 'widgets/kitchen_ticket_dialog.dart';

void main() {
  runApp(const AuraPosMobileApp());
}

class AuraPosMobileApp extends StatelessWidget {
  const AuraPosMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<String>(
      valueListenable: I18n.currentLocale,
      builder: (context, locale, _) {
        return MaterialApp(
          title: 'QUÁN TRÀ - POS',
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
          home: const PosRootController(),
        );
      },
    );
  }
}

class PosRootController extends StatefulWidget {
  const PosRootController({super.key});

  @override
  State<PosRootController> createState() => _PosRootControllerState();
}

class _PosRootControllerState extends State<PosRootController> {
  bool _isLoggedIn = false; // Bắt buộc đăng nhập khi vừa mở app

  @override
  void initState() {
    super.initState();
    I18n.currentLocale.addListener(_onLocaleChanged);
    ApiService.currentUser = null;
  }

  @override
  void dispose() {
    I18n.currentLocale.removeListener(_onLocaleChanged);
    super.dispose();
  }

  void _onLocaleChanged() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    if (!_isLoggedIn) {
      return LoginScreen(
        onLoginSuccess: (user) {
          setState(() {
            ApiService.currentUser = user;
            _isLoggedIn = true;
          });
        },
      );
    }

    return PosMainScreen(
      onLogout: () {
        setState(() {
          ApiService.currentUser = null;
          _isLoggedIn = false;
        });
      },
    );
  }
}

class PosMainScreen extends StatefulWidget {
  final VoidCallback onLogout;

  const PosMainScreen({super.key, required this.onLogout});

  @override
  State<PosMainScreen> createState() => _PosMainScreenState();
}

class _PosMainScreenState extends State<PosMainScreen> {
  int _selectedNavIndex = 0; // 0: Bàn, 1: Thực đơn, 2: Bếp & Bar, 3: Đơn hàng, 4: Cá nhân
  String _selectedArea = 'all';
  int _selectedTableId = 1; // BÀN 01 mặc định
  bool _isLoading = false;

  List<DiningTable> _tables = [];
  final currencyFormat = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');

  @override
  void initState() {
    super.initState();
    I18n.currentLocale.addListener(_onLocaleChanged);
    _loadTables();
  }

  @override
  void dispose() {
    I18n.currentLocale.removeListener(_onLocaleChanged);
    super.dispose();
  }

  void _onLocaleChanged() {
    if (mounted) setState(() {});
  }

  Future<void> _loadTables() async {
    setState(() => _isLoading = true);
    final data = await ApiService.fetchTables();
    if (mounted) {
      setState(() {
        _tables = data;
        _isLoading = false;
      });
    }
  }

  void _openOrderDetail(DiningTable table) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => OrderDetailSheet(
        table: table,
        allTables: _tables,
        onOrderUpdated: _loadTables,
        onOpenMenu: () {
          setState(() {
            _selectedTableId = table.id;
            _selectedNavIndex = 1; // Chuyển sang tab Thực đơn
          });
        },
      ),
    );
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

    // 2. Kích hoạt in lệnh báo bếp trực tiếp K80 ngầm, không mở popup hỏi khổ in
    try {
      await PrintService.autoPrintKitchenTicket(
        table: table,
        items: itemsToPrint,
      );
    } catch (_) {}

    _loadTables();

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
          backgroundColor: const Color(0xFF009688),
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 3),
        ),
      );
    }
  }

  void _openKitchenTicket(DiningTable table) {
    final items = ApiService.getTableItems(table.id);
    showDialog(
      context: context,
      builder: (ctx) => KitchenTicketDialog(
        table: table,
        items: items,
        onSentSuccess: _loadTables,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final selectedTable = _tables.firstWhere(
      (t) => t.id == _selectedTableId,
      orElse: () => _tables.isNotEmpty ? _tables.first : ApiService.getMockTables()[0],
    );

    final filteredTables = _tables.where((t) {
      if (_selectedArea == 'all') return true;
      return t.areaCode == _selectedArea;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      body: IndexedStack(
        index: _selectedNavIndex,
        children: [
          // 0. Tab Phòng bàn (Sơ đồ bàn)
          _buildRoomTab(selectedTable, filteredTables),

          // 1. Tab Thực đơn món
          MenuScreen(
            tables: _tables,
            selectedTableId: _selectedTableId,
            onTableSelected: (tableId) {
              setState(() => _selectedTableId = tableId);
            },
            onOrderUpdated: _loadTables,
            onOpenOrderDetail: () => _openOrderDetail(selectedTable),
          ),

          // 2. Tab Bếp & Bar (KDS)
          KitchenScreen(
            tables: _tables,
            onRefresh: _loadTables,
          ),

          // 3. Tab Đơn hàng
          OrdersListScreen(
            tables: _tables,
            onSelectTable: (table) {
              setState(() {
                _selectedTableId = table.id;
              });
              _openOrderDetail(table);
            },
          ),

          // 4. Tab Cá nhân
          ProfileScreen(
            onLogout: widget.onLogout,
          ),
        ],
      ),

      // Bottom Navigation Bar (5 tabs)
      bottomNavigationBar: _buildBottomNavigationBar(),
    );
  }

  // --- TAB 0: SƠ ĐỒ PHÒNG BÀN ---
  Widget _buildRoomTab(DiningTable selectedTable, List<DiningTable> filteredTables) {
    final tableItems = ApiService.getTableItems(selectedTable.id);
    final tableTotal = tableItems.isNotEmpty
        ? tableItems.fold(0, (sum, it) => sum + it.subtotal)
        : selectedTable.totalAmount;
    final tableCount = tableItems.isNotEmpty
        ? tableItems.fold(0, (sum, it) => sum + it.quantity)
        : selectedTable.itemCount;

    return SafeArea(
      child: Stack(
        children: [
          Column(
            children: [
              // 1. Top App Header Bar
              _buildTopAppBar(),

              // 2. View Switcher (Sơ đồ bàn F1 / Thực đơn món F2)
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
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
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

          // 6. Floating Sticky Order Bar (Bottom Summary) - Chỉ hiển thị khi bàn có món hoặc đang phục vụ
          if (tableCount > 0 || selectedTable.status != 'empty')
            Positioned(
              left: 12,
              right: 12,
              bottom: 8,
              child: _buildFloatingOrderBar(selectedTable, tableTotal, tableCount),
            ),
        ],
      ),
    );
  }

  // --- TOP APP BAR ---
  Widget _buildTopAppBar() {
    final user = ApiService.currentUser;
    final initials = user != null
        ? user.name.split(' ').last.substring(0, 1).toUpperCase()
        : 'TH';

    return Container(
      color: const Color(0xFF0B1320),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                width: 38,
                height: 38,
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
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        I18n.t('appName'),
                        style: const TextStyle(
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
                  Text(
                    I18n.t('branchName'),
                    style: const TextStyle(
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
              _circleButton(Icons.refresh, () => _loadTables()),
              const SizedBox(width: 8),
              _circleButton(Icons.notifications_none, () {
                setState(() => _selectedNavIndex = 2); // Đến Bếp & Bar
              }),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: () {
                  setState(() => _selectedNavIndex = 4); // Đến Cá nhân
                },
                child: Container(
                  width: 32,
                  height: 32,
                  decoration: const BoxDecoration(
                    color: Color(0xFF00897B),
                    shape: BoxShape.circle,
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    initials,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      fontSize: 12,
                    ),
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
              child: GestureDetector(
                onTap: () => setState(() => _selectedNavIndex = 0),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 7),
                  decoration: BoxDecoration(
                    color: _selectedNavIndex == 0 ? const Color(0xFF009688) : Colors.transparent,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.grid_view,
                        color: _selectedNavIndex == 0 ? Colors.white : const Color(0xFF94A3B8),
                        size: 15,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        I18n.t('f1TablePlan'),
                        style: TextStyle(
                          color: _selectedNavIndex == 0 ? Colors.white : const Color(0xFF94A3B8),
                          fontWeight: FontWeight.bold,
                          fontSize: 12.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            Expanded(
              child: GestureDetector(
                onTap: () => setState(() => _selectedNavIndex = 1),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 7),
                  decoration: BoxDecoration(
                    color: _selectedNavIndex == 1 ? const Color(0xFF009688) : Colors.transparent,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.menu_book_outlined,
                        color: _selectedNavIndex == 1 ? Colors.white : const Color(0xFF94A3B8),
                        size: 15,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        I18n.t('f2Menu'),
                        style: TextStyle(
                          color: _selectedNavIndex == 1 ? Colors.white : const Color(0xFF94A3B8),
                          fontWeight: FontWeight.w600,
                          fontSize: 12.5,
                        ),
                      ),
                    ],
                  ),
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
      {'code': 'all', 'label': I18n.t('allAreas')},
      {'code': 'floor_1', 'label': I18n.t('floor1')},
      {'code': 'floor_2', 'label': I18n.t('floor2')},
      {'code': 'vip', 'label': I18n.t('vipRoom')},
      {'code': 'garden', 'label': I18n.t('garden')},
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
    final emptyCount = _tables.where((t) => t.status == 'empty').length;
    final occupiedCount = _tables.where((t) => t.status == 'occupied').length;
    final billingCount = _tables.where((t) => t.status == 'billing').length;

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(14, 0, 14, 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              _statusIndicator(const Color(0xFF94A3B8), '${I18n.t('statusEmpty')}: $emptyCount'),
              const SizedBox(width: 10),
              _statusIndicator(const Color(0xFF009688), '${I18n.t('statusOccupied')}: $occupiedCount'),
              const SizedBox(width: 10),
              _statusIndicator(const Color(0xFFF59E0B), '${I18n.t('statusBilling')}: $billingCount'),
            ],
          ),
          GestureDetector(
            onTap: _loadTables,
            child: Row(
              children: [
                Text(
                  I18n.t('refresh'),
                  style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                ),
                const SizedBox(width: 2),
                const Icon(Icons.refresh, size: 13, color: Color(0xFF64748B)),
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

    final tableItems = ApiService.getTableItems(table.id);
    final displayAmount = tableItems.isNotEmpty
        ? tableItems.fold(0, (sum, it) => sum + it.subtotal)
        : table.totalAmount;
    final displayCount = tableItems.isNotEmpty
        ? tableItems.fold(0, (sum, it) => sum + it.quantity)
        : table.itemCount;

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
        _openOrderDetail(table);
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
                          const Icon(Icons.shopping_bag_outlined, size: 14, color: Color(0xFF38BDF8)),
                          const SizedBox(width: 4),
                          Text(
                            I18n.formatTableName(table.name),
                            style: const TextStyle(
                              color: Color(0xFF38BDF8),
                              fontWeight: FontWeight.w800,
                              fontSize: 13,
                            ),
                          ),
                        ] else if (isVip) ...[
                          const Icon(Icons.star, size: 13, color: Color(0xFFF59E0B)),
                          const SizedBox(width: 4),
                          Text(
                            I18n.formatTableName(table.name),
                            style: TextStyle(
                              color: textColor,
                              fontWeight: FontWeight.w800,
                              fontSize: 13,
                            ),
                          ),
                        ] else ...[
                          Text(
                            I18n.formatTableName(table.name),
                            style: TextStyle(
                              color: textColor,
                              fontWeight: FontWeight.w800,
                              fontSize: 13.5,
                            ),
                          ),
                        ],
                      ],
                    ),

                    if (table.duration != null && !isTakeaway)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                        decoration: BoxDecoration(
                          color: isBilling
                              ? const Color(0xFFFEF08A)
                              : const Color(0xFFDCFCE7),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          table.duration!,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: isBilling
                                ? const Color(0xFF854D0E)
                                : const Color(0xFF15803D),
                          ),
                        ),
                      )
                    else if (isEmpty)
                      Text(
                        '${table.capacity} ${I18n.t('tableSeats')}',
                        style: TextStyle(fontSize: 10.5, color: subtextColor),
                      ),
                  ],
                ),

                // Center Content: Status & Note
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (isSelected && (isOccupied || isBilling)) ...[
                      Text(
                        I18n.t('tableSelected'),
                        style: const TextStyle(
                          color: Color(0xFF009688),
                          fontSize: 10.5,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 2),
                    ],
                    if (isEmpty)
                      Text(
                        I18n.t('tableEmpty'),
                        style: TextStyle(
                          color: subtextColor,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      )
                    else ...[
                      Row(
                        children: [
                          Icon(
                            Icons.people_outline,
                            size: 13,
                            color: isTakeaway ? const Color(0xFF38BDF8) : const Color(0xFF009688),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '${table.guestCount > 0 ? table.guestCount : 2} ${I18n.t('tableGuests')} • $displayCount ${I18n.t('tableItems')}',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: subtextColor,
                            ),
                          ),
                        ],
                      ),
                      if (table.notes != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 2),
                          child: Text(
                            table.notes!,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(fontSize: 10.5, color: subtextColor),
                          ),
                        ),
                    ],
                  ],
                ),

                // Bottom Line: Total Price & Detail Link
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    if (isEmpty)
                      Text(
                        '--',
                        style: TextStyle(
                          color: subtextColor,
                          fontWeight: FontWeight.w600,
                          fontSize: 12,
                        ),
                      )
                    else
                      Text(
                        currencyFormat.format(displayAmount),
                        style: TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 13,
                          color: isTakeaway ? const Color(0xFF38BDF8) : const Color(0xFF0F172A),
                        ),
                      ),
                    Text(
                      I18n.t('tableDetails'),
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: isTakeaway ? const Color(0xFF38BDF8) : const Color(0xFF009688),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Selected Checkmark Badge
          if (isSelected)
            Positioned(
              top: -6,
              right: -6,
              child: Container(
                width: 20,
                height: 20,
                decoration: const BoxDecoration(
                  color: Color(0xFF009688),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check, color: Colors.white, size: 13),
              ),
            ),
        ],
      ),
    );
  }

  // --- FLOATING ORDER BAR ---
  Widget _buildFloatingOrderBar(DiningTable table, int totalAmount, int itemCount) {
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
      decoration: BoxDecoration(
        color: const Color(0xFF0B1422),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF1E2D4A), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.35),
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
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
                    '${I18n.formatTableName(table.name)} • $itemCount ${I18n.t('tableItems')}',
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
                  Text(
                    I18n.t('totalPayment'),
                    style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10.5),
                  ),
                  Text(
                    currencyFormat.format(totalAmount),
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
          Align(
            alignment: Alignment.centerLeft,
            child: Text(
              table.notes != null && table.notes!.isNotEmpty ? table.notes! : '${I18n.t('servingAt')} ${I18n.formatTableName(table.name)}',
              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10.5),
            ),
          ),
          const SizedBox(height: 8),

          // Bottom Buttons Row
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  icon: const Icon(Icons.notifications_none, size: 14),
                  label: Text(I18n.t('btnKitchen')),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white,
                    side: const BorderSide(color: Color(0xFF243B5C)),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    backgroundColor: const Color(0xFF172942),
                    textStyle: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold),
                  ),
                  onPressed: () => _handleDirectSendKitchen(table),
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
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.receipt_long, size: 14),
                      const SizedBox(width: 6),
                      Text(
                        I18n.t('btnCheckout'),
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(width: 4),
                      const Icon(Icons.chevron_right, size: 16),
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
        onTap: (index) {
          setState(() => _selectedNavIndex = index);
          if (index == 2) {
            _loadTables();
          }
        },
        backgroundColor: Colors.white,
        selectedItemColor: const Color(0xFF009688),
        unselectedItemColor: const Color(0xFF94A3B8),
        selectedFontSize: 10.5,
        unselectedFontSize: 10.5,
        type: BottomNavigationBarType.fixed,
        items: [
          BottomNavigationBarItem(
            icon: const Icon(Icons.grid_view),
            label: I18n.t('navTables'),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.menu_book),
            label: I18n.t('navMenu'),
          ),
          BottomNavigationBarItem(
            icon: const Stack(
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
            label: I18n.t('navKitchen'),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.receipt_outlined),
            label: I18n.t('navOrders'),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.person_outline),
            label: I18n.t('navProfile'),
          ),
        ],
      ),
    );
  }
}
