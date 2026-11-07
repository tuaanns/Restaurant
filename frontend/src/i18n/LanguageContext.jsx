import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { translations, LANGUAGES } from './translations';

// === LOOKUP MAPPINGS ===
export const DISH_MAP = {
  "cơm pilaf truyền thống": "mc01",
  "mc01": "mc01",
  "kazan kebab": "mc02",
  "mc02": "mc02",
  "bò hầm goulash": "mc03",
  "mc03": "mc03",
  "bánh manti hấp nhân thịt bò": "mc04",
  "mc04": "mc04",
  "thịt bò xào cay": "mc05",
  "mc05": "mc05",
  "lagman uyghur": "mc06",
  "mc06": "mc06",
  "đùi gà ăn kèm khoai tây chiên": "mc07",
  "mc07": "mc07",
  "mì lagman chiên": "mc08",
  "mc08": "mc08",
  "kurdak (thịt hầm kiểu trung á)": "mc09",
  "mc09": "mc09",
  "cánh gà chiên giòn": "mc10",
  "mc10": "mc10",
  "kebab cừu xay nướng xiên": "bbq11",
  "bbq11": "bbq11",
  "kebab bò xay nướng xiên": "bbq12",
  "bbq12": "bbq12",
  "phi lê gà nướng xiên": "bbq13",
  "bbq13": "bbq13",
  "cánh gà nướng xiên": "bbq14",
  "bbq14": "bbq14",
  "thịt nướng xiên thập cẩm": "bbq15",
  "bbq15": "bbq15",
  "thịt cừu nướng xiên miếng": "bbq16",
  "bbq16": "bbq16",
  "thịt bò nướng xiên miếng": "bbq17",
  "bbq17": "bbq17",
  "súp lagman": "sup18",
  "sup18": "sup18",
  "súp shurpa thịt cừu": "sup19",
  "sup19": "sup19",
  "súp shurpa thịt bò": "sup20",
  "sup20": "sup20",
  "súp manpar": "sup21",
  "sup21": "sup21",
  "súp borscht củ dền": "sup22",
  "sup22": "sup22",
  "súp mastava": "sup23",
  "sup23": "sup23",
  "súp chuchvara nhân thịt bò": "sup24",
  "sup24": "sup24",
  "salad caesar tôm": "sl25",
  "sl25": "sl25",
  "salad caesar gà": "sl26",
  "sl26": "sl26",
  "salad achuchuk": "sl27",
  "sl27": "sl27",
  "salad night zhor": "sl28",
  "sl28": "sl28",
  "cơm trắng": "ak29",
  "ak29": "ak29",
  "mì sợi": "ak30",
  "ak30": "ak30",
  "khoai tây nghiền": "ak31",
  "ak31": "ak31",
  "khoai tây kiểu đồng quê": "ak32",
  "ak32": "ak32",
  "khoai tây chiên": "ak33",
  "ak33": "ak33",
  "samsa nhân gà": "bh34",
  "bh34": "bh34",
  "samsa nhân bò": "bh35",
  "bh35": "bh35",
  "cheburek nhân bò": "bh36",
  "bh36": "bh36",
  "bánh mì dẹt truyền thống": "bh37",
  "bh37": "bh37",
  "trà chanh dây": "tr38",
  "tr38": "tr38",
  "trà tashkent": "tr39",
  "tr39": "tr39",
  "trà sữa": "tr40",
  "tr40": "tr40",
  "trà chanh": "tr41",
  "tr41": "tr41",
  "trà đen": "tr42",
  "tr42": "tr42",
  "trà xanh": "tr43",
  "tr43": "tr43",
  "pizza pepperoni": "pz44",
  "pz44": "pz44",
  "pizza thập cẩm thịt": "pz45",
  "pz45": "pz45",
  "pizza gà nấm": "pz46",
  "pz46": "pz46",
  "pizza margherita": "pz47",
  "pz47": "pz47",
  "sushi cuộn cá hồi nướng": "sr48",
  "sr48": "sr48",
  "sushi cuộn philadelphia bơ": "sr49",
  "sr49": "sr49",
  "sushi cuộn nướng": "sr50",
  "sr50": "sr50",
  "sushi cuộn lươn phô mai kem": "sr51",
  "sr51": "sr51",
  "sushi cuộn kanada": "sr52",
  "sr52": "sr52",
  "sushi cuộn california nướng": "sr53",
  "sr53": "sr53",
  "sushi cuộn california cá hồi": "sr53b",
  "sr53b": "sr53b",
  "sushi cuộn dragon": "sr54",
  "sr54": "sr54",
  "sushi cuộn philadelphia": "sr55",
  "sr55": "sr55",
  "sushi cuộn gà star": "sr56",
  "sr56": "sr56",
  "sushi cuộn mummy": "sr57",
  "sr57": "sr57",
  "sushi cuộn cá hồi dưa chuột không rong biển": "sr58",
  "sr58": "sr58",
  "sushi cuộn california tôm": "sr59",
  "sr59": "sr59",
  "sushi cuộn california thanh cua": "sr68",
  "sr68": "sr68",
  "set sushi 1": "ss60",
  "ss60": "ss60",
  "set sushi 2": "ss61",
  "ss61": "ss61",
  "set sushi 3": "ss62",
  "ss62": "ss62",
  "set sushi 4": "ss63",
  "ss63": "ss63",
  "set sushi 5": "ss64",
  "ss64": "ss64",
  "set sushi 6": "ss65",
  "ss65": "ss65",
  "set sushi mini": "sn66",
  "sn66": "sn66",
  "set sushi nigiri cao cấp": "sn67",
  "sn67": "sn67",
  "nước cam": "ns69",
  "ns69": "ns69",
  "sinh tố xoài": "ns70",
  "ns70": "ns70",
  "sinh tố xoài chanh dây": "ns71",
  "ns71": "ns71",
  "nước ép dứa": "ns72",
  "ns72": "ns72",
  "nước ép dưa hấu": "ns73",
  "ns73": "ns73",
  "sinh tố chuối": "ns74",
  "ns74": "ns74",
  "nước compote trái cây nhà làm": "ns75",
  "ns75": "ns75",
  "coca-cola": "nn74",
  "nn74": "nn74",
  "fanta": "nn75",
  "nn75": "nn75",
  "7up": "nn76",
  "nn76": "nn76",
  "mirinda": "nn77",
  "nn77": "nn77",
  "pepsi": "nn78",
  "nn78": "nn78",
  "nước suối aquafina": "nn79",
  "nn79": "nn79",
  "nước suối aquafina (1.5l)": "nn79b",
  "nn79b": "nn79b"
};

