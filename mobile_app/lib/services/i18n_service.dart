import 'package:flutter/material.dart';

class LanguageItem {
  final String code;
  final String name;
  final String localName;
  final String countryCode;

  const LanguageItem({
    required this.code,
    required this.name,
    required this.localName,
    required this.countryCode,
  });
}

class I18n {
  static final ValueNotifier<String> currentLocale = ValueNotifier<String>('vi');

  static String get currentLang => currentLocale.value;

  static final List<LanguageItem> languages = const [
    LanguageItem(code: 'vi', name: 'Tiếng Việt', localName: 'Tiếng Việt (Mặc định)', countryCode: 'VN'),
    LanguageItem(code: 'en', name: 'English', localName: 'English (US)', countryCode: 'US'),
    LanguageItem(code: 'ko', name: '한국어', localName: 'Korean', countryCode: 'KR'),
    LanguageItem(code: 'ru', name: 'Русский', localName: 'Russian', countryCode: 'RU'),
  ];

  static LanguageItem get currentLanguageItem {
    return languages.firstWhere((l) => l.code == currentLang, orElse: () => languages.first);
  }

  static void setLanguage(String code) {
    if (_translations.containsKey(code)) {
      currentLocale.value = code;
    }
  }

  static String t(String key) {
    final lang = currentLang;
    final dict = _translations[lang] ?? _translations['vi']!;
    return dict[key] ?? _translations['vi']?[key] ?? key;
  }

  // ════════════════════════════════════════════════════════════
  // LOOKUP MAPPINGS FOR TABLES, DISHES, CATEGORIES & UNITS
  // ════════════════════════════════════════════════════════════
  static final Map<String, String> dishCodeMap = {
    'mì xào bò thượng hạng': 'mxb01',
    'mi xao bo thuong hang': 'mxb01',
    'mxb01': 'mxb01',
    'cơm chiên hải sản hoàng kim': 'cchs02',
    'com chien hai san hoang kim': 'cchs02',
    'cchs02': 'cchs02',
    'cchs01': 'cchs02',
    'mì xào giòn hải sản': 'mxg03',
    'mi xao gion hai san': 'mxg03',
    'mxg03': 'mxg03',
    'cơm chiên dưa bò hà nội': 'ccdb04',
    'com chien dua bo ha noi': 'ccdb04',
    'ccdb04': 'ccdb04',
    'bò nướng tảng sốt tiêu xanh': 'bnt05',
    'bo nuong tang sot tieu xanh': 'bnt05',
    'bnt05': 'bnt05',
    'bò lúc lắc khoai tây': 'bll06',
    'bo luc lac khoai tay': 'bll06',
    'bò lúc lắc khoai tây chiên': 'bll06',
    'bo luc lac khoai tay chien': 'bll06',
    'bll06': 'bll06',
    'bll01': 'bll06',
    'gà nướng muối ớt tây bắc': 'gn07',
    'ga nuong muoi ot tay bac': 'gn07',
    'gà nướng thảo mộc mật ong': 'gn07',
    'ga nuong thao moc mat ong': 'gn07',
    'gn07': 'gn07',
    'gn01': 'gn07',
    'mực một nắng nướng sa tế': 'mnn06',
    'muc mot nang nuong sa te': 'mnn06',
    'mnn06': 'mnn06',
    'tôm sú nướng muối ớt': 'tsn08',
    'tom su nuong muoi ot': 'tsn08',
    'tôm sú hoàng bào sốt phô mai': 'tsn08',
    'tom su hoang bao sot pho mai': 'tsn08',
    'tsn08': 'tsn08',
    'ts01': 'tsn08',
    'salad cá hồi sốt mè rang': 'sch09',
    'salad ca hoi sot me rang': 'sch09',
    'salad cá hồi xông khói sốt chanh leo': 'sch09',
    'salad ca hoi xong khoi sot chanh leo': 'sch09',
    'sch09': 'sch09',
    'sk01': 'sch09',
    'nộm củ hũ dừa tôm thịt': 'nchd10',
    'nom cu hu dua tom thit': 'nchd10',
    'nchd10': 'nchd10',
    'lẩu thái tomyum hải sản': 'lt07',
    'lau thai tomyum hai san': 'lt07',
    'lẩu hải sản chua cay thái tomyum': 'lt07',
    'lau hai san chua cay thai tomyum': 'lt07',
    'lt07': 'lt07',
    'lhs01': 'lt07',
    'lẩu riêu cua bắp bò sườn sụn': 'lrc11',
    'lau rieu cua bap bo suon sun': 'lrc11',
    'lrc11': 'lrc11',
    'nước cam ép tươi': 'nc03',
    'nuoc cam ep tuoi': 'nc03',
    'nước cam ép tươi nguyên chất': 'nc03',
    'nuoc cam ep tuoi nguyen chat': 'nc03',
    'nc03': 'nc03',
    'ce01': 'nc03',
    'trà đào cam sả thanh nhiệt': 'td08',
    'tra dao cam sa thanh nhiet': 'td08',
    'td08': 'td08',
    'td01': 'td08',
    'bia heineken silver (lon)': 'bia09',
    'bia heineken silver': 'bia09',
    'bia heineken lon 330ml': 'bia09',
    'bia09': 'bia09',
    'ken01': 'bia09',
    'sinh tố bơ sáp dừa non': 'stb12',
    'sinh to bo sap dua non': 'stb12',
    'stb12': 'stb12',
    'chè khúc bạch hạnh nhân': 'ckb13',
    'che khuc bach hanh nhan': 'ckb13',
    'ckb13': 'ckb13',
    'khăn lạnh thơm cao cấp': 'kl04',
    'khan lanh thom cao cap': 'kl04',
    'khăn lạnh thơm': 'kl04',
    'kl04': 'kl04',
    'kl01': 'kl04',
  };

  static final Map<String, String> categoryMap = {
    'món xào & cơm': 'cat_stir_rice',
    'mon xao & com': 'cat_stir_rice',
    'món xào và cơm': 'cat_stir_rice',
    'món bò & gà': 'cat_beef_chicken',
    'mon bo & ga': 'cat_beef_chicken',
    'món bò và gà': 'cat_beef_chicken',
    'hải sản & khai vị': 'cat_seafood_appetizer',
    'hai san & khai vi': 'cat_seafood_appetizer',
    'hải sản và khai vị': 'cat_seafood_appetizer',
    'món lẩu đặc biệt': 'cat_hotpot',
    'mon lau dac biet': 'cat_hotpot',
    'đồ uống & tráng miệng': 'cat_drinks_dessert',
    'do uong & trang mieng': 'cat_drinks_dessert',
    'đồ uống và tráng miệng': 'cat_drinks_dessert',
    'dịch vụ & khác': 'cat_services_other',
    'dich vu & khac': 'cat_services_other',
  };

  static final Map<String, String> unitMap = {
    'phần': 'portion',
    'phan': 'portion',
    'dĩa': 'plate',
    'dia': 'plate',
    'đĩa': 'plate',
    'nồi': 'pot',
    'noi': 'pot',
    'ly': 'glass',
    'lon': 'can',
    'chén': 'bowl',
    'chen': 'bowl',
    'bát': 'bowl',
    'bat': 'bowl',
    'cái': 'piece',
    'cai': 'piece',
    'nửa con': 'portion',
    'nua con': 'portion',
  };

  /// Đồng bộ tên bàn (BÀN 01 -> TABLE 01, MANG VỀ -> TAKEAWAY, ...)
  static String formatTableName(String? rawName) {
    if (rawName == null || rawName.isEmpty) return '';
    final trimmed = rawName.trim();
    final lower = trimmed.toLowerCase();

    // Takeaway (Mang về)
    if (lower == 'mang về' ||
        lower == 'mang ve' ||
        lower == 'takeaway' ||
        lower == '포장' ||
        lower == 'на вынос' ||
        lower.contains('mang về') ||
        lower.contains('mang ve')) {
      return t('takeaway');
    }

    // BÀN XX / BAN XX / TABLE XX / СТОЛ XX / 테이블 XX
    final tableReg = RegExp(r'^(bàn|ban|table|стол|테이블)\s*(\d+)', caseSensitive: false);
    final match = tableReg.firstMatch(lower);
    if (match != null) {
      final num = match.group(2) ?? '';
      return '${t('tablePrefix')} $num'.trim();
    }

    // VƯỜN X / VUON X / GARDEN X / 야외 X / САД X
    final gardenReg = RegExp(r'^(vườn|vuon|garden|야외|сад)\s*(\d+)', caseSensitive: false);
    final gMatch = gardenReg.firstMatch(lower);
    if (gMatch != null) {
      final num = gMatch.group(2) ?? '';
      return '${t('gardenPrefix')} $num'.trim();
    }

    // PHÒNG VIP X / PHONG VIP X / VIP ROOM X
    final vipRoomReg = RegExp(r'^(phòng\s*vip|phong\s*vip|vip\s*room)\s*(\d*)', caseSensitive: false);
    final vrMatch = vipRoomReg.firstMatch(lower);
    if (vrMatch != null) {
      final num = vrMatch.group(2) ?? '';
      return num.isNotEmpty ? '${t('vipRoom')} $num'.trim() : t('vipRoom');
    }

    // VIP X
    final vipReg = RegExp(r'^vip\s*(\d+)', caseSensitive: false);
    final vMatch = vipReg.firstMatch(lower);
    if (vMatch != null) {
      final num = vMatch.group(1) ?? '';
      return '${t('vipPrefix')} $num'.trim();
    }

    return rawName;
  }

