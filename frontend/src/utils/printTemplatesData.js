// ════════════════════════════════════════════════════════════════
//  AuraPOS — Print Templates Storage & Presets (Quản lý mẫu in)
// ════════════════════════════════════════════════════════════════

export const PRINT_TEMPLATES_STORAGE_KEY = 'quan_tra_custom_print_templates';

export const DEFAULT_PRINT_TEMPLATES = {
  invoice: [
    {
      id: 'inv_k80_default',
      name: 'Mẫu in hóa đơn (Mặc định)',
      isDefault: true,
      paperSize: 'k80',
      orientation: 'portrait',
      companyName: 'HỆ THỐNG TRÀ & ẨM THỰC',
      storeName: 'QUÁN TRÀ - SPECIALTY TEA & COFFEE',
      address: '103 Trần Hưng Đạo, Đặc khu Phú Quốc, Tỉnh An Giang',
      hotline: '0901.234.567 - 0988.888.888',
      title: 'HÓA ĐƠN TÍNH TIỀN',
      headerNote: '',
      footerThankYou: 'Cảm ơn Quý Khách & Hẹn Gặp Lại!',
      wifiInfo: 'Wifi: QuanTra_Guest / Pass: 88888888',
      showLogo: true,
      showVietQr: true,
      showWifi: true,
      showPoints: true,
      fontSize: 14,
      tokensState: {
        orderCode: true,
        client: true,
        billingTime: true,
        productName: true,
        productNotes: true,
        unitPrice: true,
        quantity: true,
        amount: true,
        subtotal: true,
        discount: true,
        total: true,
        vietqr: true,
        wifi: true,
        points: true,
        thankYou: true
      },
      tokens: ['{order_code}', '{table}', '{cashier}', '{billing_time}', '{items_table}', '{subtotal}', '{discount}', '{vat}', '{total}', '{vietqr}']
    },
    {
      id: 'inv_k80_secondary',
      name: 'Mẫu in hóa đơn 2',
      isDefault: false,
      paperSize: 'k80',
      orientation: 'portrait',
      companyName: 'CHI NHÁNH PHÚ QUỐC PREMIUM',
      storeName: 'QUÁN TRÀ PHÚ QUỐC',
      address: '103 Trần Hưng Đạo, P. Dương Đông, TP. Phú Quốc',
      hotline: '0901.234.567',
      title: 'PHIẾU THANH TOÁN',
      headerNote: 'Khách hàng thân thiết VIP',
      footerThankYou: 'Rất hân hạnh được phục vụ Quý Khách!',
      wifiInfo: 'Wifi: QuanTra_VIP / Pass: 66668888',
      showLogo: true,
      showVietQr: true,
      showWifi: true,
      showPoints: false,
      fontSize: 14,
      tokensState: {
        orderCode: true,
        client: true,
        billingTime: true,
        productName: true,
        productNotes: false,
        unitPrice: true,
        quantity: true,
        amount: true,
        subtotal: true,
        discount: true,
        total: true,
        vietqr: true,
        wifi: true,
        points: false,
        thankYou: true
      },
      tokens: ['{order_code}', '{table}', '{items_table}', '{total}', '{vietqr}']
    },
    {
      id: 'inv_k80_garden',
      name: 'Mẫu in K80 Khu Sân Vườn VIP',
      isDefault: false,
      paperSize: 'k80',
      orientation: 'portrait',
      companyName: 'HỆ THỐNG F&B QUÁN TRÀ',
      storeName: 'QUÁN TRÀ - GARDEN & LOUNGE',
      address: 'Khu Sân Vườn Sinh Thái, Đặc khu Phú Quốc',
      hotline: 'HOTLINE: 0901.234.567',
      title: 'HÓA ĐƠN TÍNH TIỀN',
      headerNote: '',
      footerThankYou: 'Chúc Quý Khách một ngày thật thư thái!',
      wifiInfo: 'Wifi: QuanTra_Garden / Pass: 66889900',
      showLogo: true,
      showVietQr: true,
      showWifi: true,
      showPoints: true,
      fontSize: 14,
      tokensState: {
        orderCode: true,
        client: true,
        billingTime: true,
        productName: true,
        productNotes: true,
        unitPrice: true,
        quantity: true,
        amount: true,
        subtotal: true,
        discount: true,
        total: true,
        vietqr: true,
        wifi: true,
        points: true,
        thankYou: true
      },
      tokens: ['{order_code}', '{client}', '{billing_time}', '{items_table}', '{subtotal}', '{discount}', '{total}', '{vietqr}']
    },
    {
      id: 'inv_k57_compact',
      name: 'Mẫu in hóa đơn K57 (Mini)',
      isDefault: false,
      paperSize: 'k57',
      orientation: 'portrait',
      companyName: 'QUÁN TRÀ EXPRESS',
      storeName: 'QUÁN TRÀ PHÚ QUỐC',
      address: '103 Trần Hưng Đạo, Phú Quốc',
      hotline: '0901.234.567',
      title: 'HÓA ĐƠN BÁN LẺ',
      headerNote: '',
      footerThankYou: 'Cảm ơn & Hẹn gặp lại quý khách!',
      wifiInfo: 'Wifi: QuanTra / Pass: 88888888',
      showLogo: false,
      showVietQr: true,
      showWifi: false,
      showPoints: false,
      fontSize: 12,
      tokensState: {
        orderCode: true,
        client: false,
        billingTime: true,
        productName: true,
        productNotes: false,
        unitPrice: false,
        quantity: true,
        amount: true,
        subtotal: false,
        discount: false,
        total: true,
        vietqr: true,
        wifi: false,
        points: false,
        thankYou: true
      },
      tokens: ['{order_code}', '{table}', '{items_table}', '{total}']
    }
  ],

  prebill: [
    {
      id: 'pre_k80_default',
      name: 'Mẫu in phiếu tạm tính chuẩn',
      isDefault: true,
      paperSize: 'k80',
      orientation: 'portrait',
      storeName: 'QUÁN TRÀ - SPECIALTY TEA & COFFEE',
      address: '103 Trần Hưng Đạo, Đặc khu Phú Quốc, Tỉnh An Giang',
      hotline: '0901.234.567',
      title: 'PHIẾU TẠM TÍNH',
      headerNote: '(Chưa bao gồm hóa đơn GTGT)',
      footerThankYou: 'Quý khách vui lòng kiểm tra lại món trước khi thanh toán!',
      wifiInfo: 'Wifi: QuanTra_Guest / Pass: 88888888',
      showLogo: true,
      showVietQr: true,
      showWifi: true,
      showPoints: false,
      tokens: ['{table}', '{order_code}', '{billing_time}', '{items_table}', '{subtotal}', '{discount}', '{total}', '{vietqr}']
    }
  ],

  kitchen: [
    {
      id: 'kit_k80_default',
      name: 'Mẫu phiếu chế biến Bếp/Bar',
      isDefault: true,
      paperSize: 'k80',
      orientation: 'portrait',
      storeName: 'PHIẾU BÁO CHẾ BIẾN',
      address: 'Khu vực: Quầy Pha Chế & Bếp',
      hotline: '',
      title: 'LỆNH GỌI MÓN MỚI',
      headerNote: 'Ưu tiên ra món đúng thứ tự order',
      footerThankYou: 'Vui lòng kiểm tra kỹ ghi chú của khách!',
      wifiInfo: '',
      showLogo: false,
      showVietQr: false,
      showWifi: false,
      showPoints: false,
      tokens: ['{table}', '{order_code}', '{staff}', '{billing_time}', '{items_table_kitchen}', '{item_notes}']
    }
  ],

  shift_closing: [
    {
      id: 'shift_k80_default',
      name: 'Mẫu phiếu bàn giao ca / Kết sổ',
      isDefault: true,
      paperSize: 'k80',
      orientation: 'portrait',
      storeName: 'QUÁN TRÀ - BIÊN BẢN CHỐT CA',
      address: 'Điểm bán: Chi nhánh Phú Quốc',
      hotline: '',
      title: 'PHIẾU BÀN GIAO CA BÁN HÀNG',
      headerNote: 'Đối soát doanh thu & Quỹ tiền mặt',
      footerThankYou: 'Thu ngân & Quản lý ca ký nhận',
      wifiInfo: '',
      showLogo: false,
      showVietQr: false,
      showWifi: false,
      showPoints: false,
      tokens: ['{cashier}', '{shift_time}', '{opening_balance}', '{cash_sales}', '{qr_sales}', '{cash_in}', '{cash_out}', '{closing_balance}', '{signature}']
    }
  ],

  cash_receipt: [
    {
      id: 'cr_k80_default',
      name: 'Mẫu in phiếu thu tiền mặt',
      isDefault: true,
      paperSize: 'k80',
      orientation: 'portrait',
      storeName: 'QUÁN TRÀ - SỔ QUỸ TIỀN MẶT',
      address: '103 Trần Hưng Đạo, Phú Quốc',
      hotline: '0901.234.567',
      title: 'PHIẾU THU TIỀN MẶT',
      headerNote: '',
      footerThankYou: 'Kèm theo chứng từ gốc (nếu có)',
      wifiInfo: '',
      showLogo: false,
      showVietQr: false,
      showWifi: false,
      showPoints: false,
      tokens: ['{voucher_code}', '{voucher_time}', '{payer}', '{cash_category}', '{amount}', '{amount_in_words}', '{signature}']
    }
  ],

  cash_payment: [
    {
      id: 'cp_k80_default',
      name: 'Mẫu in phiếu chi tiền mặt',
      isDefault: true,
      paperSize: 'k80',
      orientation: 'portrait',
      storeName: 'QUÁN TRÀ - SỔ QUỸ TIỀN MẶT',
      address: '103 Trần Hưng Đạo, Phú Quốc',
      hotline: '0901.234.567',
      title: 'PHIẾU CHI TIỀN MẶT',
      headerNote: '',
      footerThankYou: 'Thủ quỹ & Người nhận tiền ký nhận',
      wifiInfo: '',
      showLogo: false,
      showVietQr: false,
      showWifi: false,
      showPoints: false,
      tokens: ['{voucher_code}', '{voucher_time}', '{payee}', '{cash_category}', '{amount}', '{amount_in_words}', '{signature}']
    }
  ]
};

