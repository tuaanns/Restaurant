import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp, DollarSign, Users, Utensils, Plus, Trash2, Pencil,
  ArrowLeft, CreditCard, Banknote, QrCode, Tag, X, ChevronDown,
  Shield, Clock, Gift, Calendar, Percent, CheckCircle, AlertCircle,
  Search, Filter, UserCheck, Phone, Award, Upload, MapPin, LayoutGrid, FileSpreadsheet
} from 'lucide-react';
import { api } from '../../api';
import { useLanguage } from '../../i18n/LanguageContext';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';
import { ImportProductModal } from '../modals/ImportProductModal';
import { ImportTableModal } from '../modals/ImportTableModal';
import { ImportCustomerModal } from '../modals/ImportCustomerModal';
import { ImportUserModal } from '../modals/ImportUserModal';

const inputStyle = {
  width: '100%', padding: '8px 10px', borderRadius: '6px',
  border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '13px',
  boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit'
};
const labelStyle = { fontSize: '12px', fontWeight: 600, color: '#475569' };
const btnPrimary = {
  padding: '8px 18px', borderRadius: '6px', backgroundColor: '#009688',
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

// ── Dropdown Nav Component ──
function NavItem({ item, activeTab, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const timerRef = useRef(null);
  const isActive = item.children.some(c => c.key === activeTab);

  const handleMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setOpen(false);
    }, 180);
  };

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (item.children.length === 1 && item.children[0].key === item.key) {
    return (
      <button
        onClick={() => onSelect(item.children[0].key)}
        style={{
          padding: '0 14px', fontSize: '13.5px', fontWeight: 600,
          color: isActive ? '#009688' : '#334155',
          borderBottom: isActive ? '2px solid #009688' : '2px solid transparent',
          cursor: 'pointer', background: 'none', border: 'none',
          height: '52px', display: 'flex', alignItems: 'center',
          transition: 'color 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#009688'}
        onMouseLeave={e => e.currentTarget.style.color = isActive ? '#009688' : '#334155'}
      >
        {item.label}
      </button>
    );
  }

  return (
    <div
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative', height: '52px', display: 'flex', alignItems: 'stretch' }}
    >
      <button
        onClick={() => {
          if (item.children.length > 0) {
            onSelect(item.children[0].key);
          }
          setOpen(false);
        }}
        style={{
          padding: '0 14px', fontSize: '13.5px', fontWeight: 600,
          color: isActive ? '#009688' : '#334155',
          borderBottom: isActive ? '2px solid #009688' : '2px solid transparent',
          cursor: 'pointer', background: 'none', border: 'none',
          display: 'flex', alignItems: 'center', gap: '5px',
          transition: 'color 0.15s', whiteSpace: 'nowrap'
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#009688'; }}
        onMouseLeave={e => { e.currentTarget.style.color = isActive ? '#009688' : '#334155'; }}
      >
        {item.label}
        <ChevronDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', opacity: 0.6 }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0,
          paddingTop: '2px', zIndex: 250, minWidth: '200px'
        }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {item.children.map(child => (
              <button
                key={child.key}
                onClick={() => { onSelect(child.key); setOpen(false); }}
                style={{
                  width: '100%', padding: '10px 16px', textAlign: 'left',
                  fontSize: '13.5px', fontWeight: activeTab === child.key ? 700 : 500,
                  color: activeTab === child.key ? '#009688' : '#334155',
                  backgroundColor: activeTab === child.key ? '#e6f7f5' : 'transparent',
                  cursor: 'pointer', border: 'none', display: 'block',
                  borderLeft: activeTab === child.key ? '3px solid #009688' : '3px solid transparent',
                  transition: 'background 0.1s'
                }}
                onMouseEnter={e => { if (activeTab !== child.key) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = activeTab === child.key ? '#e6f7f5' : 'transparent'; }}
              >
                {child.label}
              </button>
            ))}
          </div>
        </div>
      )}
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

export function AdminDashboard({ onBackToPos, currentUser }) {
  const { t, formatTableName, formatAreaName, formatDishName, formatCategoryName, formatDishUnit } = useLanguage();

  // Dynamic NAV_ITEMS using translations
  const NAV_ITEMS_DYNAMIC = [
    {
      key: 'overview',
      label: t('admin.overview'),
      children: [{ key: 'overview', label: t('admin.overview') }]
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

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [menuData, setMenuData] = useState({ categories: [], products: [] });
  const [categories, setCategories] = useState([]);
  const [promotions, setPromotions] = useState([
    { id: 1, code: 'KM000014', name: 'CTKM KHAI TRƯƠNG', type: 'order_discount', discount_value: 10, min_order: 200000, from_date: '24/09/2026', to_date: '27/09/2026', is_active: true, budget_used: 0 },
    { id: 2, code: 'KM000013', name: '10 Ly Tặng 1 Hộp (Combo)', type: 'buy_get', discount_value: 0, min_order: 0, from_date: '07/11/2025', to_date: '07/01/2026', is_active: false, budget_used: 0 },
    { id: 3, code: 'KM000011', name: 'Cà phê pha máy giảm 5%', type: 'fixed_price', discount_value: 5, min_order: 100000, from_date: '24/08/2025', to_date: '08/10/2025', is_active: false, budget_used: 0 },
  ]);
  const [loading, setLoading] = useState(true);

  // ── Tables & Areas state ──
  const [tables, setTables] = useState([]);
  const [areas, setAreas] = useState([]);
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

  // ── Product modal ──
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showImportProductModal, setShowImportProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productUnit, setProductUnit] = useState('phần');
  const [productCatId, setProductCatId] = useState('');

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
    try { const r = await api.getAdminStats(); if (r?.stats) setStats(r.stats); } catch (e) {}
    try { const r = await api.getUsers(); if (r?.users) setUsers(r.users); } catch (e) {}
    try {
      const r = await api.getMenu();
      if (r) setMenuData(r);
      if (r?.categories) setCategories(r.categories);
    } catch (e) {}
    try { const r = await api.getCategories(); if (r?.categories) setCategories(r.categories); } catch (e) {}
    try {
      const r = await api.getAdminCustomers();
      if (r?.customers && r.customers.length > 0) setCustomers(r.customers);
    } catch (e) {}
    try {
      const r = await api.getAdminAreas();
      if (r?.areas && r.areas.length > 0) setAreas(r.areas);
      else setAreas([
        { id: 1, name: 'Tầng 1' },
        { id: 2, name: 'Tầng 2' },
        { id: 3, name: 'Sân thượng' },
      ]);
    } catch (e) {
      setAreas([
        { id: 1, name: 'Tầng 1' },
        { id: 2, name: 'Tầng 2' },
        { id: 3, name: 'Sân thượng' },
      ]);
    }
    try {
      const r = await api.getAdminTables();
      if (r?.tables && r.tables.length > 0) setTables(r.tables);
      else setTables([
        { id: 1, name: 'Bàn 01', area_id: 1, area_name: 'Tầng 1', capacity: 4, status: 'empty' },
        { id: 2, name: 'Bàn 02', area_id: 1, area_name: 'Tầng 1', capacity: 4, status: 'occupied' },
        { id: 3, name: 'Bàn 03', area_id: 2, area_name: 'Tầng 2', capacity: 6, status: 'empty' },
        { id: 4, name: 'Phòng VIP 1', area_id: 2, area_name: 'Tầng 2', capacity: 10, status: 'reserved' },
      ]);
    } catch (e) {
      setTables([
        { id: 1, name: 'Bàn 01', area_id: 1, area_name: 'Tầng 1', capacity: 4, status: 'empty' },
        { id: 2, name: 'Bàn 02', area_id: 1, area_name: 'Tầng 1', capacity: 4, status: 'occupied' },
        { id: 3, name: 'Bàn 03', area_id: 2, area_name: 'Tầng 2', capacity: 6, status: 'empty' },
        { id: 4, name: 'Phòng VIP 1', area_id: 2, area_name: 'Tầng 2', capacity: 10, status: 'reserved' },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => { loadAdminData(); }, []);

  // ── Product helpers ──
  const openEditProduct = (p) => {
    setEditingProduct(p);
    setProductName(p.name);
    setProductPrice(p.price);
    setProductUnit(p.unit || 'phần');
    setProductCatId(p.category_id || '');
    setShowAddProductModal(true);
  };
  const openAddProduct = () => {
    setEditingProduct(null);
    setProductName(''); setProductPrice(''); setProductUnit('phần');
    setProductCatId(menuData.categories?.[0]?.id || '');
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
  const handleSavePromo = (e) => {
    e.preventDefault();
    const newPromo = {
      id: editingPromo?.id || Date.now(),
      code: editingPromo?.code || `KM${String(promotions.length + 1).padStart(6, '0')}`,
      name: promoName,
      type: promoType,
      discount_value: Number(promoDiscountValue),
      min_order: Number(promoMinOrder),
      from_date: promoFromDate,
      to_date: promoToDate,
      is_active: true,
      budget_used: editingPromo?.budget_used || 0,
    };
    if (editingPromo) {
      setPromotions(prev => prev.map(p => p.id === editingPromo.id ? newPromo : p));
    } else {
      setPromotions(prev => [newPromo, ...prev]);
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
      onConfirm: () => {
        setPromotions(prev => prev.filter(item => item.id !== promo.id));
        closeDeleteModal();
      }
    });
  };
  const handleTogglePromo = (id) => {
    setPromotions(prev => prev.map(p => p.id === id ? { ...p, is_active: !p.is_active } : p));
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

    try {
      if (editingUser) {
        const res = await api.updateUser(editingUser.id, payload);
        const updated = res?.user || { ...editingUser, ...payload };
        setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...updated } : u));
      } else {
        if (!newUserPassword.trim() || newUserPassword.trim().length < 6) {
          alert('Vui lòng nhập mật khẩu tối thiểu 6 ký tự!');
          return;
        }
        const res = await api.createUser(payload);
        const created = res?.user || { id: Date.now(), ...payload };
        setUsers(prev => [...prev, created]);
      }
      setShowAddUserModal(false);
      loadAdminData();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteUser = (u) => {
    const userObj = typeof u === 'object' ? u : users.find(item => item.id === u);
    if (!userObj) return;

    if (userObj.id === 1 || userObj.username === 'admin') {
      alert(t('admin.cannotDeleteAdmin'));
      return;
    }
    if (currentUser && (currentUser.id === userObj.id || currentUser.username === userObj.username)) {
      alert(t('admin.cannotDeleteSelf'));
      return;
    }

    setDeleteModalState({
      isOpen: true,
      title: t('admin.confirmDeleteUserTitle'),
      message: t('admin.confirmDeleteUser'),
      itemName: `${userObj.name} (@${userObj.username})`,
      warningText: t('admin.confirmDeleteUserWarning'),
      onConfirm: async () => {
        try {
          await api.deleteUser(userObj.id);
          setUsers(prev => prev.filter(item => item.id !== userObj.id));
          loadAdminData();
          closeDeleteModal();
        } catch (err) {
          alert('Lỗi: ' + (err.response?.data?.message || err.message));
        }
      }
    });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const data = { category_id: Number(productCatId), name: productName, price: Number(productPrice), unit: productUnit };
      if (editingProduct) { await api.updateProduct(editingProduct.id, data); }
      else { await api.addProduct(data); }
      setShowAddProductModal(false);
      loadAdminData();
    } catch (err) { alert('Loi: ' + (err.response?.data?.message || err.message)); }
  };

  const handleDeleteProduct = (p) => {
    const prod = typeof p === 'object' ? p : (menuData.products || []).find(item => item.id === p);
    if (!prod) return;

    setDeleteModalState({
      isOpen: true,
      title: t('admin.confirmDeleteProductTitle'),
      message: t('admin.confirmDeleteProduct'),
      itemName: `${formatDishName(prod.name, prod.code)} (${prod.code})`,
      warningText: t('admin.confirmDeleteProductWarning'),
      onConfirm: async () => {
        try {
          await api.deleteProduct(prod.id);
          loadAdminData();
          closeDeleteModal();
        } catch (err) {
          alert('Lỗi: ' + (err.response?.data?.message || err.message));
        }
      }
    });
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCat) { await api.updateCategory(editingCat.id, { name: catName }); }
      else { await api.addCategory({ name: catName }); }
      setShowAddCatModal(false);
      loadAdminData();
    } catch (err) { alert('Loi: ' + (err.response?.data?.message || err.message)); }
  };

  const handleDeleteCategory = (c) => {
    const cat = typeof c === 'object' ? c : categories.find(item => item.id === c);
    if (!cat) return;

    setDeleteModalState({
      isOpen: true,
      title: t('admin.confirmDeleteCategoryTitle'),
      message: t('admin.confirmDeleteCategory'),
      itemName: formatCategoryName(cat.name, cat.code),
      warningText: t('admin.confirmDeleteCategoryWarning'),
      onConfirm: async () => {
        try {
          await api.deleteCategory(cat.id);
          loadAdminData();
          closeDeleteModal();
        } catch (err) {
          alert('Lỗi: ' + (err.response?.data?.message || err.message));
        }
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
    try {
      if (editingTable) {
        await api.updateAdminTable(editingTable.id, payload);
        setTables(prev => prev.map(t => t.id === editingTable.id ? { ...t, ...payload } : t));
      } else {
        const res = await api.addAdminTable(payload);
        const newT = res?.table || { id: Date.now(), ...payload, status: 'empty' };
        setTables(prev => [...prev, newT]);
      }
    } catch {
      if (editingTable) {
        setTables(prev => prev.map(t => t.id === editingTable.id ? { ...t, ...payload } : t));
      } else {
        setTables(prev => [...prev, { id: Date.now(), ...payload, status: 'empty' }]);
      }
    }
    setShowTableModal(false);
  };
  const handleDeleteTable = (tItem) => {
    const tbl = typeof tItem === 'object' ? tItem : tables.find(item => item.id === tItem);
    if (!tbl) return;

    setDeleteModalState({
      isOpen: true,
      title: t('admin.confirmDeleteTableTitle'),
      message: t('admin.confirmDeleteTable'),
      itemName: formatTableName(tbl.name),
      warningText: t('admin.confirmDeleteTableWarning'),
      onConfirm: async () => {
        try {
          await api.deleteAdminTable(tbl.id);
        } catch {}
        setTables(prev => prev.filter(t => t.id !== tbl.id));
        closeDeleteModal();
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
    try {
      if (editingArea) {
        await api.updateAdminArea(editingArea.id, payload);
        setAreas(prev => prev.map(a => a.id === editingArea.id ? { ...a, ...payload } : a));
      } else {
        const res = await api.addAdminArea(payload);
        const newA = res?.area || { id: Date.now(), ...payload };
        setAreas(prev => [...prev, newA]);
      }
    } catch {
      if (editingArea) {
        setAreas(prev => prev.map(a => a.id === editingArea.id ? { ...a, ...payload } : a));
      } else {
        setAreas(prev => [...prev, { id: Date.now(), ...payload }]);
      }
    }
    setShowAreaModal(false);
  };
  const handleDeleteArea = (a) => {
    const area = typeof a === 'object' ? a : areas.find(item => item.id === a);
    if (!area) return;

    setDeleteModalState({
      isOpen: true,
      title: t('admin.confirmDeleteAreaTitle'),
      message: t('admin.confirmDeleteArea'),
      itemName: formatAreaName(area.name, area.code),
      warningText: t('admin.confirmDeleteAreaWarning'),
      onConfirm: async () => {
        try {
          await api.deleteAdminArea(area.id);
        } catch {}
        setAreas(prev => prev.filter(item => item.id !== area.id));
        closeDeleteModal();
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

  const filteredPromos = promotions.filter(p =>
    p.name.toLowerCase().includes(promoSearch.toLowerCase()) ||
    p.code.toLowerCase().includes(promoSearch.toLowerCase())
  );

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

  return (
    <div style={{ flex: 1, backgroundColor: '#f1f5f9', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ═══ HEADER NAV BAR (KiotViet style) ═══ */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '52px',
        flexShrink: 0
      }}>
        {/* Left: Back button + Nav items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
          <button
            onClick={onBackToPos}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '6px',
              backgroundColor: '#009688', color: '#ffffff',
              fontSize: '12.5px', fontWeight: 700, border: 'none', cursor: 'pointer',
              marginRight: '16px', whiteSpace: 'nowrap', flexShrink: 0
            }}
          >
            <ArrowLeft size={15} />
            {t('admin.backToPOS') || 'Về POS'}
          </button>

          {/* Nav items with dropdowns */}
          <div style={{ display: 'flex', alignItems: 'stretch', height: '52px' }}>
            {NAV_ITEMS_DYNAMIC.map(item => (
              <NavItem key={item.key} item={item} activeTab={activeTab} onSelect={setActiveTab} />
            ))}
          </div>
        </div>

        {/* Right: User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{
            fontSize: '12px', color: '#64748b',
            backgroundColor: '#f8fafc', padding: '5px 12px',
            borderRadius: '6px', border: '1px solid #e2e8f0'
          }}>
            <Shield size={12} style={{ display: 'inline', marginRight: '5px', color: '#009688', verticalAlign: 'middle' }} />
            <strong style={{ color: '#0f172a' }}>
              {t('header.manager')}: {(currentUser?.name || 'Hoàng Nam').replace(/^(Quản lý|Thu ngân|Nhân viên|Admin|Manager|Cashier):\s*/i, '')}
            </strong>
            <span style={{ marginLeft: '4px', color: '#94a3b8' }}>
              — {currentUser?.role === 'admin' ? (t('header.admin') || 'Quản Trị Viên') : (t('header.cashier') || 'Thu Ngân')}
            </span>
          </div>
        </div>
      </div>

      {/* ═══ CONTENT AREA ═══ */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

        {/* ─── TAB: OVERVIEW ─── */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: t('admin.totalRevenue'), value: formatMoney(stats?.total_revenue || 3901700), icon: <DollarSign size={18} />, bg: '#e6f7f5', color: '#009688', sub: t('admin.allShiftsCalc'), subColor: '#10b981' },
                { label: t('admin.totalOrders'), value: (stats?.total_orders_today || 5) + ' ' + t('admin.ordersUnit'), icon: <TrendingUp size={18} />, bg: '#e0f2fe', color: '#0284c7', sub: `${t('admin.activeOnTables')} 24 ${t('table.tables')}`, subColor: '#64748b' },
                { label: t('admin.tablesOccupied'), value: (stats?.occupied_tables || 6) + ' / 24 ' + t('table.tables'), icon: <Utensils size={18} />, bg: '#fef3c7', color: '#d97706', sub: `${stats?.billing_tables || 2} ${t('table.tables')} ${t('admin.waitingPayment')}`, subColor: '#d97706' },
                { label: t('admin.staffCount'), value: users.length + ' ' + t('admin.accountsUnit'), icon: <Users size={18} />, bg: '#f3e8ff', color: '#9333ea', sub: t('admin.activeInDb'), subColor: '#64748b' },
              ].map((s, i) => (
                <div key={i} style={{ backgroundColor: '#fff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 700, letterSpacing: '0.3px' }}>{s.label}</span>
                    <div style={{ padding: '6px', backgroundColor: s.bg, color: s.color, borderRadius: '8px' }}>{s.icon}</div>
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', marginTop: '10px' }}>{s.value}</div>
                  <div style={{ fontSize: '11.5px', color: s.subColor, marginTop: '4px', fontWeight: 600 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '14px' }}>{t('admin.topDishes')}</h3>
                {[
                  { name: 'Mì xào bò thượng hạng', qty: 4, revenue: '440.000 đ' },
                  { name: 'Cơm chiên hải sản Hoàng Kim', qty: 3, revenue: '375.000 đ' },
                  { name: 'Nước cam ép tươi', qty: 4, revenue: '180.000 đ' },
                  { name: 'Khăn lạnh thơm cao cấp', qty: 6, revenue: '30.000 đ' },
                ].map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#009688', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{formatDishName(p.name)}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#009688' }}>{p.revenue}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{t('admin.sold')}: {p.qty}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '14px' }}>{t('admin.paymentMethods')}</h3>
                {[
                  { icon: <Banknote size={20} color="#10b981" />, label: t('admin.cash'), sub: t('admin.atCounter'), value: '1.850.000 đ' },
                  { icon: <QrCode size={20} color="#0284c7" />, label: t('admin.bankTransfer'), sub: 'MBBank', value: '1.450.000 đ' },
                  { icon: <CreditCard size={20} color="#8b5cf6" />, label: t('admin.cardPayment'), sub: 'ATM/Visa', value: '601.700 đ' },
                ].map((m, i) => (
                  <div key={i} style={{ padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {m.icon}
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 700 }}>{m.label}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{m.sub}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: 800 }}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
                      <td style={{ padding: '12px', fontFamily: 'monospace', color: '#0284c7', fontSize: '12.5px' }}>{u.username}</td>
                      <td style={{ padding: '12px', color: '#64748b' }}>{u.email}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                          backgroundColor: u.role === 'admin' ? 'rgba(56,189,248,0.15)' : 'rgba(0,150,136,0.15)',
                          color: u.role === 'admin' ? '#0284c7' : '#009688'
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
                              color: '#0284c7', backgroundColor: '#e0f2fe',
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
                      <span style={{ backgroundColor: '#e0f2fe', color: '#0284c7', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, marginRight: '6px' }}>{p.code}</span>
                      {t('menu.unit')}: {formatDishUnit(p.unit)}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#009688', marginTop: '4px' }}>{formatMoney(p.price)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginLeft: '8px' }}>
                    <button onClick={() => openEditProduct(p)} title={t('edit')} style={{ padding: '6px 8px', borderRadius: '6px', color: '#0284c7', backgroundColor: '#e0f2fe', border: 'none', cursor: 'pointer' }}>
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDeleteProduct(p.id)} title={t('delete')} style={{ padding: '6px 8px', borderRadius: '6px', color: '#ef4444', backgroundColor: '#fee2e2', border: 'none', cursor: 'pointer' }}>
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
                    <button onClick={() => openEditCat(c)} title={t('edit')} style={{ padding: '6px 8px', borderRadius: '6px', color: '#0284c7', backgroundColor: '#e0f2fe', border: 'none', cursor: 'pointer' }}><Pencil size={13} /></button>
                    <button onClick={() => handleDeleteCategory(c.id)} title={t('delete')} style={{ padding: '6px 8px', borderRadius: '6px', color: '#ef4444', backgroundColor: '#fee2e2', border: 'none', cursor: 'pointer' }}><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB: CUSTOMERS ─── */}
        {activeTab === 'customers' && (
          <div>
            {/* Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{t('admin.customerTitle')}</h2>
                <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>{t('admin.customerSubtitle')}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setShowImportCustomerModal(true)}
                  style={{
                    padding: '9px 18px',
                    fontSize: '13.5px',
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
                  <FileSpreadsheet size={15} /> {t('admin.importCustomerExcel') || 'Nhập từ Excel / CSV'}
                </button>
                <button onClick={openAddCustomer} style={{ ...btnPrimary, padding: '9px 20px', fontSize: '13.5px', backgroundColor: '#009688' }}>
                  <Plus size={15} /> {t('admin.addCustomer')}
                </button>
              </div>
            </div>

            {/* Quick summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '16px' }}>
              <div style={{ backgroundColor: '#fff', padding: '14px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 700 }}>{t('admin.totalCustomers')}</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{customers.length} {t('admin.customersCountUnit')}</div>
                </div>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#e6f7f5', color: '#009688' }}><Users size={18} /></div>
              </div>
              <div style={{ backgroundColor: '#fff', padding: '14px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 700 }}>{t('admin.vipMembers')}</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
                    {customers.filter(c => (c.membership_tier || '').includes('Vàng') || (c.membership_tier || '').includes('Kim Cương')).length} {t('admin.membersUnit')}
                  </div>
                </div>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#d97706' }}><Award size={18} /></div>
              </div>
              <div style={{ backgroundColor: '#fff', padding: '14px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 700 }}>{t('admin.totalRevenueStat')}</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                    {formatMoney(customers.reduce((sum, c) => sum + (Number(c.total_spent) || 0), 0))}
                  </div>
                </div>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#059669' }}><DollarSign size={18} /></div>
              </div>
            </div>

            {/* Search + Filter bar */}
            <div style={{ backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder={t('admin.searchCustomerPlaceholder')}
                value={customerSearch}
                onChange={e => setCustomerSearch(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13.5px', color: '#0f172a', background: 'transparent' }}
              />
              <div style={{ width: '1px', height: '20px', backgroundColor: '#e2e8f0' }} />
              <Filter size={15} color="#64748b" />
              <select
                value={customerTierFilter}
                onChange={e => setCustomerTierFilter(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '13px', color: '#334155', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}
              >
                <option value="all">{t('admin.allTiers')}</option>
                <option value="Hội viên Kim Cương">{t('admin.tierDiamond')}</option>
                <option value="Hội viên Vàng">{t('admin.tierGold')}</option>
                <option value="Hội viên Bạc">{t('admin.tierSilver')}</option>
                <option value="Hội viên">{t('admin.tierMember')}</option>
                <option value="Khách mới">{t('admin.tierNew')}</option>
              </select>
            </div>

            {/* Customers Table */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    {[t('admin.customerCode'), t('admin.customerName'), t('admin.phone'), t('admin.memberTier'), t('admin.discountPct'), t('admin.ordersCount'), t('admin.totalSpent'), t('admin.joinDate'), t('actions')].map(h => (
                      <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                        <Users size={32} style={{ display: 'block', margin: '0 auto 8px auto', opacity: 0.4 }} />
                        {t('admin.noCustomersFound')}
                      </td>
                    </tr>
                  ) : filteredCustomers.map(c => {
                    const custCode = `KH${String(c.id).padStart(5, '0')}`;
                    const tier = c.membership_tier || 'Khách mới';
                    const isDiamond = tier.includes('Kim Cương');
                    const isGold = tier.includes('Vàng');
                    const isSilver = tier.includes('Bạc');
                    const tierBg = isDiamond ? '#f3e8ff' : isGold ? '#fef3c7' : isSilver ? '#e0f2fe' : '#f1f5f9';
                    const tierColor = isDiamond ? '#7e22ce' : isGold ? '#b45309' : isSilver ? '#0369a1' : '#475569';

                    return (
                      <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fafafa'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#0284c7', fontWeight: 700, fontSize: '12.5px' }}>{custCode}</td>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                              {(c.name || 'K').charAt(0).toUpperCase()}
                            </div>
                            <span>{c.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', color: '#475569', fontSize: '12.5px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Phone size={12} color="#94a3b8" />
                            <span>{c.phone || t('admin.noPhone')}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            padding: '3px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: 700,
                            backgroundColor: tierBg, color: tierColor
                          }}>
                            {getTierLabel(tier)}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          {Number(c.discount_percent) > 0 ? (
                            <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, backgroundColor: '#ecfdf5', color: '#059669' }}>
                              {t('admin.discountShort')} {c.discount_percent}%
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '12px' }}>0%</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 14px', color: '#475569', fontSize: '12.5px', fontWeight: 600 }}>
                          {c.orders_count || 0} {t('admin.ordersUnit')}
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a', fontSize: '12.5px' }}>
                          {formatMoney(c.total_spent || 0)}
                        </td>
                        <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '12px', whiteSpace: 'nowrap' }}>
                          {c.created_at ? new Date(c.created_at).toLocaleDateString('vi-VN') : '—'}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => openEditCustomer(c)} title={t('edit')} style={{ padding: '5px 8px', borderRadius: '6px', color: '#0284c7', backgroundColor: '#e0f2fe', border: 'none', cursor: 'pointer' }}>
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => handleDeleteCustomer(c.id)} title={t('delete')} style={{ padding: '5px 8px', borderRadius: '6px', color: '#ef4444', backgroundColor: '#fee2e2', border: 'none', cursor: 'pointer' }}>
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
          </div>
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
              <button onClick={openAddPromo} style={{ ...btnPrimary, padding: '9px 20px', fontSize: '13.5px', backgroundColor: '#1d6ed8' }}>
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
                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#0284c7', fontWeight: 700, fontSize: '12.5px' }}>{p.code}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a', maxWidth: '180px' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
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
                              backgroundColor: p.is_active ? '#fef3c7' : '#e6f7f5',
                              color: p.is_active ? '#b45309' : '#059669'
                            }}
                          >
                            {p.is_active ? <AlertCircle size={13} /> : <CheckCircle size={13} />}
                          </button>
                          <button onClick={() => openEditPromo(p)} title={t('edit')} style={{ padding: '5px 8px', borderRadius: '6px', color: '#0284c7', backgroundColor: '#e0f2fe', border: 'none', cursor: 'pointer' }}>
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
                { label: t('admin.totalTables'), value: tables.length, bg: '#e6f7f5', color: '#009688', icon: <LayoutGrid size={18} /> },
                { label: t('admin.emptyTables'), value: tables.filter(t => t.status === 'empty' || !t.status).length, bg: '#ecfdf5', color: '#059669', icon: <CheckCircle size={18} /> },
                { label: t('admin.occupiedTables'), value: tables.filter(t => t.status === 'occupied').length, bg: '#fef3c7', color: '#d97706', icon: <Users size={18} /> },
                { label: t('admin.areasCount'), value: areas.length, bg: '#f0f9ff', color: '#0284c7', icon: <MapPin size={18} /> },
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
                        <button onClick={() => openEditTable(tObj)} style={{ padding: '5px 10px', borderRadius: '6px', color: '#0284c7', backgroundColor: '#e0f2fe', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                          <Pencil size={12} /> {t('edit')}
                        </button>
                        <button onClick={() => handleDeleteTable(tObj.id)} style={{ padding: '5px 10px', borderRadius: '6px', color: '#ef4444', backgroundColor: '#fee2e2', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
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
                      <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#e6f7f5', color: '#009688' }}><MapPin size={18} /></div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{formatAreaName(a.name)}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          {tables.filter(t => t.area_id === a.id).length} {t('admin.tablesInArea')}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => openEditArea(a)} title={t('edit')} style={{ padding: '7px 10px', borderRadius: '6px', color: '#0284c7', backgroundColor: '#e0f2fe', border: 'none', cursor: 'pointer' }}><Pencil size={13} /></button>
                      <button onClick={() => handleDeleteArea(a.id)} title={t('delete')} style={{ padding: '7px 10px', borderRadius: '6px', color: '#ef4444', backgroundColor: '#fee2e2', border: 'none', cursor: 'pointer' }}><Trash2 size={13} /></button>
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

      {/* ══════════════ MODAL: ADD / EDIT CUSTOMER ══════════════ */}
      {showCustomerModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '20px' }}>
          <div style={{ width: '440px', maxWidth: '100%', backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>
                {editingCustomer ? t('admin.editCustomer') : t('admin.addCustomer')}
              </h3>
              <button onClick={() => setShowCustomerModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={labelStyle}>{t('admin.customerName')}: <span style={{ color: '#ef4444' }}>*</span></label>
                <input required type="text" placeholder="VD: Anh Hoàng / Chị Phương Linh" value={customerName} onChange={e => setCustomerName(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{t('admin.phone')}:</label>
                <input type="text" placeholder="VD: 0988.666.888" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={labelStyle}>{t('admin.memberTier')}:</label>
                  <select value={customerTier} onChange={e => setCustomerTier(e.target.value)} style={inputStyle}>
                    <option value="Hội viên Kim Cương">{t('admin.tierDiamond')}</option>
                    <option value="Hội viên Vàng">{t('admin.tierGold')}</option>
                    <option value="Hội viên Bạc">{t('admin.tierSilver')}</option>
                    <option value="Hội viên">{t('admin.tierMember')}</option>
                    <option value="Khách mới">{t('admin.tierNew')}</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{t('admin.discountPct')} (%):</label>
                  <input type="number" min="0" max="100" placeholder="VD: 5 hoặc 10" value={customerDiscount} onChange={e => setCustomerDiscount(e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowCustomerModal(false)} style={btnSecondary}>{t('cancel')}</button>
                <button type="submit" style={btnPrimary}>
                  {editingCustomer ? t('update') : t('save')}
                </button>
              </div>
            </form>
            {!editingCustomer && (
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
                <span>{t('admin.orImportCustomersFromExcel') || 'Bạn muốn thêm nhiều khách hàng cùng lúc?'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomerModal(false);
                    setShowImportCustomerModal(true);
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
                  <FileSpreadsheet size={13} /> {t('admin.importCustomerExcel') || 'Nhập từ Excel'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
                    <span style={{ fontSize: '11px', color: '#0284c7', fontStyle: 'italic' }}>
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
                <button type="submit" style={btnPrimary}>
                  {editingUser ? t('update') : t('admin.saveToDb')}
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
              <div style={{ backgroundColor: '#e6f7f5', border: '1px solid #99d9d5', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag size={15} color="#009688" />
                <span style={{ fontSize: '12.5px', color: '#00796b', fontWeight: 600 }}>{t('admin.autoGenCodeHint')}</span>
              </div>
            )}
            {editingProduct && (
              <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', color: '#0284c7' }}>{t('admin.productCode')}: </span>
                <strong style={{ color: '#0284c7', fontSize: '13px' }}>{editingProduct.code}</strong>
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
                    {(menuData.categories || []).map(cat => (
                      <option key={cat.id} value={cat.id}>{formatCategoryName(cat.name)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowAddProductModal(false)} style={btnSecondary}>{t('cancel')}</button>
                <button type="submit" style={btnPrimary}>{editingProduct ? t('update') : t('admin.saveToDb')}</button>
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
                          backgroundColor: promoStep >= step ? '#1d6ed8' : '#e2e8f0',
                          color: promoStep >= step ? '#fff' : '#94a3b8',
                          fontSize: '11px', fontWeight: 700
                        }}>{step}</div>
                        <span style={{ fontSize: '11.5px', color: promoStep >= step ? '#1d6ed8' : '#94a3b8', fontWeight: 600 }}>
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
                    border: `1.5px solid ${promoType === 'order_discount' ? '#1d6ed8' : '#e2e8f0'}`,
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
                    borderColor: promoType === 'order_discount' ? '#1d6ed8' : '#cbd5e1',
                    backgroundColor: promoType === 'order_discount' ? '#1d6ed8' : 'transparent',
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
                      border: `1.5px solid ${promoType === pt.value ? '#1d6ed8' : '#e2e8f0'}`,
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
                      borderColor: promoType === pt.value ? '#1d6ed8' : '#cbd5e1',
                      backgroundColor: promoType === pt.value ? '#1d6ed8' : 'transparent',
                      flexShrink: 0, marginLeft: '12px'
                    }} />
                  </div>
                ))}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                  <button onClick={() => setShowPromoModal(false)} style={btnSecondary}>{t('skip')}</button>
                  <button onClick={() => setPromoStep(2)} style={{ ...btnPrimary, backgroundColor: '#1d6ed8' }}>{t('next')}</button>
                </div>
              </div>
            )}

            {/* Step 2: Fill in info */}
            {(promoStep === 2 || editingPromo) && (
              <form onSubmit={handleSavePromo} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Selected type badge */}
                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Gift size={15} color="#1d6ed8" />
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
                  <button type="submit" style={{ ...btnPrimary, backgroundColor: '#1d6ed8', padding: '9px 24px' }}>
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
