import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutGrid,
  BookOpen,
  Search,
  ChevronDown,
  LogOut,
  Shield,
  User,
  LayoutDashboard,
  Clock,
  Phone,
  Store,
  Edit3,
  Check,
  X
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { api } from '../api';

export function Header({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onResetDemo,
  onOpenMenu,
  searchInputRef,
  currentUser,
  onUpdateCurrentUser,
  onLogout,
  currentView,
  setCurrentView,
  isMobile = false,
  mobileTab = 'tables',
  setMobileTab = () => {},
  itemCount = 0,
  selectedTable = null,
  adminTab = 'overview',
  setAdminTab = () => {}
}) {
  const { t } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Quick Profile Edit Modal State
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editShift, setEditShift] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

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
  const rawName = currentUser?.name || currentUser?.username || 'Thu Hằng';
  // Clean prefix like "Quản lý:" so it does not repeat roleLabel
  const cleanName = rawName.replace(/^(Quản lý|Thu ngân|Nhân viên|Admin|Manager|Cashier):\s*/i, '');
  const displayName = cleanName || rawName;
  const roleLabel = isAdmin ? (t('header.admin') || 'Quản Trị Viên') : (t('header.cashier') || 'Thu Ngân');

  // Localize shift text dynamically
  const formatShift = (rawShift) => {
    if (!rawShift) return t('header.shift') || 'Toàn ca';
    if (rawShift.includes('Toàn ca') || rawShift.includes('Quản lý nhà hàng')) {
      return `${t('header.fullShift') || 'Toàn ca'} (${t('header.restaurantManager') || 'Quản lý'})`;
    }
    if (rawShift.includes('Ca sáng')) return t('header.morningShift') || 'Ca sáng';
    if (rawShift.includes('Ca chiều')) return t('header.afternoonShift') || 'Ca chiều';
    if (rawShift.includes('Ca tối')) return t('header.nightShift') || 'Ca tối';
    return rawShift;
  };

  const shiftText = formatShift(currentUser?.shift);
  const initials = displayName.split(' ').filter(Boolean).map(n => n[0]).slice(-2).join('').toUpperCase() || 'AD';

  const handleOpenEditProfile = () => {
    setEditName(displayName);
    setEditShift(currentUser?.shift || 'Toàn ca (Quản lý nhà hàng)');
    setEditPhone(currentUser?.phone || '');
    setProfileSuccessMsg('');
    setShowEditProfileModal(true);
    setDropdownOpen(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setIsSavingProfile(true);
    try {
      const payload = {
        name: editName.trim(),
        username: currentUser?.username || 'admin',
        email: currentUser?.email || 'admin@aura.vn',
        role: currentUser?.role || 'admin',
        shift: editShift,
        phone: editPhone.trim(),
        is_active: 1
      };
      if (currentUser?.id) {
        await api.updateUser(currentUser.id, payload);
      }
      const updated = {
        ...currentUser,
        ...payload
      };
      try {
        sessionStorage.setItem('pos_user', JSON.stringify(updated));
      } catch (err) {}
      if (onUpdateCurrentUser) {
        onUpdateCurrentUser(updated);
      }
      setProfileSuccessMsg('Cập nhật thông tin thành công!');
      setTimeout(() => {
        setShowEditProfileModal(false);
        setProfileSuccessMsg('');
      }, 700);
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <>
      <header style={{
        backgroundColor: '#0d2814', // Deep Botanical Matcha Pine
        color: '#ffffff',
        height: '56px',
        padding: isMobile ? '0 10px' : '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(165, 214, 167, 0.22)',
        position: 'relative',
        zIndex: 50,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Left: Brand & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '20px' }}>
          {/* Brand */}
          <div
            onClick={() => {
              if (setCurrentView) setCurrentView('pos');
              if (setMobileTab) setMobileTab('tables');
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <img
              src="/logo.png"
              alt="QUÁN TRÀ Logo"
              style={{
                width: isMobile ? '32px' : '36px',
                height: isMobile ? '32px' : '36px',
                borderRadius: '8px',
                border: '1.2px solid #66BB6A',
                boxShadow: '0 2px 8px rgba(102, 187, 106, 0.3)',
                objectFit: 'cover'
              }}
            />
            <div style={{ fontWeight: 800, fontSize: isMobile ? '13px' : '16px', letterSpacing: '0.4px', color: '#ffffff' }}>
              QUÁN TRÀ
            </div>
          </div>

          {/* Navigation Tabs (Only in Desktop POS view) */}
          {!isMobile && currentView === 'pos' && (
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
                  backgroundColor: activeTab === 'tables' ? '#1B5E20' : 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  boxShadow: activeTab === 'tables' ? '0 2px 8px rgba(27, 94, 32, 0.5)' : 'none',
                  border: activeTab === 'tables' ? '1px solid #66BB6A' : '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <LayoutGrid size={15} color={activeTab === 'tables' ? '#A5D6A7' : '#ffffff'} />
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
                  backgroundColor: activeTab === 'menu' ? '#1B5E20' : 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  border: activeTab === 'menu' ? '1px solid #66BB6A' : '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <BookOpen size={15} color={activeTab === 'menu' ? '#A5D6A7' : '#ffffff'} />
                <span>{t('menu.title')} (F2)</span>
              </button>
            </div>
          )}

          {/* Admin Switcher indicator if in Admin view */}
          {currentView === 'admin' && (
            <div style={{
              marginLeft: '8px',
              backgroundColor: '#E8F5E9',
              border: '1px solid #A5D6A7',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#1B5E20',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Shield size={14} color="#1B5E20" />
              <span>{t('header.adminPanel')}</span>
            </div>
          )}
        </div>

        {/* Middle: Search bar (in Desktop view) OR Mobile Switcher (in Mobile view) */}
        {isMobile && currentView === 'pos' ? (
          <div style={{
            display: 'flex',
            backgroundColor: 'rgba(0, 0, 0, 0.28)',
            borderRadius: '8px',
            padding: '2px',
            border: '1px solid rgba(165, 214, 167, 0.25)'
          }}>
            <button
              onClick={() => setMobileTab('tables')}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: mobileTab === 'tables' ? '#1B5E20' : 'transparent',
                color: '#ffffff',
                border: mobileTab === 'tables' ? '1px solid #66BB6A' : 'none'
              }}
            >
              🪑 Bàn
            </button>
            <button
              onClick={() => setMobileTab('order')}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: mobileTab === 'order' ? '#1B5E20' : 'transparent',
                color: '#ffffff',
                border: mobileTab === 'order' ? '1px solid #66BB6A' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Đơn</span>
              {itemCount > 0 && (
                <span style={{
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '0 5px',
                  fontSize: '10px',
                  fontWeight: 800
                }}>
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        ) : !isMobile && currentView === 'pos' ? (
          <div style={{ flex: '1', maxWidth: '420px', margin: '0 20px' }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(165, 214, 167, 0.35)',
              borderRadius: '8px',
              padding: '0 10px',
              height: '36px',
              transition: 'border-color 0.15s ease'
            }}>
              <Search size={15} color="#A5D6A7" style={{ marginRight: '8px', flexShrink: 0 }} />
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
                backgroundColor: 'rgba(165, 214, 167, 0.18)',
                color: '#A5D6A7',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 600,
                border: '1px solid rgba(165, 214, 167, 0.35)'
              }}>
                F3
              </span>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1 }} />
        )}

        {/* Right: Language switcher + User profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '10px' }}>
          {/* Language Switcher */}
          <LanguageSwitcher variant="dark" />

          {/* ==================================================== */}
          {/* USER DROPDOWN TRIGGER                                */}
          {/* ==================================================== */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <div
              id="cashier-dropdown-trigger"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '4px' : '10px',
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: '8px',
                backgroundColor: dropdownOpen ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                transition: 'background-color 0.15s ease'
              }}
            >
              {!isMobile && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#f8fafc',
                    lineHeight: '1.2',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    justifyContent: 'flex-end'
                  }}>
                    <span>{roleLabel}: {displayName}</span>
                    <ChevronDown size={13} color="#A5D6A7" />
                  </div>
                  <div style={{ fontSize: '11px', color: '#A5D6A7', marginTop: '1px' }}>
                    {shiftText}
                  </div>
                </div>
              )}

              <div style={{
                width: isMobile ? '30px' : '34px',
                height: isMobile ? '30px' : '34px',
                borderRadius: '50%',
                backgroundColor: '#1B5E20',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: isMobile ? '11px' : '13px',
                boxShadow: '0 2px 8px rgba(102, 187, 106, 0.35)',
                border: '2px solid #66BB6A'
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
                backgroundColor: '#0f2615',
                border: '1px solid #2a5231',
                borderRadius: '12px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
                overflow: 'hidden',
                zIndex: 100
              }}>
                {/* Profile Card Header */}
                <div style={{
                  padding: '14px 16px',
                  backgroundColor: '#16381e',
                  borderBottom: '1px solid #2a5231'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: '#1B5E20',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '14px',
                      border: '2px solid #66BB6A'
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
                        backgroundColor: '#E8F5E9',
                        color: '#1B5E20',
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
                    borderTop: '1px solid rgba(165, 214, 167, 0.2)',
                    fontSize: '11px',
                    color: '#A5D6A7',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={11} color="#A5D6A7" />
                      <span>{shiftText}</span>
                    </div>
                    {currentUser?.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={11} color="#A5D6A7" />
                        <span>{currentUser.phone}</span>
                      </div>
                    )}
                    {currentUser?.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Store size={11} color="#A5D6A7" />
                        <span>{currentUser.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Menu Items */}
                <div style={{ padding: '6px' }}>
                  {/* Quick Profile Edit button */}
                  <button
                    onClick={handleOpenEditProfile}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: '#A5D6A7',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(102, 187, 106, 0.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Edit3 size={15} color="#66BB6A" />
                    <span>Đổi tên / Thông tin tài khoản</span>
                  </button>

                  <div style={{ height: '1px', backgroundColor: '#2a5231', margin: '4px 0' }} />

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
                          color: '#66BB6A',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(102, 187, 106, 0.15)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <LayoutDashboard size={15} color="#66BB6A" />
                        <span>
                          {currentView === 'pos' ? t('header.adminPanel') : t('header.backToPOS')}
                        </span>
                      </button>
                      <div style={{ height: '1px', backgroundColor: '#2a5231', margin: '4px 0' }} />
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
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'}
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

      {/* ═══ MODAL: QUICK EDIT USER PROFILE ═══ */}
      {showEditProfileModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease-out'
          }}>
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#E8F5E9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={18} color="#1B5E20" />
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1B5E20', margin: 0 }}>
                  Cập nhật thông tin tài khoản
                </h3>
              </div>
              <button
                onClick={() => setShowEditProfileModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '4px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProfile} style={{ padding: '20px' }}>
              {profileSuccessMsg && (
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#E8F5E9',
                  border: '1px solid #A5D6A7',
                  color: '#1B5E20',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Check size={16} color="#1B5E20" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Tên hiển thị <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Ví dụ: Hoàng Nam, Tuấn, Thu Hằng..."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '7px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13.5px',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1B5E20'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Ca làm việc
                </label>
                <select
                  value={editShift}
                  onChange={(e) => setEditShift(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '7px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13px',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="Toàn ca (Quản lý nhà hàng)">Toàn ca (Quản lý nhà hàng)</option>
                  <option value="Ca sáng (07:00 - 15:00)">Ca sáng (07:00 - 15:00)</option>
                  <option value="Ca chiều (15:00 - 23:00)">Ca chiều (15:00 - 23:00)</option>
                  <option value="Ca tối (18:00 - 23:00)">Ca tối (18:00 - 23:00)</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Ví dụ: 0901234567"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '7px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13.5px',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1B5E20'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {t('cancel') || 'Hủy'}
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#1B5E20',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: isSavingProfile ? 'not-allowed' : 'pointer',
                    opacity: isSavingProfile ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Check size={14} />
                  <span>{isSavingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
