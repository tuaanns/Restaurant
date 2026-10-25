import React from 'react';
import { TableCard } from './TableCard';
import { useLanguage } from '../i18n/LanguageContext';

export function TableGrid({
  tables = [],
  selectedTable,
  onSelectTable,
  selectedArea = 'all',
  statusFilter = 'all',
  searchQuery = ''
}) {
  const { t, formatTableName } = useLanguage();
  // Filter logic
  const filteredTables = tables.filter((table) => {
    // Area filter
    if (selectedArea !== 'all' && table.area_code !== selectedArea) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'all' && table.status !== statusFilter) {
      return false;
    }

    // Search query filter (search by table name or notes)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const locName = formatTableName(table.name).toLowerCase();
      const matchName = table.name.toLowerCase().includes(q) || locName.includes(q);
      const matchNotes = table.notes && table.notes.toLowerCase().includes(q);
      if (!matchName && !matchNotes) return false;
    }

    return true;
  });

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '16px 20px',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: '14px',
        alignItems: 'start'
      }}>
        {filteredTables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            isSelected={selectedTable && selectedTable.id === table.id}
            onSelectTable={onSelectTable}
          />
        ))}
      </div>

      {filteredTables.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#94a3b8'
        }}>
          <p style={{ fontSize: '15px', fontWeight: 600 }}>{t('table.notFound')}</p>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>{t('table.tryFilter')}</p>
        </div>
      )}
    </div>
  );
}
