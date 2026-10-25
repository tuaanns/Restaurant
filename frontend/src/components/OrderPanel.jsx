import React from 'react';
import {
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
  Utensils
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

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
  onEditItemNote
}) {
  const { t, formatTableName, formatDishName } = useLanguage();

  const formatMoney = (val) => {
    return Number(val || 0).toLocaleString('vi-VN') + ' đ';
  };

  if (!selectedTable) {
    return (
      <div style={{
        width: '460px',
        backgroundColor: '#ffffff',
        borderLeft: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px',
        color: '#94a3b8'
      }}>
        <Utensils size={48} strokeWidth={1.5} color="#cbd5e1" style={{ marginBottom: '16px' }} />
        <p style={{ fontSize: '16px', fontWeight: 600, color: '#475569' }}>{t('order.noTable')}</p>
        <p style={{ fontSize: '13px', marginTop: '4px' }}>{t('order.addItems')}</p>
      </div>
    );
  }

  const items = order?.items || [];
  const itemCount = items.reduce((acc, it) => acc + (it.quantity || 1), 0);
  const hasNewItems = items.some(it => it.status === 'new_pending');

  return (
    <div style={{
      width: '470px',
      minWidth: '470px',
      backgroundColor: '#ffffff',
      borderLeft: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 56px - 34px)',
      boxShadow: '-2px 0 8px rgba(0,0,0,0.02)'
    }}>
      {/* Header of Order Panel */}
      <div style={{
        padding: '12px 18px',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '5px 12px',
            borderRadius: '6px',
            fontSize: '13.5px',
            fontWeight: 800,
            letterSpacing: '0.3px'
          }}>
            {formatTableName(selectedTable.name)}
          </span>
          <span style={{ fontSize: '12.5px', color: '#64748b' }}>
            {t('order.timeIn')}: <strong style={{ color: '#334155' }}>{selectedTable.started_at || '11:30'}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            id="btn-transfer-table"
            onClick={onOpenTransferModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
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

          <button
            id="btn-clear-order"
            onClick={onClearOrder}
            title="Huỷ/Xoá đơn bàn"
            style={{
              padding: '6px 8px',
              borderRadius: '6px',
              border: '1px solid #fee2e2',
              backgroundColor: '#fff5f5',
              color: '#ef4444'
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Customer & Price Tier Subheader */}
      <div style={{
        padding: '8px 18px',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px'
      }}>
        <div
          id="btn-select-customer"
          onClick={onOpenCustomerModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            color: '#0f172a',
            fontWeight: 600
          }}
        >
          <User size={13} color="#64748b" />
          <span>{order?.customer ? `${order.customer.name} (${order.customer.phone || t('customer.tier')})` : t('customer.walkin')}</span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: '#64748b',
          cursor: 'pointer'
        }}>
          <span>{t('order.standardPriceList')}</span>
          <ChevronDown size={13} />
        </div>
      </div>

      {/* Item List */}
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
            <p style={{ fontSize: '14px', fontWeight: 600 }}>{t('order.emptyOrderHint')}</p>
            <button
              onClick={onOpenMenuModal}
              style={{
                marginTop: '12px',
                padding: '8px 16px',
                borderRadius: '6px',
                backgroundColor: '#009688',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600
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
                          color: '#009688'
                        }}>
                          <CheckCircle2 size={12} color="#009688" />
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
                          backgroundColor: '#f1f5f9'
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
                          backgroundColor: '#f1f5f9'
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

      {/* Calculation Summary Footer */}
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

        {/* Giảm giá hội viên - chỉ hiển thị khi có giảm giá */}
        {(order?.discount_amount > 0) && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12.5px',
            color: '#009688',
            marginBottom: '5px'
          }}>
            <span>{t('payment.memberDiscount')} ({order?.discount_percent || 0}%):</span>
            <span style={{ fontWeight: 600 }}>
              -{formatMoney(order?.discount_amount || 0)}
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
              border: hasNewItems ? '2px solid #009688' : '1px solid #80cbc4',
              backgroundColor: hasNewItems ? '#e6f7f5' : '#ffffff',
              color: '#00897b',
              fontSize: '12.5px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Bell size={14} color="#00897b" />
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
              gap: '6px'
            }}
          >
            <Printer size={14} color="#64748b" />
            <span>{t('order.preBill')}</span>
          </button>

          {/* Tách Đơn */}
          <button
            id="btn-split-order"
            onClick={() => alert(t('order.splitOrder'))}
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
              gap: '6px'
            }}
          >
            <Scissors size={14} color="#64748b" />
            <span>{t('order.splitOrder')}</span>
          </button>
        </div>

        {/* Primary Action Button: THANH TOÁN (F9) */}
        <button
          id="btn-checkout"
          onClick={onOpenCheckoutModal}
          style={{
            width: '100%',
            padding: '13px 18px',
            borderRadius: '8px',
            backgroundColor: '#009688',
            color: '#ffffff',
            fontSize: '15px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(0, 150, 136, 0.35)',
            transition: 'background-color 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#00796b'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#009688'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={18} />
            <span>{t('order.payment')} (F9)</span>
          </div>
          <span style={{ fontSize: '16px', letterSpacing: '0.4px' }}>
            {formatMoney(order?.total_amount || 0)}
          </span>
        </button>
      </div>
    </div>
  );
}
