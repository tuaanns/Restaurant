import React, { useState } from 'react';
import { X, ArrowLeftRight } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export function TransferTableModal({
  isOpen,
  onClose,
  currentTable,
  tables = [],
  onConfirmTransfer
}) {
  const { t, formatTableName } = useLanguage();
  const [selectedTargetId, setSelectedTargetId] = useState(null);

  if (!isOpen) return null;

  // Filter only empty tables (or tables other than current)
  const availableTables = tables.filter(t => t.id !== currentTable?.id && t.status === 'empty');

  const handleTransfer = () => {
    if (!selectedTargetId) return;
    onConfirmTransfer(currentTable.id, selectedTargetId);
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
      zIndex: 100
    }}>
      <div style={{
        width: '480px',
        maxHeight: '80vh',
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 18px',
          backgroundColor: '#0b1320',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowLeftRight size={17} color="#38bdf8" />
            <span style={{ fontSize: '15px', fontWeight: 800 }}>{t('transfer.title')}</span>
          </div>
          <button onClick={onClose} style={{ color: '#94a3b8' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 20px', flex: 1, overflowY: 'auto' }}>
          <div style={{
            fontSize: '13px',
            color: '#475569',
            marginBottom: '14px',
            backgroundColor: '#f8fafc',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            {t('transfer.from')}: <strong style={{ color: '#009688' }}>{formatTableName(currentTable?.name)}</strong>
            {' → '}{t('transfer.selectTarget')}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            marginBottom: '16px'
          }}>
            {availableTables.map((tbl) => {
              const isPicked = selectedTargetId === tbl.id;
              return (
                <div
                  key={tbl.id}
                  onClick={() => setSelectedTargetId(tbl.id)}
                  style={{
                    padding: '12px 10px',
                    borderRadius: '8px',
                    border: isPicked ? '2px solid #009688' : '1px solid #cbd5e1',
                    backgroundColor: isPicked ? '#e6f7f5' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                    {formatTableName(tbl.name)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    {tbl.capacity} {t('table.people')} • {t('table.empty')}
                  </div>
                </div>
              );
            })}
          </div>

          {availableTables.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
              {t('transfer.onlyEmpty')}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{
          padding: '12px 18px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              color: '#475569',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            {t('cancel')}
          </button>

          <button
            disabled={!selectedTargetId}
            onClick={handleTransfer}
            style={{
              padding: '8px 20px',
              borderRadius: '6px',
              backgroundColor: selectedTargetId ? '#009688' : '#94a3b8',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: selectedTargetId ? 'pointer' : 'not-allowed'
            }}
          >
            {t('transfer.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
