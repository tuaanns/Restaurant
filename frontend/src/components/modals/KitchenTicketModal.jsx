import React from 'react';
import { X, Printer, Bell } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { getRestaurantSettings } from '../../utils/restaurantSettings';

function playKitchenChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {
    console.warn('Audio chime error:', e);
  }
}

export function KitchenTicketModal({
  isOpen,
  onClose,
  selectedTable,
  order,
  onConfirmSendKitchen
}) {
  const { t, formatTableName, formatDishName } = useLanguage();
  if (!isOpen) return null;

  const items = order?.items || [];
  const pendingItems = items.filter(it => it.status === 'new_pending');
  const itemsToPrint = pendingItems.length > 0 ? pendingItems : items;

  const now = new Date();
  const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('vi-VN');

  const handlePrintAndSend = () => {
    onConfirmSendKitchen();
    const settings = getRestaurantSettings();
    if (settings.kitchenAlertSound !== false) {
      playKitchenChime();
    }
    if (settings.autoPrintKitchenTicket !== false) {
      setTimeout(() => {
        window.print();
      }, 100);
    }
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }}>
      <div style={{
        width: '420px',
        maxWidth: '95vw',
        maxHeight: '94vh',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div className="no-print" style={{
          padding: '14px 18px',
          backgroundColor: '#0b1320',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} color="#00a884" />
            <span style={{ fontSize: '15px', fontWeight: 800 }}>{t('kitchen.sendKitchenModalTitle')}</span>
          </div>
          <button onClick={onClose} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Thermal Ticket Preview (K80 80mm standard) */}
        <div style={{ padding: '16px', backgroundColor: '#f1f5f9' }}>
          <div
            className="print-area"
            style={{
              backgroundColor: '#ffffff',
              padding: '20px',
              borderRadius: '8px',
              border: '1px dashed #cbd5e1',
              fontFamily: 'monospace',
              fontSize: '12.5px',
              color: '#000000',
              lineHeight: '1.4'
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '15px', fontWeight: 900 }}>QUÁN TRÀ</div>
              <div style={{ fontSize: '11px' }}>{t('header.branch')}</div>
              <div style={{
                fontSize: '14px',
                fontWeight: 900,
                marginTop: '6px',
                borderTop: '1px dashed #000',
                borderBottom: '1px dashed #000',
                padding: '4px 0'
              }}>
                PHIẾU BÁO BẾP / BAR
              </div>
            </div>

            {/* Info */}
            <div style={{ fontSize: '12px', marginBottom: '10px' }}>
              <div><strong>{t('table.tablePrefix') || 'BÀN'}:</strong> <span style={{ fontSize: '15px', fontWeight: 900 }}>{formatTableName(selectedTable?.name)}</span></div>
              <div><strong>Thời gian:</strong> {timeStr} - {dateStr}</div>
              <div><strong>Thu ngân:</strong> Thu Hằng (Ca sáng)</div>
              <div><strong>Mã phiếu:</strong> BEP-{Date.now().toString().slice(-6)}</div>
            </div>

            <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #000', textAlign: 'left' }}>
                  <th style={{ paddingBottom: '4px', width: '24px' }}>STT</th>
                  <th style={{ paddingBottom: '4px' }}>Tên món</th>
                  <th style={{ paddingBottom: '4px', textAlign: 'center', width: '32px' }}>SL</th>
                </tr>
              </thead>
              <tbody>
                {itemsToPrint.map((item, idx) => (
                  <React.Fragment key={item.id || idx}>
                    <tr>
                      <td style={{ paddingTop: '6px', verticalAlign: 'top' }}>{idx + 1}.</td>
                      <td style={{ paddingTop: '6px', fontWeight: 700, fontSize: '13px' }}>
                        {formatDishName(item.product_name, item.code || item.product_code)}
                      </td>
                      <td style={{ paddingTop: '6px', textAlign: 'center', fontWeight: 900, fontSize: '14px' }}>
                        {item.quantity}
                      </td>
                    </tr>
                    {item.note && (
                      <tr>
                        <td></td>
                        <td colSpan={2} style={{
                          fontSize: '11.5px',
                          color: '#d97706',
                          fontStyle: 'italic',
                          paddingBottom: '4px'
                        }}>
                          👉 Ghi chú: {item.note}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            <div style={{ borderTop: '1px dashed #000', marginTop: '12px', paddingTop: '8px', textAlign: 'center', fontSize: '11px' }}>
              *** XIN CẢM ƠN - BẾP LÀM NGAY ***
            </div>
          </div>
        </div>

        {/* Modal Actions: In & Gửi Bếp (Single Primary Button) */}
        <div className="no-print" style={{
          padding: '12px 18px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#ffffff'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              color: '#475569',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              background: '#ffffff'
            }}
          >
            {t('close')}
          </button>

          <button
            id="btn-print-and-send-kitchen"
            onClick={handlePrintAndSend}
            style={{
              padding: '9px 20px',
              borderRadius: '6px',
              backgroundColor: '#1B5E20',
              color: '#ffffff',
              fontSize: '13.5px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(27, 94, 32, 0.3)'
            }}
          >
            <Printer size={16} />
            <span>{t('kitchen.printAndSendKitchen')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
