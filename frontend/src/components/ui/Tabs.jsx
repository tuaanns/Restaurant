import React from 'react';

export function TabsList({ className = '', style = {}, children, ...props }) {
  return (
    <div
      className={`shadcn-tabs ${className}`}
      style={{
        display: 'inline-flex',
        height: '38px',
        alignItems: 'center',
        borderRadius: '8px',
        backgroundColor: '#f1f5f9',
        padding: '3px',
        gap: '2px',
        boxSizing: 'border-box',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  active = false,
  onClick,
  className = '',
  style = {},
  children,
  ...props
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shadcn-tab-item ${active ? 'active' : ''} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px',
        padding: '6px 14px',
        fontSize: '12.5px',
        fontWeight: active ? 700 : 500,
        color: active ? '#0f172a' : '#64748b',
        backgroundColor: active ? '#ffffff' : 'transparent',
        boxShadow: active ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none',
        cursor: 'pointer',
        border: 'none',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
        ...style
      }}
      {...props}
    >
      {children}
    </button>
  );
}

