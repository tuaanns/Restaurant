import React, { useState } from 'react';
import { X, Plus, Check, ShoppingBag, Bike, Store, PhoneCall, Globe, Video, ShoppingCart } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { addCustomSalesChannel, renderChannelIcon } from '../../utils/salesChannelsHelper';

const COLOR_PRESETS = [
  { color: '#1B5E20', bgColor: '#E8F5E9', borderColor: '#C8E6C9', name: 'Xanh lá' },
  { color: '#0284c7', bgColor: '#e0f2fe', borderColor: '#bae6fd', name: 'Xanh dương' },
  { color: '#ee4d2d', bgColor: '#fff0ec', borderColor: '#ffd0c4', name: 'Cam đỏ' },
  { color: '#d97706', bgColor: '#fef3c7', borderColor: '#fde68a', name: 'Vàng cam' },
  { color: '#7c3aed', bgColor: '#f3e8ff', borderColor: '#e9d5ff', name: 'Tím' },
  { color: '#db2777', bgColor: '#fce7f3', borderColor: '#fbcfe8', name: 'Hồng' },
  { color: '#0f172a', bgColor: '#f1f5f9', borderColor: '#cbd5e1', name: 'Xám đậm' }
];

const ICON_PRESETS = [
  { type: 'bag', label: 'Túi hàng' },
  { type: 'cart', label: 'Giỏ hàng' },
  { type: 'bike', label: 'Giao xe' },
  { type: 'store', label: 'Cửa hàng' },
  { type: 'phone', label: 'Hotline' },
  { type: 'globe', label: 'Website' },
  { type: 'video', label: 'Video/Live' }
];

export function AddSalesChannelModal({ isOpen, onClose, onCreated }) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[1]); // default blue
  const [selectedIcon, setSelectedIcon] = useState('bag');
  const [hasOrderCode, setHasOrderCode] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMsg(t('order.channelNameRequired') || 'Vui lòng nhập tên kênh bán hàng');
      return;
    }

    const newChannel = addCustomSalesChannel({
      label: {
        vi: trimmed,
        en: trimmed,
        ko: trimmed,
        ru: trimmed
      },
      shortLabel: {
        vi: trimmed,
        en: trimmed,
        ko: trimmed,
        ru: trimmed
      },
      color: selectedColor.color,
      bgColor: selectedColor.bgColor,
      borderColor: selectedColor.borderColor,
      iconType: selectedIcon,
      hasOrderCode: hasOrderCode
    });

    setName('');
    setErrorMsg('');
    if (onCreated) {
      onCreated(newChannel);
    }
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div style={{
        width: '420px',
        maxWidth: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 18px',
          backgroundColor: '#1B5E20',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={18} color="#A5D6A7" />
            <span style={{ fontSize: '15px', fontWeight: 800 }}>
              {t('order.addSalesChannelTitle') || 'Thêm Kênh Bán Hàng Mới'}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#A5D6A7',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '18px 20px' }}>
          {errorMsg && (
            <div style={{
              padding: '8px 12px',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              borderRadius: '6px',
              fontSize: '12.5px',
              marginBottom: '14px',
              fontWeight: 600
            }}>
              {errorMsg}
            </div>
          )}

          {/* Channel Name */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              {t('order.channelNameLabel') || 'Tên kênh bán hàng'} <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder={t('order.channelNamePlaceholder') || 'VD: BeFood, Zalo OA, Website, Hotline...'}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '7px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>

          {/* Color Selection */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              {t('order.channelColorLabel') || 'Màu sắc nhận diện'}
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {COLOR_PRESETS.map((p, idx) => {
                const isSelected = selectedColor.color === p.color;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedColor(p)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: p.color,
                      border: isSelected ? '3px solid #0f172a' : '2px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isSelected && <Check size={16} color="#ffffff" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Icon Selection */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              {t('order.channelIconLabel') || 'Biểu tượng'}
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {ICON_PRESETS.map((ic) => {
                const isSelected = selectedIcon === ic.type;
                return (
                  <button
                    key={ic.type}
                    type="button"
                    onClick={() => setSelectedIcon(ic.type)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: isSelected ? `2px solid ${selectedColor.color}` : '1px solid #cbd5e1',
                      backgroundColor: isSelected ? selectedColor.bgColor : '#ffffff',
                      color: isSelected ? selectedColor.color : '#475569',
                      fontSize: '12px',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {renderChannelIcon(ic.type, 13, isSelected ? selectedColor.color : '#64748b')}
                    <span>{ic.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Require Order Code Checkbox */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12.5px',
            color: '#334155',
            cursor: 'pointer',
            marginBottom: '18px'
          }}>
            <input
              type="checkbox"
              checked={hasOrderCode}
              onChange={(e) => setHasOrderCode(e.target.checked)}
              style={{
                width: '15px',
                height: '15px',
                accentColor: '#1B5E20',
                cursor: 'pointer'
              }}
            />
            <span>{t('order.channelHasOrderCode') || 'Có nhập mã đơn từ app / khách (VD: #SPF-1234)'}</span>
          </label>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {t('cancel') || 'Hủy'}
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 18px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#1B5E20',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {t('add') || 'Thêm kênh bán'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
