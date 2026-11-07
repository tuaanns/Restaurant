import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  Search, Plus, FileSpreadsheet, MoreHorizontal,
  ChevronLeft, ChevronRight, Trash2, Edit3, Check,
  X, Filter, Download, Printer, RotateCcw,
  LayoutGrid, Table as TableIcon, MapPin, Users,
  CheckCircle, Clock, Sparkles
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export function TablesView({
  tables = [],
  areas = [],
  onOpenAddTable,
  onOpenEditTable,
  onDeleteTable,
  onOpenImportTable,
  onOpenAddArea,
  onOpenEditArea,
  onDeleteArea,
  activeSubTab = 'tables', // 'tables' | 'areas'
  onSelectSubTab
}) {
  const { t, formatTableName, formatAreaName } = useLanguage();

  const THEME = {
    forest: '#1B5E20',
    darkForest: '#2E7D32',
    lightFoam: '#E8F5E9',
    softBg: '#f8fafc',
    border: '#e2e8f0',
    slateDark: '#0f172a',
    slateBody: '#334155',
    slateMuted: '#64748b',
    danger: '#ef4444',
    dangerBg: '#fee2e2'
  };

  const [currentTab, setCurrentTab] = useState(activeSubTab || 'tables');
  const [displayMode, setDisplayMode] = useState('table'); // 'table' | 'cards'

  useEffect(() => {
    if (activeSubTab) setCurrentTab(activeSubTab);
  }, [activeSubTab]);

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
    if (onSelectSubTab) onSelectSubTab(tab);
  };

  // ── Filters for Tables ──
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAreaId, setSelectedAreaId] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'empty' | 'occupied' | 'reserved'
  const [capacityMin, setCapacityMin] = useState('');
  const [capacityMax, setCapacityMax] = useState('');

  // ── Filters for Areas ──
  const [areaSearchTerm, setAreaSearchTerm] = useState('');

  // ── Pagination ──
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // ── Selection ──
  const [selectedRows, setSelectedRows] = useState([]);

  // ── More dropdown ──
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isFiltered = useMemo(() => {
    if (currentTab === 'tables') {
      return (
        searchTerm.trim() !== '' ||
        selectedAreaId !== 'all' ||
        statusFilter !== 'all' ||
        capacityMin !== '' ||
        capacityMax !== ''
      );
    }
    return areaSearchTerm.trim() !== '';
  }, [currentTab, searchTerm, selectedAreaId, statusFilter, capacityMin, capacityMax, areaSearchTerm]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedAreaId('all');
    setStatusFilter('all');
    setCapacityMin('');
    setCapacityMax('');
    setAreaSearchTerm('');
    setCurrentPage(1);
    setSelectedRows([]);
  };

  // Filtered Tables
  const filteredTables = useMemo(() => {
    return tables.filter(tObj => {
      // 1. Search term (table name, area name)
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase().trim();
        const name = (tObj.name || '').toLowerCase();
        const locName = formatTableName(tObj.name).toLowerCase();
        const areaName = (tObj.area_name || areas.find(a => a.id === tObj.area_id)?.name || '').toLowerCase();
        if (!name.includes(q) && !locName.includes(q) && !areaName.includes(q)) {
          return false;
        }
      }

      // 2. Area
      if (selectedAreaId !== 'all') {
        if (String(tObj.area_id) !== String(selectedAreaId)) {
          return false;
        }
      }

      // 3. Status
      if (statusFilter !== 'all') {
        const s = tObj.status || 'empty';
        if (s !== statusFilter) return false;
      }

      // 4. Capacity
      const cap = Number(tObj.capacity || 4);
      if (capacityMin !== '' && !isNaN(Number(capacityMin))) {
        if (cap < Number(capacityMin)) return false;
      }
      if (capacityMax !== '' && !isNaN(Number(capacityMax))) {
        if (cap > Number(capacityMax)) return false;
      }

      return true;
    });
  }, [tables, areas, searchTerm, selectedAreaId, statusFilter, capacityMin, capacityMax, formatTableName]);

  // Filtered Areas
  const filteredAreas = useMemo(() => {
    return areas.filter(a => {
      if (areaSearchTerm.trim() !== '') {
        const q = areaSearchTerm.toLowerCase().trim();
        const name = (a.name || '').toLowerCase();
        const locName = formatAreaName(a.name).toLowerCase();
        if (!name.includes(q) && !locName.includes(q)) return false;
      }
      return true;
    });
  }, [areas, areaSearchTerm, formatAreaName]);

  // Pagination
  const activeDataList = currentTab === 'tables' ? filteredTables : filteredAreas;
  const totalPages = Math.ceil(activeDataList.length / rowsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return activeDataList.slice(start, start + rowsPerPage);
  }, [activeDataList, currentPage, rowsPerPage]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(paginatedItems.map(item => item.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Status badge helper
  const getStatusBadge = (status) => {
    if (status === 'occupied') {
      return {
        label: t('table.occupied') || 'Có khách',
        bg: '#fef3c7',
        color: '#b45309'
      };
    }
    if (status === 'reserved') {
      return {
        label: t('table.reserved') || 'Đặt trước',
        bg: '#ede9fe',
        color: '#7c3aed'
      };
    }
    return {
      label: t('table.empty') || 'Bàn trống',
      bg: '#ecfdf5',
      color: '#059669'
    };
  };

  // Export to Excel
  const handleExportExcel = () => {
    setShowMoreMenu(false);
    if (currentTab === 'tables') {
      const dataToExport = filteredTables.map((tObj, idx) => {
        const area = areas.find(a => a.id === tObj.area_id);
        const statusText = tObj.status === 'occupied' ? 'Đang có khách' : tObj.status === 'reserved' ? 'Đặt trước' : 'Bàn trống';
        return {
          'STT': idx + 1,
          'Tên phòng/bàn': formatTableName(tObj.name),
          'Khu vực': area ? formatAreaName(area.name) : (tObj.area_name || '—'),
          'Sức chứa (người)': tObj.capacity || 4,
          'Trạng thái': statusText
        };
      });
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Phong_Ban');
      XLSX.writeFile(wb, `Danh_Sach_Phong_Ban_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } else {
      const dataToExport = filteredAreas.map((a, idx) => ({
        'STT': idx + 1,
        'Tên khu vực': formatAreaName(a.name),
        'Số lượng bàn': tables.filter(t => t.area_id === a.id).length
      }));
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Khu_Vuc');
      XLSX.writeFile(wb, `Danh_Sach_Khu_Vuc_${new Date().toISOString().slice(0, 10)}.xlsx`);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>

      {/* ═══════════════════════════════════════════════════════════
          LEFT SIDEBAR: FILTER CARD
      ═══════════════════════════════════════════════════════════ */}
      <aside style={{
        width: '260px',
        flexShrink: 0,
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: `1px solid ${THEME.border}`,
        padding: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        alignSelf: 'flex-start'
      }}>
        {/* Title */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: `1px solid ${THEME.border}`
        }}>
          <h2 style={{ fontSize: '17px', fontWeight: 800, color: THEME.slateDark, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LayoutGrid size={18} color={THEME.forest} />
            <span>{currentTab === 'tables' ? (t('admin.roomTable') || 'Phòng / Bàn') : (t('admin.areaTitle') || 'Khu vực')}</span>
          </h2>
          {isFiltered && (
            <button
              onClick={handleResetFilters}
              title={t('admin.customersView.resetFilters') || 'Thiết lập lại'}
              style={{
                background: 'none',
                border: 'none',
                color: THEME.forest,
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RotateCcw size={12} /> {t('admin.customersView.resetFilters') || 'Đặt lại'}
            </button>
          )}
        </div>

        {/* ── Table Filters ── */}
        {currentTab === 'tables' && (
          <>
            {/* 1. Area Filter */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: THEME.slateDark }}>
                  {t('admin.areaTitle') || 'Khu vực'}
                </span>
                <button
                  type="button"
                  onClick={onOpenAddArea}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: THEME.forest,
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  {t('admin.customersView.createNewGroup') || '+ Tạo mới'}
                </button>
              </div>
              <select
                value={selectedAreaId}
                onChange={e => { setSelectedAreaId(e.target.value); setCurrentPage(1); }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${THEME.border}`,
                  backgroundColor: '#fff',
                  fontSize: '13px',
                  color: THEME.slateDark,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">{t('table.allAreas') || 'Tất cả khu vực'} ({tables.length})</option>
                {areas.map(a => {
                  const count = tables.filter(t => String(t.area_id) === String(a.id)).length;
                  return (
                    <option key={a.id} value={String(a.id)}>
                      {formatAreaName(a.name)} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* 2. Table Status */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: THEME.slateDark, marginBottom: '8px' }}>
                {t('status') || 'Trạng thái bàn'}
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: THEME.slateBody, cursor: 'pointer', marginBottom: '6px' }}>
                <input
                  type="radio"
                  name="tableStatus"
                  checked={statusFilter === 'all'}
                  onChange={() => { setStatusFilter('all'); setCurrentPage(1); }}
                  style={{ accentColor: THEME.forest }}
                />
                <span>{t('admin.customersView.anyTime') || 'Tất cả trạng thái'}</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: THEME.slateBody, cursor: 'pointer', marginBottom: '6px' }}>
                <input
                  type="radio"
                  name="tableStatus"
                  checked={statusFilter === 'empty'}
                  onChange={() => { setStatusFilter('empty'); setCurrentPage(1); }}
                  style={{ accentColor: THEME.forest }}
                />
                <span>{t('table.empty') || 'Bàn trống'}</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: THEME.slateBody, cursor: 'pointer', marginBottom: '6px' }}>
                <input
                  type="radio"
                  name="tableStatus"
                  checked={statusFilter === 'occupied'}
                  onChange={() => { setStatusFilter('occupied'); setCurrentPage(1); }}
                  style={{ accentColor: THEME.forest }}
                />
                <span>{t('table.occupied') || 'Đang có khách'}</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: THEME.slateBody, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="tableStatus"
                  checked={statusFilter === 'reserved'}
                  onChange={() => { setStatusFilter('reserved'); setCurrentPage(1); }}
                  style={{ accentColor: THEME.forest }}
                />
                <span>{t('table.reserved') || 'Đã đặt trước'}</span>
              </label>
            </div>

            {/* 3. Capacity Range */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: THEME.slateDark, marginBottom: '6px' }}>
                {t('table.capacity') || 'Sức chứa'}
              </div>
              <div style={{ fontSize: '11.5px', color: THEME.slateMuted, marginBottom: '6px' }}>
                {t('admin.customersView.value') || 'Số người (chỗ ngồi)'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: THEME.slateMuted, width: '32px' }}>
                  {t('admin.customersView.from') || 'Từ'}
                </span>
                <input
                  type="number"
                  placeholder="1"
                  value={capacityMin}
                  onChange={e => { setCapacityMin(e.target.value); setCurrentPage(1); }}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: `1px solid ${THEME.border}`,
                    fontSize: '12px',
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: THEME.slateMuted, width: '32px' }}>
                  {t('admin.customersView.to') || 'Đến'}
                </span>
                <input
                  type="number"
                  placeholder="20"
                  value={capacityMax}
                  onChange={e => { setCapacityMax(e.target.value); setCurrentPage(1); }}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: `1px solid ${THEME.border}`,
                    fontSize: '12px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* 4. Display Mode */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: THEME.slateDark, marginBottom: '8px' }}>
                {t('admin.displayMode') || 'Chế độ xem'}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setDisplayMode('table')}
                  style={{
                    flex: 1,
                    padding: '7px 8px',
                    borderRadius: '6px',
                    border: `1px solid ${displayMode === 'table' ? THEME.forest : THEME.border}`,
                    backgroundColor: displayMode === 'table' ? THEME.lightFoam : '#ffffff',
                    color: displayMode === 'table' ? THEME.forest : THEME.slateBody,
                    fontSize: '12px',
                    fontWeight: displayMode === 'table' ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <TableIcon size={14} /> Dạng bảng
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayMode('cards')}
                  style={{
                    flex: 1,
                    padding: '7px 8px',
                    borderRadius: '6px',
                    border: `1px solid ${displayMode === 'cards' ? THEME.forest : THEME.border}`,
                    backgroundColor: displayMode === 'cards' ? THEME.lightFoam : '#ffffff',
                    color: displayMode === 'cards' ? THEME.forest : THEME.slateBody,
                    fontSize: '12px',
                    fontWeight: displayMode === 'cards' ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <LayoutGrid size={14} /> Dạng thẻ
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Area Summary ── */}
        {currentTab === 'areas' && (
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: THEME.slateDark, marginBottom: '8px' }}>
              {t('admin.areaOverview') || 'Tổng quan khu vực'}
            </div>
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: THEME.softBg,
              border: `1px solid ${THEME.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '12.5px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: THEME.slateMuted }}>{t('admin.areasCount') || 'Tổng khu vực'}:</span>
                <span style={{ fontWeight: 800, color: THEME.slateDark }}>{areas.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: THEME.slateMuted }}>{t('admin.totalTables') || 'Tổng số bàn'}:</span>
                <span style={{ fontWeight: 800, color: THEME.forest }}>{tables.length}</span>
              </div>
            </div>
          </div>
        )}

      </aside>

      {/* ═══════════════════════════════════════════════════════════
          RIGHT MAIN CONTENT
      ═══════════════════════════════════════════════════════════ */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* Top Action Bar */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: `1px solid ${THEME.border}`,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          {/* Search Input */}
          <div style={{
            position: 'relative',
            width: '380px',
            maxWidth: '100%'
          }}>
            <Search size={16} color={THEME.slateMuted} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder={currentTab === 'tables' ? (t('admin.searchTablePlaceholder') || 'Theo tên bàn, mã bàn, khu vực...') : (t('admin.searchAreaPlaceholder') || 'Theo tên khu vực...')}
              value={currentTab === 'tables' ? searchTerm : areaSearchTerm}
              onChange={e => {
                if (currentTab === 'tables') setSearchTerm(e.target.value);
                else setAreaSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '100%',
                padding: '8.5px 36px 8.5px 36px',
                borderRadius: '8px',
                border: `1px solid ${THEME.border}`,
                fontSize: '13px',
                outline: 'none',
                backgroundColor: '#ffffff',
                transition: 'border-color 0.15s ease'
              }}
              onFocus={e => e.currentTarget.style.borderColor = THEME.forest}
              onBlur={e => e.currentTarget.style.borderColor = THEME.border}
            />
            {(currentTab === 'tables' ? searchTerm : areaSearchTerm) ? (
              <button
                onClick={() => {
                  if (currentTab === 'tables') setSearchTerm('');
                  else setAreaSearchTerm('');
                }}
                style={{
                  position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: THEME.slateMuted, cursor: 'pointer', padding: 0
                }}
              >
                <X size={14} />
              </button>
            ) : (
              <Filter size={14} color={THEME.slateMuted} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }} />
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Sub-tab pills switch */}
            <div style={{
              display: 'flex',
              backgroundColor: THEME.softBg,
              borderRadius: '8px',
              padding: '3px',
              border: `1px solid ${THEME.border}`,
              marginRight: '4px'
            }}>
              <button
                type="button"
                onClick={() => handleTabChange('tables')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: currentTab === 'tables' ? 700 : 500,
                  backgroundColor: currentTab === 'tables' ? '#ffffff' : 'transparent',
                  color: currentTab === 'tables' ? THEME.forest : THEME.slateBody,
                  boxShadow: currentTab === 'tables' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <LayoutGrid size={13} />
                <span>{t('admin.tables') || 'Phòng / Bàn'}</span>
                <span style={{
                  fontSize: '11px',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: currentTab === 'tables' ? THEME.lightFoam : '#e2e8f0',
                  color: currentTab === 'tables' ? THEME.forest : THEME.slateMuted,
                  fontWeight: 700
                }}>
                  {tables.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('areas')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: currentTab === 'areas' ? 700 : 500,
                  backgroundColor: currentTab === 'areas' ? '#ffffff' : 'transparent',
                  color: currentTab === 'areas' ? THEME.forest : THEME.slateBody,
                  boxShadow: currentTab === 'areas' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <MapPin size={13} />
                <span>{t('admin.areas') || 'Khu vực'}</span>
                <span style={{
                  fontSize: '11px',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: currentTab === 'areas' ? THEME.lightFoam : '#e2e8f0',
                  color: currentTab === 'areas' ? THEME.forest : THEME.slateMuted,
                  fontWeight: 700
                }}>
                  {areas.length}
                </span>
              </button>
            </div>

            {/* + Add New Button */}
            {currentTab === 'tables' ? (
              <button
                onClick={onOpenAddTable}
                style={{
                  padding: '8.5px 16px',
                  borderRadius: '8px',
                  backgroundColor: THEME.forest,
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'background-color 0.15s ease',
                  boxShadow: '0 1px 2px rgba(27,94,32,0.2)'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = THEME.darkForest}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = THEME.forest}
              >
                <Plus size={15} />
                <span>{t('admin.addTable') || '+ Thêm bàn mới'}</span>
              </button>
            ) : (
              <button
                onClick={onOpenAddArea}
                style={{
                  padding: '8.5px 16px',
                  borderRadius: '8px',
                  backgroundColor: THEME.forest,
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'background-color 0.15s ease',
                  boxShadow: '0 1px 2px rgba(27,94,32,0.2)'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = THEME.darkForest}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = THEME.forest}
              >
                <Plus size={15} />
                <span>{t('admin.addArea') || '+ Thêm khu vực'}</span>
              </button>
            )}

            {/* Import Button */}
            {currentTab === 'tables' && (
              <button
                onClick={onOpenImportTable}
                style={{
                  padding: '8.5px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  color: THEME.slateDark,
                  border: `1px solid ${THEME.border}`,
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = THEME.lightFoam; e.currentTarget.style.borderColor = THEME.forest; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = THEME.border; }}
              >
                <FileSpreadsheet size={15} color={THEME.forest} />
                <span>{t('admin.import') || 'Nhập file'}</span>
              </button>
            )}

            {/* More Menu */}
            <div style={{ position: 'relative' }} ref={moreMenuRef}>
              <button
                onClick={() => setShowMoreMenu(prev => !prev)}
                title={t('admin.customersView.moreActions') || 'Thao tác khác'}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  color: THEME.slateDark,
                  border: `1px solid ${THEME.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                <MoreHorizontal size={17} />
              </button>

              {showMoreMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '6px',
                  width: '210px',
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: `1px solid ${THEME.border}`,
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                  zIndex: 100,
                  overflow: 'hidden'
                }}>
                  <button
                    onClick={handleExportExcel}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      color: THEME.slateDark,
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Download size={15} color={THEME.forest} />
                    <span>{t('admin.exportExcel') || 'Xuất file Excel (.xlsx)'}</span>
                  </button>
                  <button
                    onClick={() => { setShowMoreMenu(false); window.print(); }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      color: THEME.slateDark,
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Printer size={15} color="#64748b" />
                    <span>{t('admin.printList') || 'In danh sách'}</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── Table Card (Dạng Bảng hoặc Khu Vực) ── */}
        {(currentTab === 'areas' || displayMode === 'table') ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: `1px solid ${THEME.border}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{
                    backgroundColor: THEME.softBg,
                    borderBottom: `2px solid ${THEME.border}`,
                    textAlign: 'left',
                    color: THEME.slateMuted,
                    fontSize: '12px',
                    fontWeight: 700
                  }}>
                    <th style={{ width: '44px', padding: '12px 14px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={paginatedItems.length > 0 && paginatedItems.every(item => selectedRows.includes(item.id))}
                        onChange={handleSelectAll}
                        style={{ accentColor: THEME.forest, cursor: 'pointer' }}
                      />
                    </th>

                    {currentTab === 'tables' ? (
                      <>
                        <th style={{ padding: '12px 14px' }}>{t('table.tableName') || 'Tên phòng/bàn'}</th>
                        <th style={{ padding: '12px 14px' }}>{t('admin.areaTitle') || 'Khu vực'}</th>
                        <th style={{ padding: '12px 14px', textAlign: 'center' }}>{t('table.capacity') || 'Sức chứa'}</th>
                        <th style={{ padding: '12px 14px', textAlign: 'center' }}>{t('status') || 'Trạng thái'}</th>
                        <th style={{ padding: '12px 14px', textAlign: 'center' }}>{t('actions') || 'Thao tác'}</th>
                      </>
                    ) : (
                      <>
                        <th style={{ padding: '12px 14px' }}>{t('admin.areaName') || 'Tên khu vực'}</th>
                        <th style={{ padding: '12px 14px', textAlign: 'center' }}>{t('admin.tablesInArea') || 'Số lượng bàn'}</th>
                        <th style={{ padding: '12px 14px' }}>{t('admin.tableList') || 'Danh sách bàn'}</th>
                        <th style={{ padding: '12px 14px', textAlign: 'center' }}>{t('actions') || 'Thao tác'}</th>
                      </>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {/* Summary Row */}
                  <tr style={{
                    backgroundColor: '#ffffff',
                    borderBottom: `1px solid ${THEME.border}`,
                    fontWeight: 700,
                    color: THEME.slateDark,
                    fontSize: '12.5px'
                  }}>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>—</td>
                    {currentTab === 'tables' ? (
                      <>
                        <td style={{ padding: '10px 14px', color: THEME.forest }}>
                          {filteredTables.length} {t('admin.tables') || 'bàn'}
                        </td>
                        <td style={{ padding: '10px 14px', color: THEME.slateMuted }}>
                          {isFiltered ? '(Đã lọc)' : 'Toàn bộ phòng bàn'}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', color: THEME.slateDark }}>
                          {filteredTables.reduce((acc, t) => acc + Number(t.capacity || 4), 0)} chỗ
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <span style={{ color: '#059669' }}>{filteredTables.filter(t => !t.status || t.status === 'empty').length} trống</span>
                          {' / '}
                          <span style={{ color: '#b45309' }}>{filteredTables.filter(t => t.status === 'occupied').length} có khách</span>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>—</td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: '10px 14px', color: THEME.forest }}>{filteredAreas.length} khu vực</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', color: THEME.forest, fontWeight: 800 }}>
                          {tables.length} bàn
                        </td>
                        <td style={{ padding: '10px 14px' }}>—</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>—</td>
                      </>
                    )}
                  </tr>

                  {/* Data Rows */}
                  {currentTab === 'tables' ? (
                    paginatedItems.map(tObj => {
                      const isSelected = selectedRows.includes(tObj.id);
                      const area = areas.find(a => a.id === tObj.area_id);
                      const statusInfo = getStatusBadge(tObj.status);

                      return (
                        <tr
                          key={tObj.id}
                          style={{
                            borderBottom: `1px solid ${THEME.border}`,
                            backgroundColor: isSelected ? '#f0fdf4' : 'transparent',
                            transition: 'background-color 0.12s ease'
                          }}
                          onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = '#fafafa'; }}
                          onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectRow(tObj.id)}
                              style={{ accentColor: THEME.forest, cursor: 'pointer' }}
                            />
                          </td>

                          {/* Tên bàn */}
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ fontWeight: 800, color: THEME.slateDark, fontSize: '14px' }}>
                              {formatTableName(tObj.name)}
                            </div>
                          </td>

                          {/* Khu vực */}
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '12px', fontSize: '11.5px', fontWeight: 600, backgroundColor: '#f1f5f9', color: THEME.slateBody }}>
                              <MapPin size={12} color={THEME.forest} />
                              <span>{area ? formatAreaName(area.name) : (tObj.area_name || '—')}</span>
                            </div>
                          </td>

                          {/* Sức chứa */}
                          <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: THEME.slateDark, fontWeight: 700, fontSize: '13px' }}>
                              <Users size={13} color="#94a3b8" />
                              <span>{tObj.capacity || 4} {t('table.people') || 'người'}</span>
                            </div>
                          </td>

                          {/* Trạng thái */}
                          <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                            <span style={{
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              backgroundColor: statusInfo.bg,
                              color: statusInfo.color
                            }}>
                              {statusInfo.label}
                            </span>
                          </td>

                          {/* Thao tác */}
                          <td style={{ padding: '10px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                onClick={() => onOpenEditTable(tObj)}
                                title={t('edit') || 'Sửa bàn'}
                                style={{
                                  padding: '6px',
                                  borderRadius: '6px',
                                  color: THEME.forest,
                                  backgroundColor: THEME.lightFoam,
                                  border: 'none',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.12s ease'
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#c8e6c9'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = THEME.lightFoam}
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => onDeleteTable(tObj)}
                                title={t('delete') || 'Xóa bàn'}
                                style={{
                                  padding: '6px',
                                  borderRadius: '6px',
                                  color: THEME.danger,
                                  backgroundColor: THEME.dangerBg,
                                  border: 'none',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.12s ease'
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fecaca'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = THEME.dangerBg}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    paginatedItems.map(a => {
                      const isSelected = selectedRows.includes(a.id);
                      const areaTables = tables.filter(t => t.area_id === a.id);

                      return (
                        <tr
                          key={a.id}
                          style={{
                            borderBottom: `1px solid ${THEME.border}`,
                            backgroundColor: isSelected ? '#f0fdf4' : 'transparent',
                            transition: 'background-color 0.12s ease'
                          }}
                          onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = '#fafafa'; }}
                          onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectRow(a.id)}
                              style={{ accentColor: THEME.forest, cursor: 'pointer' }}
                            />
                          </td>

                          {/* Tên khu vực */}
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ fontWeight: 800, color: THEME.slateDark, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <MapPin size={15} color={THEME.forest} />
                              <span>{formatAreaName(a.name)}</span>
                            </div>
                          </td>

                          {/* Số lượng bàn */}
                          <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                            <span style={{
                              padding: '3px 12px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 700,
                              backgroundColor: '#eff6ff',
                              color: '#1d4ed8'
                            }}>
                              {areaTables.length} bàn
                            </span>
                          </td>

                          {/* Danh sách bàn */}
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                              {areaTables.slice(0, 8).map(t => (
                                <span key={t.id} style={{
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  backgroundColor: '#f1f5f9',
                                  color: THEME.slateBody
                                }}>
                                  {formatTableName(t.name)}
                                </span>
                              ))}
                              {areaTables.length > 8 && (
                                <span style={{ fontSize: '11px', color: THEME.slateMuted, alignSelf: 'center' }}>
                                  +{areaTables.length - 8} bàn khác
                                </span>
                              )}
                              {areaTables.length === 0 && (
                                <span style={{ fontSize: '11.5px', color: THEME.slateMuted, fontStyle: 'italic' }}>Chưa có bàn</span>
                              )}
                            </div>
                          </td>

                          {/* Thao tác */}
                          <td style={{ padding: '10px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                onClick={() => onOpenEditArea(a)}
                                title={t('edit') || 'Sửa khu vực'}
                                style={{
                                  padding: '6px',
                                  borderRadius: '6px',
                                  color: THEME.forest,
                                  backgroundColor: THEME.lightFoam,
                                  border: 'none',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => onDeleteArea(a)}
                                title={t('delete') || 'Xóa khu vực'}
                                style={{
                                  padding: '6px',
                                  borderRadius: '6px',
                                  color: THEME.danger,
                                  backgroundColor: THEME.dangerBg,
                                  border: 'none',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}

                  {activeDataList.length === 0 && (
                    <tr>
                      <td colSpan={currentTab === 'tables' ? 6 : 5} style={{ padding: '60px 20px', textAlign: 'center', color: THEME.slateMuted }}>
                        <LayoutGrid size={36} color="#cbd5e1" style={{ margin: '0 auto 10px', display: 'block' }} />
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{t('noResultsFound') || 'Không tìm thấy dữ liệu phù hợp'}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div style={{
              padding: '12px 16px',
              borderTop: `1px solid ${THEME.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px',
              color: THEME.slateBody
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select
                  value={rowsPerPage}
                  onChange={e => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    border: `1px solid ${THEME.border}`,
                    backgroundColor: '#ffffff',
                    fontSize: '12.5px',
                    color: THEME.slateDark,
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span style={{ color: THEME.slateMuted }}>{t('rows') || 'Hàng'}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '6px',
                      border: `1px solid ${THEME.border}`,
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                      color: currentPage <= 1 ? '#cbd5e1' : THEME.slateDark
                    }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '6px',
                      border: `1px solid ${THEME.border}`,
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                      color: currentPage >= totalPages ? '#cbd5e1' : THEME.slateDark
                    }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                <span style={{ color: THEME.slateMuted }}>
                  {activeDataList.length === 0
                    ? '0 - 0 trong tổng 0'
                    : `${(currentPage - 1) * rowsPerPage + 1} - ${Math.min(currentPage * rowsPerPage, activeDataList.length)} trong tổng ${activeDataList.length}`}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* ── Cards Grid View (Dạng Thẻ Sơ Đồ) ── */
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '12px' }}>
              {paginatedItems.map(tObj => {
                const area = areas.find(a => a.id === tObj.area_id);
                const statusInfo = getStatusBadge(tObj.status);

                return (
                  <div
                    key={tObj.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: `1px solid ${THEME.border}`,
                      padding: '16px',
                      position: 'relative',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '120px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: 800, color: THEME.slateDark }}>
                            {formatTableName(tObj.name)}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', color: THEME.slateMuted, fontSize: '12px' }}>
                            <MapPin size={12} color={THEME.forest} />
                            <span>{area ? formatAreaName(area.name) : (tObj.area_name || '—')}</span>
                          </div>
                        </div>
                        <span style={{
                          padding: '3px 9px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: statusInfo.bg,
                          color: statusInfo.color
                        }}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: THEME.slateMuted, marginTop: '8px' }}>
                        <Users size={12} />
                        <span>{t('table.capacity') || 'Sức chứa'}: <strong>{tObj.capacity || 4}</strong> {t('table.people') || 'người'}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', marginTop: '14px', justifyContent: 'flex-end', borderTop: `1px solid ${THEME.border}`, paddingTop: '10px' }}>
                      <button
                        onClick={() => onOpenEditTable(tObj)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '6px',
                          color: THEME.forest,
                          backgroundColor: THEME.lightFoam,
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          fontWeight: 600
                        }}
                      >
                        <Edit3 size={12} /> {t('edit') || 'Sửa'}
                      </button>
                      <button
                        onClick={() => onDeleteTable(tObj)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '6px',
                          color: THEME.danger,
                          backgroundColor: THEME.dangerBg,
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          fontWeight: 600
                        }}
                      >
                        <Trash2 size={12} /> {t('delete') || 'Xóa'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination for Cards */}
            <div style={{
              marginTop: '16px',
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              border: `1px solid ${THEME.border}`,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px',
              color: THEME.slateBody
            }}>
              <span style={{ color: THEME.slateMuted }}>
                {filteredTables.length === 0
                  ? '0 bàn'
                  : `Hiển thị ${(currentPage - 1) * rowsPerPage + 1} - ${Math.min(currentPage * rowsPerPage, filteredTables.length)} trong tổng ${filteredTables.length} bàn`}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '6px',
                    border: `1px solid ${THEME.border}`,
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                    color: currentPage <= 1 ? '#cbd5e1' : THEME.slateDark
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '6px',
                    border: `1px solid ${THEME.border}`,
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                    color: currentPage >= totalPages ? '#cbd5e1' : THEME.slateDark
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}

