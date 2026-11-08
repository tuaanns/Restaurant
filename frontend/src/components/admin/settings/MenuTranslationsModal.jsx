import React, { useState, useEffect } from 'react';
import { Globe, Search, Save, X, RotateCcw, Check, Sparkles } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';

export const MENU_TRANSLATIONS_STORAGE_KEY = 'quan_tra_menu_translations';

export const DEFAULT_MENU_TRANSLATIONS = [
  { id: 'MC01', vi: 'Cơm pilaf truyền thống', en: 'Traditional Pilaf', ko: '전통 필라프', ru: 'Традиционный плов' },
  { id: 'MC02', vi: 'Kazan kebab', en: 'Kazan Kebab', ko: '카잔 케밥', ru: 'Казан кебаб' },
  { id: 'MC03', vi: 'Bò hầm Goulash', en: 'Beef Goulash', ko: '소고기 굴라시', ru: 'Гуляш из говядины' },
  { id: 'MC04', vi: 'Bánh Manti hấp nhân thịt bò', en: 'Steamed Beef Manti', ko: '소고기 만티', ru: 'Манты с говядиной' },
  { id: 'MC05', vi: 'Thịt bò xào cay', en: 'Spicy Stir-fried Beef', ko: '매콤한 소고기 볶음', ru: 'Острая жареная говядина' },
  { id: 'MC06', vi: 'Lagman Uyghur', en: 'Uyghur Lagman', ko: '위구르 라그만', ru: 'Уйгурский лагман' },
  { id: 'MC07', vi: 'Đùi gà ăn kèm khoai tây chiên', en: 'Chicken Leg with French Fries', ko: '닭다리 구이와 감자튀김', ru: 'Куриная ножка с картофелем фри' },
  { id: 'MC08', vi: 'Mì Lagman chiên', en: 'Fried Lagman Noodles', ko: '볶음 라그만 면', ru: 'Жареный лагман' },
  { id: 'MC09', vi: 'Kurdak (thịt hầm kiểu Trung Á)', en: 'Central Asian Kuurdak', ko: '중앙아시아식 쿠르닥', ru: 'Куурдак по-среднеазиатски' },
  { id: 'BBQ11', vi: 'Kebab cừu xay nướng xiên', en: 'Minced Lamb Skewer Kebab', ko: '양고기 꼬치 케밥', ru: 'Люля-кебаб из баранины' },
  { id: 'BBQ12', vi: 'Kebab bò xay nướng xiên', en: 'Minced Beef Skewer Kebab', ko: '소고기 꼬치 케밥', ru: 'Люля-кебаб из говядины' },
  { id: 'BBQ13', vi: 'Phi lê gà nướng xiên', en: 'Grilled Chicken Fillet Skewer', ko: '닭 안심 꼬치구이', ru: 'Шашлык из куриного филе' },
  { id: 'SUP18', vi: 'Súp Lagman', en: 'Lagman Noodle Soup', ko: '라그만 국수 수프', ru: 'Суп лагман' },
  { id: 'SUP19', vi: 'Súp Shurpa thịt cừu', en: 'Lamb Shurpa Soup', ko: '양고기 슈르파 수프', ru: 'Шурпа из баранины' },
  { id: 'SUP20', vi: 'Súp Shurpa thịt bò', en: 'Beef Shurpa Soup', ko: '소고기 슈르파 수프', ru: 'Шурпа из говядины' },
  { id: 'SUP22', vi: 'Súp Borscht củ dền', en: 'Beetroot Borscht Soup', ko: '비트 보르시 수프', ru: 'Борщ со свеклой' },
  { id: 'SL25', vi: 'Salad Caesar tôm', en: 'Shrimp Caesar Salad', ko: '새우 시저 샐러드', ru: 'Салат Цезарь с креветками' },
  { id: 'SL27', vi: 'Salad Achuchuk', en: 'Achuchuk Tomato Salad', ko: '아추추크 토마토 샐러드', ru: 'Салат Ачучук' },
  { id: 'TEA01', vi: 'Trà Thiết Quan Âm Thượng Hạng', en: 'Tie Guan Yin Premium Tea', ko: '특선 철관음차', ru: 'Премиум чай Те Гуань Инь' },
  { id: 'TEA02', vi: 'Trà Ô Long Phúc Kiến', en: 'Fujian Oolong Tea', ko: '푸젠 우롱차', ru: 'Фуцзяньский улун' }
];

