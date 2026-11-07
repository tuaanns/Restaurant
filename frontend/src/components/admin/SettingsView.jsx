import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Utensils, ArrowLeftRight, ChefHat, Users, TrendingUp, Printer,
  Search, CheckCircle, RotateCcw, ChevronRight, ChevronDown, Check, X,
  FileText, Shield, Sparkles, Bell, Percent, Store, Eye,
  Layers, Tag, Info, ArrowLeft, QrCode, Wifi, Coffee
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  getRestaurantSettings,
  saveRestaurantSettings,
  DEFAULT_RESTAURANT_SETTINGS,
  SETTINGS_STORAGE_KEY
} from '../../utils/restaurantSettings';
import { PrintTemplatesManager } from './PrintTemplatesManager';

export function SettingsView({ onBackToDashboard }) {
  const { t, lang, formatMoney } = useLanguage();
  const [activeTab, setActiveTab] = useState('menu');
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState(() => getRestaurantSettings());

  // Print templates expansion and sub-item selection
  const [printTemplatesExpanded, setPrintTemplatesExpanded] = useState(true);
  const [selectedPrintDocType, setSelectedPrintDocType] = useState('invoice');

  const [toastMessage, setToastMessage] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const toastTimeoutRef = useRef(null);

  const PRINT_SUB_ITEMS = [
    { id: 'invoice', label: t('admin.settings.docInvoice') || 'Hóa đơn thanh toán' },
    { id: 'prebill', label: t('admin.settings.docPreBill') || 'Phiếu tạm tính' },
    { id: 'kitchen', label: t('admin.settings.docKitchen') || 'Phiếu Bar/Bếp' },
    { id: 'shift_closing', label: t('admin.settings.docShiftClosing') || 'Phiếu bàn giao ca' },
    { id: 'cash_receipt', label: t('admin.settings.docCashReceipt') || 'Phiếu thu tiền' },
    { id: 'cash_payment', label: t('admin.settings.docCashPayment') || 'Phiếu chi tiền' },
  ];

  // Auto-save to localStorage & broadcast event on change
  const updateSetting = (key, value) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      saveRestaurantSettings(next);
      return next;
    });

    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(t('admin.settings.savedSuccess') || 'Đã lưu thiết lập thành công!');
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  const handleResetDefaults = () => {
    if (window.confirm(t('common.confirmAction') || 'Bạn có chắc chắn muốn khôi phục toàn bộ thiết lập về mặc định?')) {
      setSettings(DEFAULT_RESTAURANT_SETTINGS);
      saveRestaurantSettings(DEFAULT_RESTAURANT_SETTINGS);
      setToastMessage(t('admin.settings.resetToDefault') || 'Đã khôi phục thiết lập mặc định!');
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 2200);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Categories list
  const TABS = [
    {
      id: 'menu',
      label: t('admin.settings.menuInventory') || 'Thực đơn & Kho hàng',
      sublabel: t('admin.settings.menuInventoryDesc') || 'Thông tin món, giá vốn, định lượng & trừ kho',
      icon: Utensils,
      sections: [
        { id: 'sec-menu-info', title: t('admin.settings.menuItemInfo') || 'Thông tin món, hàng hóa' },
        { id: 'sec-cost-price', title: t('admin.settings.costPriceSection') || 'Giá vốn hàng hóa' },
        { id: 'sec-production', title: t('admin.settings.productionInventory') || 'Sản xuất & Chế biến' },
        { id: 'sec-inventory', title: t('admin.settings.inventoryAlerts') || 'Nhập hàng & Kiểm kho' }
      ]
    },
    {
      id: 'orders',
      label: t('admin.settings.orders') || 'Đơn hàng',
      sublabel: t('admin.settings.ordersDesc') || 'Hóa đơn/Tạm tính, phục vụ món & thuế VAT',
      icon: ArrowLeftRight,
      sections: [
        { id: 'sec-orders-bill', title: t('admin.settings.billAndPreBill') || 'Hóa đơn & Tạm tính' },
        { id: 'sec-orders-tax', title: t('admin.settings.taxesAndFees') || 'Thuế VAT & Phí dịch vụ' }
      ]
    },
    {
      id: 'kitchen',
      label: t('admin.settings.kitchenBar') || 'Bar/Bếp',
      sublabel: t('admin.settings.kitchenBarDesc') || 'In chế biến, điều phối & lý do hủy món',
      icon: ChefHat,
      sections: [
        { id: 'sec-kitchen-ticket', title: t('admin.settings.ticketDispatch') || 'In chế biến & Điều phối' }
      ]
    },
    {
      id: 'customers',
      label: t('admin.settings.customers') || 'Khách hàng',
      sublabel: t('admin.settings.customersDesc') || 'Tích điểm hội viên, nâng hạng & ưu đãi',
      icon: Users,
      sections: [
        { id: 'sec-cust-loyalty', title: t('admin.settings.loyaltyAndPoints') || 'Tích điểm & Hội viên' }
      ]
    },
    {
      id: 'reports',
      label: t('admin.settings.reports') || 'Báo cáo',
      sublabel: t('admin.settings.reportsDesc') || 'Chốt ca cuối ngày, lợi nhuận gộp & kết sổ',
      icon: TrendingUp,
      sections: [
        { id: 'sec-reports-closing', title: t('admin.settings.shiftClosing') || 'Chốt ca & Kết sổ doanh thu' }
      ]
    },
    {
      id: 'print_templates',
      label: t('admin.settings.printTemplates') || 'Mẫu in',
      sublabel: t('admin.settings.printTemplatesDesc') || 'Khổ giấy K80/K57, logo, VietQR & chân trang',
      icon: Printer,
      sections: [
        { id: 'sec-print-paper', title: t('admin.settings.paperSizeAndFormat') || 'Khổ giấy in & Số liên' },
        { id: 'sec-print-content', title: t('admin.settings.billContentConfig') || 'Nội dung hiển thị trên hóa đơn' },
        { id: 'sec-print-footer', title: t('admin.settings.billFooterContent') || 'Thông tin cửa hàng & Chân trang' }
      ]
    }
  ];

  const currentTabObj = TABS.find(t => t.id === activeTab) || TABS[0];

  // Helper toggle component with smooth transition
  const ToggleSwitch = ({ checked, onChange, disabled = false }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        width: '46px',
        height: '24px',
        borderRadius: '9999px',
        backgroundColor: checked ? '#1B5E20' : '#cbd5e1',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: 'none',
        outline: 'none',
        padding: '2px',
        transition: 'background-color 0.2s ease',
        flexShrink: 0
      }}
    >
      <div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          transform: checked ? 'translateX(22px)' : 'translateX(0)',
          transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />
    </button>
  );

  // Nếu đang chọn tab Quản lý mẫu in: hiển thị giao diện Quản lý mẫu in chuyên sâu chuẩn KiotViet
  if (activeTab === 'print_templates') {
    return (
      <PrintTemplatesManager
        onBack={() => setActiveTab('menu')}
        initialDocType={selectedPrintDocType}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
      
      {/* ═══ TOP HEADER (KiotViet Style) ═══ */}
      <div style={{
        height: '60px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0,
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
      }}>
        {/* Left: Title + Back button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              title={t('admin.settings.backToDashboard') || 'Quay lại Bảng điều khiển'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                color: '#475569',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
            >
              <ArrowLeft size={14} />
              <span>{t('admin.settings.backToDashboard') || 'Quay lại Bảng điều khiển'}</span>
            </button>
          )}

          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.2px' }}>
              {t('admin.settings.title') || 'Thiết lập'}
            </h1>
          </div>
        </div>

        {/* Center: Search input */}
        <div style={{ flex: 1, maxWidth: '460px', margin: '0 24px' }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('admin.settings.searchPlaceholder') || 'Tìm kiếm thiết lập...'}
              style={{
                width: '100%',
                padding: '7px 12px 7px 36px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                backgroundColor: '#f8fafc',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.borderColor = '#1B5E20';
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = '#f8fafc';
                e.target.style.borderColor = '#cbd5e1';
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Right: Auto-save status & Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11.5px',
            fontWeight: 700,
            color: '#059669',
            backgroundColor: '#ecfdf5',
            padding: '4px 10px',
            borderRadius: '9999px',
            border: '1px solid #a7f3d0'
          }}>
            <CheckCircle size={13} />
            <span>{t('admin.settings.autoSavedBadge') || 'Đã tự động lưu'}</span>
          </div>

          <button
            onClick={handleResetDefaults}
            title={t('admin.settings.resetToDefault') || 'Khôi phục mặc định'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              color: '#64748b',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            <RotateCcw size={13} />
            <span>{t('admin.settings.resetToDefault') || 'Khôi phục mặc định'}</span>
          </button>
        </div>
      </div>

      {/* ═══ BODY LAYOUT (Left Sidebar + Content + Anchor column) ═══ */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* ─── LEFT SIDEBAR (Categories) ─── */}
        <div style={{
          width: '260px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          overflowY: 'auto'
        }}>
          <div style={{
            padding: '16px 16px 8px 16px',
            fontSize: '11px',
            fontWeight: 800,
            color: '#64748b',
            letterSpacing: '0.6px',
            textTransform: 'uppercase'
          }}>
            {t('admin.settings.sectionManagement') || 'QUẢN LÝ'}
          </div>

          <div style={{ padding: '0 8px 16px 8px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              // Mục Mẫu in: có thể xổ xuống danh sách các mẫu in trong hệ thống
              if (tab.id === 'print_templates') {
                return (
                  <div key={tab.id} style={{ display: 'flex', flexDirection: 'column' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        backgroundColor: isActive ? '#E8F5E9' : 'transparent',
                        color: isActive ? '#1B5E20' : '#334155',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onClick={() => {
                        setSelectedPrintDocType('invoice');
                        setActiveTab('print_templates');
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Icon size={17} color={isActive ? '#1B5E20' : '#64748b'} />
                        <span style={{ fontSize: '13px', fontWeight: isActive ? 800 : 600 }}>
                          {tab.label}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPrintTemplatesExpanded(!printTemplatesExpanded);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '2px',
                          color: '#64748b',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {printTemplatesExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    </div>

                    {/* Danh sách xổ xuống các mẫu in */}
                    {printTemplatesExpanded && (
                      <div style={{ paddingLeft: '32px', display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                        {PRINT_SUB_ITEMS.map((sub) => {
                          const isSubActive = activeTab === 'print_templates' && selectedPrintDocType === sub.id;
                          return (
                            <button
                              key={sub.id}
                              onClick={() => {
                                setSelectedPrintDocType(sub.id);
                                setActiveTab('print_templates');
                              }}
                              style={{
                                padding: '6px 8px',
                                borderRadius: '6px',
                                border: 'none',
                                textAlign: 'left',
                                fontSize: '12px',
                                fontWeight: isSubActive ? 800 : 500,
                                backgroundColor: isSubActive ? '#E8F5E9' : 'transparent',
                                color: isSubActive ? '#1B5E20' : '#475569',
                                cursor: 'pointer',
                                transition: 'all 0.1s ease'
                              }}
                              onMouseEnter={(e) => {
                                if (!isSubActive) e.currentTarget.style.backgroundColor = '#f1f5f9';
                              }}
                              onMouseLeave={(e) => {
                                if (!isSubActive) e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              • {sub.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isActive ? '#E8F5E9' : 'transparent',
                    color: isActive ? '#1B5E20' : '#334155',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Icon size={17} color={isActive ? '#1B5E20' : '#64748b'} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: isActive ? 800 : 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {tab.label}
                    </div>
                  </div>
                  {isActive && (
                    <div style={{
                      width: '4px',
                      height: '18px',
                      borderRadius: '2px',
                      backgroundColor: '#1B5E20'
                    }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick info footer */}
          <div style={{
            marginTop: 'auto',
            padding: '14px 16px',
            borderTop: '1px solid #f1f5f9',
            backgroundColor: '#f8fafc',
            fontSize: '11px',
            color: '#64748b',
            lineHeight: '1.5'
          }}>
            <div style={{ fontWeight: 700, color: '#334155', marginBottom: '2px' }}>AuraPOS Cloud</div>
            <div>{t('admin.settings.subtitle') || 'Cấu hình hệ thống quán, thực đơn, đơn hàng & mẫu in'}</div>
          </div>
        </div>

        {/* ─── MAIN CONTENT AREA ─── */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 32px',
          display: 'flex',
          gap: '24px'
        }}>
          
          {/* Main Setting Cards */}
          <div style={{ flex: 1, maxWidth: '860px' }}>
            
            {/* ═════════ TAB 1: THỰC ĐƠN & KHO HÀNG ═════════ */}
            {activeTab === 'menu' && (
              <div>
                {/* Section 1: Thông tin món */}
                <div id="sec-menu-info" style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  marginBottom: '20px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#0f172a'
                  }}>
                    {t('admin.settings.menuItemInfo') || 'Thông tin món, hàng hóa'}
                  </div>

                  {/* Row: Thực đơn đa ngôn ngữ */}
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                        {t('admin.settings.menuMultilingual') || 'Thực đơn đa ngôn ngữ'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px', lineHeight: '1.4' }}>
                        {t('admin.settings.menuMultilingualDesc') || 'Dịch tên món và in hóa đơn đa ngôn ngữ cho khách nước ngoài (Anh, Hàn, Nga).'}
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={settings.menuMultilingual}
                      onChange={(v) => updateSetting('menuMultilingual', v)}
                    />
                  </div>

                  {/* Row: Tag món */}
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                        {t('admin.settings.tagItem') || 'Tag phân loại món'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {t('admin.settings.tagItemDesc') || 'Quản lý món theo từ khóa mô tả chi tiết như bán chạy, nên thử, món mới.'}
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#1B5E20',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}>
                      <span>{t('admin.settings.tagCount') || '43 tag món'}</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>

                  {/* Row: Đơn vị tính */}
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                        {t('admin.settings.unitSetting') || 'Đơn vị tính'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {t('admin.settings.unitSettingDesc') || 'Quản lý món, hàng hóa theo đơn vị bán hoặc nhập như ly, tách, bình, chai, phần.'}
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#1B5E20',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}>
                      <span>{t('admin.settings.unitCount') || '12 đơn vị tính'}</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>

                  {/* Row: Thuộc tính & biến thể */}
                  <div style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                        {t('admin.settings.itemAttributes') || 'Thuộc tính & Biến thể'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {t('admin.settings.itemAttributesDesc') || 'Quản lý các biến thể của món theo thuộc tính size (S, M, L), mức đường, mức đá.'}
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#1B5E20',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}>
                      <span>{t('admin.settings.attributeCount') || '5 thuộc tính'}</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>

                {/* Section 2: Giá vốn */}
                <div id="sec-cost-price" style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  marginBottom: '20px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#0f172a'
                  }}>
                    {t('admin.settings.costPriceSection') || 'Giá vốn hàng hóa'}
                  </div>

                  <div style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>
                      {t('admin.settings.costPriceMethod') || 'Phương pháp tính giá vốn'}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: `1.5px solid ${settings.costPriceMethod === 'fixed' ? '#1B5E20' : '#e2e8f0'}`,
                        backgroundColor: settings.costPriceMethod === 'fixed' ? '#E8F5E9' : '#ffffff',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="radio"
                          name="costPriceMethod"
                          checked={settings.costPriceMethod === 'fixed'}
                          onChange={() => updateSetting('costPriceMethod', 'fixed')}
                          style={{ marginTop: '2px', accentColor: '#1B5E20' }}
                        />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                            {t('admin.settings.fixedCost') || 'Giá vốn cố định'}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                            {t('admin.settings.fixedCostDesc') || 'Giá vốn được xác định theo giá nhập đầu tiên hoặc do người dùng tự nhập.'}
                          </div>
                        </div>
                      </label>

                      <label style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: `1.5px solid ${settings.costPriceMethod === 'average' ? '#1B5E20' : '#e2e8f0'}`,
                        backgroundColor: settings.costPriceMethod === 'average' ? '#E8F5E9' : '#ffffff',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="radio"
                          name="costPriceMethod"
                          checked={settings.costPriceMethod === 'average'}
                          onChange={() => updateSetting('costPriceMethod', 'average')}
                          style={{ marginTop: '2px', accentColor: '#1B5E20' }}
                        />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                            {t('admin.settings.averageCost') || 'Giá vốn bình quân gia quyền'}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                            {t('admin.settings.averageCostDesc') || 'Giá vốn được tính bình quân liên tục theo các lần nhập nguyên vật liệu.'}
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Section 3: Sản xuất & Chế biến */}
                <div id="sec-production" style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  marginBottom: '20px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#0f172a'
                  }}>
                    {t('admin.settings.productionInventory') || 'Sản xuất & Chế biến'}
                  </div>

                  <div style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                        {t('admin.settings.autoDeductInventory') || 'Tự động trừ tồn kho nguyên liệu khi bán món'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {t('admin.settings.autoDeductInventoryDesc') || 'Hệ thống tự động trừ kho nguyên vật liệu theo định lượng công thức của món.'}
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={settings.autoDeductInventory}
                      onChange={(v) => updateSetting('autoDeductInventory', v)}
                    />
                  </div>
                </div>

                {/* Section 4: Nhập hàng & Kiểm kho */}
                <div id="sec-inventory" style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  marginBottom: '20px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#0f172a'
                  }}>
                    {t('admin.settings.inventoryAlerts') || 'Nhập hàng & Kiểm kho'}
                  </div>

                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                        {t('admin.settings.allowNegativeStock') || 'Cho phép bán âm kho'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {t('admin.settings.allowNegativeStockDesc') || 'Cho phép tiếp tục tạo đơn hàng và thanh toán khi số lượng tồn kho bằng 0.'}
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={settings.allowNegativeStock}
                      onChange={(v) => updateSetting('allowNegativeStock', v)}
                    />
                  </div>

                  <div style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                        {t('admin.settings.lowStockAlert') || 'Cảnh báo sắp hết nguyên liệu'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {t('admin.settings.lowStockAlertDesc') || 'Hiển thị thông báo khi lượng tồn kho nguyên liệu giảm xuống dưới ngưỡng an toàn.'}
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={settings.lowStockAlert}
                      onChange={(v) => updateSetting('lowStockAlert', v)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ═════════ TAB 2: ĐƠN HÀNG ═════════ */}
            {activeTab === 'orders' && (
              <div>
                {/* Section 1: Hóa đơn & Tạm tính */}
                <div id="sec-orders-bill" style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  marginBottom: '20px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#0f172a'
                  }}>
                    {t('admin.settings.billAndPreBill') || 'Hóa đơn & Tạm tính'}
                  </div>

                  {/* Auto print on payment */}
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                        {t('admin.settings.autoPrintOnPayment') || 'Tự động in hóa đơn khi thanh toán'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {t('admin.settings.autoPrintOnPaymentDesc') || 'Máy in tự động xuất hóa đơn ngay sau khi hoàn tất thanh toán thành công.'}
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={settings.autoPrintOnPayment}
                      onChange={(v) => updateSetting('autoPrintOnPayment', v)}
                    />
                  </div>

                  {/* Allow pre-print bill */}
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                        {t('admin.settings.allowPrePrintBill') || 'Cho phép in tạm tính trước khi thanh toán'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {t('admin.settings.allowPrePrintBillDesc') || 'Thu ngân hoặc nhân viên phục vụ có thể in phiếu tạm tính cho khách kiểm tra.'}
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={settings.allowPrePrintBill}
                      onChange={(v) => updateSetting('allowPrePrintBill', v)}
                    />
                  </div>

                  {/* Allow pay before kitchen */}
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                        {t('admin.settings.allowPayBeforeKitchen') || 'Cho phép thanh toán khi chưa báo bếp'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {t('admin.settings.allowPayBeforeKitchenDesc') || 'Áp dụng cho các đơn mang về hoặc khách yêu cầu thanh toán trước.'}
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={settings.allowPayBeforeKitchen}
                      onChange={(v) => updateSetting('allowPayBeforeKitchen', v)}
                    />
                  </div>

                  {/* Require cancel reason */}
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                        {t('admin.settings.requireCancelReason') || 'Bắt buộc nhập lý do khi hủy món'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {t('admin.settings.requireCancelReasonDesc') || 'Nhân viên phải chọn lý do (Hết món, Khách đổi ý, Sai sót...) khi hủy món đã lưu.'}
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={settings.requireCancelReason}
                      onChange={(v) => updateSetting('requireCancelReason', v)}
                    />
                  </div>

                  {/* Auto complete paid order */}
                  <div style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                        {t('admin.settings.autoCompletePaidOrder') || 'Tự động đóng bàn khi thanh toán đủ'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {t('admin.settings.autoCompletePaidOrderDesc') || 'Bàn tự động chuyển về trạng thái Trống ngay sau khi thu ngân hoàn tất đơn.'}
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={settings.autoCompletePaidOrder}
                      onChange={(v) => updateSetting('autoCompletePaidOrder', v)}
                    />
                  </div>
                </div>

                {/* Section 2: Thuế & Phí dịch vụ */}
                <div id="sec-orders-tax" style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  marginBottom: '20px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#0f172a'
                  }}>
                    {t('admin.settings.taxesAndFees') || 'Thuế VAT & Phí dịch vụ'}
                  </div>

                  {/* VAT rate selector */}
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                        {t('admin.settings.defaultVatRate') || 'Thuế suất VAT mặc định'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {t('admin.settings.defaultVatRateDesc') || 'Mức thuế suất VAT tự động áp dụng cho các hóa đơn bán hàng.'}
                      </div>
                    </div>
                    <select
                      value={settings.defaultVatRate}
                      onChange={(e) => updateSetting('defaultVatRate', e.target.value)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#0f172a',
                        backgroundColor: '#ffffff',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="0">0% (Không áp dụng)</option>
                      <option value="5">5% (Thuế ưu đãi)</option>
                      <option value="8">8% (Giảm thuế VAT)</option>
                      <option value="10">10% (Tiêu chuẩn)</option>
                    </select>
                  </div>

                  {/* Service charge selector */}
                  <div style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                        {t('admin.settings.serviceChargeRate') || 'Phí dịch vụ mặc định (%)'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {t('admin.settings.serviceChargeRateDesc') || 'Tự động tính thêm phần trăm phí phục vụ vào hóa đơn thanh toán.'}
                      </div>
                    </div>
                    <select
                      value={settings.serviceChargeRate}
                      onChange={(e) => updateSetting('serviceChargeRate', e.target.value)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#0f172a',
                        backgroundColor: '#ffffff',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="0">0% (Miễn phí phục vụ)</option>
                      <option value="5">5% (Phí phục vụ tiêu chuẩn)</option>
                      <option value="10">10% (Phí ngày lễ / Tết)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ═════════ TAB 3: BAR / BẾP ═════════ */}
            {activeTab === 'kitchen' && (
              <div>
                <div id="sec-kitchen-ticket" style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  marginBottom: '20px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#0f172a'
                  }}>
                    {t('admin.settings.ticketDispatch') || 'In chế biến & Điều phối Bar/Bếp'}
                  </div>

                  {/* Auto print kitchen ticket */}
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                        {t('admin.settings.autoPrintKitchenTicket') || 'Tự động in phiếu chế biến khi gửi Bếp/Bar'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {t('admin.settings.autoPrintKitchenTicketDesc') || 'Món ăn/đồ uống được tự động gửi đến máy in hoặc màn hình KDS ngay khi gọi món.'}
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={settings.autoPrintKitchenTicket}
                      onChange={(v) => updateSetting('autoPrintKitchenTicket', v)}
                    />
                  </div>

                  {/* Split kitchen vs bar tickets */}
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                        {t('admin.settings.splitKitchenBarTickets') || 'Tách riêng phiếu in cho Bếp và Bar'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {t('admin.settings.splitKitchenBarTicketsDesc') || 'Đồ uống gửi đến máy in Quầy Pha Chế, đồ ăn gửi riêng vào Bếp Nấu.'}
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={settings.splitKitchenBarTickets}
                      onChange={(v) => updateSetting('splitKitchenBarTickets', v)}
                    />
                  </div>

                  {/* Group items on ticket */}
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                        {t('admin.settings.groupItemsOnTicket') || 'In phiếu gộp theo bàn thay vì từng món lẻ'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {t('admin.settings.groupItemsOnTicketDesc') || 'Gộp toàn bộ món của một lần gọi thành 1 phiếu thay vì in từng tờ rời.'}
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={settings.groupItemsOnTicket}
                      onChange={(v) => updateSetting('groupItemsOnTicket', v)}
                    />
                  </div>

                  {/* Kitchen alert chime sound */}
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                        {t('admin.settings.kitchenAlertSound') || 'Âm thanh chuông báo khi có đơn mới'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {t('admin.settings.kitchenAlertSoundDesc') || 'Phát tiếng chuông báo động tại quầy pha chế và bếp khi nhân viên gửi món.'}
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={settings.kitchenAlertSound}
                      onChange={(v) => updateSetting('kitchenAlertSound', v)}
                    />
                  </div>

                  {/* Staff can cancel kitchen items */}
                  <div style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                        {t('admin.settings.staffCanCancelKitchenItem') || 'Cho phép nhân viên phục vụ tự hủy món đã báo bếp'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {t('admin.settings.staffCanCancelKitchenItemDesc') || 'Nếu tắt, chỉ tài khoản Quản lý (Admin) mới có quyền xóa món đã gửi bếp.'}
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={settings.staffCanCancelKitchenItem}
                      onChange={(v) => updateSetting('staffCanCancelKitchenItem', v)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ═════════ TAB 4: KHÁCH HÀNG ═════════ */}
            {activeTab === 'customers' && (
              <div>
                <div id="sec-cust-loyalty" style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  marginBottom: '20px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#0f172a'
                  }}>
                    {t('admin.settings.loyaltyAndPoints') || 'Tích điểm & Hội viên'}
                  </div>

                  {/* Enable loyalty points */}
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                        {t('admin.settings.enableLoyaltyPoints') || 'Kích hoạt chương trình tích điểm hội viên'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {t('admin.settings.enableLoyaltyPointsDesc') || 'Tự động tích điểm cho khách hàng theo số điện thoại khi thanh toán hóa đơn.'}
                      </div>
                      <div style={{
                        marginTop: '8px',
                        fontSize: '11.5px',
                        color: '#2E7D32',
                        backgroundColor: '#E8F5E9',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        display: 'inline-block'
                      }}>
                        {t('admin.settings.pointRateDesc') || 'Tỷ lệ tích điểm: 10.000 đ = 1 điểm (tương đương 1% giá trị hóa đơn).'}
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={settings.enableLoyaltyPoints}
                      onChange={(v) => updateSetting('enableLoyaltyPoints', v)}
                    />
                  </div>

                  {/* Auto rank upgrade */}
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                        {t('admin.settings.autoRankUpgrade') || 'Tự động nâng hạng thành viên'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {t('admin.settings.autoRankUpgradeDesc') || 'Tự động thăng cấp Đồng -> Bạc -> Vàng -> Kim Cương khi tích lũy đủ chi tiêu.'}
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={settings.autoRankUpgrade}
                      onChange={(v) => updateSetting('autoRankUpgrade', v)}
                    />
                  </div>

                  {/* Stack promo with points */}
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                        {t('admin.settings.allowStackPromoWithPoints') || 'Cho phép cộng dồn khuyến mãi với tích điểm'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {t('admin.settings.allowStackPromoWithPointsDesc') || 'Khách hàng vừa được giảm giá theo CTKM vừa được tích thêm điểm hội viên.'}
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={settings.allowStackPromoWithPoints}
                      onChange={(v) => updateSetting('allowStackPromoWithPoints', v)}
                    />
                  </div>

                  {/* Birthday greetings */}
                  <div style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                        {t('admin.settings.birthdayGreetingSms') || 'Tự động gửi lời chúc sinh nhật khách hàng'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {t('admin.settings.birthdayGreetingSmsDesc') || 'Gửi tin nhắn chúc mừng và voucher ưu đãi vào ngày sinh nhật của khách.'}
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={settings.birthdayGreetingSms}
                      onChange={(v) => updateSetting('birthdayGreetingSms', v)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ═════════ TAB 5: BÁO CÁO ═════════ */}
            {activeTab === 'reports' && (
              <div>
                <div id="sec-reports-closing" style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  marginBottom: '20px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#0f172a'
                  }}>
                    {t('admin.settings.shiftClosing') || 'Chốt ca & Kết sổ doanh thu'}
                  </div>

                  {/* Daily closing time */}
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                        {t('admin.settings.dailyClosingTime') || 'Giờ chốt ca tự động cuối ngày'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {t('admin.settings.dailyClosingTimeDesc') || 'Thời điểm hệ thống tự động tổng kết số liệu doanh thu và kết sổ trong ngày.'}
                      </div>
                    </div>
                    <input
                      type="time"
                      value={settings.dailyClosingTime}
                      onChange={(e) => updateSetting('dailyClosingTime', e.target.value)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#0f172a'
                      }}
                    />
                  </div>

                  {/* Cash audit requirement */}
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                        {t('admin.settings.requireCashAuditBeforeClose') || 'Bắt buộc kiểm kê quỹ tiền mặt trước khi đóng ca'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {t('admin.settings.requireCashAuditBeforeCloseDesc') || 'Thu ngân phải đếm tiền mặt thực tế trong két và nhập để đối soát lệch két.'}
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={settings.requireCashAuditBeforeClose}
                      onChange={(v) => updateSetting('requireCashAuditBeforeClose', v)}
                    />
                  </div>

                  {/* Show gross profit */}
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                        {t('admin.settings.showGrossProfitInReports') || 'Hiển thị lợi nhuận gộp trên báo cáo bán hàng'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {t('admin.settings.showGrossProfitInReportsDesc') || 'Tính toán: Doanh thu thuần trừ Giá vốn hàng bán để ra lãi gộp.'}
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={settings.showGrossProfitInReports}
                      onChange={(v) => updateSetting('showGrossProfitInReports', v)}
                    />
                  </div>

                  {/* Revenue only paid */}
                  <div style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                        {t('admin.settings.revenueOnlyPaid') || 'Chỉ tính doanh thu cho các đơn đã thanh toán hoàn tất'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {t('admin.settings.revenueOnlyPaidDesc') || 'Loại trừ các đơn nợ hoặc đơn chưa hoàn tất ra khỏi doanh thu thực tế.'}
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={settings.revenueOnlyPaid}
                      onChange={(v) => updateSetting('revenueOnlyPaid', v)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ═════════ TAB 6: MẪU IN (PRINT TEMPLATES) ═════════ */}
            {activeTab === 'print_templates' && (
              <div>
                {/* Paper size & copies */}
                <div id="sec-print-paper" style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  marginBottom: '20px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                      {t('admin.settings.paperSizeAndFormat') || 'Khổ giấy in & Số liên'}
                    </span>
                    <button
                      onClick={() => setShowPreviewModal(true)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        backgroundColor: '#1B5E20',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <Eye size={13} />
                      <span>{t('admin.settings.previewBillBtn') || 'Xem trước mẫu in'}</span>
                    </button>
                  </div>

                  {/* Paper size */}
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #f8fafc' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                      {t('admin.settings.paperSize') || 'Khổ giấy in mặc định'}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                      {[
                        { id: 'k80', label: t('admin.settings.paperSizeK80') || 'K80 (80mm - Tiêu chuẩn máy in nhiệt)' },
                        { id: 'k57', label: t('admin.settings.paperSizeK57') || 'K57 (57mm - Máy in bill nhỏ)' },
                        { id: 'a5',  label: t('admin.settings.paperSizeA5')  || 'A5 / A4 (Khổ lớn in Laser)' },
                      ].map((item) => (
                        <label key={item.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: `1.5px solid ${settings.paperSize === item.id ? '#1B5E20' : '#e2e8f0'}`,
                          backgroundColor: settings.paperSize === item.id ? '#E8F5E9' : '#ffffff',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: settings.paperSize === item.id ? 700 : 500
                        }}>
                          <input
                            type="radio"
                            name="paperSize"
                            checked={settings.paperSize === item.id}
                            onChange={() => updateSetting('paperSize', item.id)}
                            style={{ accentColor: '#1B5E20' }}
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Print copies */}
                  <div style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                        {t('admin.settings.printCopies') || 'Số liên in mỗi hóa đơn'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {t('admin.settings.printCopies1') || '1 liên'} hoặc {t('admin.settings.printCopies2') || '2 liên'}
                      </div>
                    </div>
                    <select
                      value={settings.printCopies}
                      onChange={(e) => updateSetting('printCopies', Number(e.target.value))}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#0f172a'
                      }}
                    >
                      <option value={1}>{t('admin.settings.printCopies1') || '1 liên (Giao khách hàng)'}</option>
                      <option value={2}>{t('admin.settings.printCopies2') || '2 liên (1 khách + 1 lưu kho)'}</option>
                    </select>
                  </div>
                </div>

                {/* Bill content toggles */}
                <div id="sec-print-content" style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  marginBottom: '20px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#0f172a'
                  }}>
                    {t('admin.settings.billContentConfig') || 'Nội dung hiển thị trên hóa đơn'}
                  </div>

                  {/* Logo on bill */}
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                        {t('admin.settings.showStoreLogoOnBill') || 'Hiển thị Logo thương hiệu trên đầu hóa đơn'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {t('admin.settings.showStoreLogoOnBillDesc') || 'In logo thương hiệu Quán Trà ở vị trí trang trọng đầu hóa đơn.'}
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={settings.showStoreLogoOnBill}
                      onChange={(v) => updateSetting('showStoreLogoOnBill', v)}
                    />
                  </div>

                  {/* VietQR on bill */}
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                        {t('admin.settings.showVietQrOnBill') || 'Hiển thị mã QR VietQR động trên hóa đơn'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {t('admin.settings.showVietQrOnBillDesc') || 'In kèm mã QR thanh toán ngân hàng có sẵn số tiền và nội dung bàn để khách quét.'}
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={settings.showVietQrOnBill}
                      onChange={(v) => updateSetting('showVietQrOnBill', v)}
                    />
                  </div>

                  {/* Wifi on bill */}
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                        {t('admin.settings.showWifiOnBill') || 'Hiển thị thông tin Wifi & Mật khẩu trên hóa đơn'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {t('admin.settings.showWifiOnBillDesc') || 'In tên mạng Wifi và mật khẩu để khách hàng tiện kết nối internet.'}
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={settings.showWifiOnBill}
                      onChange={(v) => updateSetting('showWifiOnBill', v)}
                    />
                  </div>

                  {/* Customer points on bill */}
                  <div style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                        {t('admin.settings.showCustomerPointsOnBill') || 'Hiển thị điểm tích lũy của khách hàng'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {t('admin.settings.showCustomerPointsOnBillDesc') || 'In số điểm tích lũy hiện tại và điểm được cộng trong lần mua này.'}
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={settings.showCustomerPointsOnBill}
                      onChange={(v) => updateSetting('showCustomerPointsOnBill', v)}
                    />
                  </div>
                </div>

                {/* Bill Header & Footer text inputs */}
                <div id="sec-print-footer" style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  marginBottom: '20px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#0f172a'
                  }}>
                    {t('admin.settings.billFooterContent') || 'Thông tin cửa hàng & Lời cảm ơn'}
                  </div>

                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        {t('admin.settings.billHeaderStoreName') || 'Tên quán trên hóa đơn'}
                      </label>
                      <input
                        type="text"
                        value={settings.billHeaderStoreName}
                        onChange={(e) => updateSetting('billHeaderStoreName', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        {t('admin.settings.billHeaderAddress') || 'Địa chỉ quán'}
                      </label>
                      <input
                        type="text"
                        value={settings.billHeaderAddress}
                        onChange={(e) => updateSetting('billHeaderAddress', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                          {t('admin.settings.billHeaderPhone') || 'Số điện thoại hotline'}
                        </label>
                        <input
                          type="text"
                          value={settings.billHeaderPhone}
                          onChange={(e) => updateSetting('billHeaderPhone', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '13px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                          {t('admin.settings.billWifiInfo') || 'Thông tin Wifi'}
                        </label>
                        <input
                          type="text"
                          value={settings.billWifiInfo}
                          onChange={(e) => updateSetting('billWifiInfo', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '13px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        {t('admin.settings.billFooterThankYou') || 'Lời cảm ơn chân trang'}
                      </label>
                      <input
                        type="text"
                        value={settings.billFooterThankYou}
                        onChange={(e) => updateSetting('billFooterThankYou', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ─── RIGHT STICKY ANCHOR LINKS (KiotViet Right Edge Style) ─── */}
          <div style={{ width: '220px', flexShrink: 0, position: 'sticky', top: 0, alignSelf: 'flex-start' }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                {currentTabObj.label}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentTabObj.sections.map((sec, idx) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '4px 0',
                      textAlign: 'left',
                      fontSize: '12.5px',
                      color: idx === 0 ? '#1B5E20' : '#475569',
                      fontWeight: idx === 0 ? 700 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#1B5E20'}
                    onMouseLeave={(e) => {
                      if (idx !== 0) e.currentTarget.style.color = '#475569';
                    }}
                  >
                    <span style={{ color: '#94a3b8', fontSize: '11px' }}>|</span>
                    <span>{sec.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ═══ LIVE BILL TEMPLATE PREVIEW MODAL (K80 / K57) ═══ */}
      {showPreviewModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '460px',
            width: '100%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Printer size={16} color="#1B5E20" />
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                  {t('admin.settings.previewBillTitle') || 'Bản xem trước mẫu hóa đơn'} ({settings.paperSize.toUpperCase()})
                </span>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '4px',
                  borderRadius: '6px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Realistic Receipt Paper */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <div style={{
                width: settings.paperSize === 'k57' ? '280px' : '340px',
                backgroundColor: '#ffffff',
                padding: '20px 18px',
                borderRadius: '4px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontFamily: 'monospace, monospace',
                fontSize: '11.5px',
                color: '#1e293b',
                lineHeight: '1.4'
              }}>
                {/* Store Header */}
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                  {settings.showStoreLogoOnBill && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: '#0f172a',
                        color: '#d4af37',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Coffee size={20} />
                      </div>
                    </div>
                  )}
                  <div style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase' }}>
                    {settings.billHeaderStoreName}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                    {settings.billHeaderAddress}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    Hotline: {settings.billHeaderPhone}
                  </div>
                </div>

                <div style={{ textAlign: 'center', margin: '8px 0', borderTop: '1px dashed #cbd5e1', paddingTop: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '0.5px' }}>
                    HÓA ĐƠN THANH TOÁN
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    Số: HD-20261107-001 • Bàn: BÀN 01
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    07/11/2026 10:15 • TN: Hoàng Nam
                  </div>
                </div>

                <div style={{ borderTop: '1px dashed #cbd5e1', margin: '8px 0' }} />

                {/* Items table */}
                <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px dashed #cbd5e1', textAlign: 'left' }}>
                      <th style={{ padding: '4px 0', fontWeight: 700 }}>Món</th>
                      <th style={{ padding: '4px 0', textAlign: 'center', fontWeight: 700 }}>SL</th>
                      <th style={{ padding: '4px 0', textAlign: 'right', fontWeight: 700 }}>T.Tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '4px 0' }}>{t('admin.settings.sampleBillItem1') || 'Trà đào cam sả thanh nhiệt'}</td>
                      <td style={{ padding: '4px 0', textAlign: 'center' }}>2</td>
                      <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 700 }}>70.000</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 0' }}>{t('admin.settings.sampleBillItem2') || 'Mì xào bò thượng hạng'}</td>
                      <td style={{ padding: '4px 0', textAlign: 'center' }}>1</td>
                      <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 700 }}>45.000</td>
                    </tr>
                  </tbody>
                </table>

                <div style={{ borderTop: '1px dashed #cbd5e1', margin: '8px 0' }} />

                {/* Totals */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                  <span>Tiền hàng:</span>
                  <span style={{ fontWeight: 700 }}>115.000 đ</span>
                </div>
                {Number(settings.defaultVatRate) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#64748b' }}>
                    <span>Thuế VAT ({settings.defaultVatRate}%):</span>
                    <span>{formatMoney(115000 * Number(settings.defaultVatRate) / 100)}</span>
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderTop: '1px dashed #94a3b8',
                  marginTop: '4px',
                  fontSize: '13px',
                  fontWeight: 900
                }}>
                  <span>TỔNG CỘNG:</span>
                  <span>{formatMoney(115000 + (115000 * Number(settings.defaultVatRate) / 100))}</span>
                </div>

                {/* Customer Points */}
                {settings.showCustomerPointsOnBill && (
                  <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    margin: '8px 0',
                    fontSize: '10px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div>Khách: Nguyễn Văn A (0988.***.888)</div>
                    <div>Điểm tích: +11 điểm • Điểm khả dụng: 142 điểm</div>
                  </div>
                )}

                {/* Dynamic VietQR Preview */}
                {settings.showVietQrOnBill && (
                  <div style={{ textAlign: 'center', margin: '12px 0 8px 0' }}>
                    <div style={{
                      display: 'inline-flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff'
                    }}>
                      <div style={{ width: '100px', height: '100px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                        <QrCode size={80} color="#0f172a" />
                      </div>
                      <div style={{ fontSize: '9px', fontWeight: 800, marginTop: '4px', color: '#2E7D32' }}>
                        QUÉT MÃ VIETQR THANH TOÁN
                      </div>
                    </div>
                  </div>
                )}

                {/* Wifi */}
                {settings.showWifiOnBill && (
                  <div style={{ textAlign: 'center', fontSize: '10px', color: '#64748b', margin: '6px 0' }}>
                    📶 {settings.billWifiInfo}
                  </div>
                )}

                {/* Thank you */}
                <div style={{
                  textAlign: 'center',
                  fontSize: '11px',
                  fontWeight: 800,
                  marginTop: '10px',
                  borderTop: '1px dashed #cbd5e1',
                  paddingTop: '8px'
                }}>
                  {settings.billFooterThankYou}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              backgroundColor: '#f8fafc'
            }}>
              <button
                onClick={() => setShowPreviewModal(false)}
                style={{
                  padding: '7px 18px',
                  borderRadius: '6px',
                  backgroundColor: '#1B5E20',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {t('admin.settings.closePreview') || 'Đóng xem trước'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TOAST NOTIFICATION ═══ */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '10px 18px',
          borderRadius: '8px',
          fontSize: '12.5px',
          fontWeight: 700,
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 999999,
          animation: 'fadeIn 0.2s ease'
        }}>
          <CheckCircle size={15} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}

