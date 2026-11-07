import React from 'react';

export function Card({ className = '', style = {}, children, ...props }) {
  return (
    <div
      className={`shadcn-card ${className}`}
      style={{
        backgroundColor: 'var(--card)',
        color: 'var(--card-foreground)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', style = {}, children, ...props }) {
  return (
    <div
      className={`shadcn-card-header ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        padding: '20px 24px',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className = '', style = {}, children, ...props }) {
  return (
    <h3
      className={`shadcn-card-title ${className}`}
      style={{
        fontSize: '16px',
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: '-0.3px',
        color: 'var(--foreground)',
        margin: 0,
        ...style
      }}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className = '', style = {}, children, ...props }) {
  return (
    <p
      className={`shadcn-card-description ${className}`}
      style={{
        fontSize: '13px',
        color: 'var(--muted-foreground)',
        margin: 0,
        ...style
      }}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ className = '', style = {}, children, ...props }) {
  return (
    <div
      className={`shadcn-card-content ${className}`}
      style={{
        padding: '0 24px 20px 24px',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardFooter({ className = '', style = {}, children, ...props }) {
  return (
    <div
      className={`shadcn-card-footer ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px 20px 24px',
        borderTop: '1px solid var(--border)',
        paddingTop: '16px',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
}