export const CATEGORY_MAP = {
  "món chính": "cat_main",
  "main dishes": "cat_main",
  "cat_main": "cat_main",
  "thịt nướng": "cat_bbq",
  "bbq & grilled": "cat_bbq",
  "cat_bbq": "cat_bbq",
  "súp": "cat_soups",
  "soups": "cat_soups",
  "cat_soups": "cat_soups",
  "salad": "cat_salad",
  "cat_salad": "cat_salad",
  "món ăn kèm": "cat_sides",
  "sides": "cat_sides",
  "cat_sides": "cat_sides",
  "bánh": "cat_pastries",
  "pastries": "cat_pastries",
  "cat_pastries": "cat_pastries",
  "trà": "cat_tea",
  "tea": "cat_tea",
  "cat_tea": "cat_tea",
  "pizza": "cat_pizza",
  "cat_pizza": "cat_pizza",
  "sushi cuộn": "cat_sushi_roll",
  "sushi roll": "cat_sushi_roll",
  "cat_sushi_roll": "cat_sushi_roll",
  "set sushi": "cat_sushi_set",
  "sushi set": "cat_sushi_set",
  "cat_sushi_set": "cat_sushi_set",
  "sushi & nigiri": "cat_nigiri",
  "sushi / nigiri": "cat_nigiri",
  "cat_nigiri": "cat_nigiri",
  "nước ép & sinh tố": "cat_juices",
  "juices & smoothies": "cat_juices",
  "cat_juices": "cat_juices",
  "nước ngọt & nước suối": "cat_drinks",
  "soft drinks & water": "cat_drinks",
  "cat_drinks": "cat_drinks",
  "mon chinh": "cat_main",
  "thit nuong": "cat_bbq",
  "sup": "cat_soups",
  "mon an kem": "cat_sides",
  "banh": "cat_pastries",
  "tra": "cat_tea",
  "sushi cuon": "cat_sushi_roll",
  "nuoc ep & sinh to": "cat_juices",
  "nuoc ep va sinh to": "cat_juices",
  "nuoc ngot & nuoc suoi": "cat_drinks",
  "nuoc ngot va nuoc suoi": "cat_drinks"
};

