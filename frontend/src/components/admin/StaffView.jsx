import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  Search, Plus, FileSpreadsheet, MoreHorizontal,
  ChevronLeft, ChevronRight, Trash2, Edit3, Check,
  X, Filter, Download, Printer, RotateCcw, Users,
  UserCheck, Shield, Calendar, Phone, Mail
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export function StaffView({
  users = [],
  currentUser,
  onOpenAddUser,
  onOpenEditUser,
  onDeleteUser,
  onOpenImportUser
}) {
  const { t } = useLanguage();

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

  // ── Filters ──
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all'); // 'all' | 'admin' | 'cashier' | etc.
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [selectedShift, setSelectedShift] = useState('all');
  const [createdTimeType, setCreatedTimeType] = useState('any'); // 'any' | 'custom'
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');

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

  const getShiftLabel = (val) => {
    if (!val) return '—';
    if (val.includes('sáng') || val === 'morning') return t('admin.shiftMorning') || 'Ca sáng (07:00 - 15:00)';
    if (val.includes('chiều') || val === 'afternoon') return t('admin.shiftAfternoon') || 'Ca chiều (15:00 - 23:00)';
    if (val.includes('tối') || val === 'night') return t('admin.shiftNight') || 'Ca tối (17:00 - 23:00)';
    if (val.includes('Toàn ca') || val === 'full') return t('admin.shiftFull') || 'Toàn ca (07:00 - 23:00)';
    return val;
  };

  // Check if any filter is active
  const isFiltered = useMemo(() => {
    return (
      searchTerm.trim() !== '' ||
      selectedRole !== 'all' ||
      statusFilter !== 'all' ||
      selectedShift !== 'all' ||
      createdTimeType !== 'any'
    );
  }, [searchTerm, selectedRole, statusFilter, selectedShift, createdTimeType]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedRole('all');
    setStatusFilter('all');
    setSelectedShift('all');
    setCreatedTimeType('any');
    setCreatedFrom('');
    setCreatedTo('');
    setCurrentPage(1);
    setSelectedRows([]);
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      // 1. Search term (name, username, phone, email)
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase().trim();
        const name = (u.name || '').toLowerCase();
        const username = (u.username || '').toLowerCase();
        const phone = (u.phone || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        if (!name.includes(q) && !username.includes(q) && !phone.includes(q) && !email.includes(q)) {
          return false;
        }
      }

      // 2. Role filter
      if (selectedRole !== 'all') {
        if ((u.role || '').toLowerCase() !== selectedRole.toLowerCase()) {
          return false;
        }
      }

      // 3. Status filter
      if (statusFilter !== 'all') {
        const isActive = u.is_active !== undefined ? Boolean(u.is_active) : true;
        if (statusFilter === 'active' && !isActive) return false;
        if (statusFilter === 'inactive' && isActive) return false;
      }

      // 4. Shift filter
      if (selectedShift !== 'all') {
        const shiftVal = (u.shift || '').toLowerCase();
        if (!shiftVal.includes(selectedShift.toLowerCase())) return false;
      }

      // 5. Created Time filter
      if (createdTimeType === 'custom') {
        if (createdFrom && u.created_at && u.created_at.slice(0, 10) < createdFrom) return false;
        if (createdTo && u.created_at && u.created_at.slice(0, 10) > createdTo) return false;
      }

      return true;
    });
  }, [users, searchTerm, selectedRole, statusFilter, selectedShift, createdTimeType, createdFrom, createdTo]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [filteredUsers, currentPage, rowsPerPage]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(paginatedUsers.map(u => u.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Export to Excel
  const handleExportExcel = () => {
    setShowMoreMenu(false);
    const dataToExport = filteredUsers.map((u, idx) => ({
      'STT': idx + 1,
      'Họ và tên': u.name || '',
      'Tài khoản đăng nhập': u.username || '',
      'Vai trò': u.role === 'admin' ? 'Quản trị viên' : 'Thu ngân',
      'Ca làm việc': getShiftLabel(u.shift),
      'Số điện thoại': u.phone || '',
      'Email': u.email || '',
      'Trạng thái': (u.is_active !== undefined ? Boolean(u.is_active) : true) ? 'Đang làm việc' : 'Đã khóa'
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Nhan_Vien');
    XLSX.writeFile(wb, `Danh_Sach_Nhan_Vien_${new Date().toISOString().slice(0, 10)}.xlsx`);
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
            <Users size={18} color={THEME.forest} />
            <span>{t('admin.usersTitle') || 'Nhân viên'}</span>
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

        {/* 1. Role Filter */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: THEME.slateDark }}>
              {t('admin.role') || 'Vai trò / Vị trí'}
            </span>
            <button
              type="button"
              onClick={onOpenAddUser}
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
            value={selectedRole}
            onChange={e => { setSelectedRole(e.target.value); setCurrentPage(1); }}
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
            <option value="all">{t('all') || 'Tất cả vai trò'} ({users.length})</option>
            <option value="admin">{t('admin.roleAdmin') || 'Quản trị viên (Admin)'} ({users.filter(u => u.role === 'admin').length})</option>
            <option value="cashier">{t('admin.roleCashier') || 'Thu ngân (Cashier)'} ({users.filter(u => u.role === 'cashier' || !u.role).length})</option>
          </select>
        </div>

        {/* 2. Status Filter */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: THEME.slateDark, marginBottom: '8px' }}>
            {t('status') || 'Trạng thái làm việc'}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: THEME.slateBody, cursor: 'pointer', marginBottom: '6px' }}>
            <input
              type="radio"
              name="staffStatus"
              checked={statusFilter === 'all'}
              onChange={() => { setStatusFilter('all'); setCurrentPage(1); }}
              style={{ accentColor: THEME.forest }}
            />
            <span>{t('admin.customersView.anyTime') || 'Tất cả trạng thái'}</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: THEME.slateBody, cursor: 'pointer', marginBottom: '6px' }}>
            <input
              type="radio"
              name="staffStatus"
              checked={statusFilter === 'active'}
              onChange={() => { setStatusFilter('active'); setCurrentPage(1); }}
              style={{ accentColor: THEME.forest }}
            />
            <span>{t('admin.working') || 'Đang làm việc'}</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: THEME.slateBody, cursor: 'pointer' }}>
            <input
              type="radio"
              name="staffStatus"
              checked={statusFilter === 'inactive'}
              onChange={() => { setStatusFilter('inactive'); setCurrentPage(1); }}
              style={{ accentColor: THEME.forest }}
            />
            <span>{t('admin.locked') || 'Đã khóa / Tạm ngưng'}</span>
          </label>
        </div>

        {/* 3. Shift Filter */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: THEME.slateDark, marginBottom: '6px' }}>
            {t('admin.shift') || 'Ca làm việc'}
          </div>
          <select
            value={selectedShift}
            onChange={e => { setSelectedShift(e.target.value); setCurrentPage(1); }}
            style={{
              width: '100%',
              padding: '7px 10px',
              borderRadius: '8px',
              border: `1px solid ${THEME.border}`,
              fontSize: '12.5px',
              color: THEME.slateDark,
              outline: 'none',
              backgroundColor: '#fff'
            }}
          >
            <option value="all">{t('all') || 'Tất cả các ca'}</option>
            <option value="sáng">{t('admin.shiftMorning') || 'Ca sáng (07:00 - 15:00)'}</option>
            <option value="chiều">{t('admin.shiftAfternoon') || 'Ca chiều (15:00 - 23:00)'}</option>
            <option value="tối">{t('admin.shiftNight') || 'Ca tối (17:00 - 23:00)'}</option>
            <option value="Toàn ca">{t('admin.shiftFull') || 'Toàn ca'}</option>
          </select>
        </div>

        {/* 4. Created Date Filter */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: THEME.slateDark, marginBottom: '8px' }}>
            {t('admin.customersView.createdTime') || 'Thời gian tạo'}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: THEME.slateBody, cursor: 'pointer', marginBottom: '6px' }}>
            <input
              type="radio"
              name="staffCreatedTime"
              checked={createdTimeType === 'any'}
              onChange={() => { setCreatedTimeType('any'); setCurrentPage(1); }}
              style={{ accentColor: THEME.forest }}
            />
            <span>{t('admin.customersView.anyTime') || 'Bất kỳ lúc nào'}</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: THEME.slateBody, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="radio"
                name="staffCreatedTime"
                checked={createdTimeType === 'custom'}
                onChange={() => { setCreatedTimeType('custom'); setCurrentPage(1); }}
                style={{ accentColor: THEME.forest }}
              />
              <span>{t('admin.customersView.otherOptions') || 'Tùy chọn khác'}</span>
            </div>
            <Calendar size={14} color={THEME.slateMuted} />
          </label>
          {createdTimeType === 'custom' && (
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input
                type="date"
                value={createdFrom}
                onChange={e => { setCreatedFrom(e.target.value); setCurrentPage(1); }}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: `1px solid ${THEME.border}`, fontSize: '12px' }}
              />
              <input
                type="date"
                value={createdTo}
                onChange={e => { setCreatedTo(e.target.value); setCurrentPage(1); }}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: `1px solid ${THEME.border}`, fontSize: '12px' }}
              />
            </div>
          )}
        </div>

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
              placeholder={t('admin.searchStaffPlaceholder') || 'Theo tên, tài khoản, SĐT, email...'}
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
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
            <button
              onClick={onOpenAddUser}
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
              <span>{t('admin.addStaff') || '+ Thêm nhân viên'}</span>
            </button>

            <button
              onClick={onOpenImportUser}
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

        {/* ── Table Card ── */}
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
                      checked={paginatedUsers.length > 0 && paginatedUsers.every(u => selectedRows.includes(u.id))}
                      onChange={handleSelectAll}
                      style={{ accentColor: THEME.forest, cursor: 'pointer' }}
                    />
                  </th>
                  <th style={{ padding: '12px 14px' }}>{t('admin.fullName') || 'Họ và tên'}</th>
                  <th style={{ padding: '12px 14px' }}>{t('admin.loginName') || 'Tài khoản đăng nhập'}</th>
                  <th style={{ padding: '12px 14px' }}>{t('admin.role') || 'Vai trò'}</th>
                  <th style={{ padding: '12px 14px' }}>{t('admin.shift') || 'Ca làm việc'}</th>
                  <th style={{ padding: '12px 14px' }}>{t('admin.phone') || 'Số điện thoại'}</th>
                  <th style={{ padding: '12px 14px' }}>{t('admin.email') || 'Email'}</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>{t('status') || 'Trạng thái'}</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>{t('actions') || 'Thao tác'}</th>
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
                  <td style={{ padding: '10px 14px', color: THEME.forest }}>
                    {filteredUsers.length} {t('admin.staffCount') || 'nhân viên'}
                  </td>
                  <td style={{ padding: '10px 14px', color: THEME.slateMuted }}>
                    {isFiltered ? (t('admin.filtered') || '(Đã lọc)') : (t('admin.allStaff') || 'Toàn bộ nhân sự')}
                  </td>
                  <td style={{ padding: '10px 14px' }}>—</td>
                  <td style={{ padding: '10px 14px' }}>—</td>
                  <td style={{ padding: '10px 14px' }}>—</td>
                  <td style={{ padding: '10px 14px' }}>—</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: '#059669' }}>
                    {filteredUsers.filter(u => u.is_active !== undefined ? Boolean(u.is_active) : true).length} {t('admin.activeStaff') || 'đang làm'}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>—</td>
                </tr>

                {/* Data rows */}
                {paginatedUsers.map(u => {
                  const isSelected = selectedRows.includes(u.id);
                  const isMainAdmin = u.id === 1 || u.username === 'admin';
                  const isSelf = currentUser && (currentUser.id === u.id || currentUser.username === u.username);
                  const canDelete = !isMainAdmin && !isSelf;
                  const isActive = u.is_active !== undefined ? Boolean(u.is_active) : true;
                  const initial = (u.name || u.username || 'N').charAt(0).toUpperCase();

                  return (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: `1px solid ${THEME.border}`,
                        backgroundColor: isSelected ? '#f0fdf4' : 'transparent',
                        transition: 'background-color 0.12s ease'
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = '#fafafa'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      {/* Checkbox */}
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(u.id)}
                          style={{ accentColor: THEME.forest, cursor: 'pointer' }}
                        />
                      </td>

                      {/* Họ và tên + Avatar */}
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: u.role === 'admin' ? '#eff6ff' : THEME.lightFoam,
                            color: u.role === 'admin' ? '#1d4ed8' : THEME.forest,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '13px',
                            flexShrink: 0
                          }}>
                            {initial}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: THEME.slateDark, fontSize: '13.5px' }}>
                              {u.name}
                            </div>
                            {isSelf && (
                              <span style={{ fontSize: '10.5px', color: THEME.forest, fontWeight: 700 }}>
                                (Bạn đang đăng nhập)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Username */}
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          color: THEME.forest,
                          fontSize: '12.5px',
                          fontWeight: 700,
                          backgroundColor: THEME.lightFoam,
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}>
                          {u.username}
                        </span>
                      </td>

                      {/* Vai trò */}
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          backgroundColor: u.role === 'admin' ? '#eff6ff' : '#ecfdf5',
                          color: u.role === 'admin' ? '#1d4ed8' : '#059669'
                        }}>
                          {u.role === 'admin' ? (t('admin.roleAdmin') || 'Quản trị viên') : (t('admin.roleCashier') || 'Thu ngân')}
                        </span>
                      </td>

                      {/* Ca làm việc */}
                      <td style={{ padding: '10px 14px', color: THEME.slateBody, fontSize: '12.5px' }}>
                        {getShiftLabel(u.shift)}
                      </td>

                      {/* Phone */}
                      <td style={{ padding: '10px 14px', color: THEME.slateMuted, fontSize: '12.5px' }}>
                        {u.phone || '—'}
                      </td>

                      {/* Email */}
                      <td style={{ padding: '10px 14px', color: THEME.slateMuted, fontSize: '12.5px' }}>
                        {u.email || '—'}
                      </td>

                      {/* Trạng thái */}
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          backgroundColor: isActive ? '#ecfdf5' : '#fef2f2',
                          color: isActive ? '#059669' : '#dc2626'
                        }}>
                          {isActive ? (t('admin.working') || 'Đang làm việc') : (t('admin.locked') || 'Đã khóa')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '10px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => onOpenEditUser(u)}
                            title={t('edit') || 'Sửa nhân viên'}
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
                            onClick={() => onDeleteUser(u)}
                            disabled={!canDelete}
                            title={isMainAdmin ? (t('admin.cannotDeleteAdmin') || 'Không thể xóa quản trị viên mặc định') : isSelf ? (t('admin.cannotDeleteSelf') || 'Không thể tự xóa chính mình') : (t('delete') || 'Xóa nhân viên')}
                            style={{
                              padding: '6px',
                              borderRadius: '6px',
                              color: !canDelete ? '#94a3b8' : THEME.danger,
                              backgroundColor: !canDelete ? '#f1f5f9' : THEME.dangerBg,
                              border: 'none',
                              cursor: !canDelete ? 'not-allowed' : 'pointer',
                              opacity: !canDelete ? 0.6 : 1,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.12s ease'
                            }}
                            onMouseEnter={e => { if (canDelete) e.currentTarget.style.backgroundColor = '#fecaca'; }}
                            onMouseLeave={e => { if (canDelete) e.currentTarget.style.backgroundColor = THEME.dangerBg; }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ padding: '60px 20px', textAlign: 'center', color: THEME.slateMuted }}>
                      <Users size={36} color="#cbd5e1" style={{ margin: '0 auto 10px', display: 'block' }} />
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{t('noResultsFound') || 'Không tìm thấy nhân viên phù hợp'}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination Footer ── */}
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
                {filteredUsers.length === 0
                  ? `0 - 0 ${t('admin.customersView.inTotal') || 'trong tổng'} 0`
                  : `${(currentPage - 1) * rowsPerPage + 1} - ${Math.min(currentPage * rowsPerPage, filteredUsers.length)} ${t('admin.customersView.inTotal') || 'trong tổng'} ${filteredUsers.length}`}
              </span>
            </div>
          </div>
        </div>

      </main>

    </div>
  );
}

export default StaffView;

