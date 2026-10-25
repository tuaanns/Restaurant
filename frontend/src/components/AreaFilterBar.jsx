import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export function AreaFilterBar({
  areas = [],
  selectedArea = 'all',
  onSelectArea,
  summary = { total: 24, empty: 16, occupied: 6, billing: 2 },
  statusFilter = 'all',
  onSelectStatusFilter
}) {
  const { t, formatAreaName } = useLanguage();
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 18px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0'
    }}>
      {/* Area Filter Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => {
            onSelectArea('all');
            if (onSelectStatusFilter) onSelectStatusFilter('all');
          }}
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 600,
            backgroundColor: selectedArea === 'all' && statusFilter === 'all' ? '#0f172a' : '#f1f5f9',
            color: selectedArea === 'all' && statusFilter === 'all' ? '#ffffff' : '#475569',
            border: '1px solid',
            borderColor: selectedArea === 'all' && statusFilter === 'all' ? '#0f172a' : '#e2e8f0',
            transition: 'all 0.15s ease'
          }}
        >
          {t('table.allAreas')} ({summary.total})
        </button>

        {areas.map((area) => {
          const isActive = selectedArea === area.code && statusFilter === 'all';
          return (
            <button
              key={area.code}
              onClick={() => {
                onSelectArea(area.code);
                if (onSelectStatusFilter) onSelectStatusFilter('all');
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: isActive ? '#0f172a' : '#f1f5f9',
                color: isActive ? '#ffffff' : '#475569',
                border: '1px solid',
                borderColor: isActive ? '#0f172a' : '#e2e8f0',
                transition: 'all 0.15s ease'
              }}
            >
              {formatAreaName(area)} ({area.tables ? area.tables.length : (area.code === 'floor_1' || area.code === 'floor_2' ? 8 : 4)})
            </button>
          );
        })}
      </div>

      {/* Legend & Quick Status Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12.5px', fontWeight: 600 }}>
        {/* Trống */}
        <div
          onClick={() => onSelectStatusFilter(statusFilter === 'empty' ? 'all' : 'empty')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '6px',
            backgroundColor: statusFilter === 'empty' ? '#f1f5f9' : 'transparent',
            color: '#64748b'
          }}
        >
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#94a3b8' }}></span>
          <span>{t('table.empty')}: <strong style={{ color: '#0f172a' }}>{summary.empty}</strong></span>
        </div>

        {/* Có khách */}
        <div
          onClick={() => onSelectStatusFilter(statusFilter === 'occupied' ? 'all' : 'occupied')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '6px',
            backgroundColor: statusFilter === 'occupied' ? '#e6f7f5' : 'transparent',
            color: '#0d9488'
          }}
        >
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#0d9488' }}></span>
          <span>{t('table.occupied')}: <strong style={{ color: '#0f172a' }}>{summary.occupied}</strong></span>
        </div>

        {/* Chờ thanh toán */}
        <div
          onClick={() => onSelectStatusFilter(statusFilter === 'billing' ? 'all' : 'billing')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '6px',
            backgroundColor: statusFilter === 'billing' ? '#fef3c7' : 'transparent',
            color: '#d97706'
          }}
        >
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></span>
          <span>{t('table.billing')}: <strong style={{ color: '#0f172a' }}>{summary.billing}</strong></span>
        </div>
      </div>
    </div>
  );
}