export const UNIT_MAP = {
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
  'tô': 'bowl',
  'to': 'bowl',
  'cái': 'piece',
  'cai': 'piece',
  'xiên': 'skewer',
  'xien': 'skewer',
  'ấm': 'teapot',
  'am': 'teapot',
  'cuộn': 'roll',
  'cuon': 'roll',
  'set': 'set',
  'mẹt': 'platter',
  'met': 'platter',
  'chai': 'bottle'
};

export const AREA_MAP = {
  'floor_1': 'floor1',
  'tầng 1': 'floor1',
  'tang 1': 'floor1',
  '1st floor': 'floor1',
  'floor 1': 'floor1',
  'floor_2': 'floor2',
  'tầng 2': 'floor2',
  'tang 2': 'floor2',
  '2nd floor': 'floor2',
  'floor 2': 'floor2',
  'vip': 'vipRoom',
  'phòng vip': 'vipRoom',
  'phong vip': 'vipRoom',
  'vip room': 'vipRoom',
  'garden': 'garden',
  'sân vườn': 'garden',
  'san vuon': 'garden',
};

export const PROMO_MAP = {
  'tri an khach hang': 'triAn',
  'tri ân khách hàng': 'triAn',
  'km000004': 'triAn',
  'cà phê pha máy giảm 5%': 'coffee5',
  'ca phe pha may giam 5%': 'coffee5',
  '10 ly tặng 1 hộp (combo)': 'cup10box1',
  '10 ly tang 1 hop (combo)': 'cup10box1',
  '10 ly tặng 1 hộp': 'cup10box1',
  '10 ly tang 1 hop': 'cup10box1',
  'km000013': 'cup10box1',
  'ctkm khai trương': 'grandOpening',
  'ctkm khai truong': 'grandOpening',
  'khai trương': 'grandOpening',
  'khai truong': 'grandOpening',
  'km000014': 'grandOpening',
};

export const CASH_CATEGORY_MAP = {
  'thu tiền hóa đơn bán hàng (tự động vietqr)': 'autoSalesReceipt',
  'thu tien hoa don ban hang (tu dong vietqr)': 'autoSalesReceipt',
  'thu tiền hóa đơn bán hàng': 'salesReceiptBill',
  'thu tien hoa don ban hang': 'salesReceiptBill',
  'thu tiền bán hàng': 'salesReceipt',
  'thu tien ban hang': 'salesReceipt',
  'chi tiền mua nguyên vật liệu': 'material',
  'chi tien mua nguyen vat lieu': 'material',
  'chi trả tiền nhà / điện nước': 'utilities',
  'chi tra tien nha / dien nuoc': 'utilities',
  'chi trả lương nhân viên': 'salary',
  'chi tra luong nhan vien': 'salary',
  'chi sửa chữa & bảo trì thiết bị': 'repair',
  'chi sua chua & bao tri thiet bi': 'repair',
  'chi tiếp khách & quảng cáo': 'marketing',
  'chi tiep khach & quang cao': 'marketing',
  'chi phí quản lý & văn phòng phẩm': 'office',
  'chi phi quan ly & van phong pham': 'office',
  'thu tiền khách nợ': 'debtReceipt',
  'thu tien khach no': 'debtReceipt',
  'thu hoàn ứng nhân viên': 'refundStaff',
  'thu hoan ung nhan vien': 'refundStaff',
  'thu thanh lý tài sản': 'scrapReceipt',
  'thu thanh ly tai san': 'scrapReceipt',
  'thu tiền bồi thường': 'compensation',
  'thu tien boi thuong': 'compensation',
  'thu lãi tiền gửi ngân hàng': 'interest',
  'thu lai tien gui ngan hang': 'interest',
  'thu khác': 'otherReceipt',
  'thu khac': 'otherReceipt',
  'chi khác': 'otherPayment',
  'chi khac': 'otherPayment',
};

