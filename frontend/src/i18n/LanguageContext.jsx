import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { translations, LANGUAGES } from './translations';

// === LOOKUP MAPPINGS ===
export const DISH_MAP = {
  'mì xào bò thượng hạng': 'mxb01',
  'mi xao bo thuong hang': 'mxb01',
  'mxb01': 'mxb01',
  'cơm chiên hải sản hoàng kim': 'cchs02',
  'com chien hai san hoang kim': 'cchs02',
  'cchs02': 'cchs02',
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
  'bll06': 'bll06',
  'gà nướng muối ớt tây bắc': 'gn07',
  'ga nuong muoi ot tay bac': 'gn07',
  'gn07': 'gn07',
  'mực một nắng nướng sa tế': 'mnn06',
  'muc mot nang nuong sa te': 'mnn06',
  'mnn06': 'mnn06',
  'tôm sú nướng muối ớt': 'tsn08',
  'tom su nuong muoi ot': 'tsn08',
  'tsn08': 'tsn08',
  'salad cá hồi sốt mè rang': 'sch09',
  'salad ca hoi sot me rang': 'sch09',
  'sch09': 'sch09',
  'nộm củ hũ dừa tôm thịt': 'nchd10',
  'nom cu hu dua tom thit': 'nchd10',
  'nchd10': 'nchd10',
  'lẩu thái tomyum hải sản': 'lt07',
  'lau thai tomyum hai san': 'lt07',
  'lt07': 'lt07',
  'lẩu riêu cua bắp bò sườn sụn': 'lrc11',
  'lau rieu cua bap bo suon sun': 'lrc11',
  'lrc11': 'lrc11',
  'nước cam ép tươi': 'nc03',
  'nuoc cam ep tuoi': 'nc03',
  'nc03': 'nc03',
  'trà đào cam sả thanh nhiệt': 'td08',
  'tra dao cam sa thanh nhiet': 'td08',
  'td08': 'td08',
  'bia heineken silver (lon)': 'bia09',
  'bia heineken silver': 'bia09',
  'bia09': 'bia09',
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
};

export const CATEGORY_MAP = {
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
  'cái': 'piece',
  'cai': 'piece',
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

  // t('login.title') hoặc t('save')
  const t = useCallback((key) => {
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
    return typeof val === 'string' ? val : key;
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

  // Cập nhật document.title và lang attribute khi đổi ngôn ngữ
  useEffect(() => {
    document.documentElement.lang = lang;
    const subtitle = t('login.subtitle');
    if (subtitle && subtitle !== 'login.subtitle') {
      document.title = `AURA RESTAURANT — ${subtitle}`;
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
      formatDishUnit
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
