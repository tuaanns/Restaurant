import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowLeftRight,
  Trash2,
  User,
  ChevronDown,
  Bell,
  Printer,
  Scissors,
  CreditCard,
  Plus,
  Minus,
  AlertCircle,
  FileText,
  Clock,
  CheckCircle2,
  Utensils,
  Gift,
  X,
  Store,
  ShoppingBag,
  Bike
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { getRestaurantSettings } from '../utils/restaurantSettings';
import {
  SALES_CHANNELS,
  getSalesChannel,
  formatChannelName,
  renderChannelIcon
} from '../utils/salesChannelsHelper';

export function OrderPanel({
  selectedTable,
  order,
  onUpdateQuantity,
  onRemoveItem,
  onOpenKitchenModal,
  onOpenPreBillModal,
  onOpenCheckoutModal,
  onOpenTransferModal,
  onOpenCustomerModal,
  onOpenMenuModal,
  onClearOrder,
  onEditItemNote,
  onOpenPromotionModal,
  onApplyPromotion,
  promotions = [],
  isMobile = false,
  onBackToTables,
  onOpenSplitOrderModal,
  onShowToast,

  // Multi-tab order props
  tabs = [],
  activeTabId,
  onSelectTab,
  onCreateTab,
  onCloseTab,

  // Sales Channel props
  salesChannel = 'direct',
  onSelectChannel,
  channelOrderCode = '',
  onChangeChannelOrderCode,
  onSelectTakeawayTable
}) {
  const { t, lang, formatTableName, formatDishName, formatPromoName } = useLanguage();
  const [isChannelDropdownOpen, setIsChannelDropdownOpen] = useState(false);
  const channelDropdownRef = useRef(null);

  // Close channel dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (channelDropdownRef.current && !channelDropdownRef.current.contains(e.target)) {
        setIsChannelDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-time clock (updated every second)
  const [liveClock, setLiveClock] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setLiveClock(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getTableTimeDisplay = () => {
    const hasItems = order?.items && order.items.length > 0;
    if (hasItems) {
      if (selectedTable?.started_at && typeof selectedTable.started_at === 'string') {
        const match = selectedTable.started_at.match(/(\d{2}:\d{2})/);
        if (match) return match[1];
        return selectedTable.started_at;
      }
      if (order?.created_time) return order.created_time;
      if (order?.created_at) {
        if (typeof order.created_at === 'string') {
          const match = order.created_at.match(/(\d{2}:\d{2})/);
          if (match) return match[1];
        }
        try {
          const d = new Date(order.created_at);
          if (!isNaN(d.getTime())) {
            return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
          }
        } catch (e) {}
      }
    }
    return liveClock;
  };

  const formatMoney = (val) => {
    return Number(val || 0).toLocaleString('vi-VN') + ' đ';
  };

  const items = order?.items || [];
  const itemCount = items.reduce((acc, it) => acc + (it.quantity || 1), 0);
  const hasNewItems = items.some(it => it.status === 'new_pending');
  const currentChannel = getSalesChannel(salesChannel);

  return (
    <div style={{
      width: isMobile ? '100%' : '470px',
      minWidth: isMobile ? 'unset' : '470px',
      backgroundColor: '#ffffff',
      borderLeft: isMobile ? 'none' : '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      height: isMobile ? '100%' : 'calc(100vh - 56px - 34px)',
      boxShadow: isMobile ? 'none' : '-2px 0 8px rgba(0,0,0,0.02)'
    }}>
      {/* ═══ 1. TOP TAB BAR: Multi-order session tabs with (+) button ═══ */}
      <div style={{
        backgroundColor: '#0b1320',
        padding: '6px 10px 0 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '6px',
        borderBottom: '1px solid #1e293b',
        flexShrink: 0
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          overflowX: 'auto',
          flex: 1,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {Array.isArray(tabs) && tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            const tabItems = isActive ? items : (tab.order?.items || []);
            const tabCount = tabItems.reduce((acc, it) => acc + (it.quantity || 1), 0);
            const tabChannel = getSalesChannel(isActive ? salesChannel : (tab.salesChannel || 'direct'));
            const tabTitle = tab.table
              ? formatTableName(tab.table.name)
              : (tab.title || t('order.newTab') || 'Hóa đơn');

            return (
              <div
                key={tab.id}
                onClick={() => onSelectTab && onSelectTab(tab.id)}
                title={`${tabTitle} (${formatChannelName(tabChannel.id, lang)})`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: isActive ? '7px 12px' : '6px 10px',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                  backgroundColor: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
                  color: isActive ? '#0f172a' : '#cbd5e1',
                  fontSize: '12.5px',
                  fontWeight: isActive ? 800 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  borderBottom: isActive ? '1px solid #ffffff' : 'none',
                  boxShadow: isActive ? '0 -2px 6px rgba(0,0,0,0.12)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.22)';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                    e.currentTarget.style.color = '#cbd5e1';
                  }
                }}
              >
                {/* Channel indicator dot */}
                {tabChannel.id !== 'direct' && (
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: tabChannel.color,
                      flexShrink: 0
                    }}
                    title={formatChannelName(tabChannel.id, lang)}
                  />
                )}

                <span>{tabTitle}</span>

                {/* Items badge if tab has dishes */}
                {tabCount > 0 && (
                  <span style={{
                    fontSize: '11px',
                    padding: '1px 5px',
                    borderRadius: '10px',
                    backgroundColor: isActive ? '#E8F5E9' : 'rgba(255,255,255,0.22)',
                    color: isActive ? '#1B5E20' : '#ffffff',
                    fontWeight: 800
                  }}>
                    {tabCount}
                  </span>
                )}

                {/* Close Tab (x) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onCloseTab) onCloseTab(tab.id);
                  }}
                  title={t('close') || 'Đóng tab'}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: isActive ? '#94a3b8' : '#94a3b8',
                    borderRadius: '50%',
                    marginLeft: '2px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ef4444';
                    e.currentTarget.style.backgroundColor = isActive ? '#fee2e2' : 'rgba(239, 68, 68, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#94a3b8';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <X size={13} strokeWidth={2.5} />
                </button>
              </div>
            );
          })}

          {/* (+) Button to Add New Tab */}
          <button
            type="button"
            id="btn-add-order-tab"
            onClick={onCreateTab}
            title={t('order.addTabTooltip') || 'Thêm tab hóa đơn mới (+)'}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
              marginBottom: '3px',
              marginLeft: '4px',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.45)',
              transition: 'transform 0.15s, background-color 0.15s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0369a1';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0284c7';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Plus size={16} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* ═══ 2. HEADER: Table / Order Name & Quick Table Actions ═══ */}
      <div style={{
        padding: isMobile ? '10px 14px' : '10px 16px',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isMobile && onBackToTables && (
            <button
              onClick={onBackToTables}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 8px',
                borderRadius: '6px',
                backgroundColor: '#f1f5f9',
                color: '#0f172a',
                fontSize: '12px',
                fontWeight: 700,
                border: '1px solid #e2e8f0'
              }}
            >
              <ArrowLeft size={13} />
              <span>{t('order.pickTable') || 'Bàn'}</span>
            </button>
          )}

          {selectedTable ? (
            <span style={{
              backgroundColor: '#0f172a',
              color: '#ffffff',
              padding: '5px 10px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 800,
              letterSpacing: '0.3px'
            }}>
              {formatTableName(selectedTable.name)}
            </span>
          ) : (
            <span style={{
              backgroundColor: '#334155',
              color: '#ffffff',
              padding: '5px 10px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 800,
              letterSpacing: '0.3px'
            }}>
              {t('order.newTab') || 'Đơn tự do'}
            </span>
          )}

          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
            {getTableTimeDisplay()}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {selectedTable ? (
            <button
              id="btn-transfer-table"
              onClick={onOpenTransferModal}
              title={t('order.transfer')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                fontSize: '12px',
                fontWeight: 600,
                color: '#334155'
              }}
            >
              <ArrowLeftRight size={13} />
              <span>{t('order.transfer')}</span>
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              {onSelectTakeawayTable && (
                <button
                  onClick={onSelectTakeawayTable}
                  title="Gán đơn này là Bán mang về"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 9px',
                    borderRadius: '6px',
                    border: '1px solid #bae6fd',
                    backgroundColor: '#e0f2fe',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#0284c7',
                    cursor: 'pointer'
                  }}
                >
                  <ShoppingBag size={12} />
                  <span>{t('order.quickTakeaway') || 'Mang về'}</span>
                </button>
              )}
              {isMobile && onBackToTables && (
                <button
                  onClick={onBackToTables}
                  title="Chọn bàn trên sơ đồ"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 9px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  <span>{t('order.pickTable') || 'Chọn bàn'}</span>
                </button>
              )}
            </div>
          )}

          <button
            id="btn-clear-order"
            onClick={onClearOrder}
            title={t('order.clearOrder') || 'Huỷ/Xoá đơn'}
            style={{
              padding: '6px 8px',
              borderRadius: '6px',
              border: '1px solid #fee2e2',
              backgroundColor: '#fff5f5',
              color: '#ef4444',
              cursor: 'pointer'
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* ═══ 3. SUBHEADER: Customer, Sales Channel Selector & Price Tier ═══ */}
      <div style={{
        padding: '8px 16px',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        fontSize: '12px'
      }}>
        {/* Customer Button */}
        <div
          id="btn-select-customer"
          onClick={onOpenCustomerModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            color: '#0f172a',
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1
          }}
        >
          <User size={13} color="#64748b" style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {order?.customer ? `${order.customer.name} (${order.customer.phone || t('customer.tier')})` : t('customer.walkin')}
          </span>
        </div>

        {/* Sales Channel Selector Dropdown */}
        <div style={{ position: 'relative' }} ref={channelDropdownRef}>
          <button
            type="button"
            id="btn-sales-channel"
            onClick={() => setIsChannelDropdownOpen(prev => !prev)}
            title={t('order.salesChannel') || 'Chọn kênh bán'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 8px',
              borderRadius: '6px',
              backgroundColor: currentChannel.bgColor,
              border: `1px solid ${currentChannel.borderColor}`,
              color: currentChannel.color,
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {renderChannelIcon(currentChannel.iconType, 13, currentChannel.color)}
            <span>{formatChannelName(salesChannel, lang, true)}</span>
            <ChevronDown size={11} color={currentChannel.color} />
          </button>

          {/* Sales Channel Menu Popover */}
          {isChannelDropdownOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 4px)',
              width: '240px',
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 12px 28px -4px rgba(0,0,0,0.18)',
              padding: '6px',
              zIndex: 100
            }}>
              <div style={{
                padding: '6px 10px',
                fontSize: '10.5px',
                fontWeight: 800,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                borderBottom: '1px solid #f1f5f9',
                marginBottom: '4px'
              }}>
                {t('order.salesChannel') || 'KÊNH BÁN HÀNG'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '300px', overflowY: 'auto' }}>
                {SALES_CHANNELS.map((ch) => {
                  const isSelected = ch.id === salesChannel;
                  return (
                    <div
                      key={ch.id}
                      onClick={() => {
                        if (onSelectChannel) onSelectChannel(ch.id);
                        setIsChannelDropdownOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 10px',
                        borderRadius: '7px',
                        backgroundColor: isSelected ? ch.bgColor : 'transparent',
                        color: isSelected ? ch.color : '#1e293b',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: isSelected ? 800 : 500,
                        transition: 'background-color 0.12s'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          backgroundColor: ch.bgColor,
                          color: ch.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `1px solid ${ch.borderColor}`
                        }}>
                          {renderChannelIcon(ch.iconType, 13, ch.color)}
                        </div>
                        <div>
                          <div>{formatChannelName(ch.id, lang)}</div>
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 size={14} color={ch.color} />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Price Tier Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: '#64748b',
          cursor: 'pointer',
          flexShrink: 0
        }}>
          <span>{t('order.standardPriceList')}</span>
          <ChevronDown size={12} />
        </div>
      </div>

      {/* ═══ 4. DELIVERY APP ORDER CODE BANNER (Optional for ShopeeFood/GrabFood...) ═══ */}
      {currentChannel.hasOrderCode && (
        <div style={{
          padding: '6px 16px',
          backgroundColor: currentChannel.bgColor,
          borderBottom: `1px solid ${currentChannel.borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: currentChannel.color,
            fontSize: '11.5px',
            fontWeight: 700,
            whiteSpace: 'nowrap'
          }}>
            {renderChannelIcon(currentChannel.iconType, 13, currentChannel.color)}
            <span>{t('order.channelOrderCode') || 'Mã đơn app'}:</span>
          </div>

          <input
            type="text"
            value={channelOrderCode || ''}
            onChange={(e) => onChangeChannelOrderCode && onChangeChannelOrderCode(e.target.value)}
            placeholder={t('order.channelCodePlaceholder') || 'VD: #SPF-8392...'}
            style={{
              flex: 1,
              maxWidth: '220px',
              padding: '3px 8px',
              borderRadius: '4px',
              border: `1px solid ${currentChannel.borderColor}`,
              backgroundColor: '#ffffff',
              fontSize: '11.5px',
              fontWeight: 600,
              color: '#0f172a',
              outline: 'none'
            }}
          />
        </div>
      )}

      {/* ═══ 5. ITEM LIST ═══ */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 18px'
      }}>
        {items.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '50px 20px',
            color: '#94a3b8'
          }}>
            <Utensils size={40} strokeWidth={1.5} color="#cbd5e1" style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '14px', fontWeight: 600 }}>{t('order.emptyOrderHint')}</p>
            <button
              onClick={onOpenMenuModal}
              style={{
                marginTop: '12px',
                padding: '8px 16px',
                borderRadius: '6px',
                backgroundColor: '#1B5E20',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(27, 94, 32, 0.25)'
              }}
            >
              + {t('order.addItems')} (F2)
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {items.map((item, index) => {
              const isSentKitchen = item.status === 'sent_kitchen';
              const isPending = item.status === 'new_pending';
              const isWarningNote = item.note && (item.note.includes('Không') || item.note.includes('nhiều'));

              return (
                <div
                  key={item.id || index}
                  style={{
                    paddingBottom: '12px',
                    borderBottom: '1px solid #f1f5f9'
                  }}
                >
                  {/* Row 1: Index, Name, Total Price */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: '3px'
                  }}>
                    <div style={{
                      fontSize: '13.5px',
                      fontWeight: 700,
                      color: '#0f172a',
                      flex: 1,
                      paddingRight: '10px'
                    }}>
                      <span>{index + 1}. </span>
                      <span>{formatDishName(item.product_name, item.code || item.product_code)}</span>
                    </div>

                    <div style={{
                      fontSize: '14px',
                      fontWeight: 800,
                      color: '#0f172a',
                      textAlign: 'right'
                    }}>
                      {formatMoney(item.subtotal || (item.price * item.quantity))}
                    </div>
                  </div>

                  {/* Row 2: Note / Description & Unit price */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '6px'
                  }}>
                    <div
                      onClick={() => onEditItemNote && onEditItemNote(item)}
                      style={{
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: isWarningNote ? '#d97706' : '#64748b',
                        backgroundColor: isWarningNote ? '#fef3c7' : '#f8fafc',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        maxWidth: '280px'
                      }}
                    >
                      {isWarningNote ? (
                        <AlertCircle size={11} color="#d97706" />
                      ) : (
                        <FileText size={11} color="#94a3b8" />
                      )}
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {item.note || 'Thêm ghi chú...'}
                      </span>
                    </div>

                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {formatMoney(item.price)}/{item.unit || 'phần'}
                    </div>
                  </div>

                  {/* Row 3: Status Badge & Stepper */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    {/* Status Badge */}
                    <div>
                      {isSentKitchen ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          color: '#1B5E20'
                        }}>
                          <CheckCircle2 size={12} color="#1B5E20" />
                          <span>{t('order.sentKitchen')}</span>
                        </span>
                      ) : isPending ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: '#fef3c7',
                          color: '#b45309',
                          padding: '2px 7px',
                          borderRadius: '4px'
                        }}>
                          <Clock size={11} color="#b45309" />
                          <span>{t('order.newPending')}</span>
                        </span>
                      ) : item.is_auto_added ? (
                        <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                          {t('order.autoAdded')}
                        </span>
                      ) : null}
                    </div>

                    {/* Stepper Quantity */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      overflow: 'hidden'
                    }}>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        style={{
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#475569',
                          backgroundColor: '#f1f5f9',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <Minus size={11} />
                      </button>

                      <span style={{
                        width: '28px',
                        textAlign: 'center',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        color: '#0f172a'
                      }}>
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        style={{
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#475569',
                          backgroundColor: '#f1f5f9',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ 6. CALCULATION SUMMARY & ACTION FOOTER ═══ */}
      <div style={{
        padding: '12px 18px',
        borderTop: '1px solid #f1f5f9',
        backgroundColor: '#ffffff'
      }}>
        {/* Tạm tính */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12.5px',
          color: '#475569',
          marginBottom: '5px'
        }}>
          <span>{t('order.subtotal')} ({itemCount} {t('table.items')}):</span>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>
            {formatMoney(order?.subtotal || 0)}
          </span>
        </div>

        {/* Nút chọn hoặc hiển thị Khuyến Mãi (CTKM) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12.5px',
          marginBottom: '6px',
          padding: '6px 8px',
          borderRadius: '6px',
          backgroundColor: order?.promotion_id ? '#E8F5E9' : '#f8fafc',
          border: order?.promotion_id ? '1px solid #A5D6A7' : '1px dashed #cbd5e1'
        }}>
          <div
            onClick={onOpenPromotionModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              flex: 1,
              color: order?.promotion_id ? '#1B5E20' : '#475569',
              fontWeight: order?.promotion_id ? 700 : 500
            }}
          >
            <Gift size={14} color={order?.promotion_id ? '#1B5E20' : '#64748b'} />
            <span>
              {order?.promotion_id
                ? formatPromoName(order.promotion_name || order.promotion_code)
                : (t('order.applyPromotion') || '🎁 Áp dụng Khuyến Mãi / CTKM')}
            </span>
          </div>

          {order?.promotion_id ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, color: '#1B5E20' }}>
                -{formatMoney(order?.promotion_discount_amount || 0)}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApplyPromotion && onApplyPromotion(null);
                }}
                title={t('order.removePromotion') || 'Hủy khuyến mãi'}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Trash2 size={13} color="#ef4444" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenPromotionModal}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#0284c7',
                background: '#e0f2fe',
                border: 'none',
                borderRadius: '4px',
                padding: '2px 8px',
                cursor: 'pointer'
              }}
            >
              {t('order.selectPromotion') || 'Chọn'}
            </button>
          )}
        </div>

        {/* Giảm giá hội viên - chỉ hiển thị khi có chiết khấu hội viên */}
        {(order?.discount_percent > 0) && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12.5px',
            color: '#1B5E20',
            marginBottom: '5px'
          }}>
            <span>{t('payment.memberDiscount')} ({order?.discount_percent || 0}%):</span>
            <span style={{ fontWeight: 600 }}>
              -{formatMoney(Math.round((order?.subtotal || 0) * ((order?.discount_percent || 0) / 100)))}
            </span>
          </div>
        )}

        {/* Thuế VAT */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12.5px',
          color: '#475569',
          marginBottom: '10px'
        }}>
          <span>{t('order.vat')} ({order?.vat_percent || 8}%):</span>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>
            {formatMoney(order?.vat_amount || 0)}
          </span>
        </div>

        {/* Tổng thanh toán */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '8px',
          borderTop: '1px dashed #e2e8f0',
          marginBottom: '12px'
        }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.3px' }}>
            {t('order.total').toUpperCase()}:
          </span>
          <span style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>
            {formatMoney(order?.total_amount || 0)}
          </span>
        </div>

        {/* Action Row 1: Báo Bếp (F10), In Tạm Tính, Tách Đơn */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          {/* Báo Bếp (F10) */}
          <button
            id="btn-send-kitchen"
            onClick={onOpenKitchenModal}
            style={{
              padding: '9px 6px',
              borderRadius: '7px',
              border: hasNewItems ? '2px solid #1B5E20' : '1px solid #A5D6A7',
              backgroundColor: hasNewItems ? '#E8F5E9' : '#ffffff',
              color: '#1B5E20',
              fontSize: '12.5px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Bell size={14} color="#1B5E20" />
            <span>{t('order.sendKitchen')}</span>
          </button>

          {/* In Tạm Tính */}
          <button
            id="btn-print-prebill"
            onClick={onOpenPreBillModal}
            style={{
              padding: '9px 6px',
              borderRadius: '7px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: '12.5px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Printer size={14} color="#64748b" />
            <span>{t('order.preBill')}</span>
          </button>

          {/* Tách Đơn */}
          <button
            id="btn-split-order"
            onClick={() => {
              if (!order?.items || order.items.length === 0) {
                if (onShowToast) {
                  onShowToast('Bàn hiện chưa có món ăn nào để tách đơn!', 'warning');
                }
                return;
              }
              if (onOpenSplitOrderModal) {
                onOpenSplitOrderModal();
              }
            }}
            style={{
              padding: '9px 6px',
              borderRadius: '7px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: '12.5px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Scissors size={14} color="#64748b" />
            <span>{t('order.splitOrder')}</span>
          </button>
        </div>

        {/* Primary Action Button: THANH TOÁN (F9) */}
        <button
          id="btn-checkout"
          onClick={() => {
            const settings = getRestaurantSettings();
            if (settings.allowPayBeforeKitchen === false && hasNewItems) {
              if (onShowToast) {
                onShowToast('Cấu hình quản lý: Cần bấm "Báo Bếp" trước khi thanh toán!');
              } else {
                alert('Cấu hình quản lý: Cần bấm "Báo Bếp" trước khi thanh toán!');
              }
              return;
            }
            onOpenCheckoutModal();
          }}
          style={{
            width: '100%',
            padding: '13px 18px',
            borderRadius: '8px',
            backgroundColor: '#1B5E20',
            color: '#ffffff',
            fontSize: '15px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(27, 94, 32, 0.35)',
            transition: 'background-color 0.15s ease',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2E7D32'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1B5E20'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={18} />
            <span>{t('order.payment')}</span>
          </div>
          <span style={{ fontSize: '16px', letterSpacing: '0.4px' }}>
            {formatMoney(order?.total_amount || 0)}
          </span>
        </button>
      </div>
    </div>
  );
}