export function loadAllPrintTemplates() {
  try {
    const raw = localStorage.getItem(PRINT_TEMPLATES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const result = { ...DEFAULT_PRINT_TEMPLATES };
      Object.keys(DEFAULT_PRINT_TEMPLATES).forEach(key => {
        if (parsed[key] && Array.isArray(parsed[key])) {
          // Clean out any legacy kiotviet template so it doesn't persist
          const cleaned = parsed[key].filter(t => t.id !== 'inv_k80_kiotviet' && !t.name?.includes('KIOTVIET'));
          const existingIds = new Set(cleaned.map(t => t.id));
          const missingDefaults = DEFAULT_PRINT_TEMPLATES[key].filter(d => !existingIds.has(d.id));
          result[key] = [...cleaned, ...missingDefaults];
        }
      });
      return result;
    }
  } catch (e) {
    console.warn('Lỗi đọc mẫu in từ localStorage', e);
  }
  return DEFAULT_PRINT_TEMPLATES;
}

export function saveAllPrintTemplates(data) {
  try {
    localStorage.setItem(PRINT_TEMPLATES_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('quan_tra_print_templates_updated', { detail: data }));
  } catch (e) {
    console.error('Lỗi lưu mẫu in:', e);
  }
}

export function resetPrintTemplatesToDefault() {
  try {
    localStorage.removeItem(PRINT_TEMPLATES_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('quan_tra_print_templates_updated', { detail: DEFAULT_PRINT_TEMPLATES }));
  } catch (e) {
    console.error('Lỗi đặt lại mẫu in mặc định:', e);
  }
  return DEFAULT_PRINT_TEMPLATES;
}


