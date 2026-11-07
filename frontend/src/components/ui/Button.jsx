import React from 'react';

export function Button({
  variant = 'default', // 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size = 'default', // 'sm' | 'default' | 'lg' | 'icon'
  className = '',
  style = {},
  disabled = false,
  children,
  ...props
}) {
  const sizeStyles = {
    sm: { height: '32px', padding: '0 10px', fontSize: '12px' },
    default: { height: '36px', padding: '0 14px', fontSize: '13px' },
    lg: { height: '42px', padding: '0 18px', fontSize: '14px' },
    icon: { height: '36px', width: '36px', padding: '0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }
  };

  const variantClasses = {
    default: 'shadcn-btn-primary',
    secondary: 'shadcn-btn-secondary',
    outline: 'shadcn-btn-outline',
    ghost: 'shadcn-btn-ghost',
    destructive: 'shadcn-btn-destructive'
  };

  const chosenSize = sizeStyles[size] || sizeStyles.default;
  const chosenClass = variantClasses[variant] || variantClasses.default;

  return (
    <button
      className={`shadcn-btn ${chosenClass} ${className}`}
      disabled={disabled}
      style={{
        ...chosenSize,
        ...style
      }}
      {...props}
    >
      {children}
    </button>
  );
}
