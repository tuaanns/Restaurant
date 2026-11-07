import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp, DollarSign, Users, Utensils, Plus, Trash2, Pencil,
  ArrowLeft, CreditCard, Banknote, QrCode, Tag, X, ChevronDown,
  Shield, Clock, Gift, Calendar, Percent, CheckCircle, AlertCircle,
  Search, Filter, UserCheck, Phone, Award, Upload, MapPin, LayoutGrid, FileSpreadsheet,
  LogOut, Store, LayoutDashboard, Settings
} from 'lucide-react';
import { api } from '../../api';
import { useLanguage } from '../../i18n/LanguageContext';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';
import { ImportProductModal } from '../modals/ImportProductModal';
import { ImportTableModal } from '../modals/ImportTableModal';
import { ImportCustomerModal } from '../modals/ImportCustomerModal';
import { ImportUserModal } from '../modals/ImportUserModal';
import { ReportsView } from './ReportsView';
import { CashBookView } from './CashBookView';
import { BankAccountsView } from './BankAccountsView';
import { SettingsView } from './SettingsView';
import { CustomersView } from './CustomersView';
import { OverviewDashboard } from './OverviewDashboard';
import { Card, CardHeader, CardContent } from '../ui/Card.jsx';
import { initialMockData } from '../../mockData';

const DEFAULT_ADMIN_USERS = [
  { id: 1, name: 'Quản trị viên', username: 'admin', email: 'admin@aura.vn', role: 'admin', shift: 'Toàn ca (Quản lý nhà hàng)', phone: '0901.888.999', is_active: 1 },
  { id: 2, name: 'Thu Hằng', username: 'thuhang', email: 'thuhang@aura.vn', role: 'cashier', shift: 'Ca sáng (07:00 - 15:00)', phone: '0912.345.678', is_active: 1 },
  { id: 3, name: 'Minh Trí', username: 'minhtri', email: 'minhtri@aura.vn', role: 'cashier', shift: 'Ca chiều (15:00 - 23:00)', phone: '0987.654.321', is_active: 1 },
];

const DEFAULT_ADMIN_CATEGORIES = (initialMockData?.menuList || []).map(c => ({
  id: c.id,
  name: c.name,
  code: c.code || `CAT_${c.id}`,
  sort_order: c.id,
  is_active: 1,
}));

const DEFAULT_ADMIN_PRODUCTS = (initialMockData?.menuList || []).flatMap(c => (c.products || []).map(p => ({
  ...p,
  category_id: c.id,
  category: { id: c.id, name: c.name },
  is_active: 1,
})));

const DEFAULT_ADMIN_AREAS = (initialMockData?.areas || []).map(a => ({
  id: a.id,
  name: a.name,
  code: a.code || `area_${a.id}`,
  sort_order: a.id,
}));

const DEFAULT_ADMIN_TABLES = (initialMockData?.tables || []).map(t => {
  const area = DEFAULT_ADMIN_AREAS.find(a => a.id === t.area_id) || { id: t.area_id, name: 'Tầng 1' };
  return {
    ...t,
    area_id: t.area_id,
    area_name: area.name,
    area: area,
  };
});

const inputStyle = {
  width: '100%', padding: '8px 10px', borderRadius: '6px',
  border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '13px',
  boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit'
};
const labelStyle = { fontSize: '12px', fontWeight: 600, color: '#475569' };
const btnPrimary = {
  padding: '8px 18px', borderRadius: '6px', backgroundColor: '#1B5E20',
  color: '#ffffff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', border: 'none',
  display: 'inline-flex', alignItems: 'center', gap: '6px'
};
const btnSecondary = {
  padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1',
  color: '#475569', fontSize: '13px', cursor: 'pointer', background: '#fff'
};

// ── Navigation structure ──
const NAV_ITEMS = [
  {
    key: 'overview',
    label: 'Tổng quan',
    children: [
      { key: 'overview', label: 'Báo cáo doanh thu' },
    ]
  },
  {
    key: 'reports_group',
    label: 'Báo cáo',
    children: [
      { key: 'report_end_of_day', label: 'Báo cáo cuối ngày' },
      { key: 'report_sales', label: 'Bán hàng' },
      { key: 'report_goods', label: 'Hàng hóa' },
    ]
  },
  {
    key: 'cashbook_group',
    label: 'Sổ quỹ',
    children: [
      { key: 'cashbook', label: 'Sổ quỹ thu chi' },
      { key: 'bank_accounts', label: 'Thiết lập tài khoản ngân hàng' },
    ]
  },
  {
    key: 'menu_group',
    label: 'Thực đơn',
    children: [
      { key: 'menu', label: 'Quản lý món ăn' },
      { key: 'categories', label: 'Nhóm thực đơn' },
    ]
  },
  {
    key: 'customers_group',
    label: 'Khách hàng',
    children: [
      { key: 'customers', label: 'Khách hàng' },
      { key: 'promotions', label: 'Khuyến mãi' },
    ]
  },
  {
    key: 'users_group',
    label: 'Nhân viên',
    children: [
      { key: 'users', label: 'Danh sách nhân viên' },
    ]
  },
  {
    key: 'tables_group',
    label: 'Phòng/Bàn',
    children: [
      { key: 'tables', label: 'Danh sách phòng/bàn' },
      { key: 'areas', label: 'Khu vực' },
    ]
  },
];

// ── Promotion types ──
const PROMO_TYPES = [
  { value: 'order_discount', labelKey: 'admin.promoOrderDiscountTitle', descKey: 'admin.promoOrderDiscountDesc' },
  { value: 'item_value_gift', labelKey: 'admin.promoItemValueGiftTitle', descKey: 'admin.promoItemValueGiftDesc' },
  { value: 'buy_get', labelKey: 'admin.promoBuyGetTitle', descKey: 'admin.promoBuyGetDesc' },
  { value: 'fixed_price', labelKey: 'admin.promoFixedPriceTitle', descKey: 'admin.promoFixedPriceDesc' },
];