export function MenuTranslationsModal({ isOpen, onClose }) {
  const { t } = useLanguage();
  const [translations, setTranslations] = useState(() => {
    try {
      const raw = localStorage.getItem(MENU_TRANSLATIONS_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return DEFAULT_MENU_TRANSLATIONS;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      try {
        const raw = localStorage.getItem(MENU_TRANSLATIONS_STORAGE_KEY);
        if (raw) setTranslations(JSON.parse(raw));
      } catch (e) {}
      setSavedSuccess(false);
      setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = translations.filter(item => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return item.vi.toLowerCase().includes(q) ||
      item.en.toLowerCase().includes(q) ||
      item.ko.toLowerCase().includes(q) ||
      item.ru.toLowerCase().includes(q);
  });

  const handleTextChange = (id, field, val) => {
    setTranslations(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
    if (savedSuccess) setSavedSuccess(false);
  };

  const handleSave = () => {
    try {
      localStorage.setItem(MENU_TRANSLATIONS_STORAGE_KEY, JSON.stringify(translations));
      window.dispatchEvent(new CustomEvent('quan_tra_menu_translations_changed', { detail: translations }));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetDefaults = () => {
    setTranslations(DEFAULT_MENU_TRANSLATIONS);
    localStorage.setItem(MENU_TRANSLATIONS_STORAGE_KEY, JSON.stringify(DEFAULT_MENU_TRANSLATIONS));
    window.dispatchEvent(new CustomEvent('quan_tra_menu_translations_changed', { detail: DEFAULT_MENU_TRANSLATIONS }));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 500,
        padding: '16px'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '920px',
          maxWidth: '96vw',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#E8F5E9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1B5E20'
            }}>
              <Globe size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                {t('admin.settings.manageTranslations') || 'Quản lý bản dịch thực đơn'}
              </h2>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                {t('admin.settings.menuMultilingualDesc') || 'Dịch tên món và in hóa đơn đa ngôn ngữ cho khách nước ngoài (Anh, Hàn, Nga)'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              color: '#94a3b8',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Toolbar */}
        <div style={{
          padding: '12px 24px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          backgroundColor: '#ffffff'
        }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '340px' }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={t('admin.settings.searchDishTranslation') || 'Tìm món cần dịch theo tên bất kỳ...'}
              style={{
                width: '100%',
                padding: '7px 12px 7px 32px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '12.5px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {savedSuccess && (
              <span style={{ fontSize: '12px', color: '#1B5E20', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={14} /> {t('admin.settings.savedSuccess') || 'Đã lưu bản dịch!'}
              </span>
            )}
            <button
              onClick={handleResetDefaults}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#64748b',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={13} />
              <span>{t('admin.settings.resetDefaults') || 'Mặc định'}</span>
            </button>
            <button
              onClick={handleSave}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                borderRadius: '8px',
                backgroundColor: '#1B5E20',
                color: '#ffffff',
                border: 'none',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Save size={14} />
              <span>{t('admin.settings.saveTranslations') || 'Lưu bản dịch'}</span>
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', backgroundColor: '#fafbfc' }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569', width: '25%' }}>
                    Tiếng Việt (Gốc)
                  </th>
                  <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569', width: '25%' }}>
                    English (Tiếng Anh)
                  </th>
                  <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569', width: '25%' }}>
                    한국어 (Tiếng Hàn)
                  </th>
                  <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569', width: '25%' }}>
                    Русский (Tiếng Nga)
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 14px', fontWeight: 700, color: '#0f172a' }}>
                      {item.vi}
                    </td>
                    <td style={{ padding: '8px 14px' }}>
                      <input
                        type="text"
                        value={item.en || ''}
                        onChange={e => handleTextChange(item.id, 'en', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '5px 8px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '12px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </td>
                    <td style={{ padding: '8px 14px' }}>
                      <input
                        type="text"
                        value={item.ko || ''}
                        onChange={e => handleTextChange(item.id, 'ko', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '5px 8px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '12px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </td>
                    <td style={{ padding: '8px 14px' }}>
                      <input
                        type="text"
                        value={item.ru || ''}
                        onChange={e => handleTextChange(item.id, 'ru', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '5px 8px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '12px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#ffffff'
        }}>
          <span style={{ fontSize: '11.5px', color: '#64748b' }}>
            {t('admin.settings.translationAutoApplied') || 'Bản dịch được áp dụng tự động cho hóa đơn và màn hình gọi món POS'}
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '6px 18px',
              borderRadius: '6px',
              backgroundColor: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {t('close') || 'Đóng'}
          </button>
        </div>
      </div>
    </div>
  );
}

