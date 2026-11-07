import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Search, Plus, FileSpreadsheet, MoreHorizontal, SlidersHorizontal,
  ChevronLeft, ChevronRight, Calendar, Trash2, Edit3, Check,
  X, Filter, Download, Printer, User, Building, Phone, Mail,
  RotateCcw, AlertTriangle, Layers, ChevronDown
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { api } from '../../api';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';

// ── Default Columns Matching User's Image ──
const DEFAULT_VISIBLE_COLUMNS = [
  'customer_code',
  'name',
  'phone',
  'receivable',
  'total_purchase',
  'purchase_without_returns'
];

// ── Initial Mock Customers (Matching User's Reference Screenshot) ──
const INITIAL_CUSTOMERS = [
  {
    id: 20,
    code: 'KH000020',
    name: 'PHAM THI DOAN TRANG',
    phone: '0949393043',
    email: 'doantrang@gmail.com',
    customer_type: 'individual',
    id_code: '079195000123',
    gender: 'female',
    birthday: '1995-04-12',
    customer_group: 'Khách lẻ',
    address: '123 Cách Mạng Tháng 8, Q.3, TP.HCM',
    company: '',
    tax_code: '',
    note: 'Khách mua qua mạng',
    last_transaction: '2026-11-06 10:20',
    receivable: 0,
    total_purchase: 0,
    purchase_without_returns: 0,
    points: 0,
    total_points: 0,
    status: 'active',
    created_at: '2026-11-06'
  },
  {
    id: 19,
    code: 'KH000019',
    name: 'ĐẶC SẢN HƯƠNG ĐẢO CẦN THƠ',
    phone: '0918112233',
    email: 'huongdaocantho@gmail.com',
    customer_type: 'company',
    id_code: '',
    gender: 'other',
    birthday: '',
    customer_group: 'Đại lý',
    address: '45 Trần Văn Hoài, Ninh Kiều, Cần Thơ',
    company: 'Đặc Sản Hương Đảo',
    tax_code: '1801234567',
    note: 'Đại lý cấp 1 miền Tây',
    last_transaction: '2026-11-05 15:45',
    receivable: 0,
    total_purchase: 1320000,
    purchase_without_returns: 1320000,
    points: 132,
    total_points: 132,
    status: 'active',
    created_at: '2026-11-05'
  },
  {
    id: 18,
    code: 'KH000018',
    name: 'học sinh',
    phone: '',
    email: '',
    customer_type: 'individual',
    id_code: '',
    gender: 'male',
    birthday: '2008-09-10',
    customer_group: 'Khách lẻ',
    address: 'Trường THPT Phú Quốc',
    company: '',
    tax_code: '',
    note: '',
    last_transaction: '2026-11-04 17:10',
    receivable: 0,
    total_purchase: 27500,
    purchase_without_returns: 27500,
    points: 3,
    total_points: 3,
    status: 'active',
    created_at: '2026-11-04'
  },
  {
    id: 17,
    code: 'KH000017',
    name: 'Vân',
    phone: '09162575666',
    email: 'thanhvan@gmail.com',
    customer_type: 'individual',
    id_code: '079201004567',
    gender: 'female',
    birthday: '1998-11-20',
    customer_group: 'Khách quen',
    address: 'Dương Đông, Phú Quốc',
    company: '',
    tax_code: '',
    note: 'Hay uống trà lài hạt sen ít ngọt',
    last_transaction: '2026-11-03 14:30',
    receivable: 0,
    total_purchase: 55000,
    purchase_without_returns: 55000,
    points: 6,
    total_points: 6,
    status: 'active',
    created_at: '2026-11-03'
  },
  {
    id: 16,
    code: 'KH000016',
    name: 'ssssfssfssff',
    phone: '01212121212',
    email: '',
    customer_type: 'individual',
    id_code: '',
    gender: 'male',
    birthday: '',
    customer_group: 'Khách lẻ',
    address: '',
    company: '',
    tax_code: '',
    note: '',
    last_transaction: '2026-11-02 09:15',
    receivable: 0,
    total_purchase: 218000,
    purchase_without_returns: 218000,
    points: 22,
    total_points: 22,
    status: 'active',
    created_at: '2026-11-02'
  },
  {
    id: 15,
    code: 'KH000015',
    name: 'Thanh',
    phone: '',
    email: '',
    customer_type: 'individual',
    id_code: '',
    gender: 'female',
    birthday: '',
    customer_group: 'Khách lẻ',
    address: 'Bãi Trường, Phú Quốc',
    company: '',
    tax_code: '',
    note: '',
    last_transaction: '2026-10-31 16:40',
    receivable: 0,
    total_purchase: 199000,
    purchase_without_returns: 199000,
    points: 20,
    total_points: 20,
    status: 'active',
    created_at: '2026-10-31'
  },
  {
    id: 14,
    code: 'KH000014',
    name: 'công ty abc',
    phone: '0949711007',
    email: 'contact@abccorp.vn',
    customer_type: 'company',
    id_code: '',
    gender: 'other',
    birthday: '',
    customer_group: 'Doanh nghiệp',
    address: 'Khu Công Nghệ Cao, TP. Thủ Đức',
    company: 'Công ty Cổ phần ABC',
    tax_code: '0309998881',
    note: 'Hợp đồng tiệc trà định kỳ',
    last_transaction: '2026-10-29 11:00',
    receivable: 0,
    total_purchase: 1908000,
    purchase_without_returns: 1908000,
    points: 191,
    total_points: 191,
    status: 'active',
    created_at: '2026-10-29'
  },
  {
    id: 13,
    code: 'KH000013',
    name: 'HỒNG',
    phone: '',
    email: '',
    customer_type: 'individual',
    id_code: '',
    gender: 'female',
    birthday: '1990-08-15',
    customer_group: 'Khách lẻ',
    address: '',
    company: '',
    tax_code: '',
    note: '',
    last_transaction: '2026-10-28 13:20',
    receivable: 0,
    total_purchase: 0,
    purchase_without_returns: 0,
    points: 0,
    total_points: 0,
    status: 'active',
    created_at: '2026-10-28'
  },
  {
    id: 12,
    code: 'KH000012',
    name: 'Khang',
    phone: '0949711008',
    email: 'khang.nguyen@gmail.com',
    customer_type: 'individual',
    id_code: '082200003344',
    gender: 'male',
    birthday: '1993-02-14',
    customer_group: 'Khách quen',
    address: 'Trần Hưng Đạo, Dương Đông',
    company: '',
    tax_code: '',
    note: 'Khách đặt bàn cuối tuần',
    last_transaction: '2026-10-27 18:00',
    receivable: 0,
    total_purchase: 718000,
    purchase_without_returns: 718000,
    points: 72,
    total_points: 72,
    status: 'active',
    created_at: '2026-10-27'
  },
  {
    id: 11,
    code: 'KH000011',
    name: 'nam',
    phone: '062',
    email: '',
    customer_type: 'individual',
    id_code: '',
    gender: 'male',
    birthday: '',
    customer_group: 'Khách lẻ',
    address: '',
    company: '',
    tax_code: '',
    note: '',
    last_transaction: '2026-10-25 12:10',
    receivable: 0,
    total_purchase: 572400,
    purchase_without_returns: 572400,
    points: 57,
    total_points: 57,
    status: 'active',
    created_at: '2026-10-25'
  },
  {
    id: 10,
    code: 'KH000010',
    name: 'Anh Hoàng',
    phone: '0912.888.666',
    email: 'hoang.nam@gmail.com',
    customer_type: 'individual',
    id_code: '079090001122',
    gender: 'male',
    birthday: '1985-06-25',
    customer_group: 'VIP',
    address: 'Khu biệt thự Sunset Town, Phú Quốc',
    company: 'Tập đoàn Sunset Group',
    tax_code: '0102030405',
    note: 'Khách VIP thân thiết, nợ gối đầu tháng kết toán 1 lần',
    last_transaction: '2026-10-24 19:30',
    receivable: 2360998,
    total_purchase: 4850000,
    purchase_without_returns: 4850000,
    points: 485,
    total_points: 485,
    status: 'active',
    created_at: '2026-09-10'
  },
  {
    id: 9,
    code: 'KH000009',
    name: 'Chị Phương Linh',
    phone: '0988.666.888',
    email: 'phuonglinh.tran@yahoo.com',
    customer_type: 'individual',
    id_code: '079192003344',
    gender: 'female',
    birthday: '1992-09-15',
    customer_group: 'VIP',
    address: '103 Trần Hưng Đạo, Phú Quốc',
    company: 'Công ty Du Lịch Nam Đảo',
    tax_code: '',
    note: 'Khách quen hay tổ chức họp nhóm đối tác',
    last_transaction: '2026-10-20 15:00',
    receivable: 0,
    total_purchase: 245700,
    purchase_without_returns: 245700,
    points: 25,
    total_points: 25,
    status: 'active',
    created_at: '2026-09-15'
  },
  {
    id: 8,
    code: 'KH000008',
    name: 'Bác Minh Tuấn',
    phone: '0903.123.456',
    email: 'minhtuan54@gmail.com',
    customer_type: 'individual',
    id_code: '079054000888',
    gender: 'male',
    birthday: '1954-12-01',
    customer_group: 'Khách quen',
    address: 'Hẻm 45 ĐT45, Cửa Cạn, Phú Quốc',
    company: '',
    tax_code: '',
    note: 'Uống trà ấm buổi sáng',
    last_transaction: '2026-10-18 07:30',
    receivable: 0,
    total_purchase: 218000,
    purchase_without_returns: 218000,
    points: 22,
    total_points: 22,
    status: 'active',
    created_at: '2026-10-01'
  }
];

