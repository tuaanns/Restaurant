import React from 'react';
import { Users, Check, ShoppingBag, Star } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export function TableCard({
  table,
  isSelected,
  onSelectTable
}) {
  const { t, formatTableName } = useLanguage();
  const isOccupied = table.status === 'occupied';
  const isBilling = table.status === 'billing';
  const isEmpty = table.status === 'empty';
  const isTakeaway = table.is_takeaway;
  const isVip = table.is_vip;

  // Format currency
  const formatMoney = (val) => {
    if (!val) return '0 đ';
    return Number(val).toLocaleString('vi-VN') + ' đ';
  };

  // Theme styling based on card type
  let cardBg = '#ffffff';
  let cardBorder = '#e2e8f0';
  let textColor = '#0f172a';
  let subtextColor = '#64748b';
  let priceColor = '#0f172a';

  if (isTakeaway) {
    // Bàn MANG VỀ luôn xanh navy đặc trưng dù trống hay đang có đơn
    cardBg = '#14233c';
    cardBorder = isSelected ? '#38bdf8' : '#213a61';
    textColor = '#ffffff';
    subtextColor = '#94a3b8';
    priceColor = '#ffffff';
  } else if (isEmpty) {
    cardBg = '#ffffff';
    cardBorder = isSelected ? '#009688' : '#e2e8f0';
    textColor = '#0f172a';
    subtextColor = '#64748b';
    priceColor = '#0f172a';
  } else if (isBilling) {
    cardBg = '#fefce8';
    cardBorder = '#fef08a';
    textColor = '#713f12';
    subtextColor = '#a16207';
    priceColor = '#713f12';
  } else if (isSelected) {
    cardBorder = '#009688';
  } else if (isOccupied) {
    cardBorder = '#bbf7d0';
  }

  return (
    <div
      id={`table-card-${table.id}`}
      onClick={() => onSelectTable(table)}
      style={{
        position: 'relative',
        backgroundColor: cardBg,
        border: isSelected ? '2px solid #009688' : `1.5px solid ${cardBorder}`,
        borderRadius: '12px',
        padding: '12px 14px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '142px',
        boxShadow: isSelected
          ? '0 4px 14px rgba(0, 150, 136, 0.25)'
          : '0 1px 3px rgba(0, 0, 0, 0.04)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Selected Indicator Checkmark */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          top: '-7px',
          right: '-7px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: '#009688',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          zIndex: 2
        }}>
          <Check size={13} strokeWidth={3} />
        </div>
      )}

      {/* Top row: Name & Duration badge */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '4px'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 800,
            color: textColor,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {isTakeaway ? (
              <>
                <ShoppingBag size={14} color={isEmpty ? '#0284c7' : '#38bdf8'} />
                <span>{t('table.takeaway')}</span>
              </>
            ) : isVip ? (
              <>
                <Star size={13} color="#f59e0b" fill="#f59e0b" />
                <span>{formatTableName(table.name)}</span>
              </>
            ) : (
              <span>{formatTableName(table.name)}</span>
            )}
          </div>

          {/* Badge for time or status */}
          {!isEmpty && table.duration && !isTakeaway && (
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: isBilling ? '#fef3c7' : '#e6f7f5',
              color: isBilling ? '#b45309' : '#00796b',
            }}>
              {table.duration}
            </span>
          )}

          {!isEmpty && isTakeaway && (
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: '#1e3352',
              color: '#93c5fd'
            }}>
              {table.order?.order_code || t('table.hasOrder')}
            </span>
          )}

          {!isEmpty && isBilling && !table.duration && (
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: '#fef3c7',
              color: '#b45309'
            }}>
              {t('table.billingShort')}
            </span>
          )}
        </div>

        {/* Subtitle: Seats / Selected label */}
        <div style={{
          fontSize: '11.5px',
          color: subtextColor,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          marginBottom: '8px'
        }}>
          {isSelected && (
            <span style={{ color: '#009688', fontWeight: 700, marginRight: '4px' }}>
              {t('table.selected')}
            </span>
          )}

          {!isTakeaway && (
            <>
              <Users size={12} />
              <span>
                {table.guest_count > 0 ? `${table.guest_count} ${t('table.guests')}` : `${table.capacity} ${t('table.seats')}`}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Middle info: Notes / Status label */}
      <div style={{
        fontSize: '12px',
        color: subtextColor,
        margin: 'auto 0 6px 0'
      }}>
        {isTakeaway ? (
          isEmpty
            ? <span style={{ color: '#64748b' }}>{t('table.noOrder')}</span>
            : <span>{table.notes || t('table.packing')}</span>
        ) : isEmpty ? (
          <span style={{ color: '#94a3b8' }}>{t('table.empty')}</span>
        ) : (
          <span>{table.notes || (table.order ? `${table.order.item_count || 1} ${t('table.items')}` : t('table.dining'))}</span>
        )}
      </div>

      {/* Bottom row: Total money */}
      <div style={{
        fontSize: '14px',
        fontWeight: 800,
        color: priceColor,
        borderTop: isTakeaway && !isEmpty ? '1px dashed #213a61' : '1px dashed #e2e8f0',
        paddingTop: '6px'
      }}>
        {isEmpty ? (
          <span style={{ color: '#cbd5e1', fontWeight: 600 }}>--</span>
        ) : table.order && table.order.total_amount ? (
          formatMoney(table.order.total_amount)
        ) : (
          <span style={{ color: '#cbd5e1', fontWeight: 600 }}>--</span>
        )}
      </div>
    </div>
  );
}
