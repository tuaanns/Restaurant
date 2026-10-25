import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  warningText,
  confirmText,
  cancelText,
  loading = false,
  dangerIcon = 'trash'
}) {
  const { t } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 500,
        padding: '20px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '440px',
          maxWidth: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.15s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#334155'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
        >
          <X size={18} />
        </button>

        {/* Header Icon + Title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: '#fee2e2',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {dangerIcon === 'warning' ? <AlertTriangle size={22} /> : <Trash2 size={22} />}
          </div>
          <div style={{ flex: 1, paddingRight: '20px' }}>
            <h3 style={{
              margin: 0,
              fontSize: '17px',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.3px'
            }}>
              {title || t('confirmDelete') || 'Xác nhận xóa'}
            </h3>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '12.5px',
              color: '#64748b'
            }}>
              {t('confirmAction') || 'Vui lòng kiểm tra kỹ trước khi tiếp tục'}
            </p>
          </div>
        </div>

        {/* Message */}
        <div style={{
          fontSize: '13.5px',
          color: '#334155',
          lineHeight: '1.55',
          marginBottom: itemName ? '12px' : '16px'
        }}>
          {message}
        </div>

        {/* Item Name highlight pill */}
        {itemName && (
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              {t('targetItem') || 'Đối tượng'}:
            </span>
            <strong style={{
              fontSize: '13.5px',
              color: '#0f172a',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {itemName}
            </strong>
          </div>
        )}

        {/* Warning text */}
        {warningText && (
          <div style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fef3c7',
            borderRadius: '8px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: '#b45309',
            fontWeight: 500,
            marginBottom: '20px'
          }}>
            <AlertTriangle size={15} style={{ flexShrink: 0 }} />
            <span>{warningText}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s'
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#ffffff'; }}
          >
            {cancelText || t('cancel') || 'Hủy'}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '9px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)',
              transition: 'background-color 0.15s, transform 0.1s'
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#dc2626'; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#ef4444'; }}
          >
            <Trash2 size={14} />
            <span>{loading ? t('loading') : (confirmText || t('confirmDelete') || 'Xóa')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
