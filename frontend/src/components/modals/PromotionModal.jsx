import React, { useState } from 'react';
import { X, Gift, Check, Tag, AlertCircle, Trash2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export function PromotionModal({
  isOpen,
  onClose,
  promotions = [],
  currentPromotionId,
  orderSubtotal = 0,
  onApplyPromotion
}) {
  const { t, formatPromoName } = useLanguage();
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const formatMoney = (val) => Number(val || 0).toLocaleString('vi-VN') + ' đ';

  const filteredPromos = promotions.filter(p => {
    if (!p.is_active) return false;
    const q = search.toLowerCase();
    const displayName = formatPromoName(p.name);
    return (p.name || '').toLowerCase().includes(q) ||
           displayName.toLowerCase().includes(q) ||
           (p.code || '').toLowerCase().includes(q);
  });

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110
    }}>
      <div style={{
        width: '500px',
        maxWidth: '92vw',
        maxHeight: '85vh',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 18px',
          backgroundColor: '#0b1320',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Gift size={18} color="#00a884" />
            <span style={{ fontSize: '15px', fontWeight: 800 }}>{t('promotion.modalTitle')}</span>
          </div>
          <button onClick={onClose} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Subtotal info banner */}
        <div style={{
          padding: '12px 18px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ fontSize: '13px', color: '#475569' }}>
            {t('promotion.currentSubtotal')}: <strong style={{ color: '#0f172a', fontSize: '14px' }}>{formatMoney(orderSubtotal)}</strong>
          </div>
          {currentPromotionId && (
            <button
              onClick={() => {
                onApplyPromotion(null);
                onClose();
              }}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#ef4444',
                background: '#fee2e2',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Trash2 size={13} />
              {t('promotion.removePromo')}
            </button>
          )}
        </div>

        {/* Search */}
        <div style={{ padding: '10px 18px', borderBottom: '1px solid #f1f5f9' }}>
          <input
            type="text"
            placeholder={t('promotion.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Promotions list */}
        <div style={{
          padding: '14px 18px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {filteredPromos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
              <Tag size={32} style={{ margin: '0 auto 8px auto', opacity: 0.5, display: 'block' }} />
              <div>{t('promotion.noActive')}</div>
            </div>
          ) : (
            filteredPromos.map(promo => {
              const isApplied = currentPromotionId === promo.id;
              const isEligible = orderSubtotal >= (promo.min_order || 0);
              const diffAmount = (promo.min_order || 0) - orderSubtotal;

              return (
                <div
                  key={promo.id}
                  style={{
                    border: isApplied
                      ? '2px solid #009688'
                      : isEligible
                      ? '1px solid #cbd5e1'
                      : '1px dashed #cbd5e1',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    backgroundColor: isApplied ? '#e6f7f5' : isEligible ? '#ffffff' : '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        fontSize: '12px',
                        color: isApplied ? '#00796b' : '#009688',
                        backgroundColor: isApplied ? '#b2dfdb' : '#e6f7f5',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {promo.code}
                      </span>
                      <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                        {formatPromoName(promo.name)}
                      </span>
                    </div>

                    <div style={{ fontSize: '12.5px', color: '#00897b', fontWeight: 600, marginBottom: '4px' }}>
                      {promo.type === 'order_discount' || promo.type === 'percent'
                        ? t('promotion.discountTotalOrder', { val: promo.discount_value })
                        : t('promotion.discountFixed', { val: formatMoney(promo.discount_value) })}
                    </div>

                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                      {promo.min_order > 0 ? (
                        <span>{t('promotion.minOrder')}: <strong>{formatMoney(promo.min_order)}</strong></span>
                      ) : (
                        <span>{t('promotion.allOrders')}</span>
                      )}
                      {promo.to_date && <span> • {t('promotion.validTo')}: {promo.to_date}</span>}
                    </div>

                    {!isEligible && (
                      <div style={{
                        marginTop: '6px',
                        fontSize: '11px',
                        color: '#d97706',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 500
                      }}>
                        <AlertCircle size={12} />
                        {t('promotion.buyMoreToQualify', { val: formatMoney(diffAmount) })}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div>
                    {isApplied ? (
                      <button
                        onClick={() => {
                          onApplyPromotion(null);
                          onClose();
                        }}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '6px',
                          backgroundColor: '#009688',
                          color: '#ffffff',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Check size={14} />
                        {t('promotion.applied')}
                      </button>
                    ) : (
                      <button
                        disabled={!isEligible}
                        onClick={() => {
                          onApplyPromotion(promo.id);
                          onClose();
                        }}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '6px',
                          backgroundColor: isEligible ? '#0f172a' : '#e2e8f0',
                          color: isEligible ? '#ffffff' : '#94a3b8',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          border: 'none',
                          cursor: isEligible ? 'pointer' : 'not-allowed'
                        }}
                      >
                        {t('promotion.apply')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 18px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end',
          backgroundColor: '#ffffff'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '7px 16px',
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
        </div>
      </div>
    </div>
  );
}
