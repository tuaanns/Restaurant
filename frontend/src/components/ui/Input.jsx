import React from 'react';

export function Input({
  className = '',
  style = {},
  ...props
}) {
  return (
    <input
      className={`shadcn-input ${className}`}
      style={{
        height: '38px',
        width: '100%',
        borderRadius: '6px',
        border: '1px solid #cbd5e1',
        backgroundColor: '#ffffff',
        padding: '0 12px',
        fontSize: '13px',
        color: '#0f172a',
        boxSizing: 'border-box',
        outline: 'none',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        ...style
      }}
      {...props}
    />
  );
}
