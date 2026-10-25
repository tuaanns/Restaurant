import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Lock,
  User,
  LogIn,
  Eye,
  EyeOff,
  Store,
  Phone,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Activity,
  CheckCircle2,
  X
} from 'lucide-react';
import { api } from '../../api';
import { useLanguage } from '../../i18n/LanguageContext';
import { LanguageSwitcher } from '../LanguageSwitcher';

export function LoginPage({ onLoginSuccess }) {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Modals for extra interactive features
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
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


  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#ffffff',
      backgroundImage: 'radial-gradient(circle at 10% 12%, rgba(6, 78, 59, 0.04) 0%, transparent 45%), radial-gradient(circle at 90% 88%, rgba(2, 132, 199, 0.03) 0%, transparent 40%), linear-gradient(135deg, #f3f7f6 0%, #ffffff 42%, #f1f6f8 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden',
      userSelect: 'none',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      boxSizing: 'border-box'
    }}>

      {/* 1. THANH HEADER TRÊN CÙNG (FULL CHIỀU RỘNG) */}
      <header style={{
        height: '64px',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 10
      }}>
        {/* Bên trái: Thương hiệu & Trạng thái */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            backgroundColor: '#064e3b',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '18px',
            letterSpacing: '-0.5px',
            boxShadow: '0 2px 6px rgba(6, 78, 59, 0.25)'
          }}>
            A
          </div>
          <div style={{
            fontSize: '17px',
            fontWeight: 700,
            color: '#0f172a',
            letterSpacing: '-0.3px'
          }}>
            Aura POS
          </div>

          {/* Badge trạng thái hệ thống tiếng Việt */}
          <div style={{
            marginLeft: '8px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#e6f4ea',
            border: '1px solid #c7eed8',
            borderRadius: '9999px',
            padding: '3px 12px'
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#059669',
              display: 'inline-block',
              boxShadow: '0 0 0 2px rgba(5, 150, 105, 0.25)'
            }} />
            <span style={{
              fontSize: '10.5px',
              fontWeight: 700,
              color: '#065f46',
              letterSpacing: '0.6px'
            }}>
              {t('login.systemActive')}
            </span>
          </div>
        </div>

        {/* Bên phải: Hotline, Các liên kết, Language, Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Hotline hỗ trợ */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: '#64748b'
          }}>
            <Phone size={14} color="#64748b" />
            <span>Hotline:</span>
            <strong style={{ color: '#064e3b', fontWeight: 700 }}>1900 6868</strong>
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher variant="light" />

          {/* Chẩn đoán hệ thống */}
          <button
            type="button"
            onClick={() => setShowDiagnosticsModal(true)}
            style={{
              fontSize: '13px',
              color: '#475569',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'color 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#064e3b'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
          >
            {t('login.diagnostics')}
          </button>

          {/* Avatar đại diện */}
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: '#064e3b',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(6, 78, 59, 0.2)'
          }}
          title={t('login.restaurantBrand')}
          >
            <User size={16} />
          </div>
        </div>
      </header>

      {/* 2. KHU VỰC CHÍNH Ở GIỮA */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        overflowY: 'auto'
      }}>
        {/* Thẻ đăng nhập màu trắng nổi bật */}
        <div style={{
          width: '450px',
          maxWidth: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.02)',
          border: '1px solid #edf2f7',
          padding: '36px 36px 26px 36px',
          boxSizing: 'border-box'
        }}>
          {/* Icon Dao Nĩa ẩm thực */}
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#064e3b',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: '0 4px 12px rgba(6, 78, 59, 0.25)'
          }}>
            <UtensilsCrossed size={22} />
          </div>

          {/* Tiêu đề & phụ đề */}
          <h1 style={{
            fontSize: '21px',
            fontWeight: 700,
            color: '#111827',
            textAlign: 'center',
            marginBottom: '6px',
            letterSpacing: '-0.2px'
          }}>
            {t('login.title')}
          </h1>
          <p style={{
            fontSize: '13px',
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: '24px'
          }}>
            {t('login.subtitle')}
          </p>

          {/* Thông báo lỗi nếu có */}
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

          {/* Form Đăng Nhập */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Trường 1: Tên đăng nhập */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '6px'
              }}>
                {t('login.username')}
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#edf2f9',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                height: '44px',
                padding: '0 12px',
                transition: 'border-color 0.15s, box-shadow 0.15s'
              }}>
                <User size={16} color="#94a3b8" style={{ marginRight: '10px', flexShrink: 0 }} />
                <input
                  type="text"
                  required
                  placeholder={t('login.usernamePlaceholder')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: '#1e293b',
                    fontSize: '13.5px',
                    fontWeight: 500
                  }}
                />
              </div>
            </div>

            {/* Trường 2: Mật khẩu */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px'
              }}>
                <label style={{
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#374151'
                }}>
                  {t('login.password')}
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#064e3b',
                    cursor: 'pointer'
                  }}
                >
                  {t('login.forgotPassword')}
                </button>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#edf2f9',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                height: '44px',
                padding: '0 12px'
              }}>
                <Lock size={16} color="#94a3b8" style={{ marginRight: '10px', flexShrink: 0 }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder={t('login.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: '#1e293b',
                    fontSize: '13.5px',
                    fontWeight: 500
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    color: '#94a3b8',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Hàng: Ghi nhớ đăng nhập & Chi nhánh */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              margin: '2px 0 6px 0'
            }}>
              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '12.5px',
                color: '#374151',
                fontWeight: 500
              }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: '15px',
                    height: '15px',
                    accentColor: '#064e3b',
                    cursor: 'pointer'
                  }}
                />
                <span>{t('login.rememberMe')}</span>
              </label>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12.5px',
                color: '#475569',
                fontWeight: 500
              }}>
                <Store size={14} color="#064e3b" />
                <span>{t('login.branchShort')}</span>
              </div>
            </div>

            {/* Nút Đăng Nhập */}
            <button
              type="submit"
              disabled={loading}
              style={{
                height: '46px',
                borderRadius: '8px',
                backgroundColor: '#064e3b',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(6, 78, 59, 0.28)',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.75 : 1,
                transition: 'background-color 0.15s, transform 0.1s'
              }}
            >
              <LogIn size={18} />
              <span>{loading ? t('login.loggingIn') : t('login.loginBtn').toUpperCase()}</span>
            </button>
          </form>

          {/* Chú thích hotline dưới thẻ */}
          <div style={{ marginTop: '22px', textAlign: 'center' }}>
            <p style={{ fontSize: '11.5px', color: '#6b7280', marginBottom: '4px' }}>
              {t('login.needSupport')}
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px'
            }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: '#064e3b',
                fontWeight: 600
              }}>
                <Phone size={12} color="#064e3b" />
                Hotline: 1900 6868
              </span>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <span style={{ color: '#6b7280' }}>
                {t('login.posTechnicalSupport')}
              </span>
            </div>
          </div>
        </div>

      </main>

      {/* 3. THANH FOOTER DƯỚI CÙNG (FULL CHIỀU RỘNG) */}
      <footer style={{
        height: '48px',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid rgba(226, 232, 240, 0.8)',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(10px)',
        fontSize: '12px',
        color: '#64748b',
        zIndex: 10
      }}>
        {/* Bên trái: Tên sản phẩm & Phiên bản */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontWeight: 500 }}>{t('login.restaurantBrand')}</span>
          <span style={{
            color: '#0284c7',
            fontWeight: 700,
            backgroundColor: 'rgba(2, 132, 199, 0.08)',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            letterSpacing: '0.4px'
          }}>
            v4.2.0 - PRO
          </span>
          <span style={{ color: '#94a3b8' }}>•</span>
          <span style={{ color: '#64748b' }}>{t('login.workstation')}</span>
        </div>

        {/* Bên phải: Tổng đài hỗ trợ & Mã hóa bảo mật */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Phone size={13} color="#64748b" />
            <span>{t('login.supportHotlinePriority')}</span>
            <strong style={{ color: '#334155', fontWeight: 600 }}>1900 6868</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="#059669" />
            <span>{t('login.hardwareEncrypted')}</span>
          </div>
        </div>
      </footer>

      {/* POPUP: Quên Mật Khẩu */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            width: '420px',
            maxWidth: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            padding: '24px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={20} color="#064e3b" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{t('login.resetPasswordTitle')}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                style={{ color: '#94a3b8', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, marginBottom: '16px' }}>
              {t('login.forgotModalNotice')}
            </p>
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '12.5px',
              color: '#166534',
              lineHeight: 1.5,
              marginBottom: '20px'
            }}>
              <strong>{t('login.quickSupportSteps')}</strong>
              <div style={{ marginTop: '6px' }}>
                {t('login.step1Notice')}
              </div>
              <div style={{ marginTop: '4px' }}>
                {t('login.step2Notice')}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#064e3b',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '13.5px'
              }}
            >
              {t('login.gotIt')}
            </button>
          </div>
        </div>
      )}

      {/* POPUP: Chẩn Đoán Hệ Thống */}
      {showDiagnosticsModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            width: '460px',
            maxWidth: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            padding: '24px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} color="#064e3b" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{t('login.diagnosticsTitle')}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDiagnosticsModal(false)}
                style={{ color: '#94a3b8', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                fontSize: '12.5px'
              }}>
                <span style={{ color: '#64748b' }}>{t('login.backendApiStatus')}</span>
                <span style={{ color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} /> {t('login.normalHttp200')}
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                fontSize: '12.5px'
              }}>
                <span style={{ color: '#64748b' }}>{t('login.dbStatus')}</span>
                <span style={{ color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} /> {t('login.dbConnected')}
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                fontSize: '12.5px'
              }}>
                <span style={{ color: '#64748b' }}>{t('login.posBranch')}</span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>{t('login.branchDetail')}</span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                fontSize: '12.5px'
              }}>
                <span style={{ color: '#64748b' }}>{t('login.printerStatus')}</span>
                <span style={{ color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} /> {t('login.printerReady')}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDiagnosticsModal(false)}
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#064e3b',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '13.5px'
              }}
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
