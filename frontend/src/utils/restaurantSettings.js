// ════════════════════════════════════════════════════════════════
//  AuraPOS — Central Restaurant Settings Helper
//  Đồng bộ cài đặt giữa trang Quản lý Admin và Màn hình Thu ngân POS
// ════════════════════════════════════════════════════════════════

export const SETTINGS_STORAGE_KEY = 'quan_tra_restaurant_settings';

export const DEFAULT_RESTAURANT_SETTINGS = {
  // 1. Thực đơn & Kho hàng
  menuMultilingual: true,
  costPriceMethod: 'fixed', // 'fixed' | 'average'
  autoDeductInventory: true,
  allowNegativeStock: false,
  lowStockAlert: true,
  lowStockThreshold: 5,

  // 2. Đơn hàng
  autoPrintOnPayment: true,
  allowPrePrintBill: true,
  allowPayBeforeKitchen: true,
  requireCancelReason: true,
  autoCompletePaidOrder: true,
  defaultVatRate: '0', // '0' | '5' | '8' | '10'
  serviceChargeRate: '0', // '0' | '5' | '10'

  // 3. Bar/Bếp
  autoPrintKitchenTicket: true,
  splitKitchenBarTickets: true,
  groupItemsOnTicket: false,
  kitchenAlertSound: true,
  kitchenDelayAlertMinutes: 15,
  staffCanCancelKitchenItem: false,

  // 4. Khách hàng
  enableLoyaltyPoints: true,
  pointRateVndPerPoint: 10000,
  pointRedeemVndPerPoint: 100,
  autoRankUpgrade: true,
  allowStackPromoWithPoints: true,
  birthdayGreetingSms: true,

  // 5. Báo cáo
  dailyClosingTime: '23:59',
  requireCashAuditBeforeClose: true,
  showGrossProfitInReports: true,
  revenueOnlyPaid: true,
  autoEmailDailyReport: false,
  reportRecipientEmail: 'admin@quantra.vn',

  // 6. Mẫu in
  paperSize: 'k80', // 'k80' | 'k57' | 'a5'
  printCopies: 1, // 1 | 2
  showStoreLogoOnBill: true,
  showVietQrOnBill: true,
  showWifiOnBill: true,
  showCustomerPointsOnBill: true,
  billHeaderStoreName: 'QUÁN TRÀ - SPECIALTY TEA & COFFEE',
  billHeaderAddress: '103 Trần Hưng Đạo, Đặc khu Phú Quốc, Tỉnh An Giang',
  billHeaderPhone: '0901.234.567 - 0988.888.888',
  billWifiInfo: 'Wifi: QuanTra_Guest / Pass: 88888888',
  billFooterThankYou: 'Cảm ơn Quý Khách & Hẹn Gặp Lại!',
};

/**
 * Lấy toàn bộ thiết lập hiện tại (từ localStorage hoặc mặc định)
 */
export function getRestaurantSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_RESTAURANT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Lỗi đọc cấu hình từ localStorage:', e);
  }
  return DEFAULT_RESTAURANT_SETTINGS;
}

/**
 * Cập nhật thiết lập và phát event thông báo cho toàn bộ ứng dụng
 */
export function saveRestaurantSettings(newSettings) {
  try {
    const merged = { ...getRestaurantSettings(), ...newSettings };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('quan_tra_settings_changed', { detail: merged }));
    return merged;
  } catch (e) {
    console.error('Lỗi lưu cấu hình:', e);
    return newSettings;
  }
}

