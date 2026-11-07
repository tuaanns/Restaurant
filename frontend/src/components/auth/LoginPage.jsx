import React, { useState } from 'react';
import { Lock, User, LogIn, Eye, EyeOff, Phone, AlertCircle, X, HelpCircle } from 'lucide-react';
import { api } from '../../api';
import { useLanguage } from '../../i18n/LanguageContext';
import { LanguageSwitcher } from '../LanguageSwitcher';

export function LoginPage({ onLoginSuccess }) {
  const { t } = useLanguage();

  const [username, setUsername] = useState(() => {
    return localStorage.getItem('aura_remember_login') || '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return !!localStorage.getItem('aura_remember_login');
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!username.trim()) {
      setErrorMsg(t('login.usernamePlaceholder') || 'Vui lòng nhập tên đăng nhập');
      return;
    }
    if (!password) {
      setErrorMsg(t('login.passwordPlaceholder') || 'Vui lòng nhập mật khẩu');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.login(username.trim(), password);
      if (res && res.user) {
        if (rememberMe) {
          localStorage.setItem('aura_remember_login', username.trim());
        } else {
          localStorage.removeItem('aura_remember_login');
        }
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setErrorMsg(err.message || t('login.wrongCredentials') || 'Tên đăng nhập hoặc mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#f1f5f9',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      color: '#1e293b',
      boxSizing: 'border-box',
      userSelect: 'none'
    }}>
      {/* Top Bar: Minimal Language Selector */}
      <div style={{
        height: '56px',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end'
      }}>
        <LanguageSwitcher variant="light" />
      </div>

      {/* Main Content: Focused, Clean, Utility Card */}
      <div style={{
        width: '100%',
        maxWidth: '400px',
        margin: '0 auto',
        padding: '0 20px',
        boxSizing: 'border-box'
      }}>
        {/* Card Container */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
          padding: '32px 28px'
        }}>
          {/* Brand Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <img
              src="/logo.png"
              alt="Logo Quán Trà"
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '8px',
                objectFit: 'cover',
                border: '1px solid #e2e8f0',
                display: 'inline-block',
                marginBottom: '12px'
              }}
            />
            <h1 style={{
              fontSize: '20px',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '0.3px',
              margin: '0 0 4px 0',
              textTransform: 'uppercase'
            }}>
              QUÁN TRÀ POS
            </h1>
            <p style={{
              fontSize: '13px',
              color: '#64748b',
              margin: 0
            }}>
              {t('login.subtitle') || 'Hệ thống quản lý bán hàng'}
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '10px 12px',
              borderRadius: '6px',
              fontSize: '12.5px',
              marginBottom: '18px'
            }}>
              <AlertCircle size={15} color="#dc2626" style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Username Field */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '6px'
              }}>
                {t('login.username') || 'Tên đăng nhập'}
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '0 12px',
                height: '40px',
                transition: 'border-color 0.15s ease'
              }}>
                <User size={16} color="#94a3b8" style={{ marginRight: '10px', flexShrink: 0 }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('login.usernamePlaceholder') || 'Nhập tên đăng nhập'}
                  autoFocus
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

            {/* Password Field */}
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
                  color: '#334155'
                }}>
                  {t('login.password') || 'Mật khẩu'}
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#009688',
                    cursor: 'pointer'
                  }}
                >
                  {t('login.forgotPassword') || 'Quên mật khẩu?'}
                </button>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '0 12px',
                height: '40px',
                transition: 'border-color 0.15s ease'
              }}>
                <Lock size={16} color="#94a3b8" style={{ marginRight: '10px', flexShrink: 0 }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.passwordPlaceholder') || 'Nhập mật khẩu'}
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
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
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
              <span>{t('login.rememberMe') || 'Ghi nhớ đăng nhập'}</span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                height: '42px',
                marginTop: '6px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#009688',
                color: '#ffffff',
                fontSize: '13.5px',
                fontWeight: 700,
                letterSpacing: '0.3px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: loading ? 0.7 : 1,
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#00796b';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#009688';
              }}
            >
              <LogIn size={16} />
              <span>{loading ? (t('login.loggingIn') || 'Đang đăng nhập...') : (t('login.loginBtn') || 'ĐĂNG NHẬP')}</span>
            </button>
          </form>
        </div>

        {/* Store & Technical Support Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          fontSize: '12px',
          color: '#64748b',
          lineHeight: 1.6
        }}>
          <div>
            Hỗ trợ kỹ thuật: <strong style={{ color: '#0f766e', fontWeight: 700 }}>0348974111</strong>
          </div>
          <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px' }}>
            103 Trần Hưng Đạo, Phú Quốc • v4.2.0
          </div>
        </div>
      </div>

      {/* Bottom Spacer */}
      <div style={{ height: '32px' }} />

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '24px',
            width: '380px',
            maxWidth: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                {t('login.resetPasswordTitle') || 'Quên mật khẩu?'}
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.5, margin: '0 0 14px 0' }}>
              Để bảo mật dữ liệu doanh thu và kho hàng của quán, vui lòng liên hệ quản lý hoặc bộ phận kỹ thuật để được cấp lại mật khẩu:
            </p>
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>
                Hotline hỗ trợ kỹ thuật POS:
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#00796b' }}>
                0348974111
              </div>
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              style={{
                width: '100%',
                height: '36px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#009688',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