  /// Đồng bộ tên món ăn (Mì xào bò -> Premium Stir-Fried Beef Noodles, ...)
  static String formatDishName(String? rawName, [String? code]) {
    if (rawName == null || rawName.isEmpty) return '';
    final lower = rawName.toLowerCase().trim();
    final cLower = code?.toLowerCase().trim() ?? '';
    String? key = dishCodeMap[lower] ?? (cLower.isNotEmpty ? dishCodeMap[cLower] : null);

    if (key == null) {
      if (lower.contains('mì xào bò') || lower.contains('mi xao bo')) {
        key = 'mxb01';
      } else if (lower.contains('cơm chiên hải sản') || lower.contains('com chien hai san')) {
        key = 'cchs02';
      } else if (lower.contains('mì xào giòn') || lower.contains('mi xao gion')) {
        key = 'mxg03';
      } else if (lower.contains('cơm chiên dưa bò') || lower.contains('com chien dua bo')) {
        key = 'ccdb04';
      } else if (lower.contains('bò nướng tảng') || lower.contains('bo nuong tang')) {
        key = 'bnt05';
      } else if (lower.contains('bò lúc lắc') || lower.contains('bo luc lac')) {
        key = 'bll06';
      } else if (lower.contains('gà nướng') || lower.contains('ga nuong')) {
        key = 'gn07';
      } else if (lower.contains('mực một nắng') || lower.contains('muc mot nang')) {
        key = 'mnn06';
      } else if (lower.contains('tôm sú') || lower.contains('tom su')) {
        key = 'tsn08';
      } else if (lower.contains('salad cá hồi') || lower.contains('salad ca hoi')) {
        key = 'sch09';
      } else if (lower.contains('nộm củ hũ dừa') || lower.contains('nom cu hu dua')) {
        key = 'nchd10';
      } else if (lower.contains('lẩu thái') || lower.contains('tomyum') || lower.contains('lau thai')) {
        key = 'lt07';
      } else if (lower.contains('lẩu riêu cua') || lower.contains('lau rieu cua')) {
        key = 'lrc11';
      } else if (lower.contains('nước cam') || lower.contains('nuoc cam')) {
        key = 'nc03';
      } else if (lower.contains('trà đào') || lower.contains('tra dao')) {
        key = 'td08';
      } else if (lower.contains('heineken')) {
        key = 'bia09';
      } else if (lower.contains('sinh tố bơ') || lower.contains('sinh to bo')) {
        key = 'stb12';
      } else if (lower.contains('khúc bạch') || lower.contains('khuc bach')) {
        key = 'ckb13';
      } else if (lower.contains('khăn lạnh') || lower.contains('khan lanh')) {
        key = 'kl04';
      }
    }

    if (key != null) {
      final translated = t('dish_$key');
      if (translated != 'dish_$key') return translated;
    }
    return rawName;
  }

  /// Đồng bộ danh mục món (Món xào & Cơm -> Stir-Fry & Rice, ...)
  static String formatCategoryName(String? rawCat) {
    if (rawCat == null || rawCat.isEmpty) return '';
    final lower = rawCat.toLowerCase().trim();
    String? key = categoryMap[lower];

    if (key == null) {
      if (lower.contains('xào') || lower.contains('cơm') || lower.contains('xao') || lower.contains('com')) {
        key = 'cat_stir_rice';
      } else if (lower.contains('bò') || lower.contains('gà') || lower.contains('bo') || lower.contains('ga')) {
        key = 'cat_beef_chicken';
      } else if (lower.contains('hải sản') || lower.contains('khai vị') || lower.contains('hai san')) {
        key = 'cat_seafood_appetizer';
      } else if (lower.contains('lẩu') || lower.contains('lau')) {
        key = 'cat_hotpot';
      } else if (lower.contains('uống') || lower.contains('tráng miệng') || lower.contains('uong')) {
        key = 'cat_drinks_dessert';
      } else if (lower.contains('dịch vụ') || lower.contains('khác') || lower.contains('dich vu')) {
        key = 'cat_services_other';
      }
    }

    if (key != null) {
      final translated = t(key);
      if (translated != key) return translated;
    }
    return rawCat;
  }

  /// Đồng bộ đơn vị tính (phần -> portion, dĩa -> plate, ly -> glass, ...)
  static String formatDishUnit(String? rawUnit) {
    if (rawUnit == null || rawUnit.isEmpty) return '';
    final lower = rawUnit.toLowerCase().trim();
    String? key = unitMap[lower];

    if (key == null) {
      if (lower.contains('phần') || lower.contains('phan') || lower.contains('nửa con') || lower.contains('nua con')) {
        key = 'portion';
      } else if (lower.contains('dĩa') || lower.contains('đĩa') || lower.contains('dia')) {
        key = 'plate';
      } else if (lower.contains('nồi') || lower.contains('noi')) {
        key = 'pot';
      } else if (lower.contains('ly')) {
        key = 'glass';
      } else if (lower.contains('lon')) {
        key = 'can';
      } else if (lower.contains('chén') || lower.contains('bát') || lower.contains('chen') || lower.contains('bat')) {
        key = 'bowl';
      } else if (lower.contains('cái') || lower.contains('cai')) {
        key = 'piece';
      }
    }

    if (key != null) {
      final translated = t('unit_$key');
      if (translated != 'unit_$key') return translated;
    }
    return rawUnit;
  }

