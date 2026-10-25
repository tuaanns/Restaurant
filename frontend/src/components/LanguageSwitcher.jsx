import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { ChevronDown } from 'lucide-react';
import { FlagIcon } from './FlagIcon';

/**
 * LanguageSwitcher — Nút chọn ngôn ngữ với cờ tròn vector chuẩn quốc tế
 *
 * Props:
 *   variant: 'light' (nền sáng cho Admin / LoginPage) |
 *            'dark'  (nền tối cho Header POS)
 */
export function LanguageSwitcher({ variant = 'light' }) {
  const { lang, switchLang, languages } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Đóng khi click ra ngoài
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = languages.find(l => l.code === lang) || languages[0];
  const isDark = variant === 'dark';

  const btnStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '4px 10px',
    borderRadius: '20px',
    border: isDark ? '1px solid rgba(255,255,255,0.18)' : '1px solid #cbd5e1',
    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#ffffff',
    color: isDark ? '#f8fafc' : '#1e293b',
    cursor: 'pointer',
    fontSize: '12.5px',
    fontWeight: 600,
    transition: 'all 0.15s ease',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    boxShadow: isDark ? 'none' : '0 1px 2px rgba(0,0,0,0.04)',
  };

  const dropdownStyle = {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    minWidth: '205px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 12px 32px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
    padding: '6px',
    overflow: 'hidden',
    zIndex: 9999,
  };

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={btnStyle}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.15)' : '#f8fafc';
          e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.08)' : '#ffffff';
          e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.18)' : '#cbd5e1';
        }}
        title="Select Language"
      >
        <FlagIcon code={current.code} size={20} />
        <span style={{ fontSize: '13px', fontWeight: 600 }}>{current.label}</span>
        <ChevronDown
          size={13}
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            opacity: 0.7,
            marginLeft: '2px'
          }}
        />
      </button>

      {open && (
        <div style={dropdownStyle}>
          {languages.map(l => {
            const isSelected = l.code === lang;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => { switchLang(l.code); setOpen(false); }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  textAlign: 'left',
                  fontSize: '13px',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? '#009688' : '#1e293b',
                  backgroundColor: isSelected ? '#e6f7f5' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.1s ease',
                  boxSizing: 'border-box'
                }}
                onMouseEnter={e => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = '#f1f5f9';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = isSelected ? '#e6f7f5' : 'transparent';
                }}
              >
                <FlagIcon code={l.code} size={22} />
                <span style={{ flex: 1 }}>
                  {l.label} <span style={{ color: isSelected ? '#009688' : '#64748b', fontSize: '12px' }}>({l.countryCode || l.code.toUpperCase()})</span>
                </span>
                {isSelected && (
                  <span style={{ fontSize: '13px', color: '#009688', fontWeight: 800 }}>✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
