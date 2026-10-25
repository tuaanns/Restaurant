import React from 'react';
import { PhoneCall } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export function FooterShortcuts({ onTriggerShortcut }) {
  const { t } = useLanguage();

  const shortcuts = [
    { key: 'F1', label: t('header.tables'),       action: () => onTriggerShortcut('F1') },
    { key: 'F2', label: t('menu.title'),           action: () => onTriggerShortcut('F2') },
    { key: 'F3', label: t('search'),               action: () => onTriggerShortcut('F3') },
    { key: 'F4', label: t('customer.title'),       action: () => onTriggerShortcut('F4') },
    { key: 'F9', label: t('payment.title'),        action: () => onTriggerShortcut('F9') },
    { key: 'F10', label: t('kitchen.title').split(' ')[0], action: () => onTriggerShortcut('F10') },
  ];

  return (
    <footer style={{
      backgroundColor: '#070d17',
      color: '#94a3b8',
      height: '34px',
      padding: '0 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '11.5px',
      borderTop: '1px solid #142033',
      zIndex: 10
    }}>
      {/* Left: Hotline & Version */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PhoneCall size={12} color="#00a884" />
          <span>Hotline: <strong style={{ color: '#f8fafc' }}>1900 6888</strong></span>
        </div>
        <span style={{ color: '#334155' }}>|</span>
        <div>
          <span>POS: <strong style={{ color: '#cbd5e1' }}>v4.2.0-PRO</strong></span>
        </div>
      </div>

      {/* Right: Keyboard shortcuts */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {shortcuts.map((sc) => (
          <div
            key={sc.key}
            onClick={sc.action}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <span style={{
              backgroundColor: '#16233b',
              color: '#38bdf8',
              fontSize: '10px',
              fontWeight: 700,
              padding: '1px 5px',
              borderRadius: '3px',
              border: '1px solid #23385d'
            }}>
              {sc.key}
            </span>
            <span style={{ color: '#cbd5e1', fontSize: '11px', fontWeight: 500 }}>
              {sc.label}
            </span>
          </div>
        ))}
      </div>
    </footer>
  );
}
