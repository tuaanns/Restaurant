import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutGrid,
  BookOpen,
  Search,
  RotateCcw,
  UtensilsCrossed,
  ChevronDown,
  LogOut,
  Shield,
  User,
  LayoutDashboard,
  Clock,
  Phone,
  Store
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onResetDemo,
  onOpenMenu,
  searchInputRef,
  currentUser,
  onLogout,
  currentView,
  setCurrentView
}) {
  const { t } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAdmin = currentUser?.role === 'admin';
  const rawName = currentUser?.name || 'Thu Hằng';
  // Clean prefix like "Quản lý:" so it does not repeat roleLabel
  const cleanName = rawName.replace(/^(Quản lý|Thu ngân|Nhân viên):\s*/i, '');
  const displayName = cleanName || rawName;
  const roleLabel = isAdmin ? t('header.admin') : t('header.cashier');

  // Localize shift text dynamically
  const formatShift = (rawShift) => {
    if (!rawShift) return t('header.shift');
    if (rawShift.includes('Toàn ca') || rawShift.includes('Quản lý nhà hàng')) {
      return `${t('header.fullShift')} (${t('header.restaurantManager')})`;
    }
    if (rawShift.includes('Ca sáng')) return t('header.morningShift');
    if (rawShift.includes('Ca chiều')) return t('header.afternoonShift');
    if (rawShift.includes('Ca tối')) return t('header.nightShift');
    return rawShift;
  };

  const shiftText = formatShift(currentUser?.shift);
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(-2).toUpperCase() || 'TH';

  return (
    <header style={{
      backgroundColor: '#0b1320',
      color: '#ffffff',
      height: '56px',
      padding: '0 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid #1a273e',
      position: 'relative',
      zIndex: 50
    }}>
      {/* Left: Brand & Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Brand */}
        <div
          onClick={() => setCurrentView && setCurrentView('pos')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            backgroundColor: 'rgba(0, 168, 132, 0.15)',
            border: '1px solid rgba(0, 168, 132, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00c292'
          }}>
            <UtensilsCrossed size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '0.4px', lineHeight: '1.2' }}>
              AURA RESTAURANT
            </div>
            <div style={{ fontSize: '11px', color: '#00b488', fontWeight: 500 }}>
              {t('header.branch')}
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Only in POS view) */}
        {currentView === 'pos' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
            <button
              id="tab-tables"
              onClick={() => setActiveTab('tables')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '7px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: activeTab === 'tables' ? '#009688' : 'rgba(255, 255, 255, 0.06)',
                color: '#ffffff',
                boxShadow: activeTab === 'tables' ? '0 2px 8px rgba(0, 150, 136, 0.35)' : 'none',
                border: 'none',
                transition: 'background-color 0.15s ease'
              }}
            >
              <LayoutGrid size={15} />
              <span>{t('header.tables')} (F1)</span>
            </button>

            <button
              id="tab-menu"
              onClick={() => onOpenMenu()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '7px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: activeTab === 'menu' ? '#009688' : 'rgba(255, 255, 255, 0.06)',
                color: '#ffffff',
                border: 'none',
                transition: 'background-color 0.15s ease'
              }}
            >
              <BookOpen size={15} />
              <span>{t('menu.title')} (F2)</span>
            </button>
          </div>
        )}

        {/* Admin Switcher indicator if in Admin view */}
        {currentView === 'admin' && (
          <div style={{
            marginLeft: '12px',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid #0284c7',
            padding: '5px 12px',
            borderRadius: '6px',
            fontSize: '12.5px',
            color: '#38bdf8',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Shield size={14} />
            <span>{t('header.adminPanel')}</span>
          </div>
        )}
      </div>

      {/* Middle: Search bar (in POS view) */}
      {currentView === 'pos' ? (
        <div style={{ flex: '1', maxWidth: '420px', margin: '0 20px' }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#111e33',
            border: '1px solid #1e314d',
            borderRadius: '8px',
            padding: '0 10px',
            height: '36px'
          }}>
            <Search size={15} color="#64748b" style={{ marginRight: '8px', flexShrink: 0 }} />
            <input
              id="search-input"
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('header.searchPlaceholder') + ' (F3)'}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '12.5px',
                outline: 'none'
              }}
            />
            <span style={{
              fontSize: '10.5px',
              backgroundColor: '#1b2d4b',
              color: '#94a3b8',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 600,
              border: '1px solid #283e65'
            }}>
              F3
            </span>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1 }} />
      )}

      {/* Right: Language switcher + Printer + Reset + Cashier */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Language Switcher */}
        <LanguageSwitcher variant="dark" />

        {/* Printer status pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#111e33',
          border: '1px solid #1e314d',
          padding: '5px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          color: '#cbd5e1'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 8px #10b981'
          }}></span>
          <span>Printer: OK</span>
        </div>

        {/* Reset Demo button */}
        <button
          onClick={onResetDemo}
          title={t('header.resetDemo')}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            color: '#94a3b8',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <RotateCcw size={15} />
        </button>

        {/* ==================================================== */}
        {/* CASHIER DROPDOWN MENU                                 */}
        {/* ==================================================== */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <div
            id="cashier-dropdown-trigger"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '8px',
              backgroundColor: dropdownOpen ? '#16253c' : 'transparent',
              transition: 'background-color 0.15s ease'
            }}
          >
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#f8fafc',
                lineHeight: '1.2',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                justifyContent: 'flex-end'
              }}>
                <span>{roleLabel}: {displayName}</span>
                <ChevronDown size={13} color="#94a3b8" />
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                {shiftText}
              </div>
            </div>

            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: isAdmin ? '#0284c7' : '#009688',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '13px',
              boxShadow: isAdmin ? '0 2px 6px rgba(2, 132, 199, 0.4)' : '0 2px 6px rgba(0, 150, 136, 0.4)',
              border: '2px solid rgba(255,255,255,0.2)'
            }}>
              {initials}
            </div>
          </div>

          {/* Dropdown Card */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '46px',
              right: '0',
              width: '280px',
              backgroundColor: '#0f1c2e',
              border: '1px solid #1e3352',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
              zIndex: 100
            }}>
              {/* Profile Card Header */}
              <div style={{
                padding: '14px 16px',
                backgroundColor: '#162842',
                borderBottom: '1px solid #1f385c'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: isAdmin ? '#0284c7' : '#009688',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '14px'
                  }}>
                    {initials}
                  </div>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#ffffff' }}>
                      {displayName}
                    </div>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      backgroundColor: isAdmin ? 'rgba(56, 189, 248, 0.2)' : 'rgba(0, 150, 136, 0.2)',
                      color: isAdmin ? '#38bdf8' : '#00c292',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      marginTop: '2px'
                    }}>
                      {isAdmin ? <Shield size={10} /> : <User size={10} />}
                      <span>{roleLabel}</span>
                    </div>
                  </div>
                </div>

                <div style={{
                  marginTop: '10px',
                  paddingTop: '8px',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  fontSize: '11px',
                  color: '#94a3b8',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={11} color="#64748b" />
                    <span>{shiftText}</span>
                  </div>
                  {currentUser?.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Store size={11} color="#64748b" />
                      <span>{currentUser.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Menu Items */}
              <div style={{ padding: '6px' }}>
                {/* Admin Switcher */}
                {isAdmin && (
                  <>
                    <button
                      onClick={() => {
                        setCurrentView(currentView === 'pos' ? 'admin' : 'pos');
                        setDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '9px 12px',
                        borderRadius: '6px',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        color: '#38bdf8',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <LayoutDashboard size={15} />
                      <span>
                        {currentView === 'pos' ? t('header.adminPanel') : t('header.backToPOS')}
                      </span>
                    </button>
                    <div style={{ height: '1px', backgroundColor: '#1e3352', margin: '4px 0' }} />
                  </>
                )}

                {/* Logout Button */}
                <button
                  id="btn-logout"
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout();
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: '#f87171',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <LogOut size={15} />
                  <span>{t('header.logout')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
