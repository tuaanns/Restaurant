import React, { useState } from 'react';
import { X, User, Crown, Check } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export function CustomerModal({
  isOpen,
  onClose,
  customers = [],
  currentCustomerId,
  onSelectCustomer
}) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const getTierLabel = (tier) => {
    if (!tier) return '';
    const lower = tier.toLowerCase();
    if (lower.includes('kim cương') || lower.includes('diamond')) return t('admin.tierDiamond');
    if (lower.includes('vàng') || lower.includes('gold')) return t('admin.tierGold');
    if (lower.includes('bạc') || lower.includes('silver')) return t('admin.tierSilver');
    if (lower.includes('mới') || lower.includes('new')) return t('admin.tierNew');
    if (lower.includes('hội viên') || lower.includes('member')) return t('admin.tierMember');
    return tier;
  };

  const defaultCustomers = customers.length > 0 ? customers : [
    { id: 1, name: 'Anh Hoàng', phone: '0912.888.xxx', membership_tier: 'Hội viên Kim Cương', discount_percent: 5 },
    { id: 2, name: 'Chị Phương Linh', phone: '0988.666.888', membership_tier: 'Hội viên Vàng', discount_percent: 10 },
    { id: 3, name: t('customer.walkin'), phone: '-', membership_tier: t('customer.tier'), discount_percent: 0 },
  ];

  const filtered = defaultCustomers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search))
  );

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
        width: '460px',
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
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
            <User size={18} color="#00a884" />
            <span style={{ fontSize: '15px', fontWeight: 800 }}>{t('customer.title')} (F4)</span>
          </div>
          <button onClick={onClose} style={{ color: '#94a3b8' }}>
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 18px', borderBottom: '1px solid #f1f5f9' }}>
          <input
            type="text"
            placeholder={t('customer.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px'
            }}
          />
        </div>

        {/* List */}
        <div style={{ maxHeight: '320px', overflowY: 'auto', padding: '10px 14px' }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '13px' }}>
              {t('customer.noCustomer')}
            </div>
          )}
          {filtered.map((c) => {
            const isSelected = currentCustomerId === c.id;
            return (
              <div
                key={c.id}
                onClick={() => {
                  onSelectCustomer(c.id);
                  onClose();
                }}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: isSelected ? '1.5px solid #009688' : '1px solid #e2e8f0',
                  backgroundColor: isSelected ? '#e6f7f5' : '#ffffff',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{c.phone}</span>
                    <span>•</span>
                    <span style={{ color: '#009688', fontWeight: 600 }}>{getTierLabel(c.membership_tier)}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    backgroundColor: c.discount_percent > 0 ? '#fef3c7' : '#f1f5f9',
                    color: c.discount_percent > 0 ? '#b45309' : '#64748b',
                    padding: '3px 8px',
                    borderRadius: '4px'
                  }}>
                    {t('customer.discount')} {c.discount_percent}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 18px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', textAlign: 'right' }}>
          <button
            onClick={onClose}
            style={{
              padding: '7px 16px',
              borderRadius: '6px',
              backgroundColor: '#cbd5e1',
              color: '#334155',
              fontSize: '12.5px',
              fontWeight: 600
            }}
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
}