  // --- COMPLETE MULTI-LANGUAGE DICTIONARY ---
  static final Map<String, Map<String, String>> _translations = {
    // ════════════════════════════════════════
    // 1. TIẾNG VIỆT (vi)
    // ════════════════════════════════════════
    'vi': {
      // Chung
      'appName': 'QUÁN TRÀ',
      'branchName': '103 Trần Hưng Đạo, Đặc khu Phú Quốc, Tỉnh An Giang',
      'close': 'Đóng',
      'cancel': 'Hủy',
      'confirm': 'Xác nhận',
      'save': 'Lưu',
      'add': 'Thêm',
      'refresh': 'Làm mới',
      'search': 'Tìm kiếm...',
      'loading': 'Đang tải...',
      'logout': 'Đăng xuất',
      'back': 'Quay lại',
      'online': 'Đang đồng bộ thời gian thực',
      'realtime': 'Realtime',

      // Đăng nhập
      'loginTitle': 'Đăng Nhập Tài Khoản',
      'loginSubtitle': 'Hệ Thống Thu Ngân & Phục Vụ Nhà Hàng',
      'loginPrompt': 'Chọn ca hoặc nhập tài khoản nhân viên của bạn',
      'username': 'Tên đăng nhập:',
      'password': 'Mật khẩu:',
      'usernameHint': 'Nhập tên đăng nhập...',
      'passwordHint': 'Nhập mật khẩu...',
      'loginBtn': 'ĐĂNG NHẬP POS',
      'loggingIn': 'Đang đăng nhập...',
      'quickDemo': 'Chọn nhanh tài khoản demo:',
      'adminRole': 'Quản lý (admin)',
      'cashierRole': 'Thu Hằng (thu ngân)',
      'serverRole': 'Minh Trí (phục vụ)',
      'loginEmptyErr': 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!',
      'selectLang': 'Cài đặt ngôn ngữ',
      'selectLangDesc': 'Chọn ngôn ngữ hiển thị cho giao diện POS (đồng bộ như bản website):',

      // Bottom Tabs
      'navTables': 'Phòng bàn',
      'navMenu': 'Thực đơn',
      'navKitchen': 'Bếp & Bar',
      'navOrders': 'Đơn hàng',
      'navProfile': 'Cá nhân',

      // Header & Khu vực
      'f1TablePlan': 'Sơ đồ bàn (F1)',
      'f2Menu': 'Thực đơn món (F2)',
      'allAreas': 'Tất cả (24)',
      'floor1': 'Tầng 1 (8)',
      'floor2': 'Tầng 2 (8)',
      'vipRoom': 'Phòng VIP (4)',
      'garden': 'Sân vườn (4)',

      // Trạng thái bàn
      'statusEmpty': 'Trống',
      'statusOccupied': 'Có khách',
      'statusBilling': 'Chờ thanh toán',
      'tableEmpty': 'Bàn trống',
      'tableTakeaway': 'MANG VỀ',
      'tableGuests': 'khách',
      'tableItems': 'món',
      'tableSeats': 'chỗ',
      'tableSelected': '(ĐANG CHỌN)',
      'tableDetails': 'CHI TIẾT →',
      'totalPayment': 'TỔNG THANH TOÁN: ',
      'btnKitchen': 'Báo Bếp',
      'btnCheckout': 'Xem Đơn & Tính Tiền',

      // Trang Cá nhân
      'profileTitle': 'Tài Khoản & Cá Nhân',
      'tapToViewProfile': 'Chạm để xem chi tiết hồ sơ',
      'secAccount': 'TÀI KHOẢN & PHỤC VỤ',
      'accountInfo': 'Thông tin tài khoản',
      'accountInfoSub': 'Họ tên, mã NV, phân quyền & bảo mật',
      'shiftStats': 'Báo cáo ca làm việc',
      'shiftStatsSub': '14 đơn hoàn tất • 4.850.000 đ',
      'secSystem': 'HỆ THỐNG & CÀI ĐẶT',
      'langSettings': 'Cài đặt ngôn ngữ',
      'langSettingsSub': 'Tùy chọn ngôn ngữ hiển thị POS',
      'branchServer': 'Chi nhánh & Máy chủ kết nối',
      'branchServerSub': 'Phú Quốc • 103 Trần Hưng Đạo',
      'printerSettings': 'Cài đặt máy in & Phiếu in',
      'printerSettingsSub': 'Khổ giấy K80 • Bếp & Hóa đơn',
      'soundSettings': 'Thông báo & Chuông báo',
      'soundSettingsSub': 'Âm báo gọi món, báo bếp, rung',
      'secHelp': 'HỖ TRỢ & PHẦN MỀM',
      'helpGuide': 'Hướng dẫn sử dụng & Phím tắt',
      'helpGuideSub': 'F1 Sơ đồ bàn, F2 Thực đơn, quy trình POS',
      'aboutApp': 'Thông tin ứng dụng',
      'aboutAppSub': 'QUÁN TRÀ POS Mobile v1.0.0 (Flutter)',
      'logoutBtn': 'ĐĂNG XUẤT TÀI KHOẢN',
      'confirmLogoutTitle': 'Xác nhận đăng xuất?',
      'confirmLogoutDesc': 'Bạn có chắc chắn muốn kết thúc ca làm việc và đăng xuất khỏi tài khoản này không?',
      'changePassword': 'Đổi mật khẩu',
      'printShiftReport': 'IN BÁO CÁO KẾT CA',
      'activeAccount': 'Tài khoản đang hoạt động',
      'cashPayment': 'Tiền mặt',
      'qrPayment': 'Chuyển khoản VietQR',
      'cardPayment': 'Quẹt thẻ ngân hàng',
      'activeTablesCount': 'Bàn đang có khách',
      'discountAmount': 'Tổng chiết khấu / Giảm giá',
      'shiftStartTime': 'Giờ mở ca thu ngân',
      'completedOrders': 'Đơn hoàn tất',
      'shiftRevenue': 'Doanh thu ca',
      'paymentBreakdown': 'PHÂN TÍCH PHƯƠNG THỨC THANH TOÁN',
      'empCode': 'Mã nhân viên:',
      'phone': 'Số điện thoại:',
      'email': 'Email công việc:',
      'assignedShift': 'Ca phân công:',
      'workBranch': 'Chi nhánh trực thuộc:',
      'checkinTime': 'Thời gian vào ca:',
      'appSettings': 'CÀI ĐẶT ỨNG DỤNG',
      'roleAdmin': 'QUẢN LÝ',
      'roleCashier': 'THU NGÂN',
      'roleCashierOrder': 'Nhân viên thu ngân / Order',
      'roleAdminSystem': 'Quản lý hệ thống (Admin)',
      'accountInfoTitle': 'Thông tin tài khoản & Hồ sơ',
      'shiftStatsTitle': 'Chi tiết báo cáo ca làm việc',
      'details': 'Chi tiết',
      'onlineBadge': 'Online',
      'printerSettingsTitle': 'Cài đặt máy in & Phiếu in',
      'printerSettingsDesc': 'Khổ giấy K80 (80mm) • Bếp & Hóa đơn',
      'notificationSettingsTitle': 'Thông báo & Chuông báo',
      'notificationSettingsDesc': 'Âm báo gọi món, báo bếp, rung',
      'serviceGuideTitle': 'Hướng dẫn quy trình phục vụ',
      'serviceGuideDesc': 'SOP order bàn, đổi món, in tạm tính',
      'softwareInfoTitle': 'Thông tin phần mềm',
      'softwareInfoDesc': 'Bản quyền, điều khoản & hỗ trợ kỹ thuật',
      'logoutShiftBtn': 'Đăng xuất khỏi ca làm việc',
      'orderUnit': 'đơn',
      'tableUnit': 'bàn',
      'today': 'hôm nay',
      'completedShiftSub': '14 đơn hoàn tất • 4.850.000 đ',
      'branchServerSubText': 'Phú Quốc • 103 Trần Hưng Đạo',
      'langSettingsSubText': 'Tùy chọn ngôn ngữ hiển...',
      'orderNum': 'Đơn',
      'orderTime': 'Thời gian',
      'justSeated': 'Mới vào',
      'addDishBtn': 'Thêm món',
      'noItemsOnTable': 'Bàn chưa có món nào!',
      'tapAddDishToOrder': 'Bấm "Thêm món" để gọi món vào bàn này',
      'openMenuToOrder': 'Mở Thực Đơn Gọi Món',
      'itemSentKitchen': 'Đã gửi bếp',
      'itemNewPending': 'Món mới',
      'subtotalPrice': 'Tạm tính:',
      'memberDiscount': 'Chiết khấu TV (5%):',
      'vatTaxRate': 'VAT (8%):',
      'printPreBillBtn': 'In Tạm Tính',
      'preBillTitle': 'Xem Trước Phiếu Tạm Tính',
      'printPreBillAction': 'In Phiếu Tạm Tính',
      'emptyOrderNotice': 'Bàn chưa có món ăn nào được gọi',
      'thankYouReceipt': 'Xin Cám Ơn & Hẹn Gặp Lại!!!',
      'orderSubtotal': 'Tổng tiền hàng:',
      'orderTotal': 'Tổng cộng:',
      'dishColName': 'Tên Hàng',
      'dishColPrice': 'Đ.Giá',
      'dishColQty': 'SL',
      'dishColSubtotal': 'Thành tiền',
      'payBtnText': 'THANH TOÁN (F9)',
      'notePrefix': 'Ghi chú',
      'orderForTableTitle': 'Gọi món cho bàn:',
      'portionQuantity': 'Số lượng phần:',
      'kitchenNotes': 'Ghi chú cho bếp / pha chế:',
      'totalPrice': 'Thành tiền:',
      'kFilterAll': 'Tất cả',
      'kFilterPending': 'Chờ làm',
      'kFilterCooking': 'Đang nấu',
      'kFilterDone': 'Đã xong',
      'kStartCook': 'Bắt Đầu Nấu',
      'kFinishCook': 'Xong & Ra Món',
      'kServed': 'Đã Phục Vụ Xong',
      'kNoItems': 'Không có món nào trong mục này!',
      'kWaitingPrep': 'Chờ chế biến',
      'oFollowOrders': 'Theo dõi hóa đơn phục vụ và lịch sử thu ngân',
      'oDining': 'Đang dùng bữa',
      'oPendingBilling': 'Chờ thanh toán',
      'oCompleted': 'Hoàn tất',
      'oNoOrders': 'Không có đơn hàng nào!',
      'kTicketTitle': 'Xuất Phiếu Báo Bếp (F10)',
      'kTicketHeader': 'PHIẾU BÁO BẾP / BAR',
      'kTicketStaff': 'Thu ngân:',
      'kTicketCode': 'Mã phiếu:',
      'kTicketStt': 'STT',
      'kTicketDish': 'Tên món',
      'kTicketQty': 'SL',
      'kTicketFooter': '*** XIN CẢM ƠN - BẾP LÀM NGAY ***',
      'kPrintAndSend': 'In & Gửi Bếp',
      'kSentSuccess': 'Đã in và gửi phiếu báo bếp thành công!',
      'addMore': 'Thêm tiếp',
      'addAndKitchen': 'Báo Bếp Ngay',
      'orderAndKitchen': 'Báo Bếp ->',
      'applyPromotion': 'Áp dụng Khuyến Mãi / CTKM',
      'choosePromotion': 'Chọn Khuyến Mãi',
      'promoDiscount': 'Khuyến mãi (CTKM):',
      'promotionTitle': 'Chương Trình Khuyến Mãi (CTKM)',
      'noPromotionAvail': 'Không có khuyến mãi khả dụng',
      'removePromotion': 'Bỏ khuyến mãi',
      'splitOrder': 'Tách Đơn',
      'splitOrderTitle': 'Tách Đơn Món Ăn',
      'splitOrderDesc': 'Chọn món và số lượng muốn tách sang đơn mới:',
      'splitToTable': 'Tách sang bàn / đơn:',
      'splitNewBill': 'Hóa đơn phụ mới (#SUB)',
      'confirmSplit': 'Xác Nhận Tách Đơn',
      'splitSuccess': 'Đã tách đơn thành công!',
      'minOrderCond': 'Đơn tối thiểu',
      'tablePrefix': 'BÀN',
      'gardenPrefix': 'VƯỜN',
      'roomPrefix': 'PHÒNG',
      'vipPrefix': 'VIP',
      'takeaway': 'MANG VỀ',
      'servingAt': 'Đang phục vụ tại',
      'dish_mxb01': 'Mì xào bò thượng hạng',
      'dish_cchs02': 'Cơm chiên hải sản Hoàng Kim',
      'dish_mxg03': 'Mì xào giòn hải sản',
      'dish_ccdb04': 'Cơm chiên dưa bò Hà Nội',
      'dish_bnt05': 'Bò nướng tảng sốt tiêu xanh',
      'dish_bll06': 'Bò lúc lắc khoai tây',
      'dish_gn07': 'Gà nướng muối ớt Tây Bắc',
      'dish_mnn06': 'Mực một nắng nướng sa tế',
      'dish_tsn08': 'Tôm sú nướng muối ớt',
      'dish_sch09': 'Salad cá hồi sốt mè rang',
      'dish_nchd10': 'Nộm củ hũ dừa tôm thịt',
      'dish_lt07': 'Lẩu Thái Tomyum hải sản',
      'dish_lrc11': 'Lẩu riêu cua bắp bò sườn sụn',
      'dish_nc03': 'Nước cam ép tươi',
      'dish_td08': 'Trà đào cam sả thanh nhiệt',
      'dish_bia09': 'Bia Heineken Silver (Lon)',
      'dish_stb12': 'Sinh tố bơ sáp dừa non',
      'dish_ckb13': 'Chè khúc bạch hạnh nhân',
      'dish_kl04': 'Khăn lạnh thơm cao cấp',
      'cat_stir_rice': 'Món xào & Cơm',
      'cat_beef_chicken': 'Món bò & Gà',
      'cat_seafood_appetizer': 'Hải sản & Khai vị',
      'cat_hotpot': 'Món lẩu đặc biệt',
      'cat_drinks_dessert': 'Đồ uống & Tráng miệng',
      'cat_services_other': 'Dịch vụ & Khác',
      'unit_portion': 'phần',
      'unit_plate': 'dĩa',
      'unit_pot': 'nồi',
      'unit_glass': 'ly',
      'unit_can': 'lon',
      'unit_bowl': 'chén',
      'unit_piece': 'cái',
    },

    // ════════════════════════════════════════
    // 2. ENGLISH (en)
    // ════════════════════════════════════════
    'en': {
      // Common
      'appName': 'QUAN TRA',
      'branchName': '103 Tran Hung Dao, Phu Quoc, An Giang',
      'close': 'Close',
      'cancel': 'Cancel',
      'confirm': 'Confirm',
      'save': 'Save',
      'add': 'Add',
      'refresh': 'Refresh',
      'search': 'Search...',
      'loading': 'Loading...',
      'logout': 'Logout',
      'back': 'Back',
      'online': 'Real-time synchronization active',
      'realtime': 'Realtime',

      // Login
      'loginTitle': 'System Login',
      'loginSubtitle': 'Restaurant POS & Cashier Management System',
      'loginPrompt': 'Select your shift or enter staff credentials',
      'username': 'Username:',
      'password': 'Password:',
      'usernameHint': 'Enter username...',
      'passwordHint': 'Enter password...',
      'loginBtn': 'LOGIN TO POS',
      'loggingIn': 'Logging in...',
      'quickDemo': 'Quick demo accounts:',
      'adminRole': 'Manager (admin)',
      'cashierRole': 'Thu Hang (cashier)',
      'serverRole': 'Minh Tri (waiter)',
      'loginEmptyErr': 'Please enter both username and password!',
      'selectLang': 'Language Settings',
      'selectLangDesc': 'Choose display language for POS interface (synchronized with Web):',

      // Bottom Tabs
      'navTables': 'Tables',
      'navMenu': 'Menu',
      'navKitchen': 'Kitchen',
      'navOrders': 'Orders',
      'navProfile': 'Profile',

      // Header & Areas
      'f1TablePlan': 'Table Plan (F1)',
      'f2Menu': 'Menu Items (F2)',
      'allAreas': 'All (24)',
      'floor1': 'Floor 1 (8)',
      'floor2': 'Floor 2 (8)',
      'vipRoom': 'VIP Room (4)',
      'garden': 'Garden (4)',

      // Table Status
      'statusEmpty': 'Empty',
      'statusOccupied': 'Occupied',
      'statusBilling': 'Billing',
      'tableEmpty': 'Empty table',
      'tableTakeaway': 'TAKEAWAY',
      'tableGuests': 'guests',
      'tableItems': 'items',
      'tableSeats': 'seats',
      'tableSelected': '(SELECTED)',
      'tableDetails': 'DETAILS →',
      'totalPayment': 'TOTAL PAYMENT: ',
      'btnKitchen': 'Send Kitchen',
      'btnCheckout': 'View Order & Pay',

      // Profile Screen
      'profileTitle': 'Account & Profile',
      'tapToViewProfile': 'Tap to view profile details',
      'secAccount': 'ACCOUNT & SERVICE',
      'accountInfo': 'Account Information',
      'accountInfoSub': 'Full name, staff ID, roles & security',
      'shiftStats': 'Shift Report',
      'shiftStatsSub': '14 completed orders • 4,850,000 VND',
      'secSystem': 'SYSTEM & SETTINGS',
      'langSettings': 'Language Settings',
      'langSettingsSub': 'Select POS display language',
      'branchServer': 'Branch & Server Connection',
      'branchServerSub': 'Phu Quoc • 103 Tran Hung Dao',
      'printerSettings': 'Printer & Receipt Settings',
      'printerSettingsSub': 'K80 Paper • Kitchen & Cashier',
      'soundSettings': 'Notifications & Sounds',
      'soundSettingsSub': 'Order bell, kitchen ready alert, vibration',
      'secHelp': 'SUPPORT & SOFTWARE',
      'helpGuide': 'User Guide & Shortcuts',
      'helpGuideSub': 'F1 Tables, F2 Menu, POS service flow',
      'aboutApp': 'About Application',
      'aboutAppSub': 'QUAN TRA POS Mobile v1.0.0 (Flutter)',
      'logoutBtn': 'LOGOUT ACCOUNT',
      'confirmLogoutTitle': 'Confirm Logout?',
      'confirmLogoutDesc': 'Are you sure you want to end your shift and logout from this account?',
      'changePassword': 'Change Password',
      'printShiftReport': 'PRINT SHIFT REPORT (Z-REPORT)',
      'activeAccount': 'Account is active',
      'cashPayment': 'Cash',
      'qrPayment': 'VietQR Transfer',
      'cardPayment': 'Credit / Debit Card',
      'activeTablesCount': 'Currently occupied tables',
      'discountAmount': 'Total Discount / Promotions',
      'shiftStartTime': 'Shift opened at',
      'completedOrders': 'Completed orders',
      'shiftRevenue': 'Shift revenue',
      'paymentBreakdown': 'PAYMENT METHOD ANALYSIS',
      'empCode': 'Staff ID:',
      'phone': 'Phone number:',
      'email': 'Work email:',
      'assignedShift': 'Assigned shift:',
      'workBranch': 'Work branch:',
      'checkinTime': 'Check-in time:',
      'appSettings': 'APP SETTINGS',
      'roleAdmin': 'MANAGER',
      'roleCashier': 'CASHIER',
      'roleCashierOrder': 'Cashier / Ordering Staff',
      'roleAdminSystem': 'System Manager (Admin)',
      'accountInfoTitle': 'Account & Profile Info',
      'shiftStatsTitle': 'Shift Report Details',
      'details': 'Details',
      'onlineBadge': 'Online',
      'printerSettingsTitle': 'Printer & Receipt Settings',
      'printerSettingsDesc': 'K80 Paper (80mm) • Kitchen & Receipts',
      'notificationSettingsTitle': 'Notifications & Ringers',
      'notificationSettingsDesc': 'Order alert, kitchen ready bell, vibrate',
      'serviceGuideTitle': 'Service Operating Guide',
      'serviceGuideDesc': 'SOP table ordering, dish change, pre-bill',
      'softwareInfoTitle': 'Software Information',
      'softwareInfoDesc': 'Copyright, terms & technical support',
      'logoutShiftBtn': 'Logout from work shift',
      'orderUnit': 'orders',
      'tableUnit': 'tables',
      'today': 'today',
      'completedShiftSub': '14 completed • 4,850,000 VND',
      'branchServerSubText': 'Phu Quoc • 103 Tran Hung Dao',
      'langSettingsSubText': 'Display language options...',
      'orderNum': 'Order',
      'orderTime': 'Time',
      'justSeated': 'Just seated',
      'addDishBtn': 'Add Dish',
      'noItemsOnTable': 'No items on this table yet!',
      'tapAddDishToOrder': 'Tap "Add Dish" to order for this table',
      'openMenuToOrder': 'Open Menu to Order',
      'itemSentKitchen': 'Sent to kitchen',
      'itemNewPending': 'New item',
      'subtotalPrice': 'Subtotal:',
      'memberDiscount': 'Member Discount (5%):',
      'vatTaxRate': 'VAT (8%):',
      'printPreBillBtn': 'Print Pre-bill',
      'preBillTitle': 'Preview Pre-bill',
      'printPreBillAction': 'Print Pre-bill',
      'emptyOrderNotice': 'No items ordered on this table',
      'thankYouReceipt': 'Thank You & See You Again!!!',
      'orderSubtotal': 'Subtotal:',
      'orderTotal': 'Total:',
      'dishColName': 'Item Name',
      'dishColPrice': 'Price',
      'dishColQty': 'Qty',
      'dishColSubtotal': 'Amount',
      'payBtnText': 'CHECKOUT (F9)',
      'notePrefix': 'Note',
      'orderForTableTitle': 'Order for table:',
      'portionQuantity': 'Portion quantity:',
      'kitchenNotes': 'Kitchen / Bar notes:',
      'totalPrice': 'Total price:',
      'kFilterAll': 'All',
      'kFilterPending': 'Pending',
      'kFilterCooking': 'Cooking',
      'kFilterDone': 'Done',
      'kStartCook': 'Start Cooking',
      'kFinishCook': 'Ready to Serve',
      'kServed': 'Served',
      'kNoItems': 'No items in this section!',
      'kWaitingPrep': 'Awaiting preparation',
      'oFollowOrders': 'Track table orders and checkout history',
      'oDining': 'Dining',
      'oPendingBilling': 'Pending billing',
      'oCompleted': 'Completed',
      'oNoOrders': 'No active orders!',
      'kTicketTitle': 'Kitchen Order Ticket (F10)',
      'kTicketHeader': 'KITCHEN / BAR TICKET',
      'kTicketStaff': 'Cashier:',
      'kTicketCode': 'Ticket Code:',
      'kTicketStt': 'No.',
      'kTicketDish': 'Dish Name',
      'kTicketQty': 'Qty',
      'kTicketFooter': '*** THANK YOU - COOK IMMEDIATELY ***',
      'kPrintAndSend': 'Print & Send Kitchen',
      'kSentSuccess': 'Kitchen ticket sent and printed successfully!',
      'addMore': 'Add More',
      'addAndKitchen': 'Kitchen Ticket',
      'orderAndKitchen': 'Kitchen ->',
      'applyPromotion': 'Apply Promotion / Discount',
      'choosePromotion': 'Select Promotion',
      'promoDiscount': 'Promotion Discount:',
      'promotionTitle': 'Promotion Programs (CTKM)',
      'noPromotionAvail': 'No active promotions available',
      'removePromotion': 'Remove Promotion',
      'splitOrder': 'Split Order',
      'splitOrderTitle': 'Split Table Order',
      'splitOrderDesc': 'Select items and quantities to split into a new order:',
      'splitToTable': 'Split to table / order:',
      'splitNewBill': 'New Sub-bill (#SUB)',
      'confirmSplit': 'Confirm Split Order',
      'splitSuccess': 'Order split successfully!',
      'minOrderCond': 'Min order',
      'tablePrefix': 'TABLE',
      'gardenPrefix': 'GARDEN',
      'roomPrefix': 'ROOM',
      'vipPrefix': 'VIP',
      'takeaway': 'TAKEAWAY',
      'servingAt': 'Serving at',
      'dish_mxb01': 'Premium Stir-Fried Beef Noodles',
      'dish_cchs02': 'Golden Seafood Fried Rice',
      'dish_mxg03': 'Crispy Fried Seafood Noodles',
      'dish_ccdb04': 'Hanoi Pickled Mustard & Beef Fried Rice',
      'dish_bnt05': 'Grilled Beef Steak with Green Pepper Sauce',
      'dish_bll06': 'Shaking Beef with French Fries',
      'dish_gn07': 'Northwest Chili Salt Grilled Chicken',
      'dish_mnn06': 'Grilled Sun-Dried Squid with Sate',
      'dish_tsn08': 'Grilled Tiger Prawns with Chili Salt',
      'dish_sch09': 'Salmon Salad with Roasted Sesame Dressing',
      'dish_nchd10': 'Coconut Heart Salad with Shrimp & Pork',
      'dish_lt07': 'Seafood Tom Yum Hotpot',
      'dish_lrc11': 'Crab Paste Hotpot with Beef Shank & Cartilage Ribs',
      'dish_nc03': 'Fresh Orange Juice',
      'dish_td08': 'Peach Orange Lemongrass Iced Tea',
      'dish_bia09': 'Heineken Silver Beer (Can)',
      'dish_stb12': 'Avocado Smoothie with Young Coconut',
      'dish_ckb13': 'Almond Khuc Bach Sweet Soup',
      'dish_kl04': 'Premium Scented Wet Wipe',
      'cat_stir_rice': 'Stir-Fry & Rice',
      'cat_beef_chicken': 'Beef & Chicken',
      'cat_seafood_appetizer': 'Seafood & Appetizers',
      'cat_hotpot': 'Special Hotpot',
      'cat_drinks_dessert': 'Drinks & Desserts',
      'cat_services_other': 'Services & Others',
      'unit_portion': 'portion',
      'unit_plate': 'plate',
      'unit_pot': 'pot',
      'unit_glass': 'glass',
      'unit_can': 'can',
      'unit_bowl': 'bowl',
      'unit_piece': 'piece',
    },

    // ════════════════════════════════════════
    // 3. KOREAN (ko)
    // ════════════════════════════════════════
    'ko': {
      // Common
      'appName': 'QUÁN TRÀ',
      'branchName': '103 Tran Hung Dao, Phu Quoc, An Giang',
      'close': '닫기',
      'cancel': '취소',
      'confirm': '확인',
      'save': '저장',
      'add': '추가',
      'refresh': '새로고침',
      'search': '검색...',
      'loading': '로딩 중...',
      'logout': '로그아웃',
      'back': '뒤로가기',
      'online': '실시간 동기화 정상 작동 중',
      'realtime': '실시간',

      // Login
      'loginTitle': '시스템 로그인',
      'loginSubtitle': '레스토랑 POS 및 주문 결제 시스템',
      'loginPrompt': '근무 교대를 선택하거나 직원 계정으로 로그인하세요',
      'username': '사용자 이름:',
      'password': '비밀번호:',
      'usernameHint': '사용자 이름 입력...',
      'passwordHint': '비밀번호 입력...',
      'loginBtn': 'POS 로그인',
      'loggingIn': '로그인 중...',
      'quickDemo': '빠른 데모 계정 선택:',
      'adminRole': '매니저 (admin)',
      'cashierRole': '투항 (캐셔)',
      'serverRole': '민찌 (서빙)',
      'loginEmptyErr': '사용자 이름과 비밀번호를 모두 입력해주세요!',
      'selectLang': '언어 설정',
      'selectLangDesc': 'POS 화면에 표시할 언어를 선택하세요 (웹 버전과 동기화됨):',

      // Bottom Tabs
      'navTables': '테이블',
      'navMenu': '메뉴',
      'navKitchen': '주방 & 바',
      'navOrders': '주문 내역',
      'navProfile': '내 정보',

      // Header & Areas
      'f1TablePlan': '테이블 배치도 (F1)',
      'f2Menu': '메뉴 목록 (F2)',
      'allAreas': '전체 (24)',
      'floor1': '1층 (8)',
      'floor2': '2층 (8)',
      'vipRoom': 'VIP룸 (4)',
      'garden': '가든 (4)',

      // Table Status
      'statusEmpty': '빈 테이블',
      'statusOccupied': '사용 중',
      'statusBilling': '결제 대기',
      'tableEmpty': '비어있음',
      'tableTakeaway': '포장 주문',
      'tableGuests': '명',
      'tableItems': '개',
      'tableSeats': '석',
      'tableSelected': '(선택됨)',
      'tableDetails': '상세 보기 →',
      'totalPayment': '총 결제 금액: ',
      'btnKitchen': '주방 주문',
      'btnCheckout': '주문 확인 & 결제',

      // Profile Screen
      'profileTitle': '계정 및 내 정보',
      'tapToViewProfile': '탭하여 프로필 상세 보기',
      'secAccount': '계정 및 근무',
      'accountInfo': '계정 정보',
      'accountInfoSub': '이름, 사번, 권한 및 보안 설정',
      'shiftStats': '교대 근무 보고서',
      'shiftStatsSub': '14건 주문 완료 • 4,850,000 VND',
      'secSystem': '시스템 및 설정',
      'langSettings': '언어 설정',
      'langSettingsSub': 'POS 인터페이스 표시 언어 선택',
      'branchServer': '지점 및 서버 연결 상태',
      'branchServerSub': '푸꾸옥 • 103 쩐흥다오',
      'printerSettings': '프린터 및 영수증 설정',
      'printerSettingsSub': 'K80 감열 용지 • 주방 및 계산서',
      'soundSettings': '알림 및 소리 설정',
      'soundSettingsSub': '주문 벨소리, 조리 완료 알림, 진동',
      'secHelp': '지원 및 소프트웨어',
      'helpGuide': '이용 가이드 & 단축키',
      'helpGuideSub': 'F1 테이블, F2 메뉴, POS 주문 절차',
      'aboutApp': '앱 정보',
      'aboutAppSub': 'QUÁN TRÀ POS 모바일 v1.0.0 (Flutter)',
      'logoutBtn': '계정 로그아웃',
      'confirmLogoutTitle': '로그아웃 확인?',
      'confirmLogoutDesc': '근무 교대를 종료하고 현재 계정에서 로그아웃하시겠습니까?',
      'changePassword': '비밀번호 변경',
      'printShiftReport': '교대 마감 보고서 출력 (Z-리포트)',
      'activeAccount': '정상 작동 중인 계정',
      'cashPayment': '현금 결제',
      'qrPayment': 'VietQR 계좌이체',
      'cardPayment': '신용 / 체크카드',
      'activeTablesCount': '현재 사용 중인 테이블',
      'discountAmount': '총 할인 금액',
      'shiftStartTime': '근무 시작 시간',
      'completedOrders': '완료된 주문',
      'shiftRevenue': '교대 총 매출',
      'paymentBreakdown': '결제 수단별 분석',
      'empCode': '직원 사번:',
      'phone': '전화번호:',
      'email': '업무용 이메일:',
      'assignedShift': '배정된 근무:',
      'workBranch': '소속 지점:',
      'checkinTime': '출근 시간:',
      'appSettings': '앱 설정',
      'roleAdmin': '관리자',
      'roleCashier': '계산원',
      'roleCashierOrder': '계산원 / 주문 접수',
      'roleAdminSystem': '시스템 관리자 (Admin)',
      'accountInfoTitle': '계정 및 프로필 정보',
      'shiftStatsTitle': '근무 교대 보고서 상세',
      'details': '자세히',
      'onlineBadge': '온라인',
      'printerSettingsTitle': '프린터 및 영수증 설정',
      'printerSettingsDesc': '용지 규격 K80 (80mm) • 주방 및 영수증',
      'notificationSettingsTitle': '알림 및 벨소리',
      'notificationSettingsDesc': '주문 알림음, 주방 완료 벨, 진동',
      'serviceGuideTitle': '서비스 운영 지침서',
      'serviceGuideDesc': '테이블 주문 SOP, 메뉴 변경, 임시 영수증',
      'softwareInfoTitle': '소프트웨어 정보',
      'softwareInfoDesc': '저작권, 이용약관 및 기술 지원',
      'logoutShiftBtn': '근무 교대에서 로그아웃',
      'orderUnit': '건',
      'tableUnit': '테이블',
      'today': '오늘',
      'completedShiftSub': '14건 완료 • 4,850,000동',
      'branchServerSubText': '푸꾸옥 • 103 쩐흥다오',
      'langSettingsSubText': '표시 언어 설정 옵션...',
      'orderNum': '주문',
      'orderTime': '시간',
      'justSeated': '방금 입장',
      'addDishBtn': '메뉴 추가',
      'noItemsOnTable': '아직 주문한 메뉴가 없습니다!',
      'tapAddDishToOrder': '"메뉴 추가"를 눌러 주문하세요',
      'openMenuToOrder': '메뉴판 열기',
      'itemSentKitchen': '주방 전송됨',
      'itemNewPending': '신규 메뉴',
      'subtotalPrice': '소계:',
      'memberDiscount': '회원 할인 (5%):',
      'vatTaxRate': '부가세 (8%):',
      'printPreBillBtn': '임시 영수증 출력',
      'preBillTitle': '임시 영수증 미리보기',
      'printPreBillAction': '임시 영수증 인쇄',
      'emptyOrderNotice': '주문된 메뉴가 없습니다',
      'thankYouReceipt': '감사합니다. 또 방문해 주세요!!!',
      'orderSubtotal': '주문 합계:',
      'orderTotal': '총 결제 금액:',
      'dishColName': '메뉴명',
      'dishColPrice': '단가',
      'dishColQty': '수량',
      'dishColSubtotal': '금액',
      'payBtnText': '결제하기 (F9)',
      'notePrefix': '요청사항',
      'orderForTableTitle': '주문 테이블 선택:',
      'portionQuantity': '수량:',
      'kitchenNotes': '주방 / 음료 요청사항:',
      'totalPrice': '합계 금액:',
      'kFilterAll': '전체',
      'kFilterPending': '대기 중',
      'kFilterCooking': '조리 중',
      'kFilterDone': '완료',
      'kStartCook': '조리 시작',
      'kFinishCook': '조리 완료 & 서빙',
      'kServed': '서빙 완료',
      'kNoItems': '해당 항목에 주문이 없습니다!',
      'kWaitingPrep': '조리 대기',
      'oFollowOrders': '주문 현황 및 결제 내역 확인',
      'oDining': '식사 중',
      'oPendingBilling': '결제 대기',
      'oCompleted': '완료',
      'oNoOrders': '주문 내역이 없습니다!',
      'kTicketTitle': '주방 주문서 출력 (F10)',
      'kTicketHeader': '주방 / 바 주문 전송표',
      'kTicketStaff': '계산원:',
      'kTicketCode': '주문번호:',
      'kTicketStt': '순번',
      'kTicketDish': '메뉴명',
      'kTicketQty': '수량',
      'kTicketFooter': '*** 감사합니다 - 즉시 조리 ***',
      'kPrintAndSend': '인쇄 및 주방 전송',
      'kSentSuccess': '주방 주문서 인쇄 및 전송 완료!',
      'addMore': '추가 계속',
      'addAndKitchen': '주방 전송',
      'orderAndKitchen': '주방 전송 ->',
      'applyPromotion': '프로모션 / 할인 적용',
      'choosePromotion': '프로모션 선택',
      'promoDiscount': '프로모션 할인:',
      'promotionTitle': '프로모션 프로그램',
      'noPromotionAvail': '사용 가능한 프로모션이 없습니다',
      'removePromotion': '프로모션 취소',
      'splitOrder': '주문 분할',
      'splitOrderTitle': '테이블 주문 분할',
      'splitOrderDesc': '새 주문으로 분할할 메뉴와 수량을 선택하세요:',
      'splitToTable': '분할할 테이블 / 주문:',
      'splitNewBill': '새 보조 주문서 (#SUB)',
      'confirmSplit': '주문 분할 확인',
      'splitSuccess': '주문이 성공적으로 분할되었습니다!',
      'minOrderCond': '최소 주문',
      'tablePrefix': '테이블',
      'gardenPrefix': '야외',
      'roomPrefix': '룸',
      'vipPrefix': 'VIP',
      'takeaway': '포장',
      'servingAt': '서비스 중:',
      'dish_mxb01': '프리미엄 소고기 볶음면',
      'dish_cchs02': '황금 해산물 볶음밥',
      'dish_mxg03': '바삭한 해산물 볶음면',
      'dish_ccdb04': '하노이식 갓김치 소고기 볶음밥',
      'dish_bnt05': '통 소고기 구이와 통후추 소스',
      'dish_bll06': '찹스테이크와 감자튀김',
      'dish_gn07': '북서부 칠리소금 구운 닭고기',
      'dish_mnn06': '반건조 오징어 사테 구이',
      'dish_tsn08': '블랙타이거 새우 칠리소금 구이',
      'dish_sch09': '연어 샐러드와 참깨 드레싱',
      'dish_nchd10': '코코넛 속대 새우 돼지고기 샐러드',
      'dish_lt07': '해산물 똠얌 태국식 전골',
      'dish_lrc11': '게살 소고기 연골 갈비 전골',
      'dish_nc03': '생 오렌지 주스',
      'dish_td08': '복숭아 오렌지 레몬그라스 티',
      'dish_bia09': '하이네켄 실버 맥주 (캔)',
      'dish_stb12': '아보카도 영코코넛 스무디',
      'dish_ckb13': '아몬드 젤리 디저트 (쿡바익)',
      'dish_kl04': '고급 향기 물티슈',
      'cat_stir_rice': '볶음 요리 및 밥류',
      'cat_beef_chicken': '소고기 및 닭고기 요리',
      'cat_seafood_appetizer': '해산물 및 에피타이저',
      'cat_hotpot': '스페셜 전골 요리',
      'cat_drinks_dessert': '음료 및 디저트',
      'cat_services_other': '기타 서비스',
      'unit_portion': '인분',
      'unit_plate': '접시',
      'unit_pot': '냄비',
      'unit_glass': '잔',
      'unit_can': '캔',
      'unit_bowl': '그릇',
      'unit_piece': '개',
    },

    // ════════════════════════════════════════
    // 4. RUSSIAN (ru)
    // ════════════════════════════════════════
    'ru': {
      // Common
      'appName': 'QUÁN TRÀ',
      'branchName': '103 Tran Hung Dao, Phu Quoc, An Giang',
      'close': 'Закрыть',
      'cancel': 'Отмена',
      'confirm': 'Подтвердить',
      'save': 'Сохранить',
      'add': 'Добавить',
      'refresh': 'Обновить',
      'search': 'Поиск...',
      'loading': 'Загрузка...',
      'logout': 'Выход',
      'back': 'Назад',
      'online': 'Синхронизация в реальном времени активна',
      'realtime': 'В сети',

      // Login
      'loginTitle': 'Вход в систему',
      'loginSubtitle': 'POS-система управления рестораном и кассой',
      'loginPrompt': 'Выберите смену или войдите под учетной записью сотрудника',
      'username': 'Имя пользователя:',
      'password': 'Пароль:',
      'usernameHint': 'Введите имя пользователя...',
      'passwordHint': 'Введите пароль...',
      'loginBtn': 'ВОЙТИ В POS',
      'loggingIn': 'Выполняется вход...',
      'quickDemo': 'Быстрый выбор демо-аккаунта:',
      'adminRole': 'Менеджер (admin)',
      'cashierRole': 'Тху Ханг (кассир)',
      'serverRole': 'Минь Чи (официант)',
      'loginEmptyErr': 'Пожалуйста, введите имя пользователя и пароль!',
      'selectLang': 'Настройки языка',
      'selectLangDesc': 'Выберите язык интерфейса POS (синхронизировано с веб-версией):',

      // Bottom Tabs
      'navTables': 'Столы',
      'navMenu': 'Меню',
      'navKitchen': 'Кухня и бар',
      'navOrders': 'Заказы',
      'navProfile': 'Профиль',

      // Header & Areas
      'f1TablePlan': 'Схема столов (F1)',
      'f2Menu': 'Меню блюд (F2)',
      'allAreas': 'Все (24)',
      'floor1': 'Этаж 1 (8)',
      'floor2': 'Этаж 2 (8)',
      'vipRoom': 'VIP-зал (4)',
      'garden': 'Сад (4)',

      // Table Status
      'statusEmpty': 'Свободно',
      'statusOccupied': 'Занято',
      'statusBilling': 'Оплата',
      'tableEmpty': 'Свободный стол',
      'tableTakeaway': 'НА ВЫНОС',
      'tableGuests': 'гостей',
      'tableItems': 'блюд',
      'tableSeats': 'мест',
      'tableSelected': '(ВЫБРАН)',
      'tableDetails': 'ДЕТАЛИ →',
      'totalPayment': 'ИТОГО К ОПЛАТЕ: ',
      'btnKitchen': 'На кухню',
      'btnCheckout': 'Заказ и оплата',

      // Profile Screen
      'profileTitle': 'Аккаунт и профиль',
      'tapToViewProfile': 'Нажмите для просмотра данных профиля',
      'secAccount': 'АККАУНТ И СМЕНА',
      'accountInfo': 'Данные аккаунта',
      'accountInfoSub': 'Имя, ID сотрудника, права и безопасность',
      'shiftStats': 'Отчет по смене',
      'shiftStatsSub': '14 выполненных заказов • 4 850 000 VND',
      'secSystem': 'СИСТЕМА И НАСТРОЙКИ',
      'langSettings': 'Настройки языка',
      'langSettingsSub': 'Выбор языка отображения интерфейса POS',
      'branchServer': 'Филиал и подключение к серверу',
      'branchServerSub': 'Фукуок • 103 Чан Хынг Дао',
      'printerSettings': 'Настройки принтера и чеков',
      'printerSettingsSub': 'Термобумага K80 • Кухня и чеки',
      'soundSettings': 'Уведомления и звуки',
      'soundSettingsSub': 'Звук заказа, готовности блюд, вибрация',
      'secHelp': 'ПОДДЕРЖКА И ПО',
      'helpGuide': 'Руководство и горячие клавиши',
      'helpGuideSub': 'F1 Столы, F2 Меню, процесс работы POS',
      'aboutApp': 'О приложении',
      'aboutAppSub': 'QUÁN TRÀ POS Mobile v1.0.0 (Flutter)',
      'logoutBtn': 'ВЫЙТИ ИЗ АККАУНТА',
      'confirmLogoutTitle': 'Подтвердить выход?',
      'confirmLogoutDesc': 'Вы уверены, что хотите завершить смену и выйти из системы?',
      'changePassword': 'Сменить пароль',
      'printShiftReport': 'ПЕЧАТЬ ОТЧЕТА СМЕНЫ (Z-ОТЧЕТ)',
      'activeAccount': 'Аккаунт активен',
      'cashPayment': 'Наличные',
      'qrPayment': 'Перевод VietQR',
      'cardPayment': 'Банковская карта',
      'activeTablesCount': 'Столов с гостями',
      'discountAmount': 'Общая скидка / Акции',
      'shiftStartTime': 'Время открытия смены',
      'completedOrders': 'Завершенных заказов',
      'shiftRevenue': 'Выручка за смену',
      'paymentBreakdown': 'АНАЛИЗ СПОСОБОВ ОПЛАТЫ',
      'empCode': 'ID сотрудника:',
      'phone': 'Телефон:',
      'email': 'Рабочий email:',
      'assignedShift': 'Назначенная смена:',
      'workBranch': 'Филиал работы:',
      'checkinTime': 'Время входа:',
      'appSettings': 'НАСТРОЙКИ ПРИЛОЖЕНИЯ',
      'roleAdmin': 'МЕНЕДЖЕР',
      'roleCashier': 'КАССИР',
      'roleCashierOrder': 'Кассир / Прием заказов',
      'roleAdminSystem': 'Системный администратор (Admin)',
      'accountInfoTitle': 'Данные аккаунта и профиля',
      'shiftStatsTitle': 'Детали отчета за смену',
      'details': 'Детали',
      'onlineBadge': 'Онлайн',
      'printerSettingsTitle': 'Настройки принтера и чеков',
      'printerSettingsDesc': 'Формат K80 (80мм) • Кухня и чеки',
      'notificationSettingsTitle': 'Уведомления и сигналы',
      'notificationSettingsDesc': 'Звук заказа, оповещение кухни, вибрация',
      'serviceGuideTitle': 'Руководство по обслуживанию',
      'serviceGuideDesc': 'SOP заказа столов, замена блюд, пречек',
      'softwareInfoTitle': 'Информация о программе',
      'softwareInfoDesc': 'Авторские права, условия и поддержка',
      'logoutShiftBtn': 'Выйти из рабочей смены',
      'orderUnit': 'зак.',
      'tableUnit': 'стол',
      'today': 'сегодня',
      'completedShiftSub': '14 выполненных • 4 850 000 đ',
      'branchServerSubText': 'Фукуок • 103 Чан Хынг Дао',
      'langSettingsSubText': 'Выбор языка интерфейса...',
      'orderNum': 'Заказ',
      'orderTime': 'Время',
      'justSeated': 'Только вошли',
      'addDishBtn': 'Добавить',
      'noItemsOnTable': 'На этом столе пока нет блюд!',
      'tapAddDishToOrder': 'Нажмите "Добавить", чтобы сделать заказ',
      'openMenuToOrder': 'Открыть меню',
      'itemSentKitchen': 'На кухне',
      'itemNewPending': 'Новое блюдо',
      'subtotalPrice': 'Подытог:',
      'memberDiscount': 'Скидка клиента (5%):',
      'vatTaxRate': 'НДС (8%):',
      'printPreBillBtn': 'Печать пречека',
      'preBillTitle': 'Предпросмотр пречека',
      'printPreBillAction': 'Печать пречека',
      'emptyOrderNotice': 'На этом столе нет заказанных блюд',
      'thankYouReceipt': 'Спасибо за визит, ждем вас снова!!!',
      'orderSubtotal': 'Подытог:',
      'orderTotal': 'Итого:',
      'dishColName': 'Наименование',
      'dishColPrice': 'Цена',
      'dishColQty': 'Кол-во',
      'dishColSubtotal': 'Сумма',
      'payBtnText': 'ОПЛАТА (F9)',
      'notePrefix': 'Примечание',
      'orderForTableTitle': 'Заказ для стола:',
      'portionQuantity': 'Количество порций:',
      'kitchenNotes': 'Примечание для кухни / бара:',
      'totalPrice': 'Сумма:',
      'kFilterAll': 'Все',
      'kFilterPending': 'Ожидает',
      'kFilterCooking': 'Готовится',
      'kFilterDone': 'Готово',
      'kStartCook': 'Начать готовку',
      'kFinishCook': 'Готово к подаче',
      'kServed': 'Подано',
      'kNoItems': 'В этом разделе нет блюд!',
      'kWaitingPrep': 'Ожидание',
      'oFollowOrders': 'Отслеживание заказов и история кассы',
      'oDining': 'Обслуживается',
      'oPendingBilling': 'Ожидает оплаты',
      'oCompleted': 'Завершено',
      'oNoOrders': 'Нет заказов!',
      'kTicketTitle': 'Заказ на кухню (F10)',
      'kTicketHeader': 'ЧЕК ЗАКАЗА НА КУХНЮ / БАР',
      'kTicketStaff': 'Кассир:',
      'kTicketCode': 'Код чека:',
      'kTicketStt': '№',
      'kTicketDish': 'Блюдо',
      'kTicketQty': 'Кол-во',
      'kTicketFooter': '*** СПАСИБО - ГОТОВИТЬ СЕЙЧАС ***',
      'kPrintAndSend': 'Печать и заказ на кухню',
      'kSentSuccess': 'Чек на кухню успешно отправлен и напечатан!',
      'addMore': 'Еще блюдо',
      'addAndKitchen': 'На кухню',
      'orderAndKitchen': 'На кухню ->',
      'applyPromotion': 'Применить акцию / скидку',
      'choosePromotion': 'Выбрать акцию',
      'promoDiscount': 'Скидка по акции:',
      'promotionTitle': 'Программы скидок и акций',
      'noPromotionAvail': 'Нет доступных акций',
      'removePromotion': 'Удалить скидку',
      'splitOrder': 'Разделить заказ',
      'splitOrderTitle': 'Разделение заказа',
      'splitOrderDesc': 'Выберите блюда и количество для нового заказа:',
      'splitToTable': 'Перенести на стол / заказ:',
      'splitNewBill': 'Новый подзаказ (#SUB)',
      'confirmSplit': 'Подтвердить разделение',
      'splitSuccess': 'Заказ успешно разделен!',
      'minOrderCond': 'Мин. заказ',
      'tablePrefix': 'СТОЛ',
      'gardenPrefix': 'САД',
      'roomPrefix': 'ЗАЛ',
      'vipPrefix': 'VIP',
      'takeaway': 'НА ВЫНОС',
      'servingAt': 'Обслуживание стола',
      'dish_mxb01': 'Премиум жареная лапша с говядиной',
      'dish_cchs02': 'Золотистый жареный рис с морепродуктами',
      'dish_mxg03': 'Хрустящая жареная лапша с морепродуктами',
      'dish_ccdb04': 'Ханойский жареный рис с говядиной и соленьями',
      'dish_bnt05': 'Стейк из говядины с соусом из зеленого перца',
      'dish_bll06': 'Говядина Люк-лак с картофелем фри',
      'dish_gn07': 'Курица гриль с солью и перцем по-северо-западному',
      'dish_mnn06': 'Кальмар на гриле в соусе сатэ',
      'dish_tsn08': 'Тигровые креветки на гриле с чили и солью',
      'dish_sch09': 'Салат с лососем и кунжутным соусом',
      'dish_nchd10': 'Салат из сердцевины кокосовой пальмы с креветками и свининой',
      'dish_lt07': 'Тайский горячий котел Том Ям с морепродуктами',
      'dish_lrc11': 'Горячий котел с крабовой пастой, говядиной и хрящевыми ребрышками',
      'dish_nc03': 'Свежевыжатый апельсиновый сок',
      'dish_td08': 'Персиковый чай с апельсином и лемонграссом',
      'dish_bia09': 'Пиво Heineken Silver (банка)',
      'dish_stb12': 'Смузи из авокадо с молодым кокосом',
      'dish_ckb13': 'Миндальный сладкий суп Хук Бать',
      'dish_kl04': 'Премиальная ароматизированная влажная салфетка',
      'cat_stir_rice': 'Жареные блюда и рис',
      'cat_beef_chicken': 'Блюда из говядины и птицы',
      'cat_seafood_appetizer': 'Морепродукты и закуски',
      'cat_hotpot': 'Фирменные горячие котлы',
      'cat_drinks_dessert': 'Напитки и десерты',
      'cat_services_other': 'Услуги и прочее',
      'unit_portion': 'порц.',
      'unit_plate': 'тар.',
      'unit_pot': 'котел',
      'unit_glass': 'стак.',
      'unit_can': 'банк.',
      'unit_bowl': 'чаш.',
      'unit_piece': 'шт.',
    },
  };
}

