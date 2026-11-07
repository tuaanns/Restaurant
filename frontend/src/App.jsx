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
import { PromotionModal } from './components/modals/PromotionModal';
import { SplitOrderModal } from './components/modals/SplitOrderModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

import { useLanguage } from './i18n/LanguageContext';
import { api } from './api';
import { initialMockData } from './mockData';

export function App() {
  const { t, formatTableName } = useLanguage();
  const [isClearOrderModalOpen, setIsClearOrderModalOpen] = useState(false);
  // === AUTHENTICATION & ROLE STATE ===
  // Bắt buộc phải đăng nhập khi vừa mở web/app. Phiên đăng nhập chỉ duy trì trong tab qua sessionStorage
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      localStorage.removeItem('pos_user');
      localStorage.removeItem('pos_token');
      const saved = sessionStorage.getItem('pos_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [currentView, setCurrentView] = useState('pos'); // 'pos' hoặc 'admin'
  const [adminTab, setAdminTab] = useState('overview');
  const [activeTab, setActiveTab] = useState('tables');
  const [selectedArea, setSelectedArea] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // === RESPONSIVE MOBILE STATE ===
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 900 : false);
  const [mobileTab, setMobileTab] = useState('tables'); // 'tables' | 'order'

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
  const [isPromotionOpen, setIsPromotionOpen] = useState(false);
  const [isSplitOrderOpen, setIsSplitOrderOpen] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

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

    try {
      const promoRes = await api.getPosPromotions();
      if (promoRes && promoRes.promotions) {
        setPromotions(promoRes.promotions);
      }
    } catch (err) {}

    // Đồng bộ thông tin user mới nhất từ máy chủ
    try {
      const usersRes = await api.getUsers();
      if (usersRes && Array.isArray(usersRes.users) && currentUser) {
        const found = usersRes.users.find(u => 
          (currentUser.id && Number(u.id) === Number(currentUser.id)) ||
          (currentUser.username && u.username === currentUser.username)
        );
        if (found) {
          setCurrentUser(prev => {
            const merged = { ...prev, ...found };
            try {
              sessionStorage.setItem('pos_user', JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }
      }
    } catch (err) {}
  };

  useEffect(() => {
    if (currentUser?.id) {
      loadData();
    }
  }, [currentUser?.id]);

  // Auth Handlers
  const handleLoginSuccess = (user) => {
    try {
      sessionStorage.setItem('pos_user', JSON.stringify(user));
      localStorage.removeItem('pos_user');
      localStorage.removeItem('pos_token');
    } catch (e) {}
    setCurrentUser(user);
    if (user.role === 'admin') {
      setCurrentView('pos'); // Mặc định vào POS hoặc có thể chuyển Admin
    } else {
      setCurrentView('pos');
    }
  };

  const handleLogout = async () => {
    await api.logout();
    try {
      sessionStorage.removeItem('pos_user');
      sessionStorage.removeItem('pos_token');
      localStorage.removeItem('pos_user');
      localStorage.removeItem('pos_token');
    } catch (e) {}
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

  // In trực tiếp phiếu báo bếp K80 qua iframe ngầm, không mở modal xem trước hay dialog khổ in
  const printDirectKitchenSlip = (tableName, items) => {
    try {
      let iframe = document.getElementById('silent-kitchen-print-frame');
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'silent-kitchen-print-frame';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);
      }

      const now = new Date();
      const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toLocaleDateString('vi-VN');
      const ticketCode = 'BEP-' + now.getTime().toString().slice(-6);

      const rowsHtml = items.map((it, idx) => `
        <tr>
          <td style="padding: 4px 0; font-size: 12px; vertical-align: top;">${idx + 1}.</td>
          <td style="padding: 4px 4px; font-size: 12.5px; font-weight: bold; vertical-align: top;">
            ${it.product_name || it.name}
            ${it.note ? `<div style="font-size: 10.5px; font-weight: normal; font-style: italic; color: #444;">* ${it.note}</div>` : ''}
          </td>
          <td style="padding: 4px 0; text-align: center; font-size: 13.5px; font-weight: 900; vertical-align: top;">${it.quantity}</td>
        </tr>
      `).join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            @page { size: 80mm auto; margin: 2mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, monospace; font-size: 12px; margin: 0; padding: 4px; width: 72mm; color: #000; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .dashed { border-top: 1px dashed #000; margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; }
            th { border-bottom: 1px solid #000; font-size: 11px; padding: 3px 0; }
          </style>
        </head>
        <body>
          <div class="center bold" style="font-size: 14px;">QUÁN TRÀ</div>
          <div class="center" style="font-size: 10px;">${t('header.branch')}</div>
          <div class="dashed"></div>
          <div class="center bold" style="font-size: 13px;">PHIẾU BÁO BẾP / BAR</div>
          <div class="dashed"></div>
          <div style="display: flex; justify-content: space-between; font-size: 11.5px;">
            <span><strong>BÀN:</strong> ${tableName}</span>
            <span>Mã: ${ticketCode}</span>
          </div>
          <div style="font-size: 10.5px; color: #333;">Thời gian: ${timeStr} - ${dateStr}</div>
          <div style="font-size: 10.5px; color: #333;">Thu ngân: Thu Hằng (Ca sáng)</div>
          <div class="dashed"></div>
          <table>
            <thead>
              <tr>
                <th style="width: 22px; text-align: left;">STT</th>
                <th style="text-align: left;">Tên món</th>
                <th style="width: 32px; text-align: center;">SL</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <div class="dashed"></div>
          <div class="center bold" style="font-size: 10.5px; margin-top: 5px;">*** XIN CẢM ƠN - BẾP LÀM NGAY ***</div>
        </body>
        </html>
      `;

      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(htmlContent);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (_) {}
      }, 150);
    } catch (e) {
      console.warn('Silent print error:', e);
    }
  };

  // Báo Bếp (F10) - Tự động in và gửi bếp trực tiếp, không hiện modal xem trước hay dialog khổ in
  const handleDirectSendKitchen = async () => {
    if (!order || !order.id) {
      showToast('Vui lòng chọn bàn có đơn trước khi báo bếp!', 'warning');
      return;
    }
    const items = order.items || [];
    if (items.length === 0) {
      showToast('Bàn chưa có món nào để báo bếp!', 'warning');
      return;
    }

    const pendingItems = items.filter(it => it.status === 'new_pending');
    const itemsToPrint = pendingItems.length > 0 ? pendingItems : items;
    const tableName = selectedTable ? formatTableName(selectedTable.name) : 'Bàn';

    try {
      const res = await api.sendToKitchen(order.id);
      if (res && res.order) {
        setOrder(res.order);
        loadData();
      }
    } catch (err) {
      console.warn('sendToKitchen err:', err);
    }

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

    showToast(`Đã tự động gửi & in báo bếp thành công cho ${tableName} (${itemsToPrint.length} món)!`, 'success');

    // Tự động in lệnh báo bếp ngầm định dạng khổ K80 chuẩn
    printDirectKitchenSlip(tableName, itemsToPrint);
  };

  // Báo Bếp Modal (fallback)
  const handleConfirmSendKitchen = async () => {
    await handleDirectSendKitchen();
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
      try {
        window.dispatchEvent(new CustomEvent('aura_pos_data_changed'));
        localStorage.setItem('aura_pos_sync_timestamp', String(Date.now()));
      } catch (e) {}
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

  // Tách Đơn
  const handleConfirmSplit = async (fromTableId, toTableId, splitItems) => {
    try {
      const res = await api.splitOrder(fromTableId, toTableId, splitItems);
      showToast(res?.message || 'Đã tách đơn thành công!', 'success');
      await loadData();
      if (selectedTable?.id) {
        const orderRes = await api.getTableOrder(selectedTable.id);
        if (orderRes && orderRes.order) {
          setOrder(orderRes.order);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Có lỗi xảy ra khi tách đơn', 'warning');
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

  // Áp dụng hoặc hủy khuyến mãi
  const handleApplyPromotion = async (promoId) => {
    if (!order?.id) return;
    try {
      const res = await api.applyOrderPromotion(order.id, promoId);
      if (res && res.order) {
        setOrder(res.order);
        setTables(prev => prev.map(t => {
          if (t.id === selectedTable?.id) {
            return {
              ...t,
              order: {
                ...t.order,
                total_amount: res.order.total_amount,
                subtotal: res.order.subtotal,
                discount_amount: res.order.discount_amount
              }
            };
          }
          return t;
        }));
      }
    } catch (err) {
      console.warn('Apply promo error:', err);
    }
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
        handleDirectSendKitchen();
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

  const formatMoney = (val) => Number(val || 0).toLocaleString('vi-VN') + ' đ';
  const itemCount = order?.items?.reduce((acc, it) => acc + (it.quantity || 1), 0) || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* 1. Header Bar (Chỉ hiển thị khi ở màn hình POS) */}
      {currentView !== 'admin' && (
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onResetDemo={handleResetDemo}
          onOpenMenu={() => setIsMenuOpen(true)}
          searchInputRef={searchInputRef}
          currentUser={currentUser}
          onUpdateCurrentUser={(updatedUser) => {
            setCurrentUser(updatedUser);
            try {
              sessionStorage.setItem('pos_user', JSON.stringify(updatedUser));
            } catch (e) {}
          }}
          onLogout={handleLogout}
          currentView={currentView}
          setCurrentView={setCurrentView}
          isMobile={isMobile}
          mobileTab={mobileTab}
          setMobileTab={setMobileTab}
          itemCount={itemCount}
          selectedTable={selectedTable}
          adminTab={adminTab}
          setAdminTab={setAdminTab}
        />
      )}

      {/* 2. Main View (POS View HOẶC Admin Dashboard) */}
      {currentView === 'admin' && currentUser.role === 'admin' ? (
        <AdminDashboard
          currentUser={currentUser}
          onUpdateCurrentUser={(updatedUser) => {
            setCurrentUser(updatedUser);
            try {
              sessionStorage.setItem('pos_user', JSON.stringify(updatedUser));
            } catch (e) {}
          }}
          initialTab={adminTab}
          onBackToPos={() => setCurrentView('pos')}
          onLogout={handleLogout}
        />
      ) : (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
          {/* Cột Trái: Bộ lọc khu vực & Lưới bàn (Hiển thị nếu trên Desktop HOẶC trên Mobile tab tables) */}
          {(!isMobile || mobileTab === 'tables') && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
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
                onSelectTable={(table) => {
                  handleSelectTable(table);
                }}
                selectedArea={selectedArea}
                statusFilter={statusFilter}
                searchQuery={searchQuery}
              />

              {/* Floating Sticky Order Bar on Mobile when Table is selected */}
              {isMobile && selectedTable && (
                <div
                  onClick={() => setMobileTab('order')}
                  style={{
                    position: 'fixed',
                    bottom: '62px',
                    left: '10px',
                    right: '10px',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.1)',
                    zIndex: 40,
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      backgroundColor: '#1B5E20',
                      color: '#ffffff',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontWeight: 800,
                      fontSize: '12px'
                    }}>
                      {formatTableName(selectedTable.name)}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                        {itemCount} món • {formatMoney(order?.total_amount || 0)}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                        {selectedTable.status === 'billing' ? 'Đã in tạm tính' : selectedTable.status === 'occupied' ? 'Đang phục vụ' : 'Chạm để xem đơn / gọi món'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMenuOpen(true);
                      }}
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        color: '#ffffff',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 600
                      }}
                    >
                      + Món
                    </button>
                    <button
                      onClick={() => setMobileTab('order')}
                      style={{
                        backgroundColor: '#1B5E20',
                        color: '#ffffff',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>Xem đơn &gt;</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cột Phải: Bảng Chi Tiết Order (Hiển thị nếu trên Desktop HOẶC trên Mobile tab order) */}
          {(!isMobile || mobileTab === 'order') && (
            <OrderPanel
              selectedTable={selectedTable}
              order={order}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onOpenKitchenModal={handleDirectSendKitchen}
              onOpenPreBillModal={() => setIsPreBillOpen(true)}
              onOpenCheckoutModal={() => setIsPaymentOpen(true)}
              onOpenTransferModal={() => setIsTransferOpen(true)}
              onOpenCustomerModal={() => setIsCustomerOpen(true)}
              onOpenMenuModal={() => setIsMenuOpen(true)}
              onClearOrder={handleClearOrder}
              onEditItemNote={(item) => setEditingItem(item)}
              onOpenPromotionModal={() => setIsPromotionOpen(true)}
              onApplyPromotion={handleApplyPromotion}
              onOpenSplitOrderModal={() => setIsSplitOrderOpen(true)}
              onShowToast={showToast}
              promotions={promotions}
              isMobile={isMobile}
              onBackToTables={() => setMobileTab('tables')}
            />
          )}
        </div>
      )}

      {/* 3. Bottom Shortcuts Footer (Desktop) */}
      {!isMobile && currentView === 'pos' && (
        <FooterShortcuts
          onTriggerShortcut={(key) => {
            if (key === 'F1') { setActiveTab('tables'); setIsMenuOpen(false); }
            if (key === 'F2') setIsMenuOpen(true);
            if (key === 'F3') searchInputRef.current?.focus();
            if (key === 'F4') setIsCustomerOpen(true);
            if (key === 'F9') setIsPaymentOpen(true);
            if (key === 'F10') handleDirectSendKitchen();
          }}
        />
      )}

      {/* Mobile Bottom Navigation Bar (Điện thoại) */}
      {isMobile && currentView === 'pos' && (
        <nav style={{
          height: '52px',
          backgroundColor: '#0b1320',
          borderTop: '1px solid #1a273e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          zIndex: 50,
          flexShrink: 0
        }}>
          <button
            onClick={() => setMobileTab('tables')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              color: mobileTab === 'tables' ? '#00c292' : '#94a3b8',
              fontSize: '11px',
              fontWeight: 600,
              border: 'none',
              background: 'none'
            }}
          >
            <span style={{ fontSize: '15px' }}>🪑</span>
            <span>Sơ đồ bàn</span>
          </button>

          <button
            onClick={() => setIsMenuOpen(true)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              color: '#94a3b8',
              fontSize: '11px',
              fontWeight: 600,
              border: 'none',
              background: 'none'
            }}
          >
            <span style={{ fontSize: '15px' }}>📖</span>
            <span>Thực đơn</span>
          </button>

          <button
            onClick={() => setMobileTab('order')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              color: mobileTab === 'order' ? '#00c292' : '#94a3b8',
              fontSize: '11px',
              fontWeight: 600,
              position: 'relative',
              border: 'none',
              background: 'none'
            }}
          >
            <span style={{ fontSize: '15px' }}>📋</span>
            <span>Đơn hàng</span>
            {itemCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-6px',
                backgroundColor: '#ef4444',
                color: '#fff',
                borderRadius: '10px',
                padding: '0 4px',
                fontSize: '9.5px',
                fontWeight: 800
              }}>
                {itemCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              if (order?.id) {
                handleDirectSendKitchen();
              } else {
                showToast('Vui lòng chọn bàn trước khi báo bếp!', 'warning');
              }
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              color: '#94a3b8',
              fontSize: '11px',
              fontWeight: 600,
              border: 'none',
              background: 'none'
            }}
          >
            <span style={{ fontSize: '15px' }}>🔔</span>
            <span>Báo bếp</span>
          </button>
        </nav>
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

      <PromotionModal
        isOpen={isPromotionOpen}
        onClose={() => setIsPromotionOpen(false)}
        promotions={promotions}
        currentPromotionId={order?.promotion_id}
        orderSubtotal={order?.subtotal || 0}
        onApplyPromotion={handleApplyPromotion}
      />

      {/* Modal Tách Đơn Hàng (Split Order Modal - Không dùng alert browser) */}
      <SplitOrderModal
        isOpen={isSplitOrderOpen}
        onClose={() => setIsSplitOrderOpen(false)}
        selectedTable={selectedTable}
        order={order}
        tables={tables}
        onConfirmSplit={handleConfirmSplit}
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

      {/* Toast Notification nổi trên màn hình (thay thế hoàn toàn alert localhost) */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          backgroundColor: toast.type === 'warning' ? '#ea580c' : '#1B5E20',
          color: '#ffffff',
          padding: '10px 22px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          fontSize: '13.5px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          pointerEvents: 'none'
        }}>
          {toast.type === 'warning' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;
