import React from 'react';

/**
 * FlagIcon — SVG Circular Flag Icons
 * Renders high-quality, crisp, pixel-perfect round flags matching modern POS/KiotViet design.
 */
export function FlagIcon({ code = 'vi', size = 22, style = {} }) {
  const c = (code || 'vi').toLowerCase();

  const containerStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.18)',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    verticalAlign: 'middle',
    ...style
  };

  // 1. VIỆT NAM (vi / vn)
  if (c === 'vi' || c === 'vn') {
    return (
      <div style={containerStyle}>
        <svg viewBox="0 0 32 32" width="100%" height="100%">
          <rect width="32" height="32" fill="#da251d" />
          <polygon
            points="16,6 19.1,13.5 27.2,13.8 20.9,18.8 23.1,26.5 16,21.8 8.9,26.5 11.1,18.8 4.8,13.8 12.9,13.5"
            fill="#ffff00"
          />
        </svg>
      </div>
    );
  }

  // 2. UNITED STATES / ENGLISH (en / us)
  if (c === 'en' || c === 'us') {
    return (
      <div style={containerStyle}>
        <svg viewBox="0 0 32 32" width="100%" height="100%">
          {/* 13 Red & White stripes */}
          <rect width="32" height="32" fill="#ffffff" />
          <rect y="0" width="32" height="2.46" fill="#b22234" />
          <rect y="4.92" width="32" height="2.46" fill="#b22234" />
          <rect y="9.85" width="32" height="2.46" fill="#b22234" />
          <rect y="14.77" width="32" height="2.46" fill="#b22234" />
          <rect y="19.69" width="32" height="2.46" fill="#b22234" />
          <rect y="24.62" width="32" height="2.46" fill="#b22234" />
          <rect y="29.54" width="32" height="2.46" fill="#b22234" />
          {/* Blue canton */}
          <rect width="14" height="17.2" fill="#3c3b6e" />
          {/* Stars */}
          <circle cx="3" cy="3" r="0.9" fill="#fff" />
          <circle cx="7" cy="3" r="0.9" fill="#fff" />
          <circle cx="11" cy="3" r="0.9" fill="#fff" />
          <circle cx="5" cy="6" r="0.9" fill="#fff" />
          <circle cx="9" cy="6" r="0.9" fill="#fff" />
          <circle cx="3" cy="9" r="0.9" fill="#fff" />
          <circle cx="7" cy="9" r="0.9" fill="#fff" />
          <circle cx="11" cy="9" r="0.9" fill="#fff" />
          <circle cx="5" cy="12" r="0.9" fill="#fff" />
          <circle cx="9" cy="12" r="0.9" fill="#fff" />
          <circle cx="3" cy="15" r="0.9" fill="#fff" />
          <circle cx="7" cy="15" r="0.9" fill="#fff" />
          <circle cx="11" cy="15" r="0.9" fill="#fff" />
        </svg>
      </div>
    );
  }

  // 3. SOUTH KOREA (ko / kr)
  if (c === 'ko' || c === 'kr') {
    return (
      <div style={containerStyle}>
        <svg viewBox="0 0 32 32" width="100%" height="100%">
          <rect width="32" height="32" fill="#ffffff" />
          {/* Trigrams in 4 corners */}
          {/* Top-left 건 */}
          <line x1="5.5" y1="6.5" x2="10.5" y2="10.5" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="7" y1="5" x2="12" y2="9" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="4" y1="8" x2="9" y2="12" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" />
          {/* Bottom-right 곤 */}
          <line x1="21.5" y1="21.5" x2="26.5" y2="25.5" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="23" y1="20" x2="28" y2="24" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="20" y1="23" x2="25" y2="27" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" />
          {/* Top-right 감 */}
          <line x1="21.5" y1="10.5" x2="26.5" y2="6.5" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="20" y1="9" x2="25" y2="5" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="23" y1="12" x2="28" y2="8" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" />
          {/* Bottom-left 리 */}
          <line x1="5.5" y1="25.5" x2="10.5" y2="21.5" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="4" y1="24" x2="9" y2="20" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="7" y1="27" x2="12" y2="23" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" />
          {/* Center Taegeuk circle */}
          <g transform="rotate(-35 16 16)">
            <path d="M 16,8 A 8,8 0 0,1 16,24 A 8,8 0 0,1 16,8 Z" fill="#003478" />
            <path d="M 16,8 A 8,8 0 0,0 16,24 A 4,4 0 0,0 16,16 A 4,4 0 0,1 16,8 Z" fill="#c60c30" />
          </g>
        </svg>
      </div>
    );
  }

  // 4. RUSSIA (ru)
  if (c === 'ru') {
    return (
      <div style={containerStyle}>
        <svg viewBox="0 0 32 32" width="100%" height="100%">
          <rect y="0" width="32" height="10.67" fill="#ffffff" />
          <rect y="10.67" width="32" height="10.67" fill="#0039a6" />
          <rect y="21.33" width="32" height="10.67" fill="#d52b1e" />
        </svg>
      </div>
    );
  }

  // 5. JAPAN (jp / ja)
  if (c === 'jp' || c === 'ja') {
    return (
      <div style={containerStyle}>
        <svg viewBox="0 0 32 32" width="100%" height="100%">
          <rect width="32" height="32" fill="#ffffff" />
          <circle cx="16" cy="16" r="7.5" fill="#bc002d" />
        </svg>
      </div>
    );
  }

  // 6. CHINA (cn / zh)
  if (c === 'cn' || c === 'zh') {
    return (
      <div style={containerStyle}>
        <svg viewBox="0 0 32 32" width="100%" height="100%">
          <rect width="32" height="32" fill="#de2910" />
          <polygon points="6,6 7.5,9.5 11,9.8 8.2,12 9.1,15.5 6,13.5 2.9,15.5 3.8,12 1,9.8 4.5,9.5" fill="#ffde00" />
          <polygon points="13,3 13.5,4.5 15,4.6 13.8,5.5 14.2,7 13,6.2 11.8,7 12.2,5.5 11,4.6 12.5,4.5" fill="#ffde00" />
          <polygon points="16,6 16.5,7.5 18,7.6 16.8,8.5 17.2,10 16,9.2 14.8,10 15.2,8.5 14,7.6 15.5,7.5" fill="#ffde00" />
          <polygon points="16,11 16.5,12.5 18,12.6 16.8,13.5 17.2,15 16,14.2 14.8,15 15.2,13.5 14,12.6 15.5,12.5" fill="#ffde00" />
          <polygon points="13,14 13.5,15.5 15,15.6 13.8,16.5 14.2,18 13,17.2 11.8,18 12.2,16.5 11,15.6 12.5,15.5" fill="#ffde00" />
        </svg>
      </div>
    );
  }

  // 7. FRANCE (fr)
  if (c === 'fr') {
    return (
      <div style={containerStyle}>
        <svg viewBox="0 0 32 32" width="100%" height="100%">
          <rect x="0" width="10.67" height="32" fill="#002395" />
          <rect x="10.67" width="10.67" height="32" fill="#ffffff" />
          <rect x="21.33" width="10.67" height="32" fill="#ed2939" />
        </svg>
      </div>
    );
  }

  // 8. GERMANY (de)
  if (c === 'de') {
    return (
      <div style={containerStyle}>
        <svg viewBox="0 0 32 32" width="100%" height="100%">
          <rect y="0" width="32" height="10.67" fill="#000000" />
          <rect y="10.67" width="32" height="10.67" fill="#dd0000" />
          <rect y="21.33" width="32" height="10.67" fill="#ffce00" />
        </svg>
      </div>
    );
  }

  // Fallback default
  return (
    <div style={containerStyle}>
      <span style={{ fontSize: '12px', fontWeight: 800 }}>{code.toUpperCase()}</span>
    </div>
  );
}
