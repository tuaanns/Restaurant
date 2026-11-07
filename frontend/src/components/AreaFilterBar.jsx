import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { TabsList, TabsTrigger } from './ui/Tabs.jsx';
import { Badge } from './ui/Badge.jsx';

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
      flexDirection: 'column',
      gap: '8px',
      padding: '8px 14px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border)'
    }}>
      {/* Area Filter Tabs - shadcn Tabs Pill Style */}
      <div className="no-scrollbar" style={{
        display: 'flex',
        alignItems: 'center',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: '2px'
      }}>
        <TabsList style={{ width: 'auto' }}>
          <TabsTrigger
            active={selectedArea === 'all' && statusFilter === 'all'}
            onClick={() => {
              onSelectArea('all');
              if (onSelectStatusFilter) onSelectStatusFilter('all');
            }}
          >
            {t('table.allAreas')} ({summary.total})
          </TabsTrigger>

          {areas.map((area) => {
            const isActive = selectedArea === area.code && statusFilter === 'all';
            return (
              <TabsTrigger
                key={area.code}
                active={isActive}
                onClick={() => {
                  onSelectArea(area.code);
                  if (onSelectStatusFilter) onSelectStatusFilter('all');
                }}
              >
                {formatAreaName(area)} ({area.tables ? area.tables.length : (area.code === 'floor_1' || area.code === 'floor_2' ? 8 : 4)})
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>

      {/* Legend & Quick Status Filters (shadcn Badge Style) */}
      <div className="no-scrollbar" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        overflowX: 'auto',
        fontSize: '11.5px',
        paddingTop: '2px',
        borderTop: '1px dashed #f1f5f9'
      }}>
        {/* Trống */}
        <div
          onClick={() => onSelectStatusFilter(statusFilter === 'empty' ? 'all' : 'empty')}
          style={{ cursor: 'pointer' }}
        >
          <Badge variant={statusFilter === 'empty' ? 'secondary' : 'outline'} style={{ cursor: 'pointer', padding: '4px 10px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#94a3b8' }}></span>
            <span>{t('table.empty')}: <strong style={{ color: '#0f172a' }}>{summary.empty}</strong></span>
          </Badge>
        </div>

        {/* Có khách */}
        <div
          onClick={() => onSelectStatusFilter(statusFilter === 'occupied' ? 'all' : 'occupied')}
          style={{ cursor: 'pointer' }}
        >
          <Badge variant={statusFilter === 'occupied' ? 'default' : 'outline'} style={{ cursor: 'pointer', padding: '4px 10px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#009688' }}></span>
            <span>{t('table.occupied')}: <strong style={{ color: '#0f172a' }}>{summary.occupied}</strong></span>
          </Badge>
        </div>

        {/* Chờ thanh toán */}
        <div
          onClick={() => onSelectStatusFilter(statusFilter === 'billing' ? 'all' : 'billing')}
          style={{ cursor: 'pointer' }}
        >
          <Badge variant={statusFilter === 'billing' ? 'warning' : 'outline'} style={{ cursor: 'pointer', padding: '4px 10px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></span>
            <span>{t('table.billing')}: <strong style={{ color: '#0f172a' }}>{summary.billing}</strong></span>
          </Badge>
        </div>
      </div>
    </div>
  );
}
