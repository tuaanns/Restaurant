import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/i18n_service.dart';
import '../services/print_service.dart';
import '../widgets/flag_widget.dart';
import '../widgets/language_picker_sheet.dart';

class ProfileScreen extends StatefulWidget {
  final VoidCallback onLogout;

  const ProfileScreen({super.key, required this.onLogout});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  String _paperSize = 'K80 (80mm)';
  bool _autoPrintOnPayment = true;
  bool _autoSendKitchen = true;
  bool _cutPaper = true;
  bool _orderBell = true;
  bool _kitchenBell = true;
  bool _vibrate = true;

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

  @override
  Widget build(BuildContext context) {
    final user = ApiService.currentUser ??
        User(
          id: 2,
          name: 'Thu Hằng',
          username: 'thuhang',
          role: 'cashier',
          shift: 'Ca sáng (07:00 - 15:00)',
          phone: '0912.345.678',
          email: 'thuhang@aura.vn',
        );

    final isAdmin = user.role == 'admin';
    final currentLang = I18n.currentLanguageItem;

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // ══════════════════════════════════════════════════════════════
              // 1. TOP HEADER BANNER (CÀI ĐẶT ỨNG DỤNG + USER PROFILE)
              // ══════════════════════════════════════════════════════════════
              Container(
                color: const Color(0xFF0B1320),
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 22),
                child: Column(
                  children: [
                    // Top line: CÀI ĐẶT ỨNG DỤNG & Version pill
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          I18n.t('appSettings'),
                          style: const TextStyle(
                            color: Color(0xFF94A3B8),
                            fontSize: 12.5,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.8,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3.5),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E293B),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFF334155), width: 0.8),
                          ),
                          child: const Text(
                            'v2.4.12',
                            style: TextStyle(
                              color: Color(0xFF94A3B8),
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 18),

                    // User Profile Row
                    InkWell(
                      onTap: () => _showAccountInfoSheet(context, user),
                      borderRadius: BorderRadius.circular(12),
                      child: Row(
                        children: [
                          Stack(
                            children: [
                              Container(
                                width: 58,
                                height: 58,
                                decoration: BoxDecoration(
                                  color: isAdmin ? const Color(0xFFF59E0B) : const Color(0xFF1B5E20),
                                  shape: BoxShape.circle,
                                  border: Border.all(color: Colors.white24, width: 2),
                                  boxShadow: [
                                    BoxShadow(
                                      color: (isAdmin ? const Color(0xFFF59E0B) : const Color(0xFF1B5E20)).withOpacity(0.35),
                                      blurRadius: 10,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                                alignment: Alignment.center,
                                child: Text(
                                  user.name.split(' ').last.substring(0, 1).toUpperCase(),
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              Positioned(
                                right: 0,
                                bottom: 0,
                                child: Container(
                                  width: 15,
                                  height: 15,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF10B981),
                                    shape: BoxShape.circle,
                                    border: Border.all(color: const Color(0xFF0B1320), width: 2.2),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Flexible(
                                      child: Text(
                                        user.name,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 17,
                                          fontWeight: FontWeight.bold,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                                      decoration: BoxDecoration(
                                        color: isAdmin ? const Color(0xFFF59E0B) : const Color(0xFF1B5E20),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Text(
                                        isAdmin ? I18n.t('roleAdmin') : I18n.t('roleCashier'),
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 9.5,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '@${user.username} • ${user.shift}',
                                  style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11.5),
                                ),
                                const SizedBox(height: 3),
                                Row(
                                  children: [
                                    Text(
                                      I18n.t('tapToViewProfile'),
                                      style: const TextStyle(
                                        color: Color(0xFF00B4D8),
                                        fontSize: 11.5,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    const SizedBox(width: 2),
                                    const Icon(Icons.chevron_right, color: Color(0xFF00B4D8), size: 14),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // ══════════════════════════════════════════════════════════════
              // 2. SETTINGS CONTENT LIST
              // ══════════════════════════════════════════════════════════════
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 28),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // NHÓM 1: TÀI KHOẢN & PHỤC VỤ
                    _buildSectionHeader(I18n.t('secAccount')),
                    _buildSettingsCard([
                      _buildSettingItem(
                        icon: Icons.person_pin_circle_outlined,
                        iconColor: const Color(0xFF2563EB),
                        iconBg: const Color(0xFFEFF6FF),
                        title: I18n.t('accountInfo'),
                        subtitle: I18n.t('accountInfoSub'),
                        trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8), size: 20),
                        onTap: () => _showAccountInfoSheet(context, user),
                      ),
                      _buildDivider(),
                      _buildSettingItem(
                        icon: Icons.bar_chart_rounded,
                        iconColor: const Color(0xFF059669),
                        iconBg: const Color(0xFFECFDF5),
                        title: I18n.t('shiftStats'),
                        subtitle: I18n.t('completedShiftSub'),
                        trailingWidget: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFECFDF5),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFFA7F3D0), width: 0.8),
                          ),
                          child: Text(
                            I18n.t('details'),
                            style: const TextStyle(
                              color: Color(0xFF047857),
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        onTap: () => _showShiftStatsSheet(context),
                      ),
                    ]),

                    const SizedBox(height: 20),

                    // NHÓM 2: HỆ THỐNG & CÀI ĐẶT
                    _buildSectionHeader(I18n.t('secSystem')),
                    _buildSettingsCard([
                      // Cài đặt ngôn ngữ (Language) - Flag chip instead of VN text
                      _buildSettingItem(
                        icon: Icons.language_rounded,
                        iconColor: const Color(0xFF7C3AED),
                        iconBg: const Color(0xFFF5F3FF),
                        title: I18n.t('langSettings'),
                        subtitle: I18n.t('langSettingsSubText'),
                        trailingWidget: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF3E8FF),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: const Color(0xFFDDD6FE), width: 1),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              FlagWidget(
                                code: currentLang.code,
                                size: 18,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                currentLang.name,
                                style: const TextStyle(
                                  color: Color(0xFF6B21A8),
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                        onTap: () => showLanguagePickerSheet(context, onLanguageChanged: () => setState(() {})),
                      ),
                      _buildDivider(),
                      // Chi nhánh & máy chủ
                      _buildSettingItem(
                        icon: Icons.store_outlined,
                        iconColor: const Color(0xFF0D9488),
                        iconBg: const Color(0xFFF0FDFA),
                        title: I18n.t('branchServer'),
                        subtitle: I18n.t('branchServerSubText'),
                        trailingWidget: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFECFDF5),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: const Color(0xFFA7F3D0), width: 0.8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 7,
                                height: 7,
                                decoration: const BoxDecoration(
                                  color: Color(0xFF10B981),
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 5),
                              Text(
                                I18n.t('onlineBadge'),
                                style: const TextStyle(
                                  color: Color(0xFF047857),
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                        onTap: () => _showBranchSheet(context),
                      ),
                      _buildDivider(),
                      // Cài đặt máy in
                      _buildSettingItem(
                        icon: Icons.print_outlined,
                        iconColor: const Color(0xFFEA580C),
                        iconBg: const Color(0xFFFFF7ED),
                        title: I18n.t('printerSettingsTitle'),
                        subtitle: I18n.t('printerSettingsDesc'),
                        trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8), size: 20),
                        onTap: () => _showPrinterSheet(context),
                      ),
                      _buildDivider(),
                      // Thông báo & Âm thanh
                      _buildSettingItem(
                        icon: Icons.notifications_none_rounded,
                        iconColor: const Color(0xFFD97706),
                        iconBg: const Color(0xFFFEF3C7),
                        title: I18n.t('notificationSettingsTitle'),
                        subtitle: I18n.t('notificationSettingsDesc'),
                        trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8), size: 20),
                        onTap: () => _showNotificationSheet(context),
                      ),
                      _buildDivider(),
                      // Hướng dẫn quy trình phục vụ
                      _buildSettingItem(
                        icon: Icons.menu_book_outlined,
                        iconColor: const Color(0xFF0284C7),
                        iconBg: const Color(0xFFF0F9FF),
                        title: I18n.t('serviceGuideTitle'),
                        subtitle: I18n.t('serviceGuideDesc'),
                        trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8), size: 20),
                        onTap: () => _showHelpSheet(context),
                      ),
                      _buildDivider(),
                      // Thông tin phần mềm
                      _buildSettingItem(
                        icon: Icons.info_outline_rounded,
                        iconColor: const Color(0xFF475569),
                        iconBg: const Color(0xFFF1F5F9),
                        title: I18n.t('softwareInfoTitle'),
                        subtitle: I18n.t('softwareInfoDesc'),
                        trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8), size: 20),
                        onTap: () => _showAboutSheet(context),
                      ),
                    ]),

                    const SizedBox(height: 26),

                    // NHÓM 3: NÚT ĐĂNG XUẤT (Khớp 100% mẫu thiết kế)
                    OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFFDC2626),
                        side: const BorderSide(color: Color(0xFFFECACA), width: 1.2),
                        backgroundColor: const Color(0xFFFFF5F5),
                        padding: const EdgeInsets.symmetric(vertical: 13),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        elevation: 0,
                      ),
                      icon: const Icon(Icons.logout_rounded, size: 18, color: Color(0xFFEF4444)),
                      label: Text(
                        I18n.t('logoutShiftBtn'),
                        style: const TextStyle(
                          color: Color(0xFFDC2626),
                          fontWeight: FontWeight.bold,
                          fontSize: 13.5,
                          letterSpacing: 0.3,
                        ),
                      ),
                      onPressed: () => _confirmLogout(context),
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

  // --- WIDGET HELPERS ---

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        title,
        style: const TextStyle(
          color: Color(0xFF64748B),
          fontSize: 11.5,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.6,
        ),
      ),
    );
  }

  Widget _buildSettingsCard(List<Widget> children) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x06000000),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(children: children),
    );
  }

  Widget _buildDivider() {
    return const Divider(height: 1, thickness: 1, indent: 64, endIndent: 16, color: Color(0xFFF1F5F9));
  }

  Widget _buildSettingItem({
    required IconData icon,
    required Color iconColor,
    required Color iconBg,
    required String title,
    required String subtitle,
    Widget? trailing,
    Widget? trailingWidget,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: iconBg,
                borderRadius: BorderRadius.circular(11),
              ),
              child: Icon(icon, color: iconColor, size: 21),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      color: Color(0xFF0F172A),
                      fontSize: 13.5,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      color: Color(0xFF64748B),
                      fontSize: 11.5,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            if (trailingWidget != null) ...[
              trailingWidget,
              const SizedBox(width: 4),
            ],
            trailing ?? const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8), size: 20),
          ],
        ),
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════
  // DETAIL BOTTOM SHEET 1: THÔNG TIN TÀI KHOẢN & HỒ SƠ
  // (Khớp 100% mẫu thiết kế trong Figma/Ảnh)
  // ═══════════════════════════════════════════════════════════
  void _showAccountInfoSheet(BuildContext context, User user) {
    final isAdmin = user.role == 'admin';
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
        ),
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
        child: SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildSheetHandle(),

              // Sheet Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    I18n.t('accountInfoTitle'),
                    style: const TextStyle(
                      fontSize: 16.5,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Color(0xFF64748B), size: 20),
                    onPressed: () => Navigator.pop(ctx),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Profile Card
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 28,
                      backgroundColor: isAdmin ? const Color(0xFFF59E0B) : const Color(0xFF1B5E20),
                      child: Text(
                        user.name.split(' ').last.substring(0, 1).toUpperCase(),
                        style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user.name,
                            style: const TextStyle(
                              fontSize: 16.5,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Icon(
                                isAdmin ? Icons.admin_panel_settings_rounded : Icons.person_outline_rounded,
                                size: 14,
                                color: isAdmin ? const Color(0xFFD97706) : const Color(0xFF1B5E20),
                              ),
                              const SizedBox(width: 4),
                              Text(
                                isAdmin ? I18n.t('roleAdminSystem') : I18n.t('roleCashierOrder'),
                                style: TextStyle(
                                  color: isAdmin ? const Color(0xFFD97706) : const Color(0xFF1B5E20),
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
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
                              const SizedBox(width: 5),
                              Text(
                                I18n.t('activeAccount'),
                                style: const TextStyle(
                                  color: Color(0xFF10B981),
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.w500,
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
              const SizedBox(height: 16),

              // Detail List - Clean borderless rows matching Figma mockup exactly
              _buildCleanPlainRow(I18n.t('username'), '@${user.username}'),
              _buildCleanPlainRow(I18n.t('empCode'), '#NV-00${user.id}'),
              _buildCleanPlainRow(I18n.t('phone'), user.phone ?? '0912.345.678'),
              _buildCleanPlainRow(I18n.t('email'), user.email ?? '${user.username}@aura.vn'),
              _buildCleanPlainRow(I18n.t('assignedShift'), user.shift),
              _buildCleanPlainRow(I18n.t('workBranch'), '103 Trần Hưng Đạo, Đặc khu Phú Quốc, Tỉnh An Giang'),
              _buildCleanPlainRow(I18n.t('checkinTime'), '07:00 ${I18n.t('today')}'),

              const SizedBox(height: 22),

              // Action Buttons Row (Đổi mật khẩu outline teal, Đóng dark filled)
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF1B5E20),
                        side: const BorderSide(color: Color(0xFF1B5E20), width: 1.2),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      icon: const Icon(Icons.sync_rounded, size: 18),
                      label: Text(I18n.t('changePassword'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5)),
                      onPressed: () {
                        Navigator.pop(ctx);
                        _showChangePasswordDialog(context);
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0F172A),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 13),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        elevation: 0,
                      ),
                      onPressed: () => Navigator.pop(ctx),
                      child: Text(I18n.t('close'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════
  // DETAIL BOTTOM SHEET 2: BÁO CÁO CA LÀM VIỆC
  // (Khớp 100% mẫu thiết kế trong Figma/Ảnh)
  // ═══════════════════════════════════════════════════════════
  void _showShiftStatsSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
        ),
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
        child: SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildSheetHandle(),

              // Sheet Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    I18n.t('shiftStatsTitle'),
                    style: const TextStyle(
                      fontSize: 16.5,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Color(0xFF64748B), size: 20),
                    onPressed: () => Navigator.pop(ctx),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // KPI Summary Cards
              Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.description_outlined, color: Color(0xFF64748B), size: 16),
                              const SizedBox(width: 6),
                              Text(I18n.t('completedOrders'), style: const TextStyle(fontSize: 12.5, color: Color(0xFF64748B))),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text('14 ${I18n.t('orderUnit')}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFECFDF5),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFA7F3D0)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.paid_rounded, color: Color(0xFF059669), size: 16),
                              const SizedBox(width: 6),
                              Text(I18n.t('shiftRevenue'), style: const TextStyle(fontSize: 12.5, color: Color(0xFF059669), fontWeight: FontWeight.bold)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          const Text('4.850.000 đ', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF059669))),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),

              Text(
                I18n.t('paymentBreakdown'),
                style: const TextStyle(
                  fontSize: 11.5,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF64748B),
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(height: 8),

              // Detail breakdown rows
              _buildBreakdownRow(
                icon: Icons.payments_outlined,
                iconColor: const Color(0xFF10B981),
                label: '${I18n.t('cashPayment')}:',
                mainValue: '2.150.000 đ',
                subValue: '(6 ${I18n.t('orderUnit')} - 44.3%)',
              ),
              _buildBreakdownRow(
                icon: Icons.qr_code_2_rounded,
                iconColor: const Color(0xFF6366F1),
                label: '${I18n.t('qrPayment')}:',
                mainValue: '2.700.000 đ',
                subValue: '(8 ${I18n.t('orderUnit')} - 55.7%)',
              ),
              _buildBreakdownRow(
                icon: Icons.credit_card_rounded,
                iconColor: const Color(0xFF0284C7),
                label: '${I18n.t('cardPayment')}:',
                mainValue: '0 đ',
                subValue: '(0 ${I18n.t('orderUnit')})',
              ),
              _buildBreakdownRow(
                icon: Icons.hourglass_bottom_rounded,
                iconColor: const Color(0xFFD97706),
                label: '${I18n.t('activeTablesCount')}:',
                mainValue: '1 ${I18n.t('tableUnit')}',
                subValue: '(BÀN 01: 228.420 đ)',
              ),
              _buildBreakdownRow(
                icon: Icons.local_offer_outlined,
                iconColor: const Color(0xFFEA580C),
                label: '${I18n.t('discountAmount')}:',
                mainValue: '0 đ',
              ),
              _buildBreakdownRow(
                icon: Icons.access_time_rounded,
                iconColor: const Color(0xFF64748B),
                label: '${I18n.t('shiftStartTime')}:',
                mainValue: '07:00:15 ${I18n.t('today')}',
              ),

              const SizedBox(height: 20),

              // Print Report Button
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF00897B),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 13),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  elevation: 0,
                ),
                icon: const Icon(Icons.print_outlined, size: 19),
                label: Text(
                  I18n.t('printShiftReport'),
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5, letterSpacing: 0.5),
                ),
                onPressed: () {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Row(
                        children: [
                          Icon(Icons.print_rounded, color: Colors.white, size: 18),
                          SizedBox(width: 8),
                          Text('Đã gửi lệnh in phiếu kết ca (Z-Report) thành công!'),
                        ],
                      ),
                      backgroundColor: Color(0xFF00897B),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCleanPlainRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: Color(0xFF64748B),
              fontSize: 13,
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              color: Color(0xFF0F172A),
              fontSize: 13,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBreakdownRow({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String mainValue,
    String? subValue,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.5),
      child: Row(
        children: [
          Icon(icon, color: iconColor, size: 17),
          const SizedBox(width: 8),
          Text(
            label,
            style: const TextStyle(
              color: Color(0xFF334155),
              fontSize: 13,
            ),
          ),
          const Spacer(),
          RichText(
            textAlign: TextAlign.right,
            text: TextSpan(
              children: [
                TextSpan(
                  text: mainValue,
                  style: const TextStyle(
                    color: Color(0xFF0F172A),
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (subValue != null)
                  TextSpan(
                    text: ' $subValue',
                    style: const TextStyle(
                      color: Color(0xFF64748B),
                      fontSize: 12,
                      fontWeight: FontWeight.normal,
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // --- DETAIL BOTTOM SHEETS 3..6 ---

  void _showBranchSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
        child: SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildSheetHandle(),
              _buildSheetHeader('Chi nhánh & Máy chủ kết nối', ctx),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0FDFA),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF99F6E4)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.cloud_done_rounded, color: Color(0xFF0D9488), size: 28),
                    SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Đang đồng bộ thời gian thực', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F766E))),
                          SizedBox(height: 2),
                          Text('Độ trễ Ping: 12ms • Máy chủ MySQL 8.0', style: TextStyle(fontSize: 11.5, color: Color(0xFF115E59))),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),
              _buildIconDetailRow(icon: Icons.store, iconColor: const Color(0xFF0D9488), label: 'Tên quán', value: 'QUÁN TRÀ'),
              _buildIconDetailRow(icon: Icons.location_on, iconColor: const Color(0xFF0D9488), label: 'Địa chỉ', value: '103 Trần Hưng Đạo, Đặc khu Phú Quốc, Tỉnh An Giang'),
              _buildIconDetailRow(icon: Icons.phone, iconColor: const Color(0xFF0D9488), label: 'Hotline', value: '1900 6868'),
              _buildIconDetailRow(icon: Icons.link, iconColor: const Color(0xFF0D9488), label: 'API Base', value: ApiService.baseUrl),
              const SizedBox(height: 18),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0D9488),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                icon: const Icon(Icons.refresh_rounded, size: 18),
                label: const Text('KIỂM TRA LẠI KẾT NỐI MÁY CHỦ'),
                onPressed: () => Navigator.pop(ctx),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showPrinterSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setSheetState) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
          child: SafeArea(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _buildSheetHandle(),
                _buildSheetHeader('Cài đặt máy in & Phiếu in', ctx),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: ChoiceChip(
                        label: const Text('K80 (80mm)'),
                        selected: _paperSize == 'K80 (80mm)',
                        selectedColor: const Color(0xFFFFEDD5),
                        onSelected: (v) {
                          if (v) {
                            setState(() => _paperSize = 'K80 (80mm)');
                            setSheetState(() {});
                          }
                        },
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ChoiceChip(
                        label: const Text('K58 (58mm)'),
                        selected: _paperSize == 'K58 (58mm)',
                        selectedColor: const Color(0xFFFFEDD5),
                        onSelected: (v) {
                          if (v) {
                            setState(() => _paperSize = 'K58 (58mm)');
                            setSheetState(() {});
                          }
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Tự động in hóa đơn khi thanh toán', style: TextStyle(fontSize: 13)),
                  value: _autoPrintOnPayment,
                  activeColor: const Color(0xFFEA580C),
                  onChanged: (v) {
                    setState(() => _autoPrintOnPayment = v);
                    setSheetState(() {});
                  },
                ),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Tự động in phiếu khi Báo Bếp', style: TextStyle(fontSize: 13)),
                  value: _autoSendKitchen,
                  activeColor: const Color(0xFFEA580C),
                  onChanged: (v) {
                    setState(() => _autoSendKitchen = v);
                    setSheetState(() {});
                  },
                ),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Tự động cắt giấy khi in xong', style: TextStyle(fontSize: 13)),
                  value: _cutPaper,
                  activeColor: const Color(0xFFEA580C),
                  onChanged: (v) {
                    setState(() => _cutPaper = v);
                    setSheetState(() {});
                  },
                ),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFEA580C),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  icon: const Icon(Icons.print_rounded, size: 18),
                  label: const Text('IN THỬ PHIẾU HÓA ĐƠN TEST'),
                  onPressed: () async {
                    Navigator.pop(ctx);
                    await PrintService.printTestBill();
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showNotificationSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setSheetState) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
          child: SafeArea(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _buildSheetHandle(),
                _buildSheetHeader('Thông báo & Chuông báo', ctx),
                const SizedBox(height: 12),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Chuông báo order món mới', style: TextStyle(fontSize: 13)),
                  value: _orderBell,
                  activeColor: const Color(0xFFD97706),
                  onChanged: (v) {
                    setState(() => _orderBell = v);
                    setSheetState(() {});
                  },
                ),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Chuông báo bếp nấu xong món', style: TextStyle(fontSize: 13)),
                  value: _kitchenBell,
                  activeColor: const Color(0xFFD97706),
                  onChanged: (v) {
                    setState(() => _kitchenBell = v);
                    setSheetState(() {});
                  },
                ),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Rung phản hồi xúc giác', style: TextStyle(fontSize: 13)),
                  value: _vibrate,
                  activeColor: const Color(0xFFD97706),
                  onChanged: (v) {
                    setState(() => _vibrate = v);
                    setSheetState(() {});
                  },
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0F172A),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('Lưu cài đặt'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showHelpSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
        child: SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildSheetHandle(),
              _buildSheetHeader('Hướng dẫn quy trình phục vụ', ctx),
              const SizedBox(height: 12),
              _buildGuideItem('1', 'Chọn bàn trống', 'Tại màn hình "Phòng bàn", chọn bàn khách ngồi để bắt đầu mở order.'),
              _buildGuideItem('2', 'Gọi món & Tùy chọn', 'Nhấn "+ Thêm món" hoặc chuyển sang tab "Thực đơn", chọn số lượng và ghi chú riêng.'),
              _buildGuideItem('3', 'Báo Bếp / Quầy Bar', 'Nhấn nút "Báo Bếp" để gửi phiếu in danh sách món mới vào nhà bếp thực hiện.'),
              _buildGuideItem('4', 'In tạm tính & Thanh toán', 'Bấm "Xem Đơn & Tính Tiền" -> In phiếu tạm tính hoặc thu tiền mặt / Quét mã VietQR.'),
              const SizedBox(height: 16),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0F172A),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Đóng'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showAboutSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
        child: SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildSheetHandle(),
              _buildSheetHeader('Thông tin phần mềm', ctx),
              const SizedBox(height: 16),
              Center(
                child: Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFD4AF37), width: 1.2),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(15),
                    child: Image.asset('assets/images/logo.png', fit: BoxFit.cover),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              const Center(
                child: Text(
                  'QUÁN TRÀ - POS',
                  style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                ),
              ),
              const Center(
                child: Text('Phiên bản v2.4.12 (Build 20261105)', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
              ),
              const SizedBox(height: 16),
              _buildIconDetailRow(icon: Icons.verified_user, iconColor: const Color(0xFF0D9488), label: 'Bản quyền', value: '© 2026 Aura POS Software Ltd.'),
              _buildIconDetailRow(icon: Icons.support_agent, iconColor: const Color(0xFF0D9488), label: 'Hotline 24/7', value: '1900.6868'),
              _buildIconDetailRow(icon: Icons.language, iconColor: const Color(0xFF0D9488), label: 'Hệ sinh thái', value: 'Web & Mobile POS'),
              const SizedBox(height: 20),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0F172A),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Đóng'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // --- SUB DIALOGS ---

  void _showChangePasswordDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Đổi mật khẩu tài khoản', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              obscureText: true,
              decoration: InputDecoration(labelText: 'Mật khẩu hiện tại', prefixIcon: Icon(Icons.lock_outline)),
            ),
            SizedBox(height: 10),
            TextField(
              obscureText: true,
              decoration: InputDecoration(labelText: 'Mật khẩu mới', prefixIcon: Icon(Icons.key)),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Hủy')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF1B5E20), foregroundColor: Colors.white),
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Mật khẩu đã được cập nhật thành công!'), backgroundColor: Color(0xFF1B5E20)),
              );
            },
            child: const Text('Lưu'),
          ),
        ],
      ),
    );
  }

  void _confirmLogout(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: Color(0xFFEF4444)),
            SizedBox(width: 8),
            Text('Xác nhận đăng xuất?', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        content: const Text(
          'Bạn có chắc chắn muốn kết thúc ca làm việc và đăng xuất khỏi tài khoản này không?',
          style: TextStyle(fontSize: 13.5, color: Color(0xFF475569)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Hủy bỏ', style: TextStyle(color: Color(0xFF64748B))),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              ApiService.logout();
              widget.onLogout();
            },
            child: const Text('ĐĂNG XUẤT', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  // --- REUSABLE SHEET COMPONENTS ---

  Widget _buildSheetHandle() {
    return Center(
      child: Container(
        width: 36,
        height: 4,
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: const Color(0xFFCBD5E1),
          borderRadius: BorderRadius.circular(2),
        ),
      ),
    );
  }

  Widget _buildSheetHeader(String title, BuildContext ctx) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Text(
            title,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
          ),
        ),
        IconButton(
          icon: const Icon(Icons.close, color: Color(0xFF64748B), size: 20),
          onPressed: () => Navigator.pop(ctx),
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(),
        ),
      ],
    );
  }

  Widget _buildIconDetailRow({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String value,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 7),
      child: Row(
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(7),
            ),
            child: Icon(icon, color: iconColor, size: 15),
          ),
          const SizedBox(width: 10),
          Text(label, style: const TextStyle(color: Color(0xFF64748B), fontSize: 12.5)),
          const Spacer(),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: const TextStyle(color: Color(0xFF0F172A), fontSize: 12.5, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGuideItem(String step, String title, String desc) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 22,
            height: 22,
            decoration: const BoxDecoration(
              color: Color(0xFF1B5E20),
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: Text(step, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                const SizedBox(height: 2),
                Text(desc, style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B))),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
