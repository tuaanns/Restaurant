import React from 'react';

export function Table({ className = '', style = {}, children, ...props }) {
  return (
    <div style={{ width: '100%', overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
      <table
        className={`shadcn-table ${className}`}
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '13px',
          ...style
        }}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className = '', style = {}, children, ...props }) {
  return (
    <thead
      className={`shadcn-table-header ${className}`}
      style={{
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        ...style
      }}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({ className = '', style = {}, children, ...props }) {
  return (
    <tbody
      className={`shadcn-table-body ${className}`}
      style={{
        backgroundColor: '#ffffff',
        ...style
      }}
      {...props}
    >
      {children}
    </tbody>
  );
}

export function TableRow({ className = '', style = {}, children, ...props }) {
  return (
    <tr
      className={`shadcn-table-row ${className}`}
      style={{
        borderBottom: '1px solid #f1f5f9',
        transition: 'background-color 0.1s ease',
        ...style
      }}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ className = '', style = {}, children, align = 'left', ...props }) {
  return (
    <th
      className={`shadcn-table-head ${className}`}
      style={{
        height: '38px',
        padding: '0 12px',
        textAlign: align,
        verticalAlign: 'middle',
        fontWeight: 600,
        fontSize: '11.5px',
        textTransform: 'uppercase',
        letterSpacing: '0.4px',
        color: '#64748b',
        ...style
      }}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ className = '', style = {}, children, align = 'left', ...props }) {
  return (
    <td
      className={`shadcn-table-cell ${className}`}
      style={{
        padding: '10px 12px',
        verticalAlign: 'middle',
        textAlign: align,
        color: '#0f172a',
        ...style
      }}
      {...props}
    >
      {children}
    </td>
  );
}