// ── Dropdown Nav Component (Instant switching, zero delay/lag) ──
function AdminNavMenu({ navItems, activeTab, onSelect }) {
  const [activeMenuKey, setActiveMenuKey] = useState(null);
  const containerRef = useRef(null);
  const leaveTimerRef = useRef(null);

  // When hovering on any tab: instant switch without delay
  const handleItemMouseEnter = (key, hasChildren) => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    if (hasChildren) {
      setActiveMenuKey(key);
    } else {
      setActiveMenuKey(null);
    }
  };

  // When leaving the nav bar container entirely: graceful 120ms exit
  const handleNavMouseLeave = () => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    leaveTimerRef.current = setTimeout(() => {
      setActiveMenuKey(null);
    }, 120);
  };

  const handleNavMouseEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setActiveMenuKey(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleNavMouseEnter}
      onMouseLeave={handleNavMouseLeave}
      style={{ display: 'flex', alignItems: 'stretch', height: '56px', marginLeft: '8px' }}
    >
      {navItems.map(item => {
        const isActive = activeTab === item.key || item.children?.some(c => c.key === activeTab);
        const hasChildren = item.children && item.children.length > 0;
        const isDirectSingle = item.children?.length === 1 && item.children[0].key === item.key;
        const isOpen = activeMenuKey === item.key;

        if (isDirectSingle) {
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setActiveMenuKey(null);
                onSelect(item.children[0].key);
              }}
              style={{
                padding: '0 14px',
                fontSize: '13.5px',
                fontWeight: 600,
                color: isActive ? '#1B5E20' : '#334155',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: isActive ? '3px solid #1B5E20' : '3px solid transparent',
                cursor: 'pointer',
                background: 'none',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.12s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                handleItemMouseEnter(item.key, false);
                e.currentTarget.style.color = '#1B5E20';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = isActive ? '#1B5E20' : '#334155';
              }}
            >
              {item.label}
            </button>
          );
        }

        return (
          <div
            key={item.key}
            onMouseEnter={() => handleItemMouseEnter(item.key, hasChildren)}
            style={{ position: 'relative', height: '56px', display: 'flex', alignItems: 'stretch' }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isOpen) {
                  setActiveMenuKey(null);
                } else if (hasChildren) {
                  setActiveMenuKey(item.key);
                }
                if (hasChildren) {
                  onSelect(item.children[0].key);
                }
              }}
              style={{
                padding: '0 14px',
                fontSize: '13.5px',
                fontWeight: 600,
                color: isActive || isOpen ? '#1B5E20' : '#334155',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: isActive ? '3px solid #1B5E20' : '3px solid transparent',
                cursor: 'pointer',
                background: isOpen ? '#f8fafc' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                height: '56px',
                transition: 'color 0.12s, background-color 0.12s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#1B5E20'; }}
              onMouseLeave={e => { e.currentTarget.style.color = isActive || isOpen ? '#1B5E20' : '#334155'; }}
            >
              <span>{item.label}</span>
              <ChevronDown
                size={13}
                style={{
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.15s ease',
                  opacity: 0.6
                }}
              />
            </button>

            {/* Dropdown Menu */}
            {isOpen && hasChildren && (
              <div
                style={{
                  position: 'absolute',
                  top: '56px',
                  left: 0,
                  zIndex: 9999,
                  minWidth: '210px'
                }}
              >
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  boxShadow: '0 12px 28px -4px rgba(0,0,0,0.18), 0 8px 10px -6px rgba(0,0,0,0.08)',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  padding: '4px 0'
                }}>
                  {item.children.map(child => (
                    <button
                      key={child.key}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(child.key);
                        setActiveMenuKey(null);
                      }}
                      style={{
                        width: '100%',
                        padding: '9px 16px',
                        textAlign: 'left',
                        fontSize: '13px',
                        fontWeight: activeTab === child.key ? 700 : 500,
                        color: activeTab === child.key ? '#1B5E20' : '#334155',
                        backgroundColor: activeTab === child.key ? '#E8F5E9' : 'transparent',
                        cursor: 'pointer',
                        border: 'none',
                        display: 'block',
                        borderLeft: activeTab === child.key ? '3px solid #1B5E20' : '3px solid transparent',
                        transition: 'background-color 0.1s'
                      }}
                      onMouseEnter={e => { if (activeTab !== child.key) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = activeTab === child.key ? '#E8F5E9' : 'transparent'; }}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Status Badge ──
function StatusBadge({ active }) {
  const { t } = useLanguage();
  return (
    <span style={{
      padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700,
      backgroundColor: active ? '#ecfdf5' : '#fef2f2',
      color: active ? '#059669' : '#dc2626'
    }}>
      {active ? t('active') : t('inactive')}
    </span>
  );
}

export function AdminDashboard({ onBackToPos, currentUser, initialTab = 'overview', onLogout = () => {}, onUpdateCurrentUser }) {
  const { t, formatTableName, formatAreaName, formatDishName, formatCategoryName, formatDishUnit, formatPromoName } = useLanguage();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dynamic NAV_ITEMS using translations
  const NAV_ITEMS_DYNAMIC = [
    {
      key: 'overview',
      label: t('admin.overview'),
      children: [{ key: 'overview', label: t('admin.overview') }]
    },
    {
      key: 'reports_group',
      label: t('admin.reports.reports'),
      children: [
        { key: 'report_end_of_day', label: t('admin.reports.reportEndOfDay') },
        { key: 'report_sales', label: t('admin.reports.reportSales') },
        { key: 'report_goods', label: t('admin.reports.reportGoods') },
      ]
    },
    {
      key: 'cashbook_group',
      label: t('admin.cashbook.title'),
      children: [
        { key: 'cashbook', label: t('admin.cashbook.tabCashbook') },
        { key: 'bank_accounts', label: t('admin.cashbook.tabBankAccounts') || 'Thiết lập tài khoản ngân hàng' },
      ]
    },
    {
      key: 'menu_group',
      label: t('admin.menu'),
      children: [
        { key: 'menu', label: t('admin.manageMenu') },
        { key: 'categories', label: t('admin.menuGroups') },
      ]
    },
    {
      key: 'customers_group',
      label: t('admin.customers'),
      children: [
        { key: 'customers', label: t('admin.customerList') },
        { key: 'promotions', label: t('admin.promotions') },
      ]
    },
    {
      key: 'users_group',
      label: t('admin.staff'),
      children: [{ key: 'users', label: t('admin.staffList') }]
    },
    {
      key: 'tables_group',
      label: t('admin.tableRooms'),
      children: [
        { key: 'tables', label: t('admin.tableList') },
        { key: 'areas', label: t('admin.areas') },
      ]
    },
  ];

  const [activeTab, setActiveTab] = useState(initialTab || 'overview');
  const [stats, setStats] = useState(null);
  const [isDbOffline, setIsDbOffline] = useState(false);

  const [users, setUsers] = useState(() => {
    try {
      const c = localStorage.getItem('aura_pos_admin_users');
      if (c) {
        const parsed = JSON.parse(c);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleanUsers = parsed.filter(u => u && u.name && u.name.trim().toLowerCase() !== 'test' && u.username !== 'test');
          try { localStorage.setItem('aura_pos_admin_users', JSON.stringify(cleanUsers)); } catch (e) {}
          return cleanUsers;
        }
      }
    } catch (e) {}
    return DEFAULT_ADMIN_USERS;
  });

  const [menuData, setMenuData] = useState(() => {
    try {
      const menuVer = localStorage.getItem('aura_pos_menu_version');
      if (menuVer === 'v3_menu_83') {
        const c = localStorage.getItem('aura_pos_admin_menu');
        if (c) {
          const parsed = JSON.parse(c);
          if (parsed?.products && Array.isArray(parsed.products) && parsed.products.length >= 80) {
            const cleanProducts = parsed.products.filter(p => p && p.name && p.name.trim().toLowerCase() !== 'test');
            parsed.products = cleanProducts;
            try { localStorage.setItem('aura_pos_admin_menu', JSON.stringify(parsed)); } catch (e) {}
            return parsed;
          }
        }
      } else {
        localStorage.setItem('aura_pos_menu_version', 'v3_menu_83');
        localStorage.removeItem('aura_pos_admin_menu');
        localStorage.removeItem('aura_pos_admin_categories');
      }
    } catch (e) {}
    return { categories: DEFAULT_ADMIN_CATEGORIES, products: DEFAULT_ADMIN_PRODUCTS };
  });

  const [categories, setCategories] = useState(() => {
    try {
      const menuVer = localStorage.getItem('aura_pos_menu_version');
      if (menuVer === 'v3_menu_83') {
        const c = localStorage.getItem('aura_pos_admin_categories');
        if (c) {
          const parsed = JSON.parse(c);
          if (Array.isArray(parsed) && parsed.length >= 10) return parsed;
        }
      }
    } catch (e) {}
    return DEFAULT_ADMIN_CATEGORIES;
  });

  const [promotions, setPromotions] = useState([
    { id: 1, code: 'KM000014', name: 'CTKM KHAI TRƯƠNG', type: 'order_discount', discount_value: 10, min_order: 200000, from_date: '24/09/2026', to_date: '27/09/2026', is_active: true, budget_used: 0 },
    { id: 2, code: 'KM000013', name: '10 Ly Tặng 1 Hộp (Combo)', type: 'buy_get', discount_value: 0, min_order: 0, from_date: '07/11/2025', to_date: '07/01/2026', is_active: false, budget_used: 0 },
    { id: 3, code: 'KM000011', name: 'Cà phê pha máy giảm 5%', type: 'fixed_price', discount_value: 5, min_order: 100000, from_date: '24/08/2025', to_date: '08/10/2025', is_active: false, budget_used: 0 },
  ]);
  const [loading, setLoading] = useState(true);

  // ── Tables & Areas state ──
  const [tables, setTables] = useState(() => {
    try {
      const c = localStorage.getItem('aura_pos_admin_tables');
      if (c) {
        const parsed = JSON.parse(c);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_ADMIN_TABLES;
  });

  const [areas, setAreas] = useState(() => {
    try {
      const c = localStorage.getItem('aura_pos_admin_areas');
      if (c) {
        const parsed = JSON.parse(c);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_ADMIN_AREAS;
  });
  const [tableSearch, setTableSearch] = useState('');
  const [tableAreaFilter, setTableAreaFilter] = useState('all');
  const [showTableModal, setShowTableModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [tableName, setTableName] = useState('');
  const [tableAreaId, setTableAreaId] = useState('');
  const [tableCapacity, setTableCapacity] = useState('4');
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [areaName, setAreaName] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const importFileRef = useRef(null);

  // ── Customer management state ──
  const [customers, setCustomers] = useState([
    { id: 1, name: 'Anh Hoàng', phone: '0912.888.666', membership_tier: 'Hội viên Kim Cương', discount_percent: 5, orders_count: 12, total_spent: 4850000, created_at: '2026-09-10' },
    { id: 2, name: 'Chị Phương Linh', phone: '0988.666.888', membership_tier: 'Hội viên Vàng', discount_percent: 10, orders_count: 8, total_spent: 2350000, created_at: '2026-09-15' },
    { id: 3, name: 'Bác Minh Tuấn', phone: '0903.123.456', membership_tier: 'Hội viên Bạc', discount_percent: 3, orders_count: 4, total_spent: 980000, created_at: '2026-10-01' },
    { id: 4, name: 'Khách Vãng Lai', phone: '0977.112.233', membership_tier: 'Khách mới', discount_percent: 0, orders_count: 1, total_spent: 185000, created_at: '2026-10-12' },
  ]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showImportCustomerModal, setShowImportCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerTier, setCustomerTier] = useState('Hội viên');
  const [customerDiscount, setCustomerDiscount] = useState('0');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerTierFilter, setCustomerTierFilter] = useState('all');

  // ── Add/Edit User modal ──
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showImportUserModal, setShowImportUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('123456');
  const [newUserRole, setNewUserRole] = useState('cashier');
  const [newUserShift, setNewUserShift] = useState('Ca sáng (07:00 - 15:00)');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserIsActive, setNewUserIsActive] = useState(true);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  // ── Product modal ──
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showImportProductModal, setShowImportProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productUnit, setProductUnit] = useState('phần');
  const [productCatId, setProductCatId] = useState('');
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  // ── Category modal ──
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catName, setCatName] = useState('');

  // ── Promotion modal ──
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoStep, setPromoStep] = useState(1); // 1=chọn loại, 2=nhập thông tin
  const [editingPromo, setEditingPromo] = useState(null);
  const [promoType, setPromoType] = useState('order_discount');
  const [promoName, setPromoName] = useState('');
  const [promoDiscountValue, setPromoDiscountValue] = useState('');
  const [promoMinOrder, setPromoMinOrder] = useState('');
  const [promoFromDate, setPromoFromDate] = useState('');
  const [promoToDate, setPromoToDate] = useState('');
  const [promoSearch, setPromoSearch] = useState('');

  // ── Delete Confirmation Modal State ──
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    itemName: '',
    warningText: '',
    onConfirm: null,
    loading: false
  });

  const closeDeleteModal = () => {
    setDeleteModalState(prev => ({ ...prev, isOpen: false }));
  };

  const formatMoney = (val) => Number(val || 0).toLocaleString('vi-VN') + ' đ';

  // ── Load data ──
  const loadAdminData = async () => {
    setLoading(true);
    let offlineDetected = false;

    try {
      const r = await api.getAdminStats();
      if (r?.stats) setStats(r.stats);
    } catch (e) {
      offlineDetected = true;
    }

    try {
      const r = await api.getUsers();
      if (r?.users && Array.isArray(r.users) && r.users.length > 0) {
        const cleanUsers = r.users.filter(u => u && u.name && u.name.trim().toLowerCase() !== 'test' && u.username !== 'test');
        setUsers(cleanUsers);
        try { localStorage.setItem('aura_pos_admin_users', JSON.stringify(cleanUsers)); } catch (e) {}
      }
    } catch (e) {
      offlineDetected = true;
    }

    try {
      const r = await api.getMenu();
      if (r && Array.isArray(r.products) && r.products.length > 0) {
        const cleanProducts = r.products.filter(p => p && p.name && p.name.trim().toLowerCase() !== 'test');
        const cleanR = { ...r, products: cleanProducts };
        setMenuData(cleanR);
        try { localStorage.setItem('aura_pos_admin_menu', JSON.stringify(cleanR)); } catch (e) {}
      }
      if (r?.categories && Array.isArray(r.categories) && r.categories.length > 0) {
        setCategories(r.categories);
        try { localStorage.setItem('aura_pos_admin_categories', JSON.stringify(r.categories)); } catch (e) {}
      }
    } catch (e) {
      offlineDetected = true;
    }

    try {
      const r = await api.getCategories();
      if (r?.categories && Array.isArray(r.categories) && r.categories.length > 0) {
        setCategories(r.categories);
        try { localStorage.setItem('aura_pos_admin_categories', JSON.stringify(r.categories)); } catch (e) {}
      }
    } catch (e) {
      offlineDetected = true;
    }

    try {
      const r = await api.getAdminCustomers();
      if (r?.customers && Array.isArray(r.customers) && r.customers.length > 0) {
        setCustomers(r.customers);
      }
    } catch (e) {
      offlineDetected = true;
    }

    try {
      const r = await api.getAdminPromotions();
      if (r?.promotions && Array.isArray(r.promotions) && r.promotions.length > 0) {
        setPromotions(r.promotions);
      }
    } catch (e) {
      offlineDetected = true;
    }

    try {
      const r = await api.getAdminAreas();
      if (r?.areas && Array.isArray(r.areas) && r.areas.length > 0) {
        setAreas(r.areas);
        try { localStorage.setItem('aura_pos_admin_areas', JSON.stringify(r.areas)); } catch (e) {}
      }
    } catch (e) {
      offlineDetected = true;
    }

    try {
      const r = await api.getAdminTables();
      if (r?.tables && Array.isArray(r.tables) && r.tables.length > 0) {
        setTables(r.tables);
        try { localStorage.setItem('aura_pos_admin_tables', JSON.stringify(r.tables)); } catch (e) {}
      }
    } catch (e) {
      offlineDetected = true;
    }

    setIsDbOffline(offlineDetected);
    setLoading(false);
  };

  const [lastSyncTime, setLastSyncTime] = useState(new Date());

  // ── Real-time live polling & sync for Overview Dashboard ──
  const refreshLiveStats = async () => {
    try {
      const r = await api.getAdminStats();
      if (r?.stats) {
        setStats(r.stats);
        setLastSyncTime(new Date());
      }
    } catch (e) {}

    try {
      const tRes = await api.getAdminTables();
      if (tRes?.tables && Array.isArray(tRes.tables)) {
        setTables(tRes.tables);
      }
    } catch (e) {}
  };

  useEffect(() => {
    // Tự động polling định kỳ mỗi 3 giây khi đang ở màn hình Tổng quan
    const timer = setInterval(() => {
      if (activeTab === 'overview' && document.visibilityState === 'visible') {
        refreshLiveStats();
      }
    }, 3000);

    const handleSync = () => {
      refreshLiveStats();
    };

    window.addEventListener('aura_pos_data_changed', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);

    return () => {
      clearInterval(timer);
      window.removeEventListener('aura_pos_data_changed', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, [activeTab]);

  useEffect(() => { loadAdminData(); }, []);

  // ── Product helpers ──
  const openEditProduct = (p) => {
    setEditingProduct(p);
    setProductName(p.name);
    setProductPrice(p.price);
    setProductUnit(p.unit || 'phần');
    const catList = (categories && categories.length > 0) ? categories : (menuData.categories || []);
    const catId = p.category_id || p.category?.id || catList[0]?.id || '1';
    setProductCatId(String(catId));
    setShowAddProductModal(true);
  };
  const openAddProduct = () => {
    setEditingProduct(null);
    setProductName(''); setProductPrice(''); setProductUnit('phần');
    const catList = (categories && categories.length > 0) ? categories : (menuData.categories || []);
    setProductCatId(catList[0]?.id ? String(catList[0].id) : '1');
    setShowAddProductModal(true);
  };
  const openEditCat = (c) => { setEditingCat(c); setCatName(c.name); setShowAddCatModal(true); };
  const openAddCat = () => { setEditingCat(null); setCatName(''); setShowAddCatModal(true); };

  // ── Promotion helpers ──
  const openAddPromo = () => {
    setEditingPromo(null);
    setPromoStep(1);
    setPromoType('order_discount');
    setPromoName(''); setPromoDiscountValue(''); setPromoMinOrder('');
    setPromoFromDate(''); setPromoToDate('');
    setShowPromoModal(true);
  };
  const openEditPromo = (p) => {
    setEditingPromo(p);
    setPromoStep(2);
    setPromoType(p.type);
    setPromoName(p.name);
    setPromoDiscountValue(p.discount_value);
    setPromoMinOrder(p.min_order);
    setPromoFromDate(p.from_date);
    setPromoToDate(p.to_date);
    setShowPromoModal(true);
  };
  const handleSavePromo = async (e) => {
    e.preventDefault();
    const newPromo = {
      name: promoName,
      type: promoType,
      discount_value: Number(promoDiscountValue),
      min_order: Number(promoMinOrder),
      from_date: promoFromDate,
      to_date: promoToDate,
      is_active: true,
    };
    try {
      if (editingPromo) {
        const res = await api.updateAdminPromotion(editingPromo.id, newPromo);
        if (res?.promotion) {
          setPromotions(prev => prev.map(p => p.id === editingPromo.id ? res.promotion : p));
        }
      } else {
        const res = await api.addAdminPromotion(newPromo);
        if (res?.promotion) {
          setPromotions(prev => [res.promotion, ...prev]);
        }
      }
    } catch (err) {
      console.warn('Promo save error:', err);
    }
    setShowPromoModal(false);
  };
  const handleDeletePromo = (p) => {
    const promo = typeof p === 'object' ? p : promotions.find(item => item.id === p);
    if (!promo) return;

    setDeleteModalState({
      isOpen: true,
      title: t('admin.confirmDeletePromoTitle'),
      message: t('admin.confirmDeletePromo'),
      itemName: `${promo.name} (${promo.code})`,
      warningText: t('admin.confirmDeletePromoWarning'),
      onConfirm: async () => {
        try {
          await api.deleteAdminPromotion(promo.id);
          setPromotions(prev => prev.filter(item => item.id !== promo.id));
        } catch (err) {}
        closeDeleteModal();
      }
    });
  };
  const handleTogglePromo = async (id) => {
    const current = promotions.find(p => p.id === id);
    if (!current) return;
    const nextStatus = !current.is_active;
    setPromotions(prev => prev.map(p => p.id === id ? { ...p, is_active: nextStatus } : p));
    try {
      await api.updateAdminPromotion(id, { is_active: nextStatus });
    } catch (err) {}
  };

  // ── User management helpers ──
  const openAddUser = () => {
    setEditingUser(null);
    setNewUserName('');
    setNewUserUsername('');
    setNewUserEmail('');
    setNewUserPassword('123456');
    setNewUserRole('cashier');
    setNewUserShift('Ca sáng (07:00 - 15:00)');
    setNewUserPhone('');
    setNewUserIsActive(true);
    setShowAddUserModal(true);
  };

  const openEditUser = (u) => {
    setEditingUser(u);
    setNewUserName(u.name || '');
    setNewUserUsername(u.username || '');
    setNewUserEmail(u.email || '');
    setNewUserPassword('');
    setNewUserRole(u.role || 'cashier');
    setNewUserShift(u.shift || 'Ca sáng (07:00 - 15:00)');
    setNewUserPhone(u.phone || '');
    setNewUserIsActive(u.is_active !== undefined ? Boolean(u.is_active) : true);
    setShowAddUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (isSubmittingUser) return;
    setIsSubmittingUser(true);

    const payload = {
      name: newUserName.trim(),
      username: newUserUsername.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      shift: newUserShift,
      phone: newUserPhone.trim(),
      is_active: newUserIsActive ? 1 : 0,
    };
    if (newUserPassword.trim()) {
      payload.password = newUserPassword.trim();
    }

    setShowAddUserModal(false);

    if (editingUser) {
      const updated = { ...editingUser, ...payload };
      setUsers(prev => {
        const next = prev.map(u => String(u.id) === String(editingUser.id) ? { ...u, ...updated } : u);
        try { localStorage.setItem('aura_pos_admin_users', JSON.stringify(next)); } catch (e) {}
        return next;
      });

      // Nếu sửa chính tài khoản đang đăng nhập, lập tức cập nhật state cha và sessionStorage
      const isSelf = (currentUser?.id && String(editingUser.id) === String(currentUser.id)) ||
                     (currentUser?.username && editingUser.username === currentUser.username);
      if (isSelf) {
        const merged = { ...currentUser, ...updated };
        try {
          sessionStorage.setItem('pos_user', JSON.stringify(merged));
        } catch (e) {}
        if (onUpdateCurrentUser) {
          onUpdateCurrentUser(merged);
        }
      }

      try {
        const res = await api.updateUser(editingUser.id, payload);
        if (res?.user) {
          setUsers(prev => {
            const next = prev.map(u => String(u.id) === String(editingUser.id) ? { ...u, ...res.user } : u);
            try { localStorage.setItem('aura_pos_admin_users', JSON.stringify(next)); } catch (e) {}
            return next;
          });
        }
      } catch (err) {
        console.warn('API updateUser warning:', err);
      } finally {
        setIsSubmittingUser(false);
      }
    } else {
      if (!newUserPassword.trim() || newUserPassword.trim().length < 6) {
        alert('Vui lòng nhập mật khẩu tối thiểu 6 ký tự!');
        setIsSubmittingUser(false);
        setShowAddUserModal(true);
        return;
      }
      const tempId = Date.now();
      const created = { id: tempId, ...payload };
      setUsers(prev => {
        const next = [...prev, created];
        try { localStorage.setItem('aura_pos_admin_users', JSON.stringify(next)); } catch (e) {}
        return next;
      });

      try {
        const res = await api.createUser(payload);
        if (res?.user) {
          setUsers(prev => {
            const next = prev.map(u => u.id === tempId ? { ...u, ...res.user } : u);
            try { localStorage.setItem('aura_pos_admin_users', JSON.stringify(next)); } catch (e) {}
            return next;
          });
        }
      } catch (err) {
        console.warn('API createUser warning:', err);
      } finally {
        setIsSubmittingUser(false);
      }
    }
  };

  const handleDeleteUser = (u) => {
    const userObj = typeof u === 'object' ? u : users.find(item => String(item.id) === String(u));
    if (!userObj) return;

    if (userObj.id === 1 || userObj.username === 'admin') {
      alert(t('admin.cannotDeleteAdmin'));
      return;
    }
    if (currentUser && (String(currentUser.id) === String(userObj.id) || currentUser.username === userObj.username)) {
      alert(t('admin.cannotDeleteSelf'));
      return;
    }

    setDeleteModalState({
      isOpen: true,
      title: t('admin.confirmDeleteUserTitle'),
      message: t('admin.confirmDeleteUser'),
      itemName: `${userObj.name} (@${userObj.username})`,
      warningText: t('admin.confirmDeleteUserWarning'),
      onConfirm: () => {
        closeDeleteModal();
        setUsers(prev => {
          const next = prev.filter(item => String(item.id) !== String(userObj.id));
          try { localStorage.setItem('aura_pos_admin_users', JSON.stringify(next)); } catch (e) {}
          return next;
        });
        api.deleteUser(userObj.id).catch(err => {
          console.warn('API deleteUser warning:', err);
        });
      }
    });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (isSubmittingProduct) return;
    setIsSubmittingProduct(true);

    const catList = (categories && categories.length > 0) ? categories : (menuData.categories || []);
    const cat = catList.find(c => String(c.id) === String(productCatId)) || catList[0];
    const catIdNum = cat ? Number(cat.id) : (Number(productCatId) || 1);
    const data = { category_id: catIdNum, name: productName.trim(), price: Number(productPrice) || 0, unit: productUnit.trim() || 'phần' };

    setShowAddProductModal(false);

    if (editingProduct) {
      const updated = { ...editingProduct, ...data, category: cat || editingProduct.category };
      setMenuData(prev => {
        const nextProducts = (prev.products || []).map(p => String(p.id) === String(editingProduct.id) ? updated : p);
        const next = { ...prev, products: nextProducts };
        try { localStorage.setItem('aura_pos_admin_menu', JSON.stringify(next)); } catch (e) {}
        return next;
      });

      try {
        await api.updateProduct(editingProduct.id, data);
      } catch (err) {
        console.warn('API updateProduct warning:', err);
      } finally {
        setIsSubmittingProduct(false);
      }
    } else {
      const randomCode = `SP${Math.floor(Math.random() * 900) + 100}`;
      const tempId = Date.now();
      const newProd = { id: tempId, ...data, code: randomCode, category: cat, is_active: 1 };
      setMenuData(prev => {
        const nextProducts = [...(prev.products || []), newProd];
        const next = { ...prev, products: nextProducts };
        try { localStorage.setItem('aura_pos_admin_menu', JSON.stringify(next)); } catch (e) {}
        return next;
      });

      try {
        const res = await api.addProduct(data);
        if (res && res.product) {
          setMenuData(prev => {
            const nextProducts = (prev.products || []).map(p => p.id === tempId ? { ...p, id: res.product.id, code: res.product.code || p.code } : p);
            const next = { ...prev, products: nextProducts };
            try { localStorage.setItem('aura_pos_admin_menu', JSON.stringify(next)); } catch (e) {}
            return next;
          });
        }
      } catch (err) {
        console.warn('API addProduct warning:', err);
      } finally {
        setIsSubmittingProduct(false);
      }
    }
  };

  const handleDeleteProduct = (p) => {
    const prod = typeof p === 'object' ? p : (menuData.products || []).find(item => String(item.id) === String(p));
    const targetId = prod ? prod.id : p;
    const targetName = prod ? `${formatDishName(prod.name, prod.code)} (${prod.code})` : 'Món ăn';

    setDeleteModalState({
      isOpen: true,
      title: t('admin.confirmDeleteProductTitle'),
      message: t('admin.confirmDeleteProduct'),
      itemName: targetName,
      warningText: t('admin.confirmDeleteProductWarning'),
      onConfirm: () => {
        closeDeleteModal();
        setMenuData(prev => {
          const nextProducts = (prev.products || []).filter(item => String(item.id) !== String(targetId));
          const next = { ...prev, products: nextProducts };
          try { localStorage.setItem('aura_pos_admin_menu', JSON.stringify(next)); } catch (e) {}
          return next;
        });
        api.deleteProduct(targetId).catch(err => {
          console.warn('API deleteProduct warning:', err);
        });
      }
    });
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const name = catName.trim();
    if (!name) return;
    setShowAddCatModal(false);

    if (editingCat) {
      setCategories(prev => {
        const next = prev.map(c => String(c.id) === String(editingCat.id) ? { ...c, name } : c);
        try { localStorage.setItem('aura_pos_admin_categories', JSON.stringify(next)); } catch (e) {}
        return next;
      });
      try {
        await api.updateCategory(editingCat.id, { name });
      } catch (err) {
        console.warn('API updateCategory warning:', err);
      }
    } else {
      const tempId = Date.now();
      const newCat = { id: tempId, name, code: `CAT_${tempId}` };
      setCategories(prev => {
        const next = [...prev, newCat];
        try { localStorage.setItem('aura_pos_admin_categories', JSON.stringify(next)); } catch (e) {}
        return next;
      });
      try {
        const res = await api.addCategory({ name });
        if (res && res.category) {
          setCategories(prev => {
            const next = prev.map(c => c.id === tempId ? { ...c, id: res.category.id, code: res.category.code || c.code } : c);
            try { localStorage.setItem('aura_pos_admin_categories', JSON.stringify(next)); } catch (e) {}
            return next;
          });
        }
      } catch (err) {
        console.warn('API addCategory warning:', err);
      }
    }
  };

  const handleDeleteCategory = (c) => {
    const cat = typeof c === 'object' ? c : categories.find(item => String(item.id) === String(c));
    const targetId = cat ? cat.id : c;
    const targetName = cat ? formatCategoryName(cat.name, cat.code) : 'Nhóm thực đơn';

    setDeleteModalState({
      isOpen: true,
      title: t('admin.confirmDeleteCategoryTitle'),
      message: t('admin.confirmDeleteCategory'),
      itemName: targetName,
      warningText: t('admin.confirmDeleteCategoryWarning'),
      onConfirm: () => {
        closeDeleteModal();
        setCategories(prev => {
          const next = prev.filter(item => String(item.id) !== String(targetId));
          try { localStorage.setItem('aura_pos_admin_categories', JSON.stringify(next)); } catch (e) {}
          return next;
        });
        api.deleteCategory(targetId).catch(err => {
          console.warn('API deleteCategory warning:', err);
        });
      }
    });
  };

  // ── Table helpers ──
  const openAddTable = () => {
    setEditingTable(null);
    setTableName('');
    setTableAreaId(areas[0]?.id || '');
    setTableCapacity('4');
    setShowTableModal(true);
  };
  const openEditTable = (t) => {
    setEditingTable(t);
    setTableName(t.name);
    setTableAreaId(t.area_id || '');
    setTableCapacity(String(t.capacity || 4));
    setShowTableModal(true);
  };
  const handleSaveTable = async (e) => {
    e.preventDefault();
    if (!tableName.trim()) return alert('Vui lòng nhập tên bàn/phòng');
    const areaObj = areas.find(a => String(a.id) === String(tableAreaId));
    const payload = {
      name: tableName.trim(),
      area_id: Number(tableAreaId),
      area_name: areaObj?.name || '',
      capacity: Number(tableCapacity) || 4,
    };
    setShowTableModal(false);

    if (editingTable) {
      setTables(prev => {
        const next = prev.map(t => String(t.id) === String(editingTable.id) ? { ...t, ...payload } : t);
        try { localStorage.setItem('aura_pos_admin_tables', JSON.stringify(next)); } catch (e) {}
        return next;
      });
      try {
        await api.updateAdminTable(editingTable.id, payload);
      } catch (err) {
        console.warn('API updateAdminTable warning:', err);
      }
    } else {
      const tempId = Date.now();
      const newT = { id: tempId, ...payload, status: 'empty' };
      setTables(prev => {
        const next = [...prev, newT];
        try { localStorage.setItem('aura_pos_admin_tables', JSON.stringify(next)); } catch (e) {}
        return next;
      });
      try {
        const res = await api.addAdminTable(payload);
        if (res?.table) {
          setTables(prev => {
            const next = prev.map(t => t.id === tempId ? { ...t, ...res.table } : t);
            try { localStorage.setItem('aura_pos_admin_tables', JSON.stringify(next)); } catch (e) {}
            return next;
          });
        }
      } catch (err) {
        console.warn('API addAdminTable warning:', err);
      }
    }
  };
  const handleDeleteTable = (tItem) => {
    const tbl = typeof tItem === 'object' ? tItem : tables.find(item => String(item.id) === String(tItem));
    const targetId = tbl ? tbl.id : tItem;
    const targetName = tbl ? formatTableName(tbl.name) : 'Bàn / Phòng';

    setDeleteModalState({
      isOpen: true,
      title: t('admin.confirmDeleteTableTitle'),
      message: t('admin.confirmDeleteTable'),
      itemName: targetName,
      warningText: t('admin.confirmDeleteTableWarning'),
      onConfirm: () => {
        closeDeleteModal();
        setTables(prev => {
          const next = prev.filter(t => String(t.id) !== String(targetId));
          try { localStorage.setItem('aura_pos_admin_tables', JSON.stringify(next)); } catch (e) {}
          return next;
        });
        api.deleteAdminTable(targetId).catch(err => {
          console.warn('API deleteAdminTable warning:', err);
        });
      }
    });
  };

  // ── Area helpers ──
  const openAddArea = () => { setEditingArea(null); setAreaName(''); setShowAreaModal(true); };
  const openEditArea = (a) => { setEditingArea(a); setAreaName(a.name); setShowAreaModal(true); };
  const handleSaveArea = async (e) => {
    e.preventDefault();
    if (!areaName.trim()) return alert('Vui lòng nhập tên khu vực');
    const payload = { name: areaName.trim() };
    setShowAreaModal(false);

    if (editingArea) {
      setAreas(prev => {
        const next = prev.map(a => String(a.id) === String(editingArea.id) ? { ...a, ...payload } : a);
        try { localStorage.setItem('aura_pos_admin_areas', JSON.stringify(next)); } catch (e) {}
        return next;
      });
      try {
        await api.updateAdminArea(editingArea.id, payload);
      } catch (err) {
        console.warn('API updateAdminArea warning:', err);
      }
    } else {
      const tempId = Date.now();
      const newA = { id: tempId, ...payload };
      setAreas(prev => {
        const next = [...prev, newA];
        try { localStorage.setItem('aura_pos_admin_areas', JSON.stringify(next)); } catch (e) {}
        return next;
      });
      try {
        const res = await api.addAdminArea(payload);
        if (res?.area) {
          setAreas(prev => {
            const next = prev.map(a => a.id === tempId ? { ...a, ...res.area } : a);
            try { localStorage.setItem('aura_pos_admin_areas', JSON.stringify(next)); } catch (e) {}
            return next;
          });
        }
      } catch (err) {
        console.warn('API addAdminArea warning:', err);
      }
    }
  };
  const handleDeleteArea = (a) => {
    const area = typeof a === 'object' ? a : areas.find(item => String(item.id) === String(a));
    const targetId = area ? area.id : a;
    const targetName = area ? formatAreaName(area.name, area.code) : 'Khu vực';

    setDeleteModalState({
      isOpen: true,
      title: t('admin.confirmDeleteAreaTitle'),
      message: t('admin.confirmDeleteArea'),
      itemName: targetName,
      warningText: t('admin.confirmDeleteAreaWarning'),
      onConfirm: () => {
        closeDeleteModal();
        setAreas(prev => {
          const next = prev.filter(item => String(item.id) !== String(targetId));
          try { localStorage.setItem('aura_pos_admin_areas', JSON.stringify(next)); } catch (e) {}
          return next;
        });
        api.deleteAdminArea(targetId).catch(err => {
          console.warn('API deleteAdminArea warning:', err);
        });
      }
    });
  };

  // ── Import tables from file / text ──
  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImportText(ev.target.result);
    reader.readAsText(file, 'UTF-8');
  };
  const handleConfirmImport = async () => {
    const lines = importText.split('\n').map(l => l.trim()).filter(Boolean);
    const imported = [];
    for (const line of lines) {
      // Support CSV: TênBàn,KhuVực,SứcChứa  OR  JSON array
      let name = '', areaName2 = '', capacity = 4;
      if (line.startsWith('{')) {
        try { const obj = JSON.parse(line); name = obj.name; areaName2 = obj.area || obj.area_name || ''; capacity = obj.capacity || 4; } catch {}
      } else {
        const parts = line.split(',').map(p => p.trim());
        name = parts[0] || '';
        areaName2 = parts[1] || '';
        capacity = Number(parts[2]) || 4;
      }
      if (!name) continue;
      const areaObj = areas.find(a => a.name === areaName2) || areas[0];
      imported.push({ name, area_id: areaObj?.id || null, area_name: areaObj?.name || areaName2, capacity });
    }
    if (imported.length === 0) return alert(t('admin.importNoData'));
    try {
      const res = await api.importAdminTables(imported);
      if (res?.tables) setTables(prev => [...prev, ...res.tables]);
      else setTables(prev => [...prev, ...imported.map((t, i) => ({ ...t, id: Date.now() + i, status: 'empty' }))]);
    } catch {
      setTables(prev => [...prev, ...imported.map((t, i) => ({ ...t, id: Date.now() + i, status: 'empty' }))]);
    }
    setShowImportModal(false);
    setImportText('');
  };

  // ── Customer helpers ──
  const openAddCustomer = () => {
    setEditingCustomer(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerTier('Hội viên');
    setCustomerDiscount('0');
    setShowCustomerModal(true);
  };

  const openEditCustomer = (c) => {
    setEditingCustomer(c);
    setCustomerName(c.name);
    setCustomerPhone(c.phone || '');
    setCustomerTier(c.membership_tier || 'Hội viên');
    setCustomerDiscount(String(c.discount_percent || '0'));
    setShowCustomerModal(true);
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) return alert('Vui lòng nhập tên khách hàng');

    const payload = {
      name: customerName.trim(),
      phone: customerPhone.trim(),
      membership_tier: customerTier,
      discount_percent: Number(customerDiscount) || 0
    };

    try {
      if (editingCustomer) {
        await api.updateCustomerInfo(editingCustomer.id, payload);
        setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? { ...c, ...payload } : c));
      } else {
        const res = await api.addCustomer(payload);
        const newCust = res?.customer || {
          id: Date.now(),
          ...payload,
          orders_count: 0,
          total_spent: 0,
          created_at: new Date().toISOString()
        };
        setCustomers(prev => [newCust, ...prev]);
      }
      setShowCustomerModal(false);
    } catch (err) {
      if (editingCustomer) {
        setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? { ...c, ...payload } : c));
      } else {
        setCustomers(prev => [{
          id: Date.now(),
          ...payload,
          orders_count: 0,
          total_spent: 0,
          created_at: new Date().toISOString()
        }, ...prev]);
      }
      setShowCustomerModal(false);
    }
  };

  const handleDeleteCustomer = (c) => {
    const cust = typeof c === 'object' ? c : customers.find(item => item.id === c);
    if (!cust) return;

    setDeleteModalState({
      isOpen: true,
      title: t('admin.confirmDeleteCustomerTitle'),
      message: t('admin.confirmDeleteCustomer'),
      itemName: `${cust.name} (${cust.phone || 'KH' + String(cust.id).padStart(5, '0')})`,
      warningText: t('admin.confirmDeleteCustomerWarning'),
      onConfirm: async () => {
        try {
          await api.deleteCustomer(cust.id);
        } catch (e) {}
        setCustomers(prev => prev.filter(item => item.id !== cust.id));
        closeDeleteModal();
      }
    });
  };

  const filteredCustomers = customers.filter(c => {
    const code = `KH${String(c.id).padStart(5, '0')}`.toLowerCase();
    const name = (c.name || '').toLowerCase();
    const phone = (c.phone || '');
    const q = customerSearch.toLowerCase();
    const matchesSearch = name.includes(q) || phone.includes(q) || code.includes(q);
    const matchesTier = customerTierFilter === 'all' || c.membership_tier === customerTierFilter;
    return matchesSearch && matchesTier;
  });

  const filteredPromos = promotions.filter(p => {
    const q = promoSearch.toLowerCase();
    const dName = formatPromoName(p.name).toLowerCase();
    return p.name.toLowerCase().includes(q) ||
           dName.includes(q) ||
           p.code.toLowerCase().includes(q);
  });

  const getPromoTypeLabel = (type) => {
    const pt = PROMO_TYPES.find(item => item.value === type);
    return pt ? t(pt.labelKey) : type;
  };

  const getTierLabel = (tierStr) => {
    if (!tierStr) return t('admin.tierNew');
    if (tierStr.includes('Kim Cương') || tierStr.toLowerCase().includes('diamond')) return t('admin.tierDiamond');
    if (tierStr.includes('Vàng') || tierStr.toLowerCase().includes('gold')) return t('admin.tierGold');
    if (tierStr.includes('Bạc') || tierStr.toLowerCase().includes('silver')) return t('admin.tierSilver');
    if (tierStr === 'Hội viên' || tierStr.toLowerCase() === 'member') return t('admin.tierMember');
    if (tierStr === 'Khách mới' || tierStr.toLowerCase().includes('new')) return t('admin.tierNew');
    return tierStr;
  };

  const getShiftLabel = (shiftStr) => {
    if (!shiftStr) return '—';
    if (shiftStr.includes('sáng')) return `${t('header.morningShift')} (07:00 - 15:00)`;
    if (shiftStr.includes('chiều')) return `${t('header.afternoonShift')} (15:00 - 23:00)`;
    if (shiftStr.includes('Toàn ca')) return `${t('header.fullShift')} (${t('header.manager')})`;
    return shiftStr;
  };

  // ─── TỰ ĐỘNG ĐỒNG BỘ THÔNG TIN USER ĐANG ĐĂNG NHẬP ───
  // Luôn ưu tiên lấy thông tin mới nhất từ danh sách users trong state (để khi vừa bấm Sửa nhân viên, góc phải lập tức đổi ngay)
  const currentInList = users.find(u => 
    (currentUser?.id && u.id === currentUser.id) || 
    (currentUser?.username && u.username === currentUser.username)
  );
  const activeUser = currentInList || currentUser;

  const rawName = activeUser?.name || activeUser?.username || '';
  const cleanName = rawName.replace(/^(Quản lý|Thu ngân|Nhân viên|Admin|Manager|Cashier):\s*/i, '');
  const displayName = cleanName || rawName || 'Admin';
  const initials = displayName.split(' ').filter(Boolean).map(n => n[0]).slice(-2).join('').toUpperCase() || 'AD';
  const roleLabel = activeUser?.role === 'admin' ? (t('header.admin') || 'Quản Trị Viên') : (t('header.cashier') || 'Thu Ngân');
  const shiftText = getShiftLabel(activeUser?.shift);

  return (
    <div style={{ flex: 1, backgroundColor: '#f1f5f9', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ═══ UNIFIED ADMIN HEADER BAR ═══ */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '56px',
        flexShrink: 0,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        zIndex: 50
      }}>
        {/* Left side: Brand Logo + Về POS Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          {/* Logo & Brand */}
          <div
            onClick={onBackToPos}
            title={t('header.backToPOS') || 'Về POS'}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <img
              src="/logo.png"
              alt="QUÁN TRÀ Logo"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                border: '1.2px solid #d4af37',
                boxShadow: '0 2px 6px rgba(212, 175, 55, 0.25)',
                objectFit: 'cover'
              }}
            />
            <div style={{
              fontWeight: 800,
              fontSize: '15px',
              letterSpacing: '0.4px',
              color: '#0f172a'
            }}>
              QUÁN TRÀ
            </div>
          </div>

          {/* Vertical Separator */}
          <div style={{ width: '1px', height: '22px', backgroundColor: '#e2e8f0', margin: '0 4px' }} />

          {/* Nút Về POS */}
          <button
            onClick={onBackToPos}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: '#1B5E20',
              color: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 6px rgba(27, 94, 32, 0.25)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2E7D32'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1B5E20'}
          >
            <ArrowLeft size={14} />
            <span>{t('admin.backToPOS') || 'Về POS'}</span>
          </button>
        </div>

        {/* Center: Navigation Menu Tabs with Dropdowns */}
        <AdminNavMenu navItems={NAV_ITEMS_DYNAMIC} activeTab={activeTab} onSelect={setActiveTab} />

        {/* Right side: Language Switcher + User Account Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>

          {/* Language Switcher */}
          <LanguageSwitcher variant="light" />

          {/* User Account Dropdown Menu */}
          <div ref={userDropdownRef} style={{ position: 'relative' }}>
            <div
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '4px 8px 4px 10px',
                borderRadius: '8px',
                backgroundColor: userDropdownOpen ? '#f1f5f9' : 'transparent',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => { if (!userDropdownOpen) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
              onMouseLeave={(e) => { if (!userDropdownOpen) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: '#0f172a',
                  lineHeight: '1.2',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  justifyContent: 'flex-end'
                }}>
                  <span>{roleLabel}: {displayName}</span>
                  <ChevronDown
                    size={12}
                    color="#64748b"
                    style={{
                      transform: userDropdownOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s'
                    }}
                  />
                </div>
                <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                  {shiftText}
                </div>
              </div>

              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#1B5E20',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '12px',
                boxShadow: '0 2px 6px rgba(27, 94, 32, 0.35)',
                border: '1.5px solid #ffffff'
              }}>
                {initials}
              </div>
            </div>

            {/* Dropdown Menu Box */}
            {userDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '46px',
                right: '0',
                width: '270px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
                overflow: 'hidden',
                zIndex: 9999
              }}>
                {/* Profile Card Header */}
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#1B5E20',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '13px'
                    }}>
                      {initials}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                        {displayName}
                      </div>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        backgroundColor: '#E8F5E9',
                        color: '#2E7D32',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        marginTop: '2px'
                      }}>
                        <Shield size={10} />
                        <span>{roleLabel}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: '1px solid #e2e8f0',
                    fontSize: '11px',
                    color: '#64748b',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={11} color="#64748b" />
                      <span>{shiftText}</span>
                    </div>
                    {activeUser?.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Store size={11} color="#64748b" />
                        <span>{activeUser.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ padding: '6px' }}>
                  <button
                    id="btn-admin-settings"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setActiveTab('settings');
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: activeTab === 'settings' ? '#1B5E20' : '#334155',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: activeTab === 'settings' ? '#E8F5E9' : 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E8F5E9'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = activeTab === 'settings' ? '#E8F5E9' : 'transparent'}
                  >
                    <Settings size={14} color="#1B5E20" />
                    <span>{t('admin.settings.title') || 'Thiết lập'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onBackToPos();
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: '#1B5E20',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E8F5E9'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LayoutDashboard size={14} />
                    <span>{t('header.backToPOS') || 'Về màn hình POS'}</span>
                  </button>

                  <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '4px 0' }} />

                  <button
                    id="btn-admin-logout"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      if (onLogout) onLogout();
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={14} />
                    <span>{t('header.logout') || 'Đăng xuất'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ CONTENT AREA ═══ */}
      <div style={{
        flex: 1,
        overflowY: ['report_end_of_day', 'report_sales', 'report_goods', 'cashbook', 'bank_accounts', 'settings'].includes(activeTab) ? 'hidden' : 'auto',
        padding: ['report_end_of_day', 'report_sales', 'report_goods', 'cashbook', 'bank_accounts', 'settings'].includes(activeTab) ? '0' : '24px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Banner cảnh báo khi MySQL tạm dừng / chưa bật */}
        {isDbOffline && (
          <div style={{
            margin: ['report_end_of_day', 'report_sales', 'report_goods', 'cashbook', 'bank_accounts', 'settings'].includes(activeTab) ? '12px 24px 0 24px' : '0 0 20px 0',
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '10px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', flexShrink: 0 }}>
                <AlertCircle size={20} />
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#92400e' }}>
                  {t('admin.mysqlOfflineTitle')}
                </div>
                <div style={{ fontSize: '12px', color: '#b45309', marginTop: '2px', lineHeight: 1.4 }}>
                  {t('admin.mysqlOfflineDesc')}
                </div>
              </div>
            </div>
            <button
              onClick={() => loadAdminData()}
              style={{
                padding: '7px 16px',
                backgroundColor: '#1B5E20',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '12.5px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {t('admin.retrySync')}
            </button>
          </div>
        )}

        {/* ─── TAB: THIẾT LẬP (SETTINGS) ─── */}
        {activeTab === 'settings' && (
          <SettingsView onBackToDashboard={() => setActiveTab('overview')} />
        )}

        {/* ─── TAB: SỔ QUỸ (CASHBOOK) ─── */}
        {activeTab === 'cashbook' && (
          <CashBookView currentUser={currentUser} />
        )}

        {/* ─── TAB: THIẾT LẬP TÀI KHOẢN NGÂN HÀNG (BANK ACCOUNTS) ─── */}
        {activeTab === 'bank_accounts' && (
          <BankAccountsView />
        )}

        {/* ─── TAB: REPORTS (Báo cáo cuối ngày, Bán hàng, Hàng hóa) ─── */}
        {['report_end_of_day', 'report_sales', 'report_goods'].includes(activeTab) && (
          <ReportsView
            subTab={activeTab}
            onSubTabChange={(tab) => setActiveTab(tab)}
            currentUser={currentUser}
          />
        )}

        {/* ─── TAB: OVERVIEW ─── */}
        {activeTab === 'overview' && (
          <OverviewDashboard
            stats={stats}
            users={users}
            tables={tables}
            menuData={menuData}
            formatMoney={formatMoney}
            formatDishName={formatDishName}
          />
        )}

        {/* ─── TAB: USERS ─── */}
        {activeTab === 'users' && (
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800 }}>{t('admin.usersTitle')}</h3>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{t('admin.userDataDbDesc')}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setShowImportUserModal(true)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                    border: '1px solid #a7f3d0',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <FileSpreadsheet size={15} /> {t('admin.importUserExcel') || 'Nhập từ Excel / CSV'}
                </button>
                <button onClick={openAddUser} style={btnPrimary}>
                  <Plus size={15} /> {t('admin.addStaff')}
                </button>
              </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  {[t('admin.fullName'), t('admin.loginName'), t('admin.email'), t('admin.role'), t('admin.shift'), t('admin.phone'), t('status'), t('actions')].map(h => (
                    <th key={h} style={{ padding: '10px 12px', fontSize: '12px', fontWeight: 700, color: '#475569', textAlign: h === t('actions') ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const isMainAdmin = u.id === 1 || u.username === 'admin';
                  const isSelf = currentUser && (currentUser.id === u.id || currentUser.username === u.username);
                  const canDelete = !isMainAdmin && !isSelf;
                  const isActive = u.is_active !== undefined ? Boolean(u.is_active) : true;

                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: 700 }}>{u.name}</td>
                      <td style={{ padding: '12px', fontFamily: 'monospace', color: '#1B5E20', fontSize: '12.5px' }}>{u.username}</td>
                      <td style={{ padding: '12px', color: '#64748b' }}>{u.email}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                          backgroundColor: u.role === 'admin' ? 'rgba(56,189,248,0.15)' : 'rgba(27, 94, 32,0.15)',
                          color: u.role === 'admin' ? '#1B5E20' : '#1B5E20'
                        }}>
                          {u.role === 'admin' ? t('admin.roleAdmin') : t('admin.roleCashier')}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#475569' }}>{getShiftLabel(u.shift)}</td>
                      <td style={{ padding: '12px', color: '#64748b' }}>{u.phone || '—'}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          color: isActive ? '#10b981' : '#ef4444',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          backgroundColor: isActive ? '#ecfdf5' : '#fef2f2',
                          padding: '2px 8px',
                          borderRadius: '12px'
                        }}>
                          {isActive ? t('admin.working') : t('admin.locked')}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => openEditUser(u)}
                            title={t('edit')}
                            style={{
                              padding: '6px 8px', borderRadius: '6px',
                              color: '#1B5E20', backgroundColor: '#E8F5E9',
                              border: 'none', cursor: 'pointer',
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                            }}
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            disabled={!canDelete}
                            title={isMainAdmin ? t('admin.cannotDeleteAdmin') : isSelf ? t('admin.cannotDeleteSelf') : t('delete')}
                            style={{
                              padding: '6px 8px', borderRadius: '6px',
                              color: !canDelete ? '#94a3b8' : '#ef4444',
                              backgroundColor: !canDelete ? '#f1f5f9' : '#fee2e2',
                              border: 'none',
                              cursor: !canDelete ? 'not-allowed' : 'pointer',
                              opacity: !canDelete ? 0.6 : 1,
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── TAB: MENU (Products) ─── */}
        {activeTab === 'menu' && (
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800 }}>{t('admin.menuTitle')}</h3>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{t('admin.autoGenCodeDesc')}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowImportProductModal(true)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid #10b981',
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#d1fae5'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ecfdf5'}
                >
                  <FileSpreadsheet size={15} /> {t('admin.importProductExcel') || 'Nhập từ Excel / CSV'}
                </button>
                <button onClick={openAddProduct} style={btnPrimary}>
                  <Plus size={15} /> {t('admin.addProduct')}
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {(menuData.products || []).map(p => (
                <div key={p.id} style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formatDishName(p.name, p.code)}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      <span style={{ backgroundColor: '#E8F5E9', color: '#1B5E20', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, marginRight: '6px' }}>{p.code}</span>
                      {t('menu.unit')}: {formatDishUnit(p.unit)}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#1B5E20', marginTop: '4px' }}>{formatMoney(p.price)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginLeft: '8px' }}>
                    <button onClick={() => openEditProduct(p)} title={t('edit')} style={{ padding: '6px 8px', borderRadius: '6px', color: '#1B5E20', backgroundColor: '#E8F5E9', border: 'none', cursor: 'pointer' }}>
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDeleteProduct(p)} title={t('delete')} style={{ padding: '6px 8px', borderRadius: '6px', color: '#ef4444', backgroundColor: '#fee2e2', border: 'none', cursor: 'pointer' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB: CATEGORIES ─── */}
        {activeTab === 'categories' && (
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800 }}>{t('admin.categoryTitle')}</h3>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{t('admin.categoryDbDesc')}</p>
              </div>
              <button onClick={openAddCat} style={btnPrimary}>
                <Plus size={15} /> {t('admin.addCategory')}
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {categories.map(c => (
                <div key={c.id} style={{ padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{formatCategoryName(c.name)}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{c.products_count ?? c.products?.length ?? 0} {t('table.items')}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => openEditCat(c)} title={t('edit')} style={{ padding: '6px 8px', borderRadius: '6px', color: '#1B5E20', backgroundColor: '#E8F5E9', border: 'none', cursor: 'pointer' }}><Pencil size={13} /></button>
                    <button onClick={() => handleDeleteCategory(c)} title={t('delete')} style={{ padding: '6px 8px', borderRadius: '6px', color: '#ef4444', backgroundColor: '#fee2e2', border: 'none', cursor: 'pointer' }}><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB: CUSTOMERS ─── */}
        {activeTab === 'customers' && (
          <CustomersView
            customers={customers}
            setCustomers={setCustomers}
            onRefresh={loadAdminData}
            setShowImportCustomerModal={setShowImportCustomerModal}
          />
        )}

        {/* ─── TAB: PROMOTIONS ─── */}
        {activeTab === 'promotions' && (
          <div>
            {/* Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{t('admin.promoTitle')}</h2>
                <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>{t('admin.promoSubtitle')}</p>
              </div>
              <button onClick={openAddPromo} style={{ ...btnPrimary, padding: '9px 20px', fontSize: '13.5px', backgroundColor: '#1B5E20' }}>
                <Plus size={15} /> {t('admin.addPromo')}
              </button>
            </div>

            {/* Search + Filter bar */}
            <div style={{ backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder={t('admin.searchPromoPlaceholder')}
                value={promoSearch}
                onChange={e => setPromoSearch(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13.5px', color: '#0f172a', background: 'transparent' }}
              />
              <div style={{ width: '1px', height: '20px', backgroundColor: '#e2e8f0' }} />
              <Filter size={15} color="#64748b" />
              <span style={{ fontSize: '12.5px', color: '#64748b' }}>{t('filter')}: {t('all')}</span>
            </div>

            {/* Table */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    {[t('admin.promoCode'), t('admin.promoName'), t('admin.promoType'), t('admin.fromDate'), t('admin.toDate'), t('admin.validity'), t('status'), t('actions')].map(h => (
                      <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPromos.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                        <Gift size={32} style={{ display: 'block', margin: '0 auto 8px auto', opacity: 0.4 }} />
                        {t('admin.noPromos')}
                      </td>
                    </tr>
                  ) : filteredPromos.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#1B5E20', fontWeight: 700, fontSize: '12.5px' }}>{p.code}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a', maxWidth: '180px' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formatPromoName(p.name)}</div>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#475569', maxWidth: '200px' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12.5px' }}>
                          {getPromoTypeLabel(p.type)}
                          {p.discount_value > 0 && <span style={{ marginLeft: '6px', color: '#ef4444', fontWeight: 700 }}>-{p.discount_value}%</span>}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '12.5px', whiteSpace: 'nowrap' }}>{p.from_date}</td>
                      <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '12.5px', whiteSpace: 'nowrap' }}>{p.to_date}</td>
                      <td style={{ padding: '12px 14px', color: '#94a3b8', fontSize: '12px' }}>
                        {p.budget_used > 0 ? formatMoney(p.budget_used) : '0%'}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <StatusBadge active={p.is_active} />
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleTogglePromo(p.id)}
                            title={p.is_active ? t('admin.deactivatePromo') : t('admin.activatePromo')}
                            style={{
                              padding: '5px 8px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                              backgroundColor: p.is_active ? '#fef3c7' : '#E8F5E9',
                              color: p.is_active ? '#b45309' : '#059669'
                            }}
                          >
                            {p.is_active ? <AlertCircle size={13} /> : <CheckCircle size={13} />}
                          </button>
                          <button onClick={() => openEditPromo(p)} title={t('edit')} style={{ padding: '5px 8px', borderRadius: '6px', color: '#1B5E20', backgroundColor: '#E8F5E9', border: 'none', cursor: 'pointer' }}>
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => handleDeletePromo(p.id)} title={t('delete')} style={{ padding: '5px 8px', borderRadius: '6px', color: '#ef4444', backgroundColor: '#fee2e2', border: 'none', cursor: 'pointer' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── TAB: TABLES (Phòng/Bàn) ─── */}
        {activeTab === 'tables' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{t('admin.tableTitle')}</h2>
                <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>{t('admin.tableManageDesc')}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowImportModal(true)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid #10b981',
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#d1fae5'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ecfdf5'}
                >
                  <FileSpreadsheet size={15} /> {t('admin.importTableExcel') || 'Nhập từ Excel / CSV'}
                </button>
                <button onClick={openAddTable} style={{ ...btnPrimary, padding: '9px 20px', fontSize: '13.5px' }}>
                  <Plus size={15} /> {t('admin.addTable')}
                </button>
              </div>
            </div>

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
              {[
                { label: t('admin.totalTables'), value: tables.length, bg: '#E8F5E9', color: '#1B5E20', icon: <LayoutGrid size={18} /> },
                { label: t('admin.emptyTables'), value: tables.filter(t => t.status === 'empty' || !t.status).length, bg: '#ecfdf5', color: '#059669', icon: <CheckCircle size={18} /> },
                { label: t('admin.occupiedTables'), value: tables.filter(t => t.status === 'occupied').length, bg: '#fef3c7', color: '#d97706', icon: <Users size={18} /> },
                { label: t('admin.areasCount'), value: areas.length, bg: '#E8F5E9', color: '#1B5E20', icon: <MapPin size={18} /> },
              ].map((s, i) => (
                <div key={i} style={{ backgroundColor: '#fff', padding: '14px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>{s.label}</div>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{s.value}</div>
                  </div>
                  <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: s.bg, color: s.color }}>{s.icon}</div>
                </div>
              ))}
            </div>

            {/* Search + Filter */}
            <div style={{ backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Search size={16} color="#94a3b8" />
              <input type="text" placeholder={t('admin.searchTablePlaceholder')} value={tableSearch} onChange={e => setTableSearch(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13.5px', color: '#0f172a', background: 'transparent' }} />
              <div style={{ width: '1px', height: '20px', backgroundColor: '#e2e8f0' }} />
              <MapPin size={15} color="#64748b" />
              <select value={tableAreaFilter} onChange={e => setTableAreaFilter(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '13px', color: '#334155', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}>
                <option value="all">{t('table.allAreas')}</option>
                {areas.map(a => <option key={a.id} value={String(a.id)}>{formatAreaName(a.name)}</option>)}
              </select>
            </div>

            {/* Tables grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
              {tables
                .filter(t => {
                  const q = tableSearch.toLowerCase();
                  const locName = formatTableName(t.name).toLowerCase();
                  const matchName = (t.name || '').toLowerCase().includes(q) || locName.includes(q);
                  const matchArea = tableAreaFilter === 'all' || String(t.area_id) === tableAreaFilter;
                  return matchName && matchArea;
                })
                .map(tObj => {
                  const statusInfo = tObj.status === 'occupied'
                    ? { label: t('table.occupied'), bg: '#fef3c7', color: '#b45309' }
                    : tObj.status === 'reserved'
                    ? { label: t('table.reserved'), bg: '#ede9fe', color: '#7c3aed' }
                    : { label: t('table.empty'), bg: '#ecfdf5', color: '#059669' };
                  return (
                    <div key={tObj.id} style={{ backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '14px 16px', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{formatTableName(tObj.name)}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', color: '#64748b', fontSize: '12px' }}>
                            <MapPin size={11} />
                            <span>{formatAreaName(tObj.area_name || areas.find(a => a.id === tObj.area_id)?.name || '—')}</span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{t('table.capacity')}: {tObj.capacity || 4} {t('table.people')}</div>
                        </div>
                        <span style={{ padding: '3px 9px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, backgroundColor: statusInfo.bg, color: statusInfo.color }}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '12px', justifyContent: 'flex-end' }}>
                        <button onClick={() => openEditTable(tObj)} style={{ padding: '5px 10px', borderRadius: '6px', color: '#1B5E20', backgroundColor: '#E8F5E9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                          <Pencil size={12} /> {t('edit')}
                        </button>
                        <button onClick={() => handleDeleteTable(tObj)} style={{ padding: '5px 10px', borderRadius: '6px', color: '#ef4444', backgroundColor: '#fee2e2', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                          <Trash2 size={12} /> {t('delete')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              {tables.length === 0 && (
                <div style={{ gridColumn: '1/-1', padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                  <LayoutGrid size={40} style={{ margin: '0 auto 12px', opacity: 0.3, display: 'block' }} />
                  {t('admin.noTablesNotice')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB: AREAS (Khu vực) ─── */}
        {activeTab === 'areas' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{t('admin.areaTitle')}</h2>
                <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>{t('admin.areaManageDesc')}</p>
              </div>
              <button onClick={openAddArea} style={{ ...btnPrimary, padding: '9px 20px', fontSize: '13.5px' }}>
                <Plus size={15} /> {t('admin.addArea')}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {areas.map(a => (
                <div key={a.id} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#E8F5E9', color: '#1B5E20' }}><MapPin size={18} /></div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{formatAreaName(a.name)}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          {tables.filter(t => t.area_id === a.id).length} {t('admin.tablesInArea')}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => openEditArea(a)} title={t('edit')} style={{ padding: '7px 10px', borderRadius: '6px', color: '#1B5E20', backgroundColor: '#E8F5E9', border: 'none', cursor: 'pointer' }}><Pencil size={13} /></button>
                      <button onClick={() => handleDeleteArea(a)} title={t('delete')} style={{ padding: '7px 10px', borderRadius: '6px', color: '#ef4444', backgroundColor: '#fee2e2', border: 'none', cursor: 'pointer' }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                  {/* Mini table list in this area */}
                  {tables.filter(t => t.area_id === a.id).length > 0 && (
                    <div style={{ marginTop: '14px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {tables.filter(t => t.area_id === a.id).map(t => (
                        <span key={t.id} style={{
                          padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                          backgroundColor: t.status === 'occupied' ? '#fef3c7' : '#f1f5f9',
                          color: t.status === 'occupied' ? '#b45309' : '#475569'
                        }}>{formatTableName(t.name)}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {areas.length === 0 && (
                <div style={{ gridColumn: '1/-1', padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                  <MapPin size={40} style={{ margin: '0 auto 12px', opacity: 0.3, display: 'block' }} />
                  {t('admin.noAreasNotice')}
                </div>
              )}
            </div>
          </div>
        )}

      </div>{/* end content */}



      {/* ══════════════ MODAL: ADD / EDIT USER ══════════════ */}
      {showAddUserModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '20px' }}>
          <div style={{ width: '460px', maxWidth: '100%', backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>
                {editingUser ? t('admin.editStaffTitle') : t('admin.createUserTitle')}
              </h3>
              <button onClick={() => setShowAddUserModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={labelStyle}>{t('admin.fullName')}: <span style={{ color: '#ef4444' }}>*</span></label>
                <input required type="text" placeholder="Nguyễn Văn A" value={newUserName} onChange={e => setNewUserName(e.target.value)} style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={labelStyle}>{t('admin.loginName')}: <span style={{ color: '#ef4444' }}>*</span></label>
                  <input required type="text" placeholder="nguyenvana" value={newUserUsername} onChange={e => setNewUserUsername(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t('admin.email')}: <span style={{ color: '#ef4444' }}>*</span></label>
                  <input required type="email" placeholder="vana@aura.vn" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} style={inputStyle} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={labelStyle}>
                    {t('login.password')}: {!editingUser && <span style={{ color: '#ef4444' }}>*</span>}
                  </label>
                  {editingUser && (
                    <span style={{ fontSize: '11px', color: '#1B5E20', fontStyle: 'italic' }}>
                      {t('admin.leaveBlankPassword')}
                    </span>
                  )}
                </div>
                <input
                  required={!editingUser}
                  type="password"
                  placeholder={editingUser ? '••••••••' : 'Tối thiểu 6 ký tự'}
                  value={newUserPassword}
                  onChange={e => setNewUserPassword(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>{t('admin.phone')}:</label>
                <input type="text" placeholder="0901.xxx.xxx" value={newUserPhone} onChange={e => setNewUserPhone(e.target.value)} style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={labelStyle}>{t('admin.role')}:</label>
                  <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)} style={inputStyle}>
                    <option value="cashier">{t('admin.roleCashier')}</option>
                    <option value="admin">{t('admin.roleAdmin')}</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{t('admin.shift')}:</label>
                  <select value={newUserShift} onChange={e => setNewUserShift(e.target.value)} style={inputStyle}>
                    <option value="Ca sáng (07:00 - 15:00)">{t('header.morningShift')} (07:00 - 15:00)</option>
                    <option value="Ca chiều (15:00 - 23:00)">{t('header.afternoonShift')} (15:00 - 23:00)</option>
                    <option value="Toàn ca (Quản lý nhà hàng)">{t('header.fullShift')}</option>
                  </select>
                </div>
              </div>

              {editingUser && (
                <div>
                  <label style={labelStyle}>{t('status')}:</label>
                  <select
                    value={newUserIsActive ? '1' : '0'}
                    onChange={e => setNewUserIsActive(e.target.value === '1')}
                    style={inputStyle}
                  >
                    <option value="1">{t('admin.working')}</option>
                    <option value="0">{t('admin.locked')}</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddUserModal(false)} style={btnSecondary}>{t('cancel')}</button>
                <button type="submit" disabled={isSubmittingUser} style={{ ...btnPrimary, opacity: isSubmittingUser ? 0.7 : 1, cursor: isSubmittingUser ? 'not-allowed' : 'pointer' }}>
                  {isSubmittingUser ? '...' : (editingUser ? t('update') : t('admin.saveToDb'))}
                </button>
              </div>
            </form>
            {!editingUser && (
              <div style={{
                marginTop: '14px',
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                border: '1px dashed #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#475569'
              }}>
                <span>{t('admin.orImportUsersFromExcel') || 'Bạn muốn thêm nhiều nhân viên cùng lúc?'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUserModal(false);
                    setShowImportUserModal(true);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#059669',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'underline'
                  }}
                >
                  <FileSpreadsheet size={13} /> {t('admin.importUserExcel') || 'Nhập từ Excel'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ MODAL: ADD / EDIT PRODUCT ══════════════ */}
      {showAddProductModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
          <div style={{ width: '440px', backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>{editingProduct ? t('admin.editProduct') : t('admin.addProduct')}</h3>
              <button onClick={() => setShowAddProductModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>
            {!editingProduct && (
              <div style={{ backgroundColor: '#E8F5E9', border: '1px solid #99d9d5', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag size={15} color="#1B5E20" />
                <span style={{ fontSize: '12.5px', color: '#2E7D32', fontWeight: 600 }}>{t('admin.autoGenCodeHint')}</span>
              </div>
            )}
            {editingProduct && (
              <div style={{ backgroundColor: '#E8F5E9', border: '1px solid #A5D6A7', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', color: '#1B5E20' }}>{t('admin.productCode')}: </span>
                <strong style={{ color: '#1B5E20', fontSize: '13px' }}>{editingProduct.code}</strong>
              </div>
            )}
            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={labelStyle}>{t('admin.productName')}:</label>
                <input required type="text" placeholder="VD: Cơm rang dưa bò giòn" value={productName} onChange={e => setProductName(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{t('admin.productPrice')}:</label>
                <input required type="number" min="0" placeholder="VD: 120000" value={productPrice} onChange={e => setProductPrice(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={labelStyle}>{t('admin.productUnit')}:</label>
                  <input required type="text" value={productUnit} onChange={e => setProductUnit(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t('admin.productGroup')}:</label>
                  <select required value={productCatId} onChange={e => setProductCatId(e.target.value)} style={inputStyle}>
                    {((categories && categories.length > 0) ? categories : (menuData.categories || [])).map(cat => (
                      <option key={cat.id} value={cat.id}>{formatCategoryName(cat.name)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowAddProductModal(false)} style={btnSecondary}>{t('cancel')}</button>
                <button type="submit" disabled={isSubmittingProduct} style={{ ...btnPrimary, opacity: isSubmittingProduct ? 0.7 : 1, cursor: isSubmittingProduct ? 'not-allowed' : 'pointer' }}>
                  {isSubmittingProduct ? '...' : (editingProduct ? t('update') : t('admin.saveToDb'))}
                </button>
              </div>
            </form>
            {!editingProduct && (
              <div style={{
                marginTop: '14px',
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                border: '1px dashed #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#475569'
              }}>
                <span>{t('admin.orImportFromExcel') || 'Bạn muốn thêm nhiều món cùng lúc?'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddProductModal(false);
                    setShowImportProductModal(true);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#059669',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'underline'
                  }}
                >
                  <FileSpreadsheet size={13} /> {t('admin.importProductExcel') || 'Nhập từ Excel'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ MODAL: ADD / EDIT CATEGORY ══════════════ */}
      {showAddCatModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
          <div style={{ width: '380px', backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>{editingCat ? t('admin.editCategory') : t('admin.addCategory')}</h3>
              <button onClick={() => setShowAddCatModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>{t('admin.categoryName')}:</label>
                <input required type="text" placeholder="VD: Món Lẩu & Nướng" value={catName} onChange={e => setCatName(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowAddCatModal(false)} style={btnSecondary}>{t('cancel')}</button>
                <button type="submit" style={btnPrimary}>{editingCat ? t('update') : t('add')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════ MODAL: PROMOTION (2 STEPS) ══════════════ */}
      {showPromoModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '20px' }}>
          <div style={{ width: '560px', maxWidth: '100%', backgroundColor: '#fff', borderRadius: '14px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', overflow: 'hidden' }}>

            {/* Modal header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                  {editingPromo ? t('admin.editPromo') : t('admin.createPromo')}
                </h3>
                {!editingPromo && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    {[1, 2].map(step => (
                      <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{
                          width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          backgroundColor: promoStep >= step ? '#1B5E20' : '#e2e8f0',
                          color: promoStep >= step ? '#fff' : '#94a3b8',
                          fontSize: '11px', fontWeight: 700
                        }}>{step}</div>
                        <span style={{ fontSize: '11.5px', color: promoStep >= step ? '#1B5E20' : '#94a3b8', fontWeight: 600 }}>
                          {step === 1 ? t('admin.promoStep1') : t('admin.promoStep2')}
                        </span>
                        {step < 2 && <div style={{ width: '24px', height: '1px', backgroundColor: '#e2e8f0', margin: '0 2px' }} />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setShowPromoModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>

            {/* Step 1: Choose type */}
            {promoStep === 1 && !editingPromo && (
              <div style={{ padding: '20px 24px' }}>
                {/* GIẢM TRÊN ĐƠN */}
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.8px', marginBottom: '10px' }}>{t('admin.promoOrderDiscountGroup')}</div>
                <div
                  onClick={() => setPromoType('order_discount')}
                  style={{
                    padding: '14px 16px', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer',
                    border: `1.5px solid ${promoType === 'order_discount' ? '#1B5E20' : '#e2e8f0'}`,
                    backgroundColor: promoType === 'order_discount' ? '#eff6ff' : '#ffffff',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{t('admin.promoOrderDiscountTitle')}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>{t('admin.promoOrderDiscountDesc')}</div>
                    <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>{t('admin.promoOrderDiscountExample')}</div>
                  </div>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%', border: '2px solid',
                    borderColor: promoType === 'order_discount' ? '#1B5E20' : '#cbd5e1',
                    backgroundColor: promoType === 'order_discount' ? '#1B5E20' : 'transparent',
                    flexShrink: 0, marginLeft: '12px'
                  }} />
                </div>

                {/* GIẢM TRÊN MÓN */}
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.8px', margin: '14px 0 10px 0' }}>{t('admin.promoItemDiscountGroup')}</div>
                {PROMO_TYPES.slice(1).map(pt => (
                  <div
                    key={pt.value}
                    onClick={() => setPromoType(pt.value)}
                    style={{
                      padding: '14px 16px', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer',
                      border: `1.5px solid ${promoType === pt.value ? '#1B5E20' : '#e2e8f0'}`,
                      backgroundColor: promoType === pt.value ? '#eff6ff' : '#ffffff',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{t(pt.labelKey)}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>{t(pt.descKey)}</div>
                    </div>
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%', border: '2px solid',
                      borderColor: promoType === pt.value ? '#1B5E20' : '#cbd5e1',
                      backgroundColor: promoType === pt.value ? '#1B5E20' : 'transparent',
                      flexShrink: 0, marginLeft: '12px'
                    }} />
                  </div>
                ))}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                  <button onClick={() => setShowPromoModal(false)} style={btnSecondary}>{t('skip')}</button>
                  <button onClick={() => setPromoStep(2)} style={{ ...btnPrimary, backgroundColor: '#1B5E20' }}>{t('next')}</button>
                </div>
              </div>
            )}

            {/* Step 2: Fill in info */}
            {(promoStep === 2 || editingPromo) && (
              <form onSubmit={handleSavePromo} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Selected type badge */}
                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Gift size={15} color="#1B5E20" />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#1d40af' }}>{getPromoTypeLabel(promoType)}</span>
                </div>

                <div>
                  <label style={labelStyle}>{t('admin.promoName')}: <span style={{ color: '#ef4444' }}>*</span></label>
                  <input required type="text" placeholder="VD: CTKM Khai Trương Tháng 10" value={promoName} onChange={e => setPromoName(e.target.value)} style={inputStyle} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>{t('admin.discountPct')} (%):</label>
                    <input type="number" min="0" max="100" placeholder="VD: 10" value={promoDiscountValue} onChange={e => setPromoDiscountValue(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>{t('admin.minOrder')} (VNĐ):</label>
                    <input type="number" min="0" placeholder="VD: 200000" value={promoMinOrder} onChange={e => setPromoMinOrder(e.target.value)} style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>{t('admin.fromDate')}: <span style={{ color: '#ef4444' }}>*</span></label>
                    <input required type="date" value={promoFromDate} onChange={e => setPromoFromDate(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>{t('admin.toDate')}: <span style={{ color: '#ef4444' }}>*</span></label>
                    <input required type="date" value={promoToDate} onChange={e => setPromoToDate(e.target.value)} style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    type="button"
                    onClick={() => editingPromo ? setShowPromoModal(false) : setPromoStep(1)}
                    style={btnSecondary}
                  >
                    {editingPromo ? t('cancel') : t('back')}
                  </button>
                  <button type="submit" style={{ ...btnPrimary, backgroundColor: '#1B5E20', padding: '9px 24px' }}>
                    {editingPromo ? t('admin.updatePromo') : t('admin.createPromo')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ MODAL: ADD / EDIT TABLE ══════════════ */}
      {showTableModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '20px' }}>
          <div style={{ width: '420px', maxWidth: '100%', backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>{editingTable ? t('admin.editTable') : t('admin.addTable')}</h3>
              <button onClick={() => setShowTableModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveTable} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
              <div>
                <label style={labelStyle}>{t('admin.tableName')}: <span style={{ color: '#ef4444' }}>*</span></label>
                <input required type="text" placeholder="VD: Bàn 01 / Phòng VIP 1" value={tableName} onChange={e => setTableName(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={labelStyle}>{t('admin.tableArea')}:</label>
                  <select value={tableAreaId} onChange={e => setTableAreaId(e.target.value)} style={inputStyle}>
                    {areas.map(a => <option key={a.id} value={a.id}>{formatAreaName(a.name)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{t('admin.tableCapacity')}:</label>
                  <input type="number" min="1" max="100" value={tableCapacity} onChange={e => setTableCapacity(e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button type="button" onClick={() => setShowTableModal(false)} style={btnSecondary}>{t('cancel')}</button>
                <button type="submit" style={btnPrimary}>{editingTable ? t('update') : t('save')}</button>
              </div>
            </form>
            {!editingTable && (
              <div style={{
                marginTop: '14px',
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                border: '1px dashed #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#475569'
              }}>
                <span>{t('admin.orImportTablesFromExcel') || 'Bạn muốn thêm nhiều bàn cùng lúc?'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowTableModal(false);
                    setShowImportModal(true);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#059669',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'underline'
                  }}
                >
                  <FileSpreadsheet size={13} /> {t('admin.importTableExcel') || 'Nhập từ Excel'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ MODAL: ADD / EDIT AREA ══════════════ */}
      {showAreaModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '20px' }}>
          <div style={{ width: '380px', maxWidth: '100%', backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>{editingArea ? t('admin.editArea') : t('admin.addArea')}</h3>
              <button onClick={() => setShowAreaModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveArea} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>{t('admin.areaName')}: <span style={{ color: '#ef4444' }}>*</span></label>
                <input required type="text" placeholder="VD: Tầng 1, Sân thượng, Phòng VIP" value={areaName} onChange={e => setAreaName(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowAreaModal(false)} style={btnSecondary}>{t('cancel')}</button>
                <button type="submit" style={btnPrimary}>{editingArea ? t('update') : t('add')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════ MODAL: IMPORT TABLES FROM EXCEL ══════════════ */}
      <ImportTableModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        areas={areas}
        onSuccess={(res) => {
          loadAdminData();
          alert(res?.message || t('admin.importTableSuccess') || 'Đã nhập thành công danh sách phòng / bàn!');
        }}
      />

      {/* ══════════════ MODAL: CONFIRM DELETE (PROFESSIONAL CUSTOM MODAL) ══════════════ */}
      <ConfirmDeleteModal
        isOpen={deleteModalState.isOpen}
        onClose={closeDeleteModal}
        onConfirm={deleteModalState.onConfirm}
        title={deleteModalState.title}
        message={deleteModalState.message}
        itemName={deleteModalState.itemName}
        warningText={deleteModalState.warningText}
        confirmText={t('confirmDelete')}
        cancelText={t('cancel')}
        loading={deleteModalState.loading}
      />

      {/* ══════════════ MODAL: IMPORT PRODUCTS FROM EXCEL ══════════════ */}
      <ImportProductModal
        isOpen={showImportProductModal}
        onClose={() => setShowImportProductModal(false)}
        categories={menuData.categories || categories}
        onSuccess={(res) => {
          loadAdminData();
          alert(res?.message || t('admin.importProductSuccess') || 'Đã nhập thành công các món ăn vào thực đơn!');
        }}
      />

      {/* ══════════════ MODAL: IMPORT CUSTOMERS FROM EXCEL ══════════════ */}
      <ImportCustomerModal
        isOpen={showImportCustomerModal}
        onClose={() => setShowImportCustomerModal(false)}
        onSuccess={(res) => {
          loadAdminData();
          alert(res?.message || t('admin.importCustomerSuccess') || 'Đã nhập thành công danh sách khách hàng!');
        }}
      />

      {/* ══════════════ MODAL: IMPORT USERS / STAFF FROM EXCEL ══════════════ */}
      <ImportUserModal
        isOpen={showImportUserModal}
        onClose={() => setShowImportUserModal(false)}
        onSuccess={(res) => {
          loadAdminData();
          alert(res?.message || t('admin.importUserSuccess') || 'Đã nhập thành công danh sách nhân viên!');
        }}
      />

    </div>
  );
}
