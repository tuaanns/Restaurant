import React, { useState } from 'react';
import { X, CreditCard, Banknote, QrCode, CheckCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export function PaymentModal({
  isOpen,
  onClose,
  selectedTable,
  order,
  onConfirmCheckout
}) {
  const { t, formatTableName } = useLanguage();
  const [method, setMethod] = useState('cash'); // cash, qr_banking, card
  const [cashGiven, setCashGiven] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const totalAmount = order?.total_amount || 0;
  const formatMoney = (val) => Number(val || 0).toLocaleString('vi-VN') + ' đ';

  // Quick cash buttons
  const cashNum = Number(cashGiven) || 0;
  const changeMoney = Math.max(0, cashNum - totalAmount);

  const quickAmounts = [
    totalAmount,
    500000,
    600000,
    1000000,
    2000000
  ];

  const handlePay = () => {
    setIsSuccess(true);
    setTimeout(() => {
      onConfirmCheckout({
        payment_method: method,
        paid_amount: method === 'cash' ? (cashNum || totalAmount) : totalAmount,
      });
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }}>
      <div style={{
        width: '540px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 25px 30px -5px rgba(0,0,0,0.25)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          backgroundColor: '#0b1320',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800 }}>{t('payment.title')} (F9)</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
            {t('table.tables')}: <strong style={{ color: '#38bdf8' }}>{formatTableName(selectedTable?.name)}</strong>{order?.order_code ? ` • ${order.order_code}` : ''}
            </div>
          </div>
          <button onClick={onClose} style={{ color: '#94a3b8' }}>
            <X size={20} />
          </button>
        </div>

        {isSuccess ? (
          <div style={{ padding: '50px 20px', textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#e6f7f5',
              color: '#009688',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <CheckCircle size={36} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{t('payment.success')}</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
              {t('payment.collectedMoney')} {formatMoney(totalAmount)}. {t('table.tables')} {formatTableName(selectedTable?.name)} {t('payment.tableResetSuccess')}
            </p>
          </div>
        ) : (
          <div style={{ padding: '20px' }}>
            {/* Total Highlight */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '10px',
              padding: '14px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{t('payment.total').toUpperCase()}</div>
                {order?.discount_amount > 0 && <div style={{ fontSize: '11px', color: '#94a3b8' }}>Đã gồm VAT {order?.vat_percent || 8}% & Giảm hội viên {order?.discount_percent || 0}%</div>}
              </div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#009688' }}>
                {formatMoney(totalAmount)}
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                {t('payment.method').toUpperCase()}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <button
                  onClick={() => setMethod('cash')}
                  style={{
                    padding: '10px 8px',
                    borderRadius: '8px',
                    border: '1.5px solid',
                    borderColor: method === 'cash' ? '#009688' : '#e2e8f0',
                    backgroundColor: method === 'cash' ? '#e6f7f5' : '#ffffff',
                    color: method === 'cash' ? '#00796b' : '#334155',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Banknote size={18} />
                  <span>{t('payment.cash')}</span>
                </button>

                <button
                  onClick={() => setMethod('qr_banking')}
                  style={{
                    padding: '10px 8px',
                    borderRadius: '8px',
                    border: '1.5px solid',
                    borderColor: method === 'qr_banking' ? '#009688' : '#e2e8f0',
                    backgroundColor: method === 'qr_banking' ? '#e6f7f5' : '#ffffff',
                    color: method === 'qr_banking' ? '#00796b' : '#334155',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <QrCode size={18} />
                  <span>VietQR</span>
                </button>

                <button
                  onClick={() => setMethod('card')}
                  style={{
                    padding: '10px 8px',
                    borderRadius: '8px',
                    border: '1.5px solid',
                    borderColor: method === 'card' ? '#009688' : '#e2e8f0',
                    backgroundColor: method === 'card' ? '#e6f7f5' : '#ffffff',
                    color: method === 'card' ? '#00796b' : '#334155',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <CreditCard size={18} />
                  <span>{t('payment.card')}</span>
                </button>
              </div>
            </div>

            {/* Method Details */}
            {method === 'cash' && (
              <div>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    {t('payment.customerReceive')} (VND):
                  </label>
                  <input
                    type="number"
                    placeholder="Nhập số tiền khách đưa..."
                    value={cashGiven}
                    onChange={(e) => setCashGiven(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '16px',
                      fontWeight: 700,
                      outline: 'none',
                      color: '#0f172a'
                    }}
                  />
                </div>

                {/* Quick denomination pills */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setCashGiven(amt.toString())}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#f1f5f9',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        color: '#334155',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      {formatMoney(amt)}
                    </button>
                  ))}
                </div>

                {/* Change return */}
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>{t('payment.change')}:</span>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: changeMoney > 0 ? '#009688' : '#0f172a' }}>
                    {formatMoney(changeMoney)}
                  </span>
                </div>
              </div>
            )}

            {method === 'qr_banking' && (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{
                  display: 'inline-block',
                  padding: '10px',
                  backgroundColor: '#ffffff',
                  border: '2px solid #009688',
                  borderRadius: '10px',
                  marginBottom: '8px'
                }}>
                  <QrCode size={130} color="#0b1320" />
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  AURA RESTAURANT - MBBank
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  STK: <strong>19006888</strong> • Nội dung: <strong>AURA {selectedTable?.name}</strong>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#009688', marginTop: '4px' }}>
                  Số tiền: {formatMoney(totalAmount)}
                </div>
              </div>
            )}

            {method === 'card' && (
              <div style={{
                textAlign: 'center',
                padding: '24px 16px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px'
              }}>
                <CreditCard size={40} color="#009688" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '14px', fontWeight: 700 }}>Vui lòng quẹt thẻ trên thiết bị POS cầm tay</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Hỗ trợ thẻ Chip, Thẻ từ, Visa/Mastercard, Apple Pay
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid #f1f5f9'
            }}>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                {t('cancel')}
              </button>

              <button
                onClick={handlePay}
                style={{
                  padding: '11px 24px',
                  borderRadius: '8px',
                  backgroundColor: '#009688',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(0, 150, 136, 0.35)'
                }}
              >
                <span>{t('payment.confirm')}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
