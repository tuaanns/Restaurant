import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export function ItemNoteModal({
  isOpen,
  onClose,
  item,
  onSaveNote
}) {
  const { t, formatDishName } = useLanguage();
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    if (item) {
      setNoteText(item.note || '');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const quickTags = [
    'Ít hành tây, làm mềm',
    'Cay nhẹ',
    'Không đường, nhiều đá',
    'Không tiêu',
    'Nhiều sốt',
    'Ăn chay',
    'Làm chín kỹ',
    'Để riêng sốt',
    'Giao ngay'
  ];

  const handleSave = () => {
    onSaveNote(item.id, noteText);
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
      zIndex: 110
    }}>
      <div style={{
        width: '420px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '14px 18px',
          backgroundColor: '#0b1320',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '14.5px', fontWeight: 800 }}>{t('itemNote.title')}</div>
            <div style={{ fontSize: '12px', color: '#38bdf8' }}>{formatDishName(item.product_name, item.code || item.product_code)}</div>
          </div>
          <button onClick={onClose} style={{ color: '#94a3b8' }}><X size={18} /></button>
        </div>

        <div style={{ padding: '16px' }}>
          <textarea
            rows={3}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder={t('itemNote.placeholder')}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1.5px solid #cbd5e1',
              fontSize: '13px',
              outline: 'none',
              marginBottom: '12px',
              resize: 'none',
              boxSizing: 'border-box'
            }}
          />

          <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
            Chọn nhanh:
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {quickTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setNoteText(tag)}
                style={{
                  fontSize: '11px',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  backgroundColor: noteText === tag ? '#009688' : '#f1f5f9',
                  color: noteText === tag ? '#ffffff' : '#475569',
                  border: '1px solid #e2e8f0'
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              onClick={() => setNoteText('')}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                color: '#475569',
                fontSize: '12.5px',
                fontWeight: 600
              }}
            >
              {t('itemNote.clear')}
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '8px 18px',
                borderRadius: '6px',
                backgroundColor: '#009688',
                color: '#ffffff',
                fontSize: '12.5px',
                fontWeight: 700
              }}
            >
              {t('itemNote.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