export const CASH_TARGET_MAP = {
  'khách thanh toán vietqr': 'targetVietQrCustomer',
  'khach thanh toan vietqr': 'targetVietQrCustomer',
  'khách lẻ / đối tác': 'defaultTarget',
  'khach le / doi tac': 'defaultTarget',
  'khách lẻ': 'retailCustomer',
  'khach le': 'retailCustomer',
  'nhà cung cấp': 'supplier',
  'nha cung cap': 'supplier',
  'nhân viên': 'staffTarget',
  'nhan vien': 'staffTarget',
};

export const CASH_CREATOR_MAP = {
  'hệ thống tự động (vietqr webhook)': 'autoSystemWebhook',
  'he thong tu dong (vietqr webhook)': 'autoSystemWebhook',
  'hệ thống tự động': 'autoSystem',
  'he thong tu dong': 'autoSystem',
};

// ── Context ──
const LanguageContext = createContext(null);

// ── Provider ──
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('aura_lang') || 'vi';
  });

  const switchLang = useCallback((code) => {
    setLang(code);
    localStorage.setItem('aura_lang', code);
  }, []);

  // t('login.title') hoặc t('payment.vatAndDiscount', { vat: 8, discount: 5 })
  const t = useCallback((key, params) => {
    const dict = translations[lang] || translations['vi'];
    const parts = key.split('.');
    let val = dict;
    for (const part of parts) {
      val = val?.[part];
      if (val === undefined) break;
    }
    // Fallback sang tiếng Việt nếu chưa dịch
    if (val === undefined) {
      val = translations['vi'];
      for (const part of parts) {
        val = val?.[part];
        if (val === undefined) break;
      }
    }
    if (typeof val !== 'string') {
      if (typeof params === 'string') return params;
      return undefined;
    }
    if (params && typeof params === 'object') {
      return Object.entries(params).reduce((str, [k, v]) => {
        return str.replaceAll(`{${k}}`, v !== undefined && v !== null ? v : '');
      }, val);
    }
    return val;
  }, [lang]);

  // Format table name (BÀN 01 -> TABLE 01, MANG VỀ -> TAKEAWAY, VIP 01 -> VIP 01, VƯỜN 1 -> GARDEN 1)
  const formatTableName = useCallback((rawName) => {
    if (!rawName) return '';
    const trimmed = String(rawName).trim();
    const lower = trimmed.toLowerCase();
    
    // Takeaway (Mang về)
    if (lower === 'mang về' || lower === 'mang ve' || lower === 'takeaway') {
      return t('table.takeaway');
    }
    // BÀN XX / TABLE XX
    if (/^bàn\s*/i.test(trimmed) || /^table\s*/i.test(trimmed)) {
      const num = trimmed.replace(/^(bàn|table)\s*/i, '').trim();
      return `${t('table.tablePrefix')} ${num}`.trim();
    }
    // VƯỜN X / GARDEN X
    if (/^vườn\s*/i.test(trimmed) || /^garden\s*/i.test(trimmed)) {
      const num = trimmed.replace(/^(vườn|garden)\s*/i, '').trim();
      return `${t('table.gardenPrefix')} ${num}`.trim();
    }
    // PHÒNG VIP X / VIP ROOM X
    if (/^phòng\s*vip\s*/i.test(trimmed)) {
      const num = trimmed.replace(/^phòng\s*vip\s*/i, '').trim();
      return `${t('areas.vipRoom')} ${num}`.trim();
    }
    if (/^phòng\s*/i.test(trimmed) || /^room\s*/i.test(trimmed)) {
      const num = trimmed.replace(/^(phòng|room)\s*/i, '').trim();
      return `${t('table.roomPrefix')} ${num}`.trim();
    }
    if (/^vip\s*/i.test(trimmed)) {
      const num = trimmed.replace(/^vip\s*/i, '').trim();
      return `${t('table.vipPrefix') || 'VIP'} ${num}`.trim();
    }
    return rawName;
  }, [t]);

  // Format area name (Tầng 1 -> 1st Floor / 1층 / 1-й этаж)
  const formatAreaName = useCallback((rawArea) => {
    if (!rawArea) return '';
    if (typeof rawArea === 'object') {
      const code = (rawArea.code || '').toLowerCase().trim();
      const name = (rawArea.name || '').toLowerCase().trim();
      if (AREA_MAP[code]) return t(`areas.${AREA_MAP[code]}`);
      if (AREA_MAP[name]) return t(`areas.${AREA_MAP[name]}`);
      return rawArea.name || '';
    }
    const lower = String(rawArea).toLowerCase().trim();
    if (AREA_MAP[lower]) return t(`areas.${AREA_MAP[lower]}`);
    return rawArea;
  }, [t]);

  // Format dish name
  const formatDishName = useCallback((rawName, code) => {
    if (!rawName) return '';
    const lower = String(rawName).toLowerCase().trim();
    const cLower = code ? String(code).toLowerCase().trim() : '';
    const key = DISH_MAP[lower] || (cLower && DISH_MAP[cLower]);
    if (key) {
      const translated = t(`dishes.${key}`);
      if (translated && translated !== `dishes.${key}`) return translated;
    }
    return rawName;
  }, [t]);

  // Format category name
  const formatCategoryName = useCallback((rawCat) => {
    if (!rawCat) return '';
    const name = typeof rawCat === 'object' ? rawCat.name : rawCat;
    if (!name) return '';
    const lower = String(name).toLowerCase().trim();
    const key = CATEGORY_MAP[lower];
    if (key) {
      const translated = t(`categories.${key}`);
      if (translated && translated !== `categories.${key}`) return translated;
    }
    return name;
  }, [t]);

  // Format dish unit (phần -> portion, dĩa -> plate, ...)
  const formatDishUnit = useCallback((rawUnit) => {
    if (!rawUnit) return '';
    const lower = String(rawUnit).toLowerCase().trim();
    const key = UNIT_MAP[lower];
    if (key) {
      const translated = t(`dishUnits.${key}`);
      if (translated && translated !== `dishUnits.${key}`) return translated;
    }
    return rawUnit;
  }, [t]);

  // Format promotion name (Tri ân khách hàng -> Customer Appreciation)
  const formatPromoName = useCallback((rawName) => {
    if (!rawName) return '';
    const lower = String(rawName).toLowerCase().trim();
    const key = PROMO_MAP[lower] || PROMO_MAP[lower.replace(/[()]/g, '').trim()];
    if (key) {
      const translated = t(`promos.${key}`);
      if (translated && translated !== `promos.${key}`) return translated;
    }
    return rawName;
  }, [t]);

  // Format cash category (Thu tiền bán hàng -> Sales revenue receipt)
  const formatCashCategory = useCallback((rawCat) => {
    if (!rawCat) return '';
    const lower = String(rawCat).toLowerCase().trim();
    const key = CASH_CATEGORY_MAP[lower];
    if (key) {
      const translated = t(`admin.cashbook.categories.${key}`);
      if (translated && translated !== `admin.cashbook.categories.${key}`) return translated;
    }
    return rawCat;
  }, [t]);

  // Format cash target / payer / payee (Khách thanh toán VietQR -> Customer (VietQR Payment))
  const formatCashTarget = useCallback((rawTarget) => {
    if (!rawTarget) return '';
    const lower = String(rawTarget).toLowerCase().trim();
    const key = CASH_TARGET_MAP[lower];
    if (key) {
      const translated = t(`admin.cashbook.${key}`);
      if (translated && translated !== `admin.cashbook.${key}`) return translated;
    }
    return rawTarget;
  }, [t]);

  // Format cash transaction creator
  const formatCashCreatedBy = useCallback((rawCreator) => {
    if (!rawCreator) return '';
    const lower = String(rawCreator).toLowerCase().trim();
    const key = CASH_CREATOR_MAP[lower];
    if (key) {
      const translated = t(`admin.cashbook.${key}`);
      if (translated && translated !== `admin.cashbook.${key}`) return translated;
    }
    return rawCreator;
  }, [t]);

  // Cập nhật document.title và lang attribute khi đổi ngôn ngữ
  useEffect(() => {
    document.documentElement.lang = lang;
    const subtitle = t('login.subtitle');
    if (subtitle && subtitle !== 'login.subtitle') {
      document.title = `QUÁN TRÀ — ${subtitle}`;
    }
  }, [lang, t]);

  return (
    <LanguageContext.Provider value={{
      lang,
      switchLang,
      t,
      languages: LANGUAGES,
      formatTableName,
      formatAreaName,
      formatDishName,
      formatCategoryName,
      formatDishUnit,
      formatPromoName,
      formatCashCategory,
      formatCashTarget,
      formatCashCreatedBy
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ── Hook ──
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