/// Helper component: Country Badge without emoji (Clean vector tag)
class LanguageCountryBadge extends StatelessWidget {
  final String countryCode;
  final bool isSelected;
  final double size;

  const LanguageCountryBadge({
    super.key,
    required this.countryCode,
    this.isSelected = false,
    this.size = 28,
  });

  @override
  Widget build(BuildContext context) {
    Color bg = const Color(0xFFF1F5F9);
    Color textColor = const Color(0xFF0F172A);
    Color borderColor = const Color(0xFFCBD5E1);

    if (isSelected) {
      bg = const Color(0xFF1B5E20);
      textColor = Colors.white;
      borderColor = const Color(0xFF2E7D32);
    } else {
      switch (countryCode) {
        case 'VN':
          bg = const Color(0xFFFEF2F2);
          textColor = const Color(0xFFDC2626);
          borderColor = const Color(0xFFFECACA);
          break;
        case 'US':
          bg = const Color(0xFFEFF6FF);
          textColor = const Color(0xFF2563EB);
          borderColor = const Color(0xFFBFDBFE);
          break;
        case 'KR':
          bg = const Color(0xFFF5F3FF);
          textColor = const Color(0xFF7C3AED);
          borderColor = const Color(0xFFDDD6FE);
          break;
        case 'RU':
          bg = const Color(0xFFECFDF5);
          textColor = const Color(0xFF059669);
          borderColor = const Color(0xFFA7F3D0);
          break;
      }
    }

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: bg,
        shape: BoxShape.circle,
        border: Border.all(color: borderColor, width: 1.2),
      ),
      alignment: Alignment.center,
      child: Text(
        countryCode,
        style: TextStyle(
          color: textColor,
          fontSize: size * 0.42,
          fontWeight: FontWeight.w900,
          letterSpacing: 0.2,
        ),
      ),
    );
  }
}

