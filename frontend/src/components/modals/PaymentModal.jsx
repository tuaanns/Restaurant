import React, { useState, useEffect } from 'react';
import { X, CreditCard, Banknote, QrCode, CheckCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { api } from '../../api';
import { VIETNAM_BANKS } from '../admin/BankAccountsView';
import { getRestaurantSettings } from '../../utils/restaurantSettings';

function playSuccessChime() {
  try {
    const settings = getRestaurantSettings();
    if (settings.kitchenAlertSound === false) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // First chime (A5 - 880Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.5);

    // Second chime (E6 - 1318.5Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.15);
    gain2.gain.setValueAtTime(0.35, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.8);
  } catch (e) {
    console.warn('AudioContext chime error:', e);
  }
}

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
  const [defaultBank, setDefaultBank] = useState(null);
  const [autoPaidInfo, setAutoPaidInfo] = useState(null);

  const totalAmount = order?.total_amount || 0;
  const formatMoney = (val) => Number(val || 0).toLocaleString('vi-VN') + ' đ';

  const activeBank = defaultBank || {
    bank_name: 'Ngân hàng TMCP Quân đội (MBBank)',
    bank_code: 'MB',
    bin: '970422',
    account_number: '19006888',
    account_name: 'QUAN TRA',
    qr_template: 'compact2'
  };

  const qrTransferContent = `QUAN TRA ${selectedTable?.name || ''}`.trim();
  const vietQrUrl = `https://img.vietqr.io/image/${activeBank.bin}-${activeBank.account_number}-${activeBank.qr_template || 'compact2'}.png?amount=${totalAmount}&addInfo=${encodeURIComponent(qrTransferContent)}&accountName=${encodeURIComponent(activeBank.account_name)}`;

  useEffect(() => {
    if (isOpen) {
      setAutoPaidInfo(null);
      api.getDefaultBankAccount().then(res => {
        if (res && res.bank_account) {
          setDefaultBank(res.bank_account);
        }
      }).catch(err => {
        console.warn('Could not fetch default bank account, using default fallback', err);
      });
    }
  }, [isOpen]);

  // Lắng nghe thanh toán tự động qua Webhook khi mở tab Chuyển khoản QR
  useEffect(() => {
    if (!isOpen || method !== 'qr_banking' || !order?.id) return;

    let isSubscribed = true;
    const interval = setInterval(async () => {
      try {
        const res = await api.checkOrderStatus(order.id);
        if (isSubscribed && res?.is_paid && !autoPaidInfo) {
          clearInterval(interval);
          playSuccessChime();
          setAutoPaidInfo(res);
          setIsSuccess(true);
          setTimeout(() => {
            onConfirmCheckout({
              payment_method: 'qr_banking',
              paid_amount: res.paid_amount || totalAmount,
            });
            setIsSuccess(false);
            setAutoPaidInfo(null);
            onClose();
          }, 1800);
        }
      } catch (e) {
        // Silent catch for background poll
      }
    }, 1500);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [isOpen, method, order?.id, autoPaidInfo, onConfirmCheckout, onClose, totalAmount]);

  if (!isOpen) return null;

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
    playSuccessChime();
    setTimeout(() => {
      onConfirmCheckout({
        payment_method: method,
        paid_amount: method === 'cash' ? (cashNum || totalAmount) : totalAmount,
      });
      setIsSuccess(false);
      onClose();

      // Tự động in hóa đơn nếu được bật trong Thiết lập Mẫu in / Đơn hàng
      const settings = getRestaurantSettings();
      if (settings.autoPrintOnPayment) {
        setTimeout(() => {
          window.print();
        }, 300);
      }
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
        width: '520px',
        maxWidth: '95vw',
        maxHeight: '92vh',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 25px 30px -5px rgba(0,0,0,0.25)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 20px',
          backgroundColor: '#0b1320',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800 }}>{t('payment.title')} (F9)</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
            {t('table.tableLabel') || t('table.tables')}: <strong style={{ color: '#38bdf8' }}>{formatTableName(selectedTable?.name)}</strong>{order?.order_code ? ` • ${order.order_code}` : ''}
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
          <>
            {/* Scrollable Body */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '14px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {/* Total Highlight */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{t('payment.total').toUpperCase()}</div>
                  {order?.discount_amount > 0 && (
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {t('payment.vatAndDiscount', { vat: order?.vat_percent || 8, discount: order?.discount_percent || 0 })}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#009688' }}>
                  {formatMoney(totalAmount)}
                </div>
              </div>

              {/* Payment Method Tabs */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  {t('payment.method').toUpperCase()}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <button
                    onClick={() => setMethod('cash')}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1.5px solid',
                      borderColor: method === 'cash' ? '#009688' : '#e2e8f0',
                      backgroundColor: method === 'cash' ? '#e6f7f5' : '#ffffff',
                      color: method === 'cash' ? '#00796b' : '#334155',
                      fontSize: '12px',
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
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1.5px solid',
                      borderColor: method === 'qr_banking' ? '#009688' : '#e2e8f0',
                      backgroundColor: method === 'qr_banking' ? '#e6f7f5' : '#ffffff',
                      color: method === 'qr_banking' ? '#00796b' : '#334155',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <QrCode size={18} />
                    <span>{t('payment.vietqr')}</span>
                  </button>

                  <button
                    onClick={() => setMethod('card')}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1.5px solid',
                      borderColor: method === 'card' ? '#009688' : '#e2e8f0',
                      backgroundColor: method === 'card' ? '#e6f7f5' : '#ffffff',
                      color: method === 'card' ? '#00796b' : '#334155',
                      fontSize: '12px',
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
                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      {t('payment.customerReceive')} (VND):
                    </label>
                    <input
                      type="number"
                      placeholder={t('payment.cashPlaceholder')}
                      value={cashGiven}
                      onChange={(e) => setCashGiven(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '15px',
                        fontWeight: 700,
                        outline: 'none',
                        color: '#0f172a'
                      }}
                    />
                  </div>

                  {/* Quick denomination pills */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    {quickAmounts.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setCashGiven(amt.toString())}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#f1f5f9',
                          fontSize: '11px',
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
                    padding: '8px 12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>{t('payment.change')}:</span>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: changeMoney > 0 ? '#009688' : '#0f172a' }}>
                      {formatMoney(changeMoney)}
                    </span>
                  </div>
                </div>
              )}

              {method === 'qr_banking' && (
                <div style={{ textAlign: 'center', padding: '2px 0' }}>
                  {autoPaidInfo && (
                    <div style={{
                      backgroundColor: '#ecfdf5',
                      border: '2px solid #10b981',
                      borderRadius: '12px',
                      padding: '12px',
                      marginBottom: '10px',
                      textAlign: 'center'
                    }}>
                      <CheckCircle size={28} color="#059669" style={{ margin: '0 auto 4px auto' }} />
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#065f46' }}>
                        {t('payment.webhookSuccessTitle')}
                      </div>
                      <div style={{ fontSize: '12px', color: '#047857', marginTop: '2px' }}>
                        {t('payment.webhookSuccessDesc', { amount: formatMoney(autoPaidInfo.paid_amount || totalAmount) })}
                      </div>
                    </div>
                  )}

                  <div style={{
                    display: 'inline-block',
                    padding: '6px',
                    backgroundColor: '#ffffff',
                    border: '2px solid #009688',
                    borderRadius: '10px',
                    marginBottom: '6px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                  }}>
                    <img
                      src={vietQrUrl}
                      alt="VietQR"
                      style={{
                        width: '150px',
                        height: 'auto',
                        maxHeight: '185px',
                        display: 'block',
                        borderRadius: '6px'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div style={{ display: 'none', padding: '16px' }}>
                      <QrCode size={110} color="#009688" />
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                    {VIETNAM_BANKS?.find(b => b.code === activeBank.bank_code)?.shortName || activeBank.bank_name || activeBank.bank_code}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                    {t('payment.accountNumber')}: <strong style={{ color: '#0f172a' }}>{activeBank.account_number}</strong> • {t('payment.accountOwner')}: <strong style={{ color: '#0f172a' }}>{activeBank.account_name}</strong>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                    {t('payment.transferContent')}: <strong style={{ color: '#009688' }}>{qrTransferContent}</strong>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#009688', marginTop: '2px' }}>
                    {t('payment.amount')}: {formatMoney(totalAmount)}
                  </div>
                </div>
              )}

              {method === 'card' && (
                <div style={{
                  textAlign: 'center',
                  padding: '20px 16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px'
                }}>
                  <CreditCard size={36} color="#009688" style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: '13.5px', fontWeight: 700 }}>{t('payment.cardInstruction')}</div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
                    {t('payment.cardSupported')}
                  </div>
                </div>
              )}
            </div>

            {/* Fixed Sticky Footer Actions */}
            <div style={{
              flexShrink: 0,
              padding: '12px 20px',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 -2px 10px rgba(0,0,0,0.03)'
            }}>
              <button
                onClick={onClose}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                {t('cancel')}
              </button>

              <button
                onClick={handlePay}
                style={{
                  padding: '10px 22px',
                  borderRadius: '8px',
                  backgroundColor: '#009688',
                  color: '#ffffff',
                  fontSize: '13.5px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 150, 136, 0.35)'
                }}
              >
                <span>{t('payment.confirm')}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
