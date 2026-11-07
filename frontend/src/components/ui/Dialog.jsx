import React from 'react';
import { X } from 'lucide-react';

export function Dialog({
  isOpen,
  onClose,
  maxWidth = '500px',
  className = '',
  style = {},
  children
}) {
  if (!isOpen) return null;

  return (
    <div
      className="shadcn-dialog-overlay"
      onClick={onClose}
    >
      <div
        className={`shadcn-dialog-content ${className}`}
        style={{
          maxWidth,
          ...style
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className = '', style = {}, children, onClose }) {
  return (
    <div
      className={`shadcn-dialog-header ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        ...style
      }}
    >
      <div>{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            border: 'none',
            background: 'transparent',
            padding: '4px',
            borderRadius: '6px',
            color: '#64748b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

export function DialogTitle({ className = '', style = {}, children }) {
  return (
    <h2
      className={`shadcn-dialog-title ${className}`}
      style={{
        fontSize: '17px',
        fontWeight: 700,
        color: '#0f172a',
        letterSpacing: '-0.3px',
        margin: 0,
        ...style
      }}
    >
      {children}
    </h2>
  );
}

export function DialogDescription({ className = '', style = {}, children }) {
  return (
    <p
      className={`shadcn-dialog-description ${className}`}
      style={{
        fontSize: '13px',
        color: '#64748b',
        margin: '4px 0 0 0',
        lineHeight: 1.5,
        ...style
      }}
    >
      {children}
    </p>
  );
}

export function DialogFooter({ className = '', style = {}, children }) {
  return (
    <div
      className={`shadcn-dialog-footer ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '8px',
        marginTop: '24px',
        paddingTop: '16px',
        borderTop: '1px solid #e2e8f0',
        ...style
      }}
    >
      {children}
    </div>
  );
}
