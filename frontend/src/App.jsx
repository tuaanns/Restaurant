import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { AreaFilterBar } from './components/AreaFilterBar';
import { TableGrid } from './components/TableGrid';
import { OrderPanel } from './components/OrderPanel';
import { FooterShortcuts } from './components/FooterShortcuts';

// Auth & Admin components
import { LoginPage } from './components/auth/LoginPage';
import { AdminDashboard } from './components/admin/AdminDashboard';

// Modals
import { MenuModal } from './components/modals/MenuModal';
import { KitchenTicketModal } from './components/modals/KitchenTicketModal';
import { PreBillModal } from './components/modals/PreBillModal';
import { PaymentModal } from './components/modals/PaymentModal';
import { TransferTableModal } from './components/modals/TransferTableModal';
import { CustomerModal } from './components/modals/CustomerModal';
import { ItemNoteModal } from './components/modals/ItemNoteModal';
import { ConfirmDeleteModal } from './components/modals/ConfirmDeleteModal';

import { useLanguage } from './i18n/LanguageContext';
import { api } from './api';
import { initialMockData } from './mockData';

export function App() {
  const { t, formatTableName } = useLanguage();
  const [isClearOrderModalOpen, setIsClearOrderModalOpen] = useState(false);
  // === AUTHENTICATION & ROLE STATE ===
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('pos_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [currentView, setCurrentView] = useState('pos'); // 'pos' hoặc 'admin'
  const [activeTab, setActiveTab] = useState('tables');
  const [selectedArea, setSelectedArea] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [areas, setAreas] = useState(initialMockData.areas);
  const [tables, setTables] = useState(initialMockData.tables);
  const [summary, setSummary] = useState(initialMockData.summary);
  const [menuCategories, setMenuCategories] = useState(initialMockData.menuList);
  const [customers, setCustomers] = useState([]);

  // Selected table & order (Ban đầu chưa chọn bàn nào, chỉ khi click chọn bàn mới hiển thị)
  const [selectedTable, setSelectedTable] = useState(null);
  const [order, setOrder] = useState(null);

  // Modals
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isKitchenOpen, setIsKitchenOpen] = useState(false);
  const [isPreBillOpen, setIsPreBillOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const searchInputRef = useRef(null);

  // Fetch data from Laravel API on mount
  const loadData = async () => {
    try {
      const res = await api.getTables();
      if (res && res.tables) {
        setTables(res.tables);
        if (res.areas) setAreas(res.areas);
        if (res.summary) setSummary(res.summary);

        if (selectedTable) {
          const matchingTable = res.tables.find(t => t.id === selectedTable.id);
          if (matchingTable) {
            setSelectedTable(matchingTable);
          }
        }
      }
    } catch (err) {
      console.info('Laravel backend data sync:', err);
    }

    try {
      const menuRes = await api.getMenu();
      if (menuRes && menuRes.categories) {
        setMenuCategories(menuRes.categories);
      }
    } catch (err) {}

    try {
      const custRes = await api.getCustomers();
      if (custRes && custRes.customers) {
        setCustomers(custRes.customers);
      }
    } catch (err) {}
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  // Auth Handlers
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setCurrentView('pos'); // Mặc định vào POS hoặc có thể chuyển Admin
    } else {
      setCurrentView('pos');
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setCurrentView('pos');
  };

  // Chọn bàn
  const handleSelectTable = async (table) => {
    setSelectedTable(table);
    try {
      const res = await api.getTableOrder(table.id);
      if (res && res.order) {
        setOrder(res.order);
      }
    } catch (err) {
      if (table.order && table.order.items) {
        setOrder(table.order);
      } else {
        setOrder({
          id: Date.now(),
          order_code: `ORD-${table.name.replace(/\s+/g, '')}`,
          table_id: table.id,
          subtotal: 0,
          discount_percent: 0,
          discount_amount: 0,
          vat_percent: 8,
          vat_amount: 0,
          total_amount: 0,
          items: []
        });
      }
    }
  };

  // Cập nhật số lượng món
  const handleUpdateQuantity = async (itemId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    try {
      const res = await api.updateItem(itemId, { quantity: newQty });
      if (res && res.order) {
        setOrder(res.order);
        loadData();
        return;
      }
    } catch (err) {}

    // Fallback state
    setOrder(prev => {
      if (!prev) return prev;
      const updatedItems = prev.items.map(it => {
        if (it.id === itemId) {
          const subtotal = it.price * newQty;
          return { ...it, quantity: newQty, subtotal };
        }
        return it;
      });
      const subtotal = updatedItems.reduce((acc, it) => acc + (it.subtotal || 0), 0);
      const discountAmount = Math.round(subtotal * ((prev.discount_percent || 0) / 100));
      const vatAmount = Math.round((subtotal - discountAmount) * ((prev.vat_percent || 8) / 100));
      const totalAmount = subtotal - discountAmount + vatAmount;

      return {
        ...prev,
        items: updatedItems,
        subtotal,
        discount_amount: discountAmount,
        vat_amount: vatAmount,
        total_amount: totalAmount,
      };
    });
  };

  // Xoá món
  const handleRemoveItem = async (itemId) => {
    try {
      const res = await api.deleteItem(itemId);
      if (res && res.order) {
        setOrder(res.order);
        // Nếu còn 0 món thì reset bàn về empty
        if (res.order.items && res.order.items.length === 0) {
          setTables(prev => prev.map(t => {
            if (t.id === selectedTable?.id) {
              return { ...t, status: 'empty', guest_count: 0, started_at: null, notes: null };
            }
            return t;
          }));
          setSelectedTable(prev => prev ? { ...prev, status: 'empty', guest_count: 0, started_at: null, notes: null } : prev);
        }
        loadData();
        return;
      }
    } catch (err) {}

    setOrder(prev => {
      if (!prev) return prev;
      const updatedItems = prev.items.filter(it => it.id !== itemId);
      const subtotal = updatedItems.reduce((acc, it) => acc + (it.subtotal || 0), 0);
      const discountAmount = Math.round(subtotal * ((prev.discount_percent || 0) / 100));
      const vatAmount = Math.round((subtotal - discountAmount) * ((prev.vat_percent || 8) / 100));
      const totalAmount = subtotal - discountAmount + vatAmount;

      // Nếu 0 món, reset bàn về empty luôn (fallback offline)
      if (updatedItems.length === 0) {
        setTables(prevTables => prevTables.map(t => {
          if (t.id === selectedTable?.id) {
            return { ...t, status: 'empty', guest_count: 0, started_at: null, notes: null };
          }
          return t;
        }));
        setSelectedTable(prevT => prevT ? { ...prevT, status: 'empty', guest_count: 0, started_at: null, notes: null } : prevT);
      }

      return {
        ...prev,
        items: updatedItems,
        subtotal,
        discount_amount: discountAmount,
        vat_amount: vatAmount,
        total_amount: totalAmount,
      };
    });
  };

  // Thêm món vào bàn
  const handleAddItemToOrder = async (product, quantity = 1, note = '') => {
    if (!order) return;
    try {
      const res = await api.addItem(order.id, {
        product_id: product.id,
        quantity,
        note
      });
      if (res && res.order) {
        setOrder(res.order);
        loadData();
        return;
      }
    } catch (err) {}

    // Fallback
    setOrder(prev => {
      if (!prev) return prev;
      const existing = prev.items.find(it => it.product_id === product.id && it.note === note && it.status === 'new_pending');
      let newItems = [];
      if (existing) {
        newItems = prev.items.map(it => {
          if (it.id === existing.id) {
            const q = it.quantity + quantity;
            return { ...it, quantity: q, subtotal: q * it.price };
          }
          return it;
        });
      } else {
        const newItem = {
          id: Date.now(),
          order_id: prev.id,
          product_id: product.id,
          product_name: product.name,
          unit: product.unit || 'phần',
          quantity,
          price: product.price,
          subtotal: product.price * quantity,
          note,
          status: 'new_pending',
          is_auto_added: false
        };
        newItems = [...prev.items, newItem];
      }

      const subtotal = newItems.reduce((acc, it) => acc + (it.subtotal || 0), 0);
      const discountAmount = Math.round(subtotal * ((prev.discount_percent || 0) / 100));
      const vatAmount = Math.round((subtotal - discountAmount) * ((prev.vat_percent || 8) / 100));
      const totalAmount = subtotal - discountAmount + vatAmount;

      return {
        ...prev,
        items: newItems,
        subtotal,
        discount_amount: discountAmount,
        vat_amount: vatAmount,
        total_amount: totalAmount,
      };
    });

    setTables(prev => prev.map(t => {
      if (t.id === selectedTable.id) {
        return {
          ...t,
          status: 'occupied',
          guest_count: t.guest_count > 0 ? t.guest_count : 2,
          notes: `${(order?.items?.length || 0) + 1} món`
        };
      }
      return t;
    }));
  };

  // Báo Bếp (F10)
  const handleConfirmSendKitchen = async () => {
    if (!order) return;
    try {
      const res = await api.sendToKitchen(order.id);
      if (res && res.order) {
        setOrder(res.order);
        loadData();
      }
    } catch (err) {}

    setOrder(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map(it => ({
          ...it,
          status: 'sent_kitchen'
        }))
      };
    });
  };

  // In Tạm Tính
  const handleConfirmPrintPreBill = async () => {
    if (!order) return;
    try {
      const res = await api.printPreBill(order.id);
      if (res && res.order) {
        setOrder(res.order);
        loadData();
      }
    } catch (err) {}

    setTables(prev => prev.map(t => {
      if (t.id === selectedTable.id) {
        return { ...t, status: 'billing', notes: 'Đã in tạm tính' };
      }
      return t;
    }));
    setSelectedTable(prev => prev ? { ...prev, status: 'billing' } : prev);
  };

  // Thanh Toán (F9)
  const handleConfirmCheckout = async (paymentData) => {
    if (!order) return;
    try {
      await api.checkout(order.id, paymentData);
      loadData();
    } catch (err) {}

    setTables(prev => prev.map(t => {
      if (t.id === selectedTable.id) {
        return {
          ...t,
          status: 'empty',
          guest_count: 0,
          started_at: null,
          duration: null,
          notes: null,
          order: null
        };
      }
      return t;
    }));

    setSelectedTable(prev => prev ? {
      ...prev,
      status: 'empty',
      guest_count: 0,
      started_at: null,
      duration: null,
      notes: null,
      order: null
    } : prev);

    setOrder({
      id: Date.now(),
      order_code: `ORD-${Date.now().toString().slice(-4)}`,
      table_id: selectedTable.id,
      subtotal: 0,
      discount_percent: 0,
      discount_amount: 0,
      vat_percent: 8,
      vat_amount: 0,
      total_amount: 0,
      items: []
    });
  };

  // Chuyển Bàn
  const handleConfirmTransfer = async (fromId, toId) => {
    try {
      await api.transferTable(fromId, toId);
      loadData();
    } catch (err) {}

    const target = tables.find(t => t.id === toId);
    if (target) {
      setTables(prev => prev.map(t => {
        if (t.id === toId) {
          return {
            ...t,
            status: selectedTable.status,
            guest_count: selectedTable.guest_count,
            started_at: selectedTable.started_at,
            duration: selectedTable.duration,
            notes: selectedTable.notes,
            order: selectedTable.order
          };
        }
        if (t.id === fromId) {
          return {
            ...t,
            status: 'empty',
            guest_count: 0,
            started_at: null,
            duration: null,
            notes: null,
            order: null
          };
        }
        return t;
      }));

      setSelectedTable({
        ...target,
        status: selectedTable.status,
        guest_count: selectedTable.guest_count,
        started_at: selectedTable.started_at,
        duration: selectedTable.duration,
        notes: selectedTable.notes,
      });
    }
  };

  // Chọn khách hàng & chiết khấu
  const handleSelectCustomer = async (custId) => {
    try {
      const res = await api.updateCustomer(order.id, custId);
      if (res && res.order) {
        setOrder(res.order);
        return;
      }
    } catch (err) {}

    const c = customers.find(x => x.id === custId);
    if (c) {
      setOrder(prev => {
        if (!prev) return prev;
        const discountAmount = Math.round(prev.subtotal * (c.discount_percent / 100));
        const vatAmount = Math.round((prev.subtotal - discountAmount) * (prev.vat_percent / 100));
        return {
          ...prev,
          customer: c,
          discount_percent: c.discount_percent,
          discount_amount: discountAmount,
          vat_amount: vatAmount,
          total_amount: prev.subtotal - discountAmount + vatAmount
        };
      });
    }
  };

  // Lưu ghi chú món
  const handleSaveItemNote = async (itemId, note) => {
    try {
      const res = await api.updateItem(itemId, { note });
      if (res && res.order) {
        setOrder(res.order);
        return;
      }
    } catch (err) {}

    setOrder(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map(it => it.id === itemId ? { ...it, note } : it)
      };
    });
  };

  // Huỷ đơn - mở popup xác nhận hoàn chỉnh
  const handleClearOrder = () => {
    if (!selectedTable) return;
    setIsClearOrderModalOpen(true);
  };

  const handleConfirmClearOrder = async () => {
    setIsClearOrderModalOpen(false);

    // Reset local state ngay lập tức để UI phản hồi nhanh
    setOrder(prev => prev ? {
      ...prev,
      subtotal: 0,
      discount_amount: 0,
      vat_amount: 0,
      total_amount: 0,
      items: []
    } : prev);

    // Reset trạng thái bàn về empty
    setTables(prev => prev.map(t => {
      if (t.id === selectedTable?.id) {
        return { ...t, status: 'empty', guest_count: 0, started_at: null, notes: null, order: null };
      }
      return t;
    }));
    setSelectedTable(prev => prev ? {
      ...prev,
      status: 'empty',
      guest_count: 0,
      started_at: null,
      notes: null,
      order: null
    } : prev);

    // Gọi API backend để xoá order + reset bàn trong DB
    try {
      if (order?.id) {
        await api.clearOrder(order.id);
      }
      loadData(); // Reload để đồng bộ summary (số Bàn trống, Có khách...)
    } catch (err) {
      console.warn('clearOrder API error (offline fallback applied):', err);
    }
  };

  // Khôi phục dữ liệu bàn về trống
  const handleResetDemo = async () => {
    try {
      await api.resetDemo();
      await loadData();
    } catch (err) {
      setTables(initialMockData.tables);
      setSelectedTable(null);
      setOrder(null);
      setSummary(initialMockData.summary);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!currentUser) return;
      if (e.key === 'F1') {
        e.preventDefault();
        setCurrentView('pos');
        setActiveTab('tables');
        setIsMenuOpen(false);
      } else if (e.key === 'F2') {
        e.preventDefault();
        setIsMenuOpen(prev => !prev);
      } else if (e.key === 'F3') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F4') {
        e.preventDefault();
        setIsCustomerOpen(prev => !prev);
      } else if (e.key === 'F9') {
        e.preventDefault();
        setIsPaymentOpen(true);
      } else if (e.key === 'F10') {
        e.preventDefault();
        setIsKitchenOpen(true);
      } else if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsKitchenOpen(false);
        setIsPreBillOpen(false);
        setIsPaymentOpen(false);
        setIsTransferOpen(false);
        setIsCustomerOpen(false);
        setEditingItem(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUser]);

  // NẾU CHƯA ĐĂNG NHẬP -> HIỂN THỊ TRANG ĐĂNG NHẬP
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* 1. Header Bar (Có menu xổ xuống và nút Đăng Xuất) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onResetDemo={handleResetDemo}
        onOpenMenu={() => setIsMenuOpen(true)}
        searchInputRef={searchInputRef}
        currentUser={currentUser}
        onLogout={handleLogout}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* 2. Main View (POS View HOẶC Admin Dashboard) */}
      {currentView === 'admin' && currentUser.role === 'admin' ? (
        <AdminDashboard
          currentUser={currentUser}
          onBackToPos={() => setCurrentView('pos')}
        />
      ) : (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Cột Trái: Bộ lọc khu vực & Lưới bàn */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <AreaFilterBar
              areas={areas}
              selectedArea={selectedArea}
              onSelectArea={setSelectedArea}
              summary={summary}
              statusFilter={statusFilter}
              onSelectStatusFilter={setStatusFilter}
            />

            <TableGrid
              tables={tables}
              selectedTable={selectedTable}
              onSelectTable={handleSelectTable}
              selectedArea={selectedArea}
              statusFilter={statusFilter}
              searchQuery={searchQuery}
            />
          </div>

          {/* Cột Phải: Bảng Chi Tiết Order */}
          <OrderPanel
            selectedTable={selectedTable}
            order={order}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onOpenKitchenModal={() => setIsKitchenOpen(true)}
            onOpenPreBillModal={() => setIsPreBillOpen(true)}
            onOpenCheckoutModal={() => setIsPaymentOpen(true)}
            onOpenTransferModal={() => setIsTransferOpen(true)}
            onOpenCustomerModal={() => setIsCustomerOpen(true)}
            onOpenMenuModal={() => setIsMenuOpen(true)}
            onClearOrder={handleClearOrder}
            onEditItemNote={(item) => setEditingItem(item)}
          />
        </div>
      )}

      {/* 3. Bottom Shortcuts Footer */}
      {currentView === 'pos' && (
        <FooterShortcuts
          onTriggerShortcut={(key) => {
            if (key === 'F1') { setActiveTab('tables'); setIsMenuOpen(false); }
            if (key === 'F2') setIsMenuOpen(true);
            if (key === 'F3') searchInputRef.current?.focus();
            if (key === 'F4') setIsCustomerOpen(true);
            if (key === 'F9') setIsPaymentOpen(true);
            if (key === 'F10') setIsKitchenOpen(true);
          }}
        />
      )}

      {/* Modals */}
      <MenuModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        menuCategories={menuCategories}
        selectedTable={selectedTable}
        onAddItemToOrder={handleAddItemToOrder}
      />

      <KitchenTicketModal
        isOpen={isKitchenOpen}
        onClose={() => setIsKitchenOpen(false)}
        selectedTable={selectedTable}
        order={order}
        onConfirmSendKitchen={handleConfirmSendKitchen}
      />

      <PreBillModal
        isOpen={isPreBillOpen}
        onClose={() => setIsPreBillOpen(false)}
        selectedTable={selectedTable}
        order={order}
        onConfirmPrintPreBill={handleConfirmPrintPreBill}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        selectedTable={selectedTable}
        order={order}
        onConfirmCheckout={handleConfirmCheckout}
      />

      <TransferTableModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        currentTable={selectedTable}
        tables={tables}
        onConfirmTransfer={handleConfirmTransfer}
      />

      <CustomerModal
        isOpen={isCustomerOpen}
        onClose={() => setIsCustomerOpen(false)}
        customers={customers}
        currentCustomerId={order?.customer?.id}
        onSelectCustomer={handleSelectCustomer}
      />

      <ItemNoteModal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        item={editingItem}
        onSaveNote={handleSaveItemNote}
      />

      {/* Modal xác nhận huỷ toàn bộ đơn bàn (Custom Dialog hoàn chỉnh) */}
      <ConfirmDeleteModal
        isOpen={isClearOrderModalOpen}
        onClose={() => setIsClearOrderModalOpen(false)}
        onConfirm={handleConfirmClearOrder}
        title={t('order.confirmClearOrderTitle')}
        message={t('order.confirmClear')}
        itemName={formatTableName(selectedTable?.name)}
        warningText={t('order.confirmClearOrderWarning')}
        confirmText={t('order.clearOrder')}
        cancelText={t('cancel')}
      />
    </div>
  );
}

export default App;
