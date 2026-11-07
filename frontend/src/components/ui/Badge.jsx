import React from 'react';

export function Badge({
  variant = 'default', // 'default' | 'secondary' | 'outline' | 'destructive' | 'warning' | 'success'
  className = '',
  style = {},
  children,
  ...props
}) {
  const variantStyles = {
    default: {
      backgroundColor: '#E8F5E9',
      color: '#1B5E20',
      border: '1px solid #A5D6A7'
    },
    secondary: {
      backgroundColor: '#f1f5f9',
      color: '#475569',
      border: '1px solid #e2e8f0'
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#0f172a',
      border: '1px solid #cbd5e1'
    },
    destructive: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      border: '1px solid #fecaca'
    },
    warning: {
      backgroundColor: '#fefce8',
      color: '#854d0e',
      border: '1px solid #fef08a'
    },
    success: {
      backgroundColor: '#ecfdf5',
      color: '#065f46',
      border: '1px solid #a7f3d0'
    }
  };

  const currentVariant = variantStyles[variant] || variantStyles.default;

  return (
    <span
      className={`shadcn-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        borderRadius: '9999px',
        padding: '2px 8px',
        fontSize: '11px',
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: '0.2px',
        ...currentVariant,
        ...style
      }}
      {...props}
    >
      {children}
    </span>
  );
}

