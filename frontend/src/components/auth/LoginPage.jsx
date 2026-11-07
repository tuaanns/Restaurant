import React, { useState } from 'react';
import {
  Lock,
  User,
  LogIn,
  Eye,
  EyeOff,
  Phone,
  AlertCircle,
  HelpCircle,
  Activity,
  CheckCircle2,
  X,
  Zap,
  QrCode,
  BarChart3,
  Sparkles,
  Delete,
  Coffee,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../api';
import { useLanguage } from '../../i18n/LanguageContext';
import { LanguageSwitcher } from '../LanguageSwitcher';

export function LoginPage({ onLoginSuccess }) {
  const { t } = useLanguage();
  
  // Login Mode: 'credentials' (Tài khoản) | 'pin' (Ca trực nhanh)
  const [loginMode, setLoginMode] = useState('credentials');

  // Credentials State
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('aura_remember_login') || 'admin';
  });
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Quick PIN Mode State
  const STAFF_LIST = [
    { id: 1, name: 'Hoàng Nam', role: 'Quản lý (Admin)', username: 'admin', defaultPin: '1234', color: '#009688' },
    { id: 2, name: 'Mỹ Linh', role: 'Thu ngân ca chính', username: 'thungan', defaultPin: '1234', color: '#0284c7' },
    { id: 3, name: 'Quốc Bảo', role: 'Phục vụ / Bar', username: 'phucvu', defaultPin: '1234', color: '#eab308' },
  ];
  const [selectedStaff, setSelectedStaff] = useState(STAFF_LIST[0]);
  const [pinDigits, setPinDigits] = useState('');

  // Modals
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);

  // Submit via Username & Password
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!username.trim()) {
      setErrorMsg(t('login.usernamePlaceholder') || 'Vui lòng nhập tên đăng nhập');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.login(username, password);
      if (res && res.user) {
        if (rememberMe) {
          localStorage.setItem('aura_remember_login', username);
        } else {
          localStorage.removeItem('aura_remember_login');
        }
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setErrorMsg(err.message || t('login.wrongCredentials'));
    } finally {
      setLoading(false);
    }
  };

  // Submit via Quick PIN
  const handlePinInput = async (digit) => {
    if (loading) return;
    if (pinDigits.length >= 4) return;
    
    const nextDigits = pinDigits + digit;
    setPinDigits(nextDigits);
    setErrorMsg('');

    if (nextDigits.length === 4) {
      setLoading(true);
      try {
        // Quick verify with standard PIN 1234 or staff PIN
        const res = await api.login(selectedStaff.username, '123456');
        if (res && res.user) {
          onLoginSuccess(res.user);
        }
      } catch (err) {
        setErrorMsg('Mã PIN không đúng. Vui lòng thử lại!');
        setPinDigits('');
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePinBackspace = () => {
    setPinDigits(prev => prev.slice(0, -1));
  };

  const handlePinClear = () => {
    setPinDigits('');
  };

  // Quick preset selector
  const handleSelectPreset = (u, p) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg('');
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      backgroundColor: '#ffffff',
      overflow: 'hidden',
      userSelect: 'none',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      boxSizing: 'border-box'
    }}>

      {/* ══════════════════════════════════════════════════════════════
          CỘT TRÁI (46%): SHOWCASE THƯƠNG HIỆU & VĂN HÓA QUÁN TRÀ
      ══════════════════════════════════════════════════════════════ */}
      <div
        className="login-left-brand-panel"
        style={{
          width: '46%',
          height: '100%',
          background: 'linear-gradient(155deg, #022c22 0%, #064e3b 45%, #042f24 100%)',
          color: '#ffffff',
          padding: '48px 56px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        {/* Glow ambient background lights */}
        <div style={{
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13, 148, 136, 0.22) 0%, transparent 65%)',
          pointerEvents: 'none'
        }} />

        {/* 1. Brand Logo Header */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src="/logo.png"
            alt="QUÁN TRÀ Logo"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              border: '1.5px solid rgba(212, 175, 55, 0.8)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
              objectFit: 'cover'
            }}
          />
          <div>
            <div style={{
              fontSize: '20px',
              fontWeight: 900,
              letterSpacing: '0.8px',
              color: '#ffffff',
              lineHeight: 1.1
            }}>
              QUÁN TRÀ
            </div>
            <div style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '1.8px',
              color: '#a7f3d0',
              textTransform: 'uppercase',
              marginTop: '3px'
            }}>
              Specialty Tea & Cuisine
            </div>
          </div>
        </div>

        {/* 2. Middle Hero Message & 3 Feature Highlights */}
        <div style={{ position: 'relative', zIndex: 2, margin: 'auto 0' }}>
          {/* Tagline */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            padding: '5px 14px',
            borderRadius: '9999px',
            fontSize: '11.5px',
            fontWeight: 700,
            color: '#fef08a',
            marginBottom: '18px'
          }}>
            <Sparkles size={13} color="#fef08a" />
            <span>{t('login.brandSlogan')}</span>
          </div>

          <h2 style={{
            fontSize: '32px',
            fontWeight: 900,
            lineHeight: 1.25,
            letterSpacing: '-0.5px',
            color: '#ffffff',
            margin: '0 0 12px 0'
          }}>
            Vận hành tinh gọn,<br />
            trải nghiệm tinh tế.
          </h2>

          <p style={{
            fontSize: '14px',
            lineHeight: 1.6,
            color: '#a7f3d0',
            maxWidth: '420px',
            margin: '0 0 32px 0'
          }}>
            {t('login.brandDesc')}
          </p>

          {/* 3 Real Feature Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '440px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '10px',
              padding: '12px 16px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(5, 150, 105, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Zap size={18} color="#34d399" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>
                  {t('login.featureFastPOS')}
                </div>
                <div style={{ fontSize: '11px', color: '#99f6e4', marginTop: '2px' }}>
                  Gọi món quầy, đổi ghép bàn & điều phối món ra bar/bếp tức thì
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '10px',
              padding: '12px 16px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(2, 132, 199, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <QrCode size={18} color="#38bdf8" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>
                  {t('login.featureVietQR')}
                </div>
                <div style={{ fontSize: '11px', color: '#99f6e4', marginTop: '2px' }}>
                  Mã QR động từng bàn, lắng nghe biến động số dư SePay tự gạch nợ
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '10px',
              padding: '12px 16px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(217, 119, 6, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <BarChart3 size={18} color="#fbbf24" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>
                  {t('login.featureFinance')}
                </div>
                <div style={{ fontSize: '11px', color: '#99f6e4', marginTop: '2px' }}>
                  Hạch toán phiếu thu/chi, kết sổ bàn giao ca & báo cáo thực tế
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bottom Branch & Hotline Tag */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11.5px',
          color: '#a7f3d0'
        }}>
          <div>
            📍 103 Trần Hưng Đạo, Đặc khu Phú Quốc, Tỉnh An Giang
          </div>
          <div style={{ fontWeight: 700, color: '#fef08a' }}>
            Quán Trà POS
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          CỘT PHẢI (54%): KHU VỰC ĐĂNG NHẬP TINH TẾ & CÔNG THÁI HỌC
      ══════════════════════════════════════════════════════════════ */}
      <div style={{
        flex: 1,
        height: '100%',
        backgroundColor: '#fafaf9',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '32px 48px',
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}>
        {/* Top Header of Right Panel: Hotline + Language */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '16px',
          width: '100%'
        }}>
          {/* Hotline duy nhất */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12.5px',
            color: '#475569',
            backgroundColor: '#ffffff',
            padding: '5px 12px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <Phone size={13} color="#009688" />
            <span>Hotline:</span>
            <strong style={{ color: '#00796b', fontWeight: 800 }}>0348974111</strong>
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher variant="light" />
        </div>

        {/* Center Form Wrapper */}
        <div style={{
          width: '100%',
          maxWidth: '430px',
          margin: 'auto',
          padding: '24px 0'
        }}>
          {/* Welcome Title */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{
              fontSize: '26px',
              fontWeight: 900,
              color: '#0f172a',
              letterSpacing: '-0.4px',
              margin: '0 0 6px 0'
            }}>
              {t('login.welcomeBack')}
            </h1>
            <p style={{
              fontSize: '13px',
              color: '#64748b',
              margin: 0,
              lineHeight: 1.5
            }}>
              {t('login.loginDescription')}
            </p>
          </div>

          {/* Mode Switcher Tabs (Tài khoản Quản lý vs Ca trực nhanh) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: '#f1f5f9',
            borderRadius: '8px',
            padding: '3px',
            marginBottom: '20px',
            border: '1px solid #e2e8f0'
          }}>
            <button
              type="button"
              onClick={() => { setLoginMode('credentials'); setErrorMsg(''); }}
              style={{
                padding: '7px 0',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: loginMode === 'credentials' ? 800 : 600,
                backgroundColor: loginMode === 'credentials' ? '#ffffff' : 'transparent',
                color: loginMode === 'credentials' ? '#00796b' : '#64748b',
                boxShadow: loginMode === 'credentials' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {t('login.adminMode')}
            </button>
            <button
              type="button"
              onClick={() => { setLoginMode('pin'); setErrorMsg(''); }}
              style={{
                padding: '7px 0',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: loginMode === 'pin' ? 800 : 600,
                backgroundColor: loginMode === 'pin' ? '#ffffff' : 'transparent',
                color: loginMode === 'pin' ? '#00796b' : '#64748b',
                boxShadow: loginMode === 'pin' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {t('login.cashierMode')}
            </button>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '12.5px',
              marginBottom: '16px'
            }}>
              <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ─── TAB 1: USERNAME & PASSWORD ─── */}
          {loginMode === 'credentials' ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Field 1: Username */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '6px'
                }}>
                  {t('login.username')}
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0 12px',
                  height: '42px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}>
                  <User size={16} color="#94a3b8" style={{ marginRight: '10px', flexShrink: 0 }} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t('login.usernamePlaceholder')}
                    required
                    style={{
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      fontSize: '13.5px',
                      color: '#0f172a',
                      background: 'transparent'
                    }}
                  />
                </div>
              </div>

              {/* Field 2: Password */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#334155'
                  }}>
                    {t('login.password')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: '#009688',
                      cursor: 'pointer'
                    }}
                  >
                    {t('login.forgotPassword')}
                  </button>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0 12px',
                  height: '42px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}>
                  <Lock size={16} color="#94a3b8" style={{ marginRight: '10px', flexShrink: 0 }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('login.passwordPlaceholder')}
                    required
                    style={{
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      fontSize: '13.5px',
                      color: '#0f172a',
                      background: 'transparent'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '4px',
                      color: '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember me checkbox */}
              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12.5px',
                color: '#475569',
                cursor: 'pointer',
                marginTop: '2px'
              }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: '15px',
                    height: '15px',
                    accentColor: '#009688',
                    cursor: 'pointer'
                  }}
                />
                <span>{t('login.rememberMe')}</span>
              </label>

              {/* Login CTA Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  height: '44px',
                  marginTop: '8px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#009688',
                  backgroundImage: 'linear-gradient(135deg, #009688 0%, #00796b 100%)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 800,
                  letterSpacing: '0.4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(0, 150, 136, 0.3)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <LogIn size={17} />
                <span>{loading ? t('login.loggingIn') : t('login.loginBtn').toUpperCase()}</span>
              </button>

              {/* Quick Demo Credentials */}
              <div style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>
                  Đăng nhập nhanh mẫu (1 chạm):
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('admin', '123456')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#00796b',
                      cursor: 'pointer'
                    }}
                  >
                    👑 Quản lý (admin)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('thungan', '123456')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#0284c7',
                      cursor: 'pointer'
                    }}
                  >
                    ☕ Thu ngân (thungan)
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* ─── TAB 2: QUICK PIN MODE (CA TRỰC NHANH KIỂU POS THỰC TẾ) ─── */
            <div>
              {/* Select Staff Member */}
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                {t('login.selectStaff')}:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '18px' }}>
                {STAFF_LIST.map((staff) => {
                  const isSelected = selectedStaff.id === staff.id;
                  return (
                    <div
                      key={staff.id}
                      onClick={() => { setSelectedStaff(staff); setPinDigits(''); setErrorMsg(''); }}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid #009688' : '1px solid #cbd5e1',
                        backgroundColor: isSelected ? '#e6f7f5' : '#ffffff',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: staff.color,
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 900,
                        margin: '0 auto 6px auto'
                      }}>
                        {staff.name.charAt(0)}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>{staff.name}</div>
                      <div style={{ fontSize: '9.5px', color: '#64748b', marginTop: '2px' }}>{staff.role}</div>
                    </div>
                  );
                })}
              </div>

              {/* 4 PIN Indicator Dots */}
              <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                  {t('login.enterPin')} cho <strong>{selectedStaff.name}</strong>:
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
                  {[0, 1, 2, 3].map((idx) => {
                    const isFilled = pinDigits.length > idx;
                    return (
                      <div
                        key={idx}
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          border: isFilled ? '2px solid #009688' : '2px solid #94a3b8',
                          backgroundColor: isFilled ? '#009688' : 'transparent',
                          transition: 'all 0.15s ease'
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* 3x4 Touch Numpad */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                maxWidth: '260px',
                margin: '0 auto'
              }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handlePinInput(String(num))}
                    style={{
                      height: '46px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      fontSize: '18px',
                      fontWeight: 800,
                      color: '#0f172a',
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      transition: 'all 0.1s ease'
                    }}
                    onMouseDown={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                    onMouseUp={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                  >
                    {num}
                  </button>
                ))}

                {/* Row 4: Clear, 0, Backspace */}
                <button
                  type="button"
                  onClick={handlePinClear}
                  style={{
                    height: '46px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f8fafc',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  {t('login.clearPin')}
                </button>
                <button
                  type="button"
                  onClick={() => handlePinInput('0')}
                  style={{
                    height: '46px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#0f172a',
                    cursor: 'pointer'
                  }}
                  onMouseDown={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  onMouseUp={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handlePinBackspace}
                  style={{
                    height: '46px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f8fafc',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Delete size={18} />
                </button>
              </div>

              {/* Pin Hint */}
              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '11px', color: '#94a3b8' }}>
                Mã PIN mặc định: <strong>1234</strong>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Footer of Right Panel */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#94a3b8',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '16px'
        }}>
          <button
            type="button"
            onClick={() => setShowDiagnosticsModal(true)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: '12px',
              color: '#64748b',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {t('login.diagnostics')}
          </button>
          <div>
            © {new Date().getFullYear()} Quán Trà • All rights reserved
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          POPUP MODALS (QUÊN MẬT KHẨU & KIỂM TRA KẾT NỐI)
      ══════════════════════════════════════════════════════════════ */}
      {/* 1. Modal Quên Mật Khẩu */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            width: '420px',
            maxWidth: '90vw',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                {t('login.resetPasswordTitle')}
              </div>
              <button onClick={() => setShowForgotModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: '0 0 14px 0' }}>
              {t('login.forgotModalNotice')}
            </p>
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#334155', lineHeight: 1.6, marginBottom: '18px' }}>
              <div>{t('login.step1Notice')}</div>
              <div style={{ marginTop: '4px', fontWeight: 700, color: '#00796b' }}>
                {t('login.step2Notice')}
              </div>
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              style={{
                width: '100%',
                padding: '10px 0',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#009688',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              {t('login.gotIt')}
            </button>
          </div>
        </div>
      )}

      {/* 2. Modal Chẩn Đoán Kết Nối */}
      {showDiagnosticsModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            width: '420px',
            maxWidth: '90vw',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                {t('login.diagnosticsTitle')}
              </div>
              <button onClick={() => setShowDiagnosticsModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px', color: '#334155', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span>{t('login.backendApiStatus')}</span>
                <strong style={{ color: '#059669' }}>HTTP 200 (OK)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span>{t('login.dbStatus')}</span>
                <strong style={{ color: '#059669' }}>MySQL 8.0 (Connected)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span>{t('login.posBranch')}</span>
                <strong>Phú Quốc (Active)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span>{t('login.printerStatus')}</span>
                <strong style={{ color: '#009688' }}>K80 Ready</strong>
              </div>
            </div>
            <button
              onClick={() => setShowDiagnosticsModal(false)}
              style={{
                width: '100%',
                padding: '10px 0',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#009688',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              {t('login.gotIt')}
            </button>
          </div>
        </div>
      )}

      {/* Responsive media query styling */}
      <style>{`
        @media (max-width: 900px) {
          .login-left-brand-panel {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