export function CustomersView({
  customers: externalCustomers = [],
  setCustomers: setExternalCustomers,
  onRefresh,
  setShowImportCustomerModal
}) {
  const { t } = useLanguage();

  // ── Palette constants ──
  const THEME = {
    forest: '#1B5E20',
    darkForest: '#2E7D32',
    accentGreen: '#66BB6A',
    softSage: '#A5D6A7',
    lightFoam: '#E8F5E9',
    slateDark: '#0f172a',
    slateBody: '#334155',
    slateMuted: '#64748b',
    border: '#e2e8f0',
    cardBg: '#ffffff',
    bgSubtle: '#f8fafc'
  };

  // ── Manage Customers State ──
  // If externalCustomers is provided, merge with our rich fields so table never has blank columns
  const [customerList, setCustomerList] = useState(() => {
    if (externalCustomers && externalCustomers.length > 0) {
      return externalCustomers.map((c, idx) => ({
        id: c.id || idx + 1,
        code: c.code || `KH${String(c.id || idx + 1).padStart(6, '0')}`,
        name: c.name || '',
        phone: c.phone || '',
        email: c.email || '',
        customer_type: c.customer_type || 'individual',
        id_code: c.id_code || '',
        gender: c.gender || 'male',
        birthday: c.birthday || '',
        customer_group: c.customer_group || 'Khách lẻ',
        address: c.address || '',
        company: c.company || c.company_name || '',
        tax_code: c.tax_code || '',
        note: c.note || c.notes || '',
        last_transaction: c.last_transaction || c.created_at || '',
        receivable: Number(c.receivable || c.debt || 0),
        total_purchase: Number(c.total_purchase ?? c.total_spent ?? 0),
        purchase_without_returns: Number(c.purchase_without_returns ?? c.total_purchase ?? c.total_spent ?? 0),
        points: Number(c.points || 0),
        total_points: Number(c.total_points ?? c.points ?? 0),
        status: c.status || 'active',
        created_at: c.created_at || new Date().toISOString()
      }));
    }
    return INITIAL_CUSTOMERS;
  });

  // Sync when externalCustomers changes meaningfully
  useEffect(() => {
    if (externalCustomers && externalCustomers.length > 0) {
      setCustomerList(prev => {
        // Map existing by ID or merge
        return externalCustomers.map((c, idx) => {
          const found = prev.find(p => p.id === c.id);
          return {
            id: c.id || idx + 1,
            code: c.code || found?.code || `KH${String(c.id || idx + 1).padStart(6, '0')}`,
            name: c.name || '',
            phone: c.phone || '',
            email: c.email || found?.email || '',
            customer_type: c.customer_type || found?.customer_type || 'individual',
            id_code: c.id_code || found?.id_code || '',
            gender: c.gender || found?.gender || 'male',
            birthday: c.birthday || found?.birthday || '',
            customer_group: c.customer_group || found?.customer_group || 'Khách lẻ',
            address: c.address || found?.address || '',
            company: c.company || c.company_name || found?.company || '',
            tax_code: c.tax_code || found?.tax_code || '',
            note: c.note || c.notes || found?.note || '',
            last_transaction: c.last_transaction || found?.last_transaction || c.created_at || '',
            receivable: Number(c.receivable ?? found?.receivable ?? 0),
            total_purchase: Number(c.total_purchase ?? c.total_spent ?? found?.total_purchase ?? 0),
            purchase_without_returns: Number(c.purchase_without_returns ?? c.total_purchase ?? c.total_spent ?? found?.purchase_without_returns ?? 0),
            points: Number(c.points ?? found?.points ?? 0),
            total_points: Number(c.total_points ?? found?.total_points ?? 0),
            status: c.status || found?.status || 'active',
            created_at: c.created_at || found?.created_at || new Date().toISOString()
          };
        });
      });
    }
  }, [externalCustomers]);

  // ── Column Visibility State (Persisted in localStorage) ──
  const [visibleColumns, setVisibleColumns] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_pos_customer_columns');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_VISIBLE_COLUMNS;
  });

  const toggleColumn = (colId) => {
    setVisibleColumns(prev => {
      let next;
      if (prev.includes(colId)) {
        if (prev.length <= 1) return prev; // Keep at least one column
        next = prev.filter(c => c !== colId);
      } else {
        next = [...prev, colId];
      }
      try { localStorage.setItem('aura_pos_customer_columns', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  const handleSelectAllColumns = () => {
    const all = [
      'customer_code', 'email', 'gender', 'address', 'note', 'total_purchase', 'total_points',
      'name', 'customer_type', 'birthday', 'company', 'last_transaction', 'purchase_without_returns', 'status',
      'phone', 'id_code', 'customer_group', 'tax_code', 'receivable', 'points'
    ];
    setVisibleColumns(all);
    try { localStorage.setItem('aura_pos_customer_columns', JSON.stringify(all)); } catch (e) {}
  };

  const handleResetDefaultColumns = () => {
    setVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
    try { localStorage.setItem('aura_pos_customer_columns', JSON.stringify(DEFAULT_VISIBLE_COLUMNS)); } catch (e) {}
  };

  // ── Filters State ──
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [createdTimeType, setCreatedTimeType] = useState('any'); // 'any' | 'custom'
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');
  const [birthdayType, setBirthdayType] = useState('any'); // 'any' | 'custom'
  const [birthdayMonth, setBirthdayMonth] = useState('');
  const [lastTxType, setLastTxType] = useState('any'); // 'any' | 'custom'
  const [lastTxFrom, setLastTxFrom] = useState('');
  const [lastTxTo, setLastTxTo] = useState('');
  const [totalPurchaseMin, setTotalPurchaseMin] = useState('');
  const [totalPurchaseMax, setTotalPurchaseMax] = useState('');

  // ── UI States ──
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // ── Customer Modal (Add / Edit) - Clean, NO membership tier ──
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formType, setFormType] = useState('individual'); // 'individual' | 'company'
  const [formIdCode, setFormIdCode] = useState('');
  const [formGender, setFormGender] = useState('male');
  const [formBirthday, setFormBirthday] = useState('');
  const [formGroup, setFormGroup] = useState('Khách lẻ');
  const [formAddress, setFormAddress] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formTaxCode, setFormTaxCode] = useState('');
  const [formNote, setFormNote] = useState('');

  // Quick group creation prompt modal
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [customGroups, setCustomGroups] = useState(['Khách lẻ', 'Khách quen', 'VIP', 'Đại lý', 'Doanh nghiệp']);

  // Delete modal state
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);
  const [deleteSelectedConfirmOpen, setDeleteSelectedConfirmOpen] = useState(false);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);

  // Close more menu when clicking outside
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

  // ── Available Customer Groups ──
  const availableGroups = useMemo(() => {
    const set = new Set(customGroups);
    customerList.forEach(c => {
      if (c.customer_group && c.customer_group.trim()) set.add(c.customer_group.trim());
    });
    return Array.from(set);
  }, [customerList, customGroups]);

  // ── Filtered Customers ──
  const filteredCustomers = useMemo(() => {
    return customerList.filter(c => {
      // 1. Search term (by code, name, phone)
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchCode = (c.code || '').toLowerCase().includes(q);
        const matchName = (c.name || '').toLowerCase().includes(q);
        const matchPhone = (c.phone || '').includes(q);
        if (!matchCode && !matchName && !matchPhone) return false;
      }

      // 2. Customer group
      if (selectedGroup !== 'all') {
        if ((c.customer_group || 'Khách lẻ') !== selectedGroup) return false;
      }

      // 3. Created time
      if (createdTimeType === 'custom') {
        const cDate = c.created_at ? new Date(c.created_at).toISOString().split('T')[0] : '';
        if (createdFrom && cDate && cDate < createdFrom) return false;
        if (createdTo && cDate && cDate > createdTo) return false;
      }

      // 4. Birthday
      if (birthdayType === 'custom' && birthdayMonth) {
        if (!c.birthday) return false;
        const bMonth = String(new Date(c.birthday).getMonth() + 1);
        if (bMonth !== String(birthdayMonth)) return false;
      }

      // 5. Last transaction
      if (lastTxType === 'custom') {
        const txDate = c.last_transaction ? new Date(c.last_transaction).toISOString().split('T')[0] : '';
        if (lastTxFrom && txDate && txDate < lastTxFrom) return false;
        if (lastTxTo && txDate && txDate > lastTxTo) return false;
      }

      // 6. Total purchase
      const tp = Number(c.total_purchase ?? c.total_spent ?? 0);
      if (totalPurchaseMin !== '' && !isNaN(totalPurchaseMin) && tp < Number(totalPurchaseMin)) return false;
      if (totalPurchaseMax !== '' && !isNaN(totalPurchaseMax) && tp > Number(totalPurchaseMax)) return false;

      return true;
    });
  }, [
    customerList, searchTerm, selectedGroup, createdTimeType, createdFrom, createdTo,
    birthdayType, birthdayMonth, lastTxType, lastTxFrom, lastTxTo, totalPurchaseMin, totalPurchaseMax
  ]);

  // ── Calculated Summaries matching Image 1 ──
  const summaries = useMemo(() => {
    return {
      receivable: filteredCustomers.reduce((sum, c) => sum + (Number(c.receivable) || 0), 0),
      total_purchase: filteredCustomers.reduce((sum, c) => sum + (Number(c.total_purchase ?? c.total_spent) || 0), 0),
      purchase_without_returns: filteredCustomers.reduce((sum, c) => sum + (Number(c.purchase_without_returns ?? c.total_purchase ?? c.total_spent) || 0), 0),
      points: filteredCustomers.reduce((sum, c) => sum + (Number(c.points) || 0), 0),
      total_points: filteredCustomers.reduce((sum, c) => sum + (Number(c.total_points ?? c.points) || 0), 0),
    };
  }, [filteredCustomers]);

  // ── Pagination Calculation ──
  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  const startIndex = filteredCustomers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, filteredCustomers.length);

  // ── Select All Rows ──
  const isAllSelected = paginatedCustomers.length > 0 && paginatedCustomers.every(c => selectedRows.includes(c.id));
  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRows(prev => prev.filter(id => !paginatedCustomers.some(c => c.id === id)));
    } else {
      const pageIds = paginatedCustomers.map(c => c.id);
      setSelectedRows(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelectRow = (id) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  // ── Open Add Customer Modal ──
  const handleOpenAddCustomer = () => {
    setEditingCustomer(null);
    const nextNum = customerList.length + 1;
    setFormCode(`KH${String(nextNum).padStart(6, '0')}`);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormType('individual');
    setFormIdCode('');
    setFormGender('male');
    setFormBirthday('');
    setFormGroup('Khách lẻ');
    setFormAddress('');
    setFormCompany('');
    setFormTaxCode('');
    setFormNote('');
    setShowCustomerModal(true);
  };

  // ── Open Edit Customer Modal ──
  const handleOpenEditCustomer = (c) => {
    setEditingCustomer(c);
    setFormCode(c.code || `KH${String(c.id).padStart(6, '0')}`);
    setFormName(c.name || '');
    setFormPhone(c.phone || '');
    setFormEmail(c.email || '');
    setFormType(c.customer_type || 'individual');
    setFormIdCode(c.id_code || '');
    setFormGender(c.gender || 'male');
    setFormBirthday(c.birthday || '');
    setFormGroup(c.customer_group || 'Khách lẻ');
    setFormAddress(c.address || '');
    setFormCompany(c.company || '');
    setFormTaxCode(c.tax_code || '');
    setFormNote(c.note || '');
    setShowCustomerModal(true);
  };

  // ── Save Customer ──
  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert(t('admin.customersView.nameRequired') || 'Vui lòng nhập tên khách hàng!');
      return;
    }

    const payload = {
      code: formCode.trim(),
      name: formName.trim(),
      phone: formPhone.trim(),
      email: formEmail.trim(),
      customer_type: formType,
      id_code: formIdCode.trim(),
      gender: formGender,
      birthday: formBirthday,
      customer_group: formGroup,
      address: formAddress.trim(),
      company: formCompany.trim(),
      tax_code: formTaxCode.trim(),
      note: formNote.trim()
    };

    try {
      if (editingCustomer) {
        // Update API
        try {
          await api.updateCustomerInfo(editingCustomer.id, {
            name: payload.name,
            phone: payload.phone
          });
        } catch (apiErr) {}

        const updated = {
          ...editingCustomer,
          ...payload
        };
        setCustomerList(prev => prev.map(c => c.id === editingCustomer.id ? updated : c));
        if (setExternalCustomers) {
          setExternalCustomers(prev => prev.map(c => c.id === editingCustomer.id ? { ...c, ...payload } : c));
        }
      } else {
        // Create API
        let newId = Date.now();
        try {
          const res = await api.addCustomer({
            name: payload.name,
            phone: payload.phone
          });
          if (res?.customer?.id) newId = res.customer.id;
        } catch (apiErr) {}

        const created = {
          id: newId,
          ...payload,
          receivable: 0,
          total_purchase: 0,
          purchase_without_returns: 0,
          points: 0,
          total_points: 0,
          status: 'active',
          created_at: new Date().toISOString()
        };
        setCustomerList(prev => [created, ...prev]);
        if (setExternalCustomers) {
          setExternalCustomers(prev => [created, ...prev]);
        }
      }
      setShowCustomerModal(false);
    } catch (err) {
      alert('Lỗi: ' + (err.message || 'Không thể lưu khách hàng'));
    }
  };

  // ── Delete Customer ──
  const handleDeleteCustomer = (c) => {
    setDeleteConfirmTarget(c);
  };

  const confirmDeleteAction = async () => {
    if (!deleteConfirmTarget) return;
    try {
      await api.deleteCustomer(deleteConfirmTarget.id);
    } catch (e) {}

    setCustomerList(prev => prev.filter(c => c.id !== deleteConfirmTarget.id));
    if (setExternalCustomers) {
      setExternalCustomers(prev => prev.filter(c => c.id !== deleteConfirmTarget.id));
    }
    setSelectedRows(prev => prev.filter(id => id !== deleteConfirmTarget.id));
    setDeleteConfirmTarget(null);
  };

  // ── Delete Selected Customers ──
  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) return;
    setDeleteSelectedConfirmOpen(true);
  };

  const confirmDeleteSelectedAction = async () => {
    if (selectedRows.length === 0) return;
    setIsDeletingSelected(true);
    try {
      for (const id of selectedRows) {
        try { await api.deleteCustomer(id); } catch (e) {}
      }
      setCustomerList(prev => prev.filter(c => !selectedRows.includes(c.id)));
      if (setExternalCustomers) {
        setExternalCustomers(prev => prev.filter(c => !selectedRows.includes(c.id)));
      }
      setSelectedRows([]);
      setShowMoreMenu(false);
    } finally {
      setIsDeletingSelected(false);
      setDeleteSelectedConfirmOpen(false);
    }
  };

  // ── Export to Excel ──
  const handleExportExcel = () => {
    try {
      const exportData = filteredCustomers.map((c, index) => ({
        STT: index + 1,
        'Mã khách hàng': c.code,
        'Tên khách hàng': c.name,
        'Số điện thoại': c.phone,
        'Email': c.email,
        'Loại khách': c.customer_type === 'company' ? 'Doanh nghiệp' : 'Cá nhân',
        'Mã số định danh': c.id_code,
        'Giới tính': c.gender === 'female' ? 'Nữ' : c.gender === 'other' ? 'Khác' : 'Nam',
        'Ngày sinh': c.birthday,
        'Nhóm khách hàng': c.customer_group,
        'Địa chỉ': c.address,
        'Công ty': c.company,
        'Mã số thuế': c.tax_code,
        'Ghi chú': c.note,
        'Giao dịch cuối': c.last_transaction,
        'Nợ cần thu': c.receivable,
        'Tổng mua': c.total_purchase,
        'Mua không hoàn': c.purchase_without_returns,
        'Điểm': c.points,
        'Tổng điểm': c.total_points,
        'Trạng thái': c.status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động'
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'KhachHang');
      XLSX.writeFile(workbook, `Danh_Sach_Khach_Hang_${new Date().toISOString().split('T')[0]}.xlsx`);
      setShowMoreMenu(false);
    } catch (e) {
      alert('Lỗi xuất file Excel: ' + e.message);
    }
  };

  // ── Print Customer List ──
  const handlePrintList = () => {
    window.print();
    setShowMoreMenu(false);
  };

  // ── Create New Group ──
  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    const name = newGroupName.trim();
    if (!customGroups.includes(name)) {
      setCustomGroups(prev => [...prev, name]);
    }
    setSelectedGroup(name);
    setNewGroupName('');
    setShowNewGroupModal(false);
  };

  // ── Reset Filters ──
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedGroup('all');
    setCreatedTimeType('any');
    setCreatedFrom('');
    setCreatedTo('');
    setBirthdayType('any');
    setBirthdayMonth('');
    setLastTxType('any');
    setLastTxFrom('');
    setLastTxTo('');
    setTotalPurchaseMin('');
    setTotalPurchaseMax('');
  };

  const isFiltered = searchTerm || selectedGroup !== 'all' || createdTimeType !== 'any' || birthdayType !== 'any' || lastTxType !== 'any' || totalPurchaseMin !== '' || totalPurchaseMax !== '';

  // ── 3-Column Definitions for Column Customizer (Matching Image 2) ──
  const columnColumns = [
    // Column 1
    [
      { id: 'customer_code', label: t('admin.customersView.colCustomerId') },
      { id: 'email', label: t('admin.customersView.colEmail') },
      { id: 'gender', label: t('admin.customersView.colGender') },
      { id: 'address', label: t('admin.customersView.colAddress') },
      { id: 'note', label: t('admin.customersView.colNote') },
      { id: 'total_purchase', label: t('admin.customersView.colTotalPurchase') },
      { id: 'total_points', label: t('admin.customersView.colTotalPoints') },
    ],
    // Column 2
    [
      { id: 'name', label: t('admin.customersView.colName') },
      { id: 'customer_type', label: t('admin.customersView.colCustomerType') },
      { id: 'birthday', label: t('admin.customersView.colBirthday') },
      { id: 'company', label: t('admin.customersView.colCompany') },
      { id: 'last_transaction', label: t('admin.customersView.colLastTransaction') },
      { id: 'purchase_without_returns', label: t('admin.customersView.colPurchaseWithoutReturns') },
      { id: 'status', label: t('admin.customersView.colStatus') },
    ],
    // Column 3
    [
      { id: 'phone', label: t('admin.customersView.colPhone') },
      { id: 'id_code', label: t('admin.customersView.colIdCode') },
      { id: 'customer_group', label: t('admin.customersView.colCustomerGroup') },
      { id: 'tax_code', label: t('admin.customersView.colTaxCode') },
      { id: 'receivable', label: t('admin.customersView.colReceivable') },
      { id: 'points', label: t('admin.customersView.colPoints') },
    ]
  ];

  // Helper dictionary for rendering cell content by column ID
  const renderCellContent = (colId, c) => {
    switch (colId) {
      case 'customer_code':
        return <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1e293b' }}>{c.code}</span>;
      case 'name':
        return <span style={{ fontWeight: 700, color: '#0f172a' }}>{c.name}</span>;
      case 'phone':
        return <span style={{ color: '#475569' }}>{c.phone || '—'}</span>;
      case 'email':
        return <span style={{ color: '#475569', fontSize: '12.5px' }}>{c.email || '—'}</span>;
      case 'customer_type':
        return (
          <span style={{
            padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
            backgroundColor: c.customer_type === 'company' ? '#eff6ff' : '#f1f5f9',
            color: c.customer_type === 'company' ? '#1d4ed8' : '#475569'
          }}>
            {c.customer_type === 'company' ? t('admin.customersView.corporate') : t('admin.customersView.individual')}
          </span>
        );
      case 'id_code':
        return <span style={{ fontFamily: 'monospace', color: '#475569' }}>{c.id_code || '—'}</span>;
      case 'gender':
        return (
          <span>
            {c.gender === 'female' ? t('admin.customersView.female') : c.gender === 'other' ? t('admin.customersView.otherGender') : t('admin.customersView.male')}
          </span>
        );
      case 'birthday':
        return <span>{c.birthday ? new Date(c.birthday).toLocaleDateString('vi-VN') : '—'}</span>;
      case 'customer_group':
        return (
          <span style={{
            padding: '3px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: 700,
            backgroundColor: c.customer_group === 'VIP' ? '#fef3c7' : '#E8F5E9',
            color: c.customer_group === 'VIP' ? '#b45309' : '#1B5E20'
          }}>
            {c.customer_group || 'Khách lẻ'}
          </span>
        );
      case 'address':
        return <span title={c.address} style={{ maxWidth: '180px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.address || '—'}</span>;
      case 'company':
        return <span>{c.company || '—'}</span>;
      case 'tax_code':
        return <span style={{ fontFamily: 'monospace' }}>{c.tax_code || '—'}</span>;
      case 'note':
        return <span title={c.note} style={{ maxWidth: '160px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.note || '—'}</span>;
      case 'last_transaction':
        return <span style={{ fontSize: '12px', color: '#64748b' }}>{c.last_transaction ? c.last_transaction.slice(0, 16) : '—'}</span>;
      case 'receivable':
        return <span style={{ fontWeight: 600, color: (c.receivable || 0) > 0 ? '#dc2626' : '#475569' }}>{(c.receivable || 0).toLocaleString('vi-VN')}</span>;
      case 'total_purchase':
        return <span style={{ fontWeight: 600, color: '#0f172a' }}>{(c.total_purchase ?? c.total_spent ?? 0).toLocaleString('vi-VN')}</span>;
      case 'purchase_without_returns':
        return <span style={{ fontWeight: 600, color: '#0f172a' }}>{(c.purchase_without_returns ?? c.total_purchase ?? 0).toLocaleString('vi-VN')}</span>;
      case 'points':
        return <span style={{ color: '#059669', fontWeight: 600 }}>{(c.points || 0).toLocaleString('vi-VN')}</span>;
      case 'total_points':
        return <span style={{ color: '#059669', fontWeight: 600 }}>{(c.total_points ?? c.points ?? 0).toLocaleString('vi-VN')}</span>;
      case 'status':
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
            backgroundColor: (c.status || 'active') === 'active' ? '#E8F5E9' : '#f1f5f9',
            color: (c.status || 'active') === 'active' ? '#1B5E20' : '#64748b'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: (c.status || 'active') === 'active' ? '#1B5E20' : '#94a3b8' }} />
            {(c.status || 'active') === 'active' ? t('admin.customersView.active') : t('admin.customersView.inactive')}
          </span>
        );
      default:
        return '—';
    }
  };

  // Helper for column headers
  const getColumnHeaderLabel = (colId) => {
    for (const group of columnColumns) {
      const match = group.find(item => item.id === colId);
      if (match) return match.label;
    }
    return colId;
  };

  return (
    <div style={{ display: 'flex', gap: '16px', minHeight: 'calc(100vh - 120px)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* ═══════════════════════════════════════════════════════════
          LEFT FILTER SIDEBAR (Matching Image 1)
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: `1px solid ${THEME.border}` }}>
          <h2 style={{ fontSize: '17px', fontWeight: 800, color: THEME.slateDark, margin: 0 }}>
            {t('admin.customersView.title')}
          </h2>
          {isFiltered && (
            <button
              onClick={handleResetFilters}
              title={t('admin.customersView.resetFilters')}
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
              <RotateCcw size={12} /> {t('admin.customersView.resetFilters')}
            </button>
          )}
        </div>

        {/* 1. Customer group */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: THEME.slateDark }}>
              {t('admin.customersView.customerGroup')}
            </span>
            <button
              onClick={() => setShowNewGroupModal(true)}
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
              {t('admin.customersView.createNewGroup')}
            </button>
          </div>
          <select
            value={selectedGroup}
            onChange={e => { setSelectedGroup(e.target.value); setCurrentPage(1); }}
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
            <option value="all">{t('admin.customersView.allGroups')}</option>
            {availableGroups.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* 2. Created time */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: THEME.slateDark, marginBottom: '8px' }}>
            {t('admin.customersView.createdTime')}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: THEME.slateBody, cursor: 'pointer', marginBottom: '6px' }}>
            <input
              type="radio"
              name="createdTime"
              checked={createdTimeType === 'any'}
              onChange={() => { setCreatedTimeType('any'); setCurrentPage(1); }}
              style={{ accentColor: THEME.forest }}
            />
            <span>{t('admin.customersView.anyTime')}</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: THEME.slateBody, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="radio"
                name="createdTime"
                checked={createdTimeType === 'custom'}
                onChange={() => { setCreatedTimeType('custom'); setCurrentPage(1); }}
                style={{ accentColor: THEME.forest }}
              />
              <span>{t('admin.customersView.otherOptions')}</span>
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

        {/* 3. Birthday */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: THEME.slateDark, marginBottom: '8px' }}>
            {t('admin.customersView.birthday')}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: THEME.slateBody, cursor: 'pointer', marginBottom: '6px' }}>
            <input
              type="radio"
              name="birthdayFilter"
              checked={birthdayType === 'any'}
              onChange={() => { setBirthdayType('any'); setCurrentPage(1); }}
              style={{ accentColor: THEME.forest }}
            />
            <span>{t('admin.customersView.anyTime')}</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: THEME.slateBody, cursor: 'pointer' }}>
            <input
              type="radio"
              name="birthdayFilter"
              checked={birthdayType === 'custom'}
              onChange={() => { setBirthdayType('custom'); setCurrentPage(1); }}
              style={{ accentColor: THEME.forest }}
            />
            <span>{t('admin.customersView.otherOptions')}</span>
          </label>
          {birthdayType === 'custom' && (
            <div style={{ marginTop: '8px' }}>
              <select
                value={birthdayMonth}
                onChange={e => { setBirthdayMonth(e.target.value); setCurrentPage(1); }}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: `1px solid ${THEME.border}`, fontSize: '12px' }}
              >
                <option value="">{t('admin.customersView.all') || 'Tất cả các tháng'}</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>Tháng {m}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 4. Last transaction */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: THEME.slateDark, marginBottom: '8px' }}>
            {t('admin.customersView.lastTransaction')}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: THEME.slateBody, cursor: 'pointer', marginBottom: '6px' }}>
            <input
              type="radio"
              name="lastTxFilter"
              checked={lastTxType === 'any'}
              onChange={() => { setLastTxType('any'); setCurrentPage(1); }}
              style={{ accentColor: THEME.forest }}
            />
            <span>{t('admin.customersView.anyTime')}</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: THEME.slateBody, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="radio"
                name="lastTxFilter"
                checked={lastTxType === 'custom'}
                onChange={() => { setLastTxType('custom'); setCurrentPage(1); }}
                style={{ accentColor: THEME.forest }}
              />
              <span>{t('admin.customersView.otherOptions')}</span>
            </div>
            <Calendar size={14} color={THEME.slateMuted} />
          </label>
          {lastTxType === 'custom' && (
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input
                type="date"
                value={lastTxFrom}
                onChange={e => { setLastTxFrom(e.target.value); setCurrentPage(1); }}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: `1px solid ${THEME.border}`, fontSize: '12px' }}
              />
              <input
                type="date"
                value={lastTxTo}
                onChange={e => { setLastTxTo(e.target.value); setCurrentPage(1); }}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: `1px solid ${THEME.border}`, fontSize: '12px' }}
              />
            </div>
          )}
        </div>

        {/* 5. Total purchase */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: THEME.slateDark, marginBottom: '6px' }}>
            {t('admin.customersView.totalPurchase')}
          </div>
          <div style={{ fontSize: '11.5px', color: THEME.slateMuted, marginBottom: '6px' }}>
            {t('admin.customersView.value')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', color: THEME.slateMuted, width: '32px' }}>
              {t('admin.customersView.from')}
            </span>
            <input
              type="number"
              placeholder={t('admin.customersView.enterValue')}
              value={totalPurchaseMin}
              onChange={e => { setTotalPurchaseMin(e.target.value); setCurrentPage(1); }}
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
              {t('admin.customersView.to')}
            </span>
            <input
              type="number"
              placeholder={t('admin.customersView.enterValue')}
              value={totalPurchaseMax}
              onChange={e => { setTotalPurchaseMax(e.target.value); setCurrentPage(1); }}
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

      </aside>

      {/* ═══════════════════════════════════════════════════════════
          RIGHT MAIN CONTENT: ACTIONS BAR + TABLE + PAGINATION
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
          {/* Search Bar */}
          <div style={{
            position: 'relative',
            width: '380px',
            maxWidth: '100%'
          }}>
            <Search size={16} color={THEME.slateMuted} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder={t('admin.customersView.searchPlaceholder')}
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
            {/* + Add New Button */}
            <button
              onClick={handleOpenAddCustomer}
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
              <span>{t('admin.customersView.addNew')}</span>
            </button>

            {/* Import Button */}
            <button
              onClick={() => setShowImportCustomerModal(true)}
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
              <span>{t('admin.customersView.import')}</span>
            </button>

            {/* More Actions Menu (...) */}
            <div style={{ position: 'relative' }} ref={moreMenuRef}>
              <button
                onClick={() => setShowMoreMenu(prev => !prev)}
                title={t('admin.customersView.moreActions')}
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
                  width: '200px',
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
                    <span>{t('admin.customersView.exportExcel')}</span>
                  </button>
                  <button
                    onClick={handlePrintList}
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
                    <Printer size={15} color={THEME.slateMuted} />
                    <span>{t('admin.customersView.printList')}</span>
                  </button>
                  {selectedRows.length > 0 && (
                    <button
                      onClick={handleDeleteSelected}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '13px',
                        color: '#ef4444',
                        border: 'none',
                        borderTop: `1px solid ${THEME.border}`,
                        background: 'none',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fee2e2'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Trash2 size={15} color="#ef4444" />
                      <span>{t('admin.customersView.deleteSelected')} ({selectedRows.length})</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 3-Bars / Sliders Column Customizer Button */}
            <button
              onClick={() => setShowColumnModal(true)}
              title={t('admin.customersView.columnsCustomizer')}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                color: THEME.forest,
                border: `1px solid ${THEME.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = THEME.lightFoam; e.currentTarget.style.borderColor = THEME.forest; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = THEME.border; }}
            >
              <SlidersHorizontal size={17} />
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            TABLE WITH DYNAMIC COLUMNS & SUMMARY ROW
        ═══════════════════════════════════════════════════════════ */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: `1px solid ${THEME.border}`,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              {/* Table Header */}
              <thead>
                <tr style={{
                  backgroundColor: '#f1f5f9',
                  borderBottom: `2px solid ${THEME.border}`,
                  position: 'sticky',
                  top: 0,
                  zIndex: 10
                }}>
                  {/* Select All Checkbox */}
                  <th style={{ width: '42px', padding: '12px 14px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleToggleSelectAll}
                      style={{ accentColor: THEME.forest, width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                  </th>

                  {/* Dynamic Columns */}
                  {visibleColumns.map(colId => {
                    const isRight = ['receivable', 'total_purchase', 'purchase_without_returns', 'points', 'total_points'].includes(colId);
                    return (
                      <th
                        key={colId}
                        style={{
                          padding: '12px 14px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          color: '#334155',
                          whiteSpace: 'nowrap',
                          textAlign: isRight ? 'right' : 'left'
                        }}
                      >
                        {getColumnHeaderLabel(colId)}
                      </th>
                    );
                  })}

                  {/* Actions Column */}
                  <th style={{ width: '80px', padding: '12px 14px', textAlign: 'center', fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
                    {t('admin.customersView.actions')}
                  </th>
                </tr>

                {/* Summary Row directly below Header (Matching Image 1) */}
                <tr style={{
                  backgroundColor: '#f8fafc',
                  borderBottom: `1px solid ${THEME.border}`,
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#0f172a'
                }}>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>—</td>
                  {visibleColumns.map(colId => {
                    if (colId === 'receivable') {
                      return (
                        <td key={colId} style={{ padding: '10px 14px', textAlign: 'right', color: '#0f172a' }}>
                          {summaries.receivable.toLocaleString('vi-VN')}
                        </td>
                      );
                    }
                    if (colId === 'total_purchase') {
                      return (
                        <td key={colId} style={{ padding: '10px 14px', textAlign: 'right', color: '#0f172a' }}>
                          {summaries.total_purchase.toLocaleString('vi-VN')}
                        </td>
                      );
                    }
                    if (colId === 'purchase_without_returns') {
                      return (
                        <td key={colId} style={{ padding: '10px 14px', textAlign: 'right', color: '#0f172a' }}>
                          {summaries.purchase_without_returns.toLocaleString('vi-VN')}
                        </td>
                      );
                    }
                    if (colId === 'points') {
                      return (
                        <td key={colId} style={{ padding: '10px 14px', textAlign: 'right', color: '#059669' }}>
                          {summaries.points.toLocaleString('vi-VN')}
                        </td>
                      );
                    }
                    if (colId === 'total_points') {
                      return (
                        <td key={colId} style={{ padding: '10px 14px', textAlign: 'right', color: '#059669' }}>
                          {summaries.total_points.toLocaleString('vi-VN')}
                        </td>
                      );
                    }
                    return <td key={colId} style={{ padding: '10px 14px' }}></td>;
                  })}
                  <td style={{ padding: '10px 14px' }}></td>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {paginatedCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={visibleColumns.length + 2} style={{ padding: '50px 20px', textAlign: 'center', color: THEME.slateMuted }}>
                      <User size={36} style={{ display: 'block', margin: '0 auto 10px', opacity: 0.3 }} />
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>{t('admin.customersView.noDataFound')}</div>
                    </td>
                  </tr>
                ) : (
                  paginatedCustomers.map((c) => {
                    const isSelected = selectedRows.includes(c.id);
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
                            onChange={() => handleToggleSelectRow(c.id)}
                            style={{ accentColor: THEME.forest, width: '15px', height: '15px', cursor: 'pointer' }}
                          />
                        </td>

                        {/* Visible Columns */}
                        {visibleColumns.map(colId => {
                          const isRight = ['receivable', 'total_purchase', 'purchase_without_returns', 'points', 'total_points'].includes(colId);
                          return (
                            <td
                              key={colId}
                              style={{
                                padding: '10px 14px',
                                textAlign: isRight ? 'right' : 'left',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {renderCellContent(colId, c)}
                            </td>
                          );
                        })}

                        {/* Actions */}
                        <td style={{ padding: '10px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              onClick={() => handleOpenEditCustomer(c)}
                              title={t('edit')}
                              style={{
                                padding: '5px 7px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: THEME.lightFoam,
                                color: THEME.forest,
                                cursor: 'pointer',
                                transition: 'opacity 0.15s ease'
                              }}
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteCustomer(c)}
                              title={t('delete')}
                              style={{
                                padding: '5px 7px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: '#fee2e2',
                                color: '#ef4444',
                                cursor: 'pointer',
                                transition: 'opacity 0.15s ease'
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              PAGINATION FOOTER (Matching Image 1)
          ═══════════════════════════════════════════════════════════ */}
          <div style={{
            padding: '10px 18px',
            borderTop: `1px solid ${THEME.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '16px',
            backgroundColor: '#ffffff',
            fontSize: '13px',
            color: THEME.slateBody
          }}>
            {/* Page Size Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: `1px solid ${THEME.border}`,
                  fontSize: '13px',
                  outline: 'none',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>{t('admin.customersView.row')}</span>
            </div>

            {/* Prev / Next Page */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  border: `1px solid ${THEME.border}`,
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage <= 1 ? 0.4 : 1
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  border: `1px solid ${THEME.border}`,
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage >= totalPages ? 0.4 : 1
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Showing Range */}
            <div style={{ color: THEME.slateMuted, fontWeight: 500 }}>
              {startIndex} - {endIndex} {t('admin.customersView.inTotal')} {filteredCustomers.length}
            </div>
          </div>
        </div>

      </main>

      {/* ═══════════════════════════════════════════════════════════
          MODAL: COLUMN CUSTOMIZER (Exact Match to Image 2)
      ═══════════════════════════════════════════════════════════ */}
      {showColumnModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15,23,42,0.5)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            width: '740px',
            maxWidth: '96vw',
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: `1px solid ${THEME.border}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '16px 22px',
              borderBottom: `1px solid ${THEME.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#fafafa'
            }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: THEME.slateDark, margin: 0 }}>
                  {t('admin.customersView.columnsCustomizer')}
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleSelectAllColumns}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    border: `1px solid ${THEME.border}`,
                    backgroundColor: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {t('admin.customersView.selectAll')}
                </button>
                <button
                  type="button"
                  onClick={handleResetDefaultColumns}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    border: `1px solid ${THEME.border}`,
                    backgroundColor: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {t('admin.customersView.defaultColumns')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowColumnModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: THEME.slateMuted,
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body: 3-column Grid Matching Image 2 */}
            <div style={{
              padding: '24px 28px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px 20px',
              maxHeight: '68vh',
              overflowY: 'auto'
            }}>
              {columnColumns.map((colGroup, colIdx) => (
                <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {colGroup.map(item => {
                    const isChecked = visibleColumns.includes(item.id);
                    return (
                      <label
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          color: isChecked ? THEME.slateDark : THEME.slateBody,
                          fontWeight: isChecked ? 600 : 400,
                          userSelect: 'none'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleColumn(item.id)}
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '4px',
                            accentColor: THEME.forest,
                            cursor: 'pointer'
                          }}
                        />
                        <span>{item.label}</span>
                      </label>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{
              padding: '14px 24px',
              borderTop: `1px solid ${THEME.border}`,
              backgroundColor: '#fafafa',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px'
            }}>
              <button
                type="button"
                onClick={() => setShowColumnModal(false)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  backgroundColor: THEME.forest,
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(27,94,32,0.2)'
                }}
              >
                {t('admin.customersView.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODAL: ADD / EDIT CUSTOMER (No Membership Tier!)
      ═══════════════════════════════════════════════════════════ */}
      {showCustomerModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15,23,42,0.5)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            width: '640px',
            maxWidth: '96vw',
            maxHeight: '92vh',
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: `1px solid ${THEME.border}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: `1px solid ${THEME.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#fafafa'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: THEME.lightFoam, color: THEME.forest, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: THEME.slateDark, margin: 0 }}>
                    {editingCustomer ? t('admin.customersView.editTitle') : t('admin.customersView.addTitle')}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomerModal(false)}
                style={{ background: 'none', border: 'none', color: THEME.slateMuted, cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveCustomer} style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Row 1: Code & Customer Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: THEME.slateDark, marginBottom: '5px' }}>
                    {t('admin.customersView.colCustomerId')}
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={e => setFormCode(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${THEME.border}`, fontSize: '13px', fontFamily: 'monospace' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: THEME.slateDark, marginBottom: '5px' }}>
                    {t('admin.customersView.colCustomerType')}
                  </label>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="customer_type"
                        value="individual"
                        checked={formType === 'individual'}
                        onChange={() => setFormType('individual')}
                        style={{ accentColor: THEME.forest }}
                      />
                      <span>{t('admin.customersView.individual')}</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="customer_type"
                        value="company"
                        checked={formType === 'company'}
                        onChange={() => setFormType('company')}
                        style={{ accentColor: THEME.forest }}
                      />
                      <span>{t('admin.customersView.corporate')}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Row 2: Name & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: THEME.slateDark, marginBottom: '5px' }}>
                    {t('admin.customersView.colName')} <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: PHAM THI DOAN TRANG"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${THEME.border}`, fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: THEME.slateDark, marginBottom: '5px' }}>
                    {t('admin.customersView.colPhone')}
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 0949393043"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${THEME.border}`, fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Row 3: Email & Identification Code */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: THEME.slateDark, marginBottom: '5px' }}>
                    {t('admin.customersView.colEmail')}
                  </label>
                  <input
                    type="email"
                    placeholder="VD: doantrang@gmail.com"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${THEME.border}`, fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: THEME.slateDark, marginBottom: '5px' }}>
                    {t('admin.customersView.colIdCode')} (CCCD / CMND)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 079195000123"
                    value={formIdCode}
                    onChange={e => setFormIdCode(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${THEME.border}`, fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Row 4: Gender & Birthday & Customer Group */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: THEME.slateDark, marginBottom: '5px' }}>
                    {t('admin.customersView.colGender')}
                  </label>
                  <select
                    value={formGender}
                    onChange={e => setFormGender(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${THEME.border}`, fontSize: '13px', backgroundColor: '#fff' }}
                  >
                    <option value="male">{t('admin.customersView.male')}</option>
                    <option value="female">{t('admin.customersView.female')}</option>
                    <option value="other">{t('admin.customersView.otherGender')}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: THEME.slateDark, marginBottom: '5px' }}>
                    {t('admin.customersView.colBirthday')}
                  </label>
                  <input
                    type="date"
                    value={formBirthday}
                    onChange={e => setFormBirthday(e.target.value)}
                    style={{ width: '100%', padding: '7.5px 12px', borderRadius: '8px', border: `1px solid ${THEME.border}`, fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: THEME.slateDark, marginBottom: '5px' }}>
                    {t('admin.customersView.colCustomerGroup')}
                  </label>
                  <input
                    type="text"
                    list="customer_group_options"
                    value={formGroup}
                    onChange={e => setFormGroup(e.target.value)}
                    placeholder="VD: Khách lẻ, VIP..."
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${THEME.border}`, fontSize: '13px' }}
                  />
                  <datalist id="customer_group_options">
                    {availableGroups.map(g => (
                      <option key={g} value={g} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Row 5: Company & Tax Code */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: THEME.slateDark, marginBottom: '5px' }}>
                    {t('admin.customersView.colCompany')}
                  </label>
                  <input
                    type="text"
                    placeholder="Tên công ty hoặc cơ quan"
                    value={formCompany}
                    onChange={e => setFormCompany(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${THEME.border}`, fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: THEME.slateDark, marginBottom: '5px' }}>
                    {t('admin.customersView.colTaxCode')}
                  </label>
                  <input
                    type="text"
                    placeholder="Mã số thuế"
                    value={formTaxCode}
                    onChange={e => setFormTaxCode(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${THEME.border}`, fontSize: '13px', fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              {/* Row 6: Address */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: THEME.slateDark, marginBottom: '5px' }}>
                  {t('admin.customersView.colAddress')}
                </label>
                <input
                  type="text"
                  placeholder="Địa chỉ số nhà, đường, phường/xã..."
                  value={formAddress}
                  onChange={e => setFormAddress(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${THEME.border}`, fontSize: '13px' }}
                />
              </div>

              {/* Row 7: Note */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: THEME.slateDark, marginBottom: '5px' }}>
                  {t('admin.customersView.colNote')}
                </label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú sở thích khách hàng, lưu ý phục vụ..."
                  value={formNote}
                  onChange={e => setFormNote(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${THEME.border}`, fontSize: '13px', resize: 'vertical' }}
                />
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px', paddingTop: '12px', borderTop: `1px solid ${THEME.border}` }}>
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(false)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    border: `1px solid ${THEME.border}`,
                    backgroundColor: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '9px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: THEME.forest,
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(27,94,32,0.2)'
                  }}
                >
                  {editingCustomer ? t('update') : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODAL: QUICK CREATE CUSTOMER GROUP
      ═══════════════════════════════════════════════════════════ */}
      {showNewGroupModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15,23,42,0.5)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1050,
          padding: '20px'
        }}>
          <div style={{
            width: '380px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            padding: '20px',
            border: `1px solid ${THEME.border}`
          }}>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: THEME.slateDark, margin: '0 0 12px 0' }}>
              {t('admin.customersView.createNewGroup')}
            </h4>
            <form onSubmit={handleCreateGroup}>
              <input
                type="text"
                autoFocus
                required
                placeholder="Nhập tên nhóm (VD: Khách sỉ, Khách VIP...)"
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${THEME.border}`, fontSize: '13px', marginBottom: '14px', outline: 'none' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewGroupModal(false)}
                  style={{ padding: '7px 14px', borderRadius: '6px', border: `1px solid ${THEME.border}`, background: '#fff', fontSize: '12.5px', cursor: 'pointer' }}
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  style={{ padding: '7px 16px', borderRadius: '6px', border: 'none', background: THEME.forest, color: '#fff', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODAL: CONFIRM DELETE CUSTOMER
      ═══════════════════════════════════════════════════════════ */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteConfirmTarget)}
        onClose={() => setDeleteConfirmTarget(null)}
        onConfirm={confirmDeleteAction}
        title={t('admin.customersView.confirmDeleteTitle') || 'Xác nhận xóa khách hàng'}
        message={t('admin.customersView.confirmDeleteMsg') || 'Bạn có chắc chắn muốn xóa khách hàng này không?'}
        itemName={deleteConfirmTarget ? `${deleteConfirmTarget.name} (${deleteConfirmTarget.code})` : ''}
        warningText={t('cannotUndo') || 'Hành động này không thể hoàn tác.'}
        confirmText={t('confirmDelete') || 'Xóa khách hàng'}
        cancelText={t('cancel') || 'Hủy'}
      />

      {/* MODAL: CONFIRM DELETE MULTIPLE SELECTED CUSTOMERS */}
      <ConfirmDeleteModal
        isOpen={deleteSelectedConfirmOpen}
        onClose={() => setDeleteSelectedConfirmOpen(false)}
        onConfirm={confirmDeleteSelectedAction}
        title={t('admin.customersView.confirmDeleteSelectedTitle') || 'Xác nhận xóa khách hàng đã chọn'}
        message={(t('admin.customersView.deleteSelectedConfirm') || 'Bạn có chắc muốn xóa {count} khách hàng đã chọn?').replace('{count}', selectedRows.length)}
        warningText={t('cannotUndo') || 'Hành động này không thể hoàn tác.'}
        confirmText={t('confirmDelete') || 'Xóa'}
        cancelText={t('cancel') || 'Hủy'}
        loading={isDeletingSelected}
      />

    </div>
  );
}
export default CustomersView;

