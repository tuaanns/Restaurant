import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  Search, Plus, FileSpreadsheet, MoreHorizontal,
  ChevronLeft, ChevronRight, Trash2, Edit3, Check,
  X, Filter, Download, Printer, RotateCcw, Utensils,
  FolderPlus, Layers, DollarSign
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export function MenuView({
  menuData = { categories: [], products: [] },
  categories = [],
  onOpenAddProduct,
  onOpenEditProduct,
  onDeleteProduct,
  onOpenAddCategory,
  onOpenEditCategory,
  onDeleteCategory,
  onOpenImportProduct,
  activeSubTab = 'products', // 'products' | 'categories'
  onSelectSubTab
}) {
  const { t, formatDishName, formatCategoryName, formatDishUnit } = useLanguage();

  // ── Palette constants matching CustomersView ──
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

  const [currentTab, setCurrentTab] = useState(activeSubTab || 'products');

  useEffect(() => {
    if (activeSubTab) setCurrentTab(activeSubTab);
  }, [activeSubTab]);

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
    if (onSelectSubTab) onSelectSubTab(tab);
  };

  // ── Filter states for Products ──
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('all');

  // ── Filter states for Categories ──
  const [catSearchTerm, setCatSearchTerm] = useState('');

  // ── Pagination ──
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // ── Multi-select ──
  const [selectedRows, setSelectedRows] = useState([]);

  // ── More options dropdown ──
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

  const productsList = useMemo(() => {
    return (menuData.products || []).filter(p => p && p.name && p.name.trim().toLowerCase() !== 'test');
  }, [menuData.products]);

  const categoryList = useMemo(() => {
    if (categories && categories.length > 0) return categories;
    return menuData.categories || [];
  }, [categories, menuData.categories]);

  // Available units
  const availableUnits = useMemo(() => {
    const set = new Set();
    productsList.forEach(p => {
      if (p.unit && p.unit.trim()) set.add(p.unit.trim());
    });
    return Array.from(set);
  }, [productsList]);

  // Check if any filter is active
  const isFiltered = useMemo(() => {
    if (currentTab === 'products') {
      return (
        searchTerm.trim() !== '' ||
        selectedCatId !== 'all' ||
        statusFilter !== 'all' ||
        priceMin !== '' ||
        priceMax !== '' ||
        selectedUnit !== 'all'
      );
    }
    return catSearchTerm.trim() !== '';
  }, [currentTab, searchTerm, selectedCatId, statusFilter, priceMin, priceMax, selectedUnit, catSearchTerm]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCatId('all');
    setStatusFilter('all');
    setPriceMin('');
    setPriceMax('');
    setSelectedUnit('all');
    setCatSearchTerm('');
    setCurrentPage(1);
    setSelectedRows([]);
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return productsList.filter(p => {
      // 1. Search term (code, name, description)
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase().trim();
        const code = (p.code || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        const locName = formatDishName(p.name, p.code).toLowerCase();
        const desc = (p.description || '').toLowerCase();
        if (!code.includes(q) && !name.includes(q) && !locName.includes(q) && !desc.includes(q)) {
          return false;
        }
      }

      // 2. Category
      if (selectedCatId !== 'all') {
        if (String(p.category_id) !== String(selectedCatId)) {
          return false;
        }
      }

      // 3. Status
      if (statusFilter !== 'all') {
        const isActive = p.is_active !== undefined ? Boolean(p.is_active) : true;
        if (statusFilter === 'active' && !isActive) return false;
        if (statusFilter === 'inactive' && isActive) return false;
      }

      // 4. Price range
      const price = Number(p.price || 0);
      if (priceMin !== '' && !isNaN(Number(priceMin))) {
        if (price < Number(priceMin)) return false;
      }
      if (priceMax !== '' && !isNaN(Number(priceMax))) {
        if (price > Number(priceMax)) return false;
      }

      // 5. Unit
      if (selectedUnit !== 'all') {
        if ((p.unit || '').trim().toLowerCase() !== selectedUnit.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [productsList, searchTerm, selectedCatId, statusFilter, priceMin, priceMax, selectedUnit, formatDishName]);

  // Filtered Categories
  const filteredCategories = useMemo(() => {
    return categoryList.filter(c => {
      if (catSearchTerm.trim() !== '') {
        const q = catSearchTerm.toLowerCase().trim();
        const name = (c.name || '').toLowerCase();
        const locName = formatCategoryName(c.name).toLowerCase();
        const code = (c.code || '').toLowerCase();
        if (!name.includes(q) && !locName.includes(q) && !code.includes(q)) return false;
      }
      return true;
    });
  }, [categoryList, catSearchTerm, formatCategoryName]);

  // Paginated items
  const activeDataList = currentTab === 'products' ? filteredProducts : filteredCategories;
  const totalPages = Math.ceil(activeDataList.length / rowsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return activeDataList.slice(start, start + rowsPerPage);
  }, [activeDataList, currentPage, rowsPerPage]);

  // Multi-select handlers
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

  // Export to Excel
  const handleExportExcel = () => {
    setShowMoreMenu(false);
    if (currentTab === 'products') {
      const dataToExport = filteredProducts.map((p, idx) => {
        const cat = categoryList.find(c => String(c.id) === String(p.category_id));
        return {
          'STT': idx + 1,
          'Mã món': p.code || '',
          'Tên món ăn': formatDishName(p.name, p.code),
          'Tên gốc': p.name || '',
          'Nhóm thực đơn': cat ? formatCategoryName(cat.name) : '—',
          'Đơn vị tính': formatDishUnit(p.unit) || 'phần',
          'Giá bán (VNĐ)': Number(p.price || 0),
          'Mô tả': p.description || '',
          'Trạng thái': (p.is_active !== undefined ? Boolean(p.is_active) : true) ? 'Đang kinh doanh' : 'Ngừng kinh doanh'
        };
      });
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Thực đơn');
      XLSX.writeFile(wb, `Thuc_Don_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } else {
      const dataToExport = filteredCategories.map((c, idx) => ({
        'STT': idx + 1,
        'Mã nhóm': c.code || '',
        'Tên nhóm thực đơn': formatCategoryName(c.name),
        'Số lượng món': c.products_count ?? c.products?.length ?? 0
      }));
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Nhom_Thuc_Don');
      XLSX.writeFile(wb, `Nhom_Thuc_Don_${new Date().toISOString().slice(0, 10)}.xlsx`);
    }
  };

  const formatMoney = (val) => Number(val || 0).toLocaleString('vi-VN') + ' đ';

  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>

      {/* ═══════════════════════════════════════════════════════════
          LEFT SIDEBAR: FILTER CARD (Matching CustomersView style)
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
            <Utensils size={18} color={THEME.forest} />
            <span>{currentTab === 'products' ? (t('admin.menu') || 'Thực đơn') : (t('admin.categoryTitle') || 'Nhóm thực đơn')}</span>
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

        {/* ── Products Filters ── */}
        {currentTab === 'products' && (
          <>
            {/* 1. Category Filter */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: THEME.slateDark }}>
                  {t('admin.menuGroups') || 'Nhóm thực đơn'}
                </span>
                <button
                  type="button"
                  onClick={onOpenAddCategory}
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
                value={selectedCatId}
                onChange={e => { setSelectedCatId(e.target.value); setCurrentPage(1); }}
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
                <option value="all">{t('admin.customersView.allGroups') || 'Tất cả các nhóm'} ({productsList.length})</option>
                {categoryList.map(c => {
                  const count = productsList.filter(p => String(p.category_id) === String(c.id)).length;
                  return (
                    <option key={c.id} value={String(c.id)}>
                      {formatCategoryName(c.name)} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* 2. Business Status */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: THEME.slateDark, marginBottom: '8px' }}>
                {t('status') || 'Trạng thái'}
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: THEME.slateBody, cursor: 'pointer', marginBottom: '6px' }}>
                <input
                  type="radio"
                  name="productStatus"
                  checked={statusFilter === 'all'}
                  onChange={() => { setStatusFilter('all'); setCurrentPage(1); }}
                  style={{ accentColor: THEME.forest }}
                />
                <span>{t('admin.customersView.anyTime') || 'Tất cả trạng thái'}</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: THEME.slateBody, cursor: 'pointer', marginBottom: '6px' }}>
                <input
                  type="radio"
                  name="productStatus"
                  checked={statusFilter === 'active'}
                  onChange={() => { setStatusFilter('active'); setCurrentPage(1); }}
                  style={{ accentColor: THEME.forest }}
                />
                <span>{t('admin.inBusiness') || 'Đang kinh doanh'}</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: THEME.slateBody, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="productStatus"
                  checked={statusFilter === 'inactive'}
                  onChange={() => { setStatusFilter('inactive'); setCurrentPage(1); }}
                  style={{ accentColor: THEME.forest }}
                />
                <span>{t('admin.stoppedBusiness') || 'Ngừng kinh doanh'}</span>
              </label>
            </div>

            {/* 3. Price Range */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: THEME.slateDark, marginBottom: '6px' }}>
                {t('admin.priceRange') || 'Giá bán'}
              </div>
              <div style={{ fontSize: '11.5px', color: THEME.slateMuted, marginBottom: '6px' }}>
                {t('admin.customersView.value') || 'Khoảng giá (VNĐ)'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: THEME.slateMuted, width: '32px' }}>
                  {t('admin.customersView.from') || 'Từ'}
                </span>
                <input
                  type="number"
                  placeholder="0"
                  value={priceMin}
                  onChange={e => { setPriceMin(e.target.value); setCurrentPage(1); }}
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
                  placeholder="500,000"
                  value={priceMax}
                  onChange={e => { setPriceMax(e.target.value); setCurrentPage(1); }}
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

            {/* 4. Unit Filter */}
            {availableUnits.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: THEME.slateDark, marginBottom: '6px' }}>
                  {t('menu.unit') || 'Đơn vị tính'}
                </div>
                <select
                  value={selectedUnit}
                  onChange={e => { setSelectedUnit(e.target.value); setCurrentPage(1); }}
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
                  <option value="all">{t('all') || 'Tất cả ĐVT'}</option>
                  {availableUnits.map(u => (
                    <option key={u} value={u}>{formatDishUnit(u)}</option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        {/* ── Categories Filters ── */}
        {currentTab === 'categories' && (
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: THEME.slateDark, marginBottom: '8px' }}>
              {t('admin.categorySummary') || 'Tổng quan nhóm'}
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
                <span style={{ color: THEME.slateMuted }}>{t('admin.totalCategories') || 'Tổng nhóm'}:</span>
                <span style={{ fontWeight: 800, color: THEME.slateDark }}>{categoryList.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: THEME.slateMuted }}>{t('admin.totalDishes') || 'Tổng món'}:</span>
                <span style={{ fontWeight: 800, color: THEME.forest }}>{productsList.length}</span>
              </div>
            </div>
          </div>
        )}

      </aside>

      {/* ═══════════════════════════════════════════════════════════
          RIGHT MAIN CONTENT: ACTIONS BAR + SUBTABS + TABLE + PAGINATION
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
              placeholder={currentTab === 'products' ? (t('admin.searchMenuPlaceholder') || 'Theo mã, tên món ăn, mô tả...') : (t('admin.searchCatPlaceholder') || 'Theo tên nhóm thực đơn...')}
              value={currentTab === 'products' ? searchTerm : catSearchTerm}
              onChange={e => {
                if (currentTab === 'products') setSearchTerm(e.target.value);
                else setCatSearchTerm(e.target.value);
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
            {(currentTab === 'products' ? searchTerm : catSearchTerm) ? (
              <button
                onClick={() => {
                  if (currentTab === 'products') setSearchTerm('');
                  else setCatSearchTerm('');
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
                onClick={() => handleTabChange('products')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: currentTab === 'products' ? 700 : 500,
                  backgroundColor: currentTab === 'products' ? '#ffffff' : 'transparent',
                  color: currentTab === 'products' ? THEME.forest : THEME.slateBody,
                  boxShadow: currentTab === 'products' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Utensils size={13} />
                <span>{t('admin.manageMenu') || 'Quản lý món ăn'}</span>
                <span style={{
                  fontSize: '11px',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: currentTab === 'products' ? THEME.lightFoam : '#e2e8f0',
                  color: currentTab === 'products' ? THEME.forest : THEME.slateMuted,
                  fontWeight: 700
                }}>
                  {productsList.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('categories')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: currentTab === 'categories' ? 700 : 500,
                  backgroundColor: currentTab === 'categories' ? '#ffffff' : 'transparent',
                  color: currentTab === 'categories' ? THEME.forest : THEME.slateBody,
                  boxShadow: currentTab === 'categories' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Layers size={13} />
                <span>{t('admin.menuGroups') || 'Nhóm thực đơn'}</span>
                <span style={{
                  fontSize: '11px',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: currentTab === 'categories' ? THEME.lightFoam : '#e2e8f0',
                  color: currentTab === 'categories' ? THEME.forest : THEME.slateMuted,
                  fontWeight: 700
                }}>
                  {categoryList.length}
                </span>
              </button>
            </div>

            {/* + Add New Button */}
            {currentTab === 'products' ? (
              <button
                onClick={onOpenAddProduct}
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
                <span>{t('admin.addProduct') || '+ Thêm món mới'}</span>
              </button>
            ) : (
              <button
                onClick={onOpenAddCategory}
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
                <span>{t('admin.addCategory') || '+ Thêm nhóm mới'}</span>
              </button>
            )}

            {/* Import Button */}
            {currentTab === 'products' && (
              <button
                onClick={onOpenImportProduct}
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

            {/* More Actions Menu (...) */}
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
                  {/* Checkbox column */}
                  <th style={{ width: '44px', padding: '12px 14px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={paginatedItems.length > 0 && paginatedItems.every(item => selectedRows.includes(item.id))}
                      onChange={handleSelectAll}
                      style={{ accentColor: THEME.forest, cursor: 'pointer' }}
                    />
                  </th>

                  {currentTab === 'products' ? (
                    <>
                      <th style={{ padding: '12px 14px' }}>{t('menu.code') || 'Mã món'}</th>
                      <th style={{ padding: '12px 14px' }}>{t('menu.dishName') || 'Tên món ăn'}</th>
                      <th style={{ padding: '12px 14px' }}>{t('admin.menuGroups') || 'Nhóm thực đơn'}</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>{t('menu.unit') || 'ĐVT'}</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>{t('menu.price') || 'Giá bán'}</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>{t('status') || 'Trạng thái'}</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>{t('actions') || 'Thao tác'}</th>
                    </>
                  ) : (
                    <>
                      <th style={{ padding: '12px 14px' }}>{t('admin.catCode') || 'Mã nhóm'}</th>
                      <th style={{ padding: '12px 14px' }}>{t('admin.catName') || 'Tên nhóm thực đơn'}</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>{t('admin.dishCount') || 'Số lượng món'}</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>{t('actions') || 'Thao tác'}</th>
                    </>
                  )}
                </tr>
              </thead>

              <tbody>
                {/* ── Summary / Total Row ── */}
                <tr style={{
                  backgroundColor: '#ffffff',
                  borderBottom: `1px solid ${THEME.border}`,
                  fontWeight: 700,
                  color: THEME.slateDark,
                  fontSize: '12.5px'
                }}>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>—</td>
                  {currentTab === 'products' ? (
                    <>
                      <td style={{ padding: '10px 14px', color: THEME.forest }}>
                        {filteredProducts.length} {t('menu.items') || 'món'}
                      </td>
                      <td style={{ padding: '10px 14px', color: THEME.slateMuted }}>
                        {isFiltered ? '(Đã lọc)' : 'Toàn bộ thực đơn'}
                      </td>
                      <td style={{ padding: '10px 14px' }}>—</td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>—</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: THEME.forest, fontWeight: 800 }}>
                        {formatMoney(
                          filteredProducts.length > 0
                            ? Math.round(filteredProducts.reduce((acc, p) => acc + Number(p.price || 0), 0) / filteredProducts.length)
                            : 0
                        )} <span style={{ fontSize: '11px', color: THEME.slateMuted, fontWeight: 500 }}>(TB)</span>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>—</td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>—</td>
                    </>
                  ) : (
                    <>
                      <td style={{ padding: '10px 14px', color: THEME.forest }}>{filteredCategories.length} {t('admin.categories') || 'nhóm'}</td>
                      <td style={{ padding: '10px 14px' }}>—</td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', color: THEME.forest, fontWeight: 800 }}>
                        {filteredCategories.reduce((acc, c) => acc + (c.products_count ?? c.products?.length ?? 0), 0)} món
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>—</td>
                    </>
                  )}
                </tr>

                {/* ── Data Rows ── */}
                {currentTab === 'products' ? (
                  paginatedItems.map((p) => {
                    const isSelected = selectedRows.includes(p.id);
                    const cat = categoryList.find(c => String(c.id) === String(p.category_id));
                    const isActive = p.is_active !== undefined ? Boolean(p.is_active) : true;

                    return (
                      <tr
                        key={p.id}
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
                            onChange={() => handleSelectRow(p.id)}
                            style={{ accentColor: THEME.forest, cursor: 'pointer' }}
                          />
                        </td>

                        {/* Mã món */}
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            backgroundColor: THEME.lightFoam,
                            color: THEME.forest,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontFamily: 'monospace',
                            fontSize: '11.5px',
                            fontWeight: 700
                          }}>
                            {p.code || `SP${p.id}`}
                          </span>
                        </td>

                        {/* Tên món ăn */}
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 700, color: THEME.slateDark, fontSize: '13.5px' }}>
                            {formatDishName(p.name, p.code)}
                          </div>
                          {p.description && (
                            <div style={{ fontSize: '11.5px', color: THEME.slateMuted, marginTop: '2px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {p.description}
                            </div>
                          )}
                        </td>

                        {/* Nhóm thực đơn */}
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: '#f1f5f9',
                            color: THEME.slateBody
                          }}>
                            {cat ? formatCategoryName(cat.name) : '—'}
                          </span>
                        </td>

                        {/* ĐVT */}
                        <td style={{ padding: '10px 14px', textAlign: 'center', color: THEME.slateMuted, fontSize: '12.5px' }}>
                          {formatDishUnit(p.unit) || 'phần'}
                        </td>

                        {/* Giá bán */}
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: THEME.forest, fontSize: '13.5px' }}>
                          {formatMoney(p.price)}
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
                            {isActive ? (t('admin.inBusiness') || 'Đang bán') : (t('admin.stoppedBusiness') || 'Tạm ngừng')}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '10px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              onClick={() => onOpenEditProduct(p)}
                              title={t('edit') || 'Chỉnh sửa món'}
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
                              onClick={() => onDeleteProduct(p)}
                              title={t('delete') || 'Xóa món'}
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
                  paginatedItems.map((c) => {
                    const isSelected = selectedRows.includes(c.id);
                    const count = c.products_count ?? c.products?.length ?? productsList.filter(p => String(p.category_id) === String(c.id)).length;

                    return (
                      <tr
                        key={c.id}
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
                            onChange={() => handleSelectRow(c.id)}
                            style={{ accentColor: THEME.forest, cursor: 'pointer' }}
                          />
                        </td>

                        {/* Mã nhóm */}
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            backgroundColor: THEME.lightFoam,
                            color: THEME.forest,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontFamily: 'monospace',
                            fontSize: '11.5px',
                            fontWeight: 700
                          }}>
                            {c.code || `CAT_${c.id}`}
                          </span>
                        </td>

                        {/* Tên nhóm */}
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 800, color: THEME.slateDark, fontSize: '14px' }}>
                            {formatCategoryName(c.name)}
                          </div>
                        </td>

                        {/* Số lượng món */}
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <span style={{
                            padding: '3px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 700,
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8'
                          }}>
                            {count} món
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '10px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              onClick={() => onOpenEditCategory(c)}
                              title={t('edit') || 'Sửa nhóm'}
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
                              onClick={() => onDeleteCategory(c)}
                              title={t('delete') || 'Xóa nhóm'}
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
                    <td colSpan={currentTab === 'products' ? 8 : 5} style={{ padding: '60px 20px', textAlign: 'center', color: THEME.slateMuted }}>
                      <Utensils size={36} color="#cbd5e1" style={{ margin: '0 auto 10px', display: 'block' }} />
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{t('noResultsFound') || 'Không tìm thấy dữ liệu phù hợp'}</p>
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
            {/* Rows Per Page */}
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

            {/* Pagination Controls */}
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

      </main>

    </div>
  );
}
