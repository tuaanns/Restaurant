import React, { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHardReset = () => {
    try {
      sessionStorage.clear();
      localStorage.removeItem('pos_user');
      localStorage.removeItem('pos_token');
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          padding: '24px',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        }}>
          <div style={{
            maxWidth: '520px',
            width: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              marginBottom: '16px'
            }}>
              ⚠️
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
              Đã xảy ra sự cố hiển thị
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
              Hệ thống đã tự động ngăn chặn gián đoạn. Bạn có thể tải lại trang hoặc xóa phiên đăng nhập để làm mới dữ liệu.
            </p>
            {this.state.error?.message && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
                fontSize: '12px',
                color: '#991b1b',
                textAlign: 'left',
                maxHeight: '120px',
                overflow: 'auto',
                fontFamily: 'monospace'
              }}>
                {this.state.error.message}
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  backgroundColor: '#1B5E20',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: '0 2px 4px rgba(27,94,32,0.2)'
                }}
              >
                Tải lại trang
              </button>
              <button
                type="button"
                onClick={this.handleHardReset}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  border: '1px solid #cbd5e1'
                }}
              >
                Xóa phiên &amp; Đăng nhập lại
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Clear any temporary synchronization fallback banner
const existingBanner = document.getElementById('critical-fallback-banner');
if (existingBanner && existingBanner.parentNode) {
  existingBanner.parentNode.removeChild(existingBanner);
}

const rootElement = document.getElementById('root');
createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ErrorBoundary>
  </StrictMode>,
);
