import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, X, Clock } from 'lucide-react';
import { Calendar } from './Calendar';
import { useLanguage } from '../../i18n/LanguageContext';

/**
 * shadcn/ui DatePicker Popover Component
 * Drop-in replacement for <input type="date"> and <input type="datetime-local">
 */
export function DatePicker({
  value = '',
  onChange = () => {},
  placeholder = 'Chọn ngày',
  disabled = false,
  includeTime = false,
  clearable = true,
  minDate,
  maxDate,
  style = {},
  className = '',
  align = 'auto', // 'auto' | 'left' | 'right'
  placement = 'auto', // 'auto' | 'top' | 'bottom'
  required = false
}) {
  const { lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const [actualPlacement, setActualPlacement] = useState(placement === 'top' ? 'top' : 'bottom');
  const [actualAlign, setActualAlign] = useState(align === 'right' ? 'right' : 'left');

  // Compute position relative to viewport and container
  const updatePosition = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    // Determine vertical placement
    if (placement === 'top') {
      setActualPlacement('top');
    } else if (placement === 'bottom') {
      setActualPlacement('bottom');
    } else {
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // Calendar popup height is ~250px. If less than 280px below and more space above, open upwards
      if (spaceBelow < 280 && spaceAbove > 240) {
        setActualPlacement('top');
      } else {
        setActualPlacement('bottom');
      }
    }

    // Determine horizontal alignment
    if (align === 'right') {
      setActualAlign('right');
    } else if (align === 'left') {
      setActualAlign('left');
    } else {
      const spaceRight = window.innerWidth - rect.left;
      if (spaceRight < 255 && rect.right > 255) {
        setActualAlign('right');
      } else {
        setActualAlign('left');
      }
    }
  };

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  // Extract date and time parts
  const datePart = value ? value.split('T')[0] : '';
  const timePart = value && value.includes('T') ? value.split('T')[1].substring(0, 5) : '00:00';

  const [selectedTime, setSelectedTime] = useState(timePart);

  useEffect(() => {
    if (value && value.includes('T')) {
      setSelectedTime(value.split('T')[1].substring(0, 5));
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Emit change in both callback shapes: (val) and (e)
  const emitChange = (valStr) => {
    if (typeof onChange === 'function') {
      const syntheticEvent = {
        target: { value: valStr },
        currentTarget: { value: valStr },
        preventDefault: () => {},
        stopPropagation: () => {}
      };
      // Call with syntheticEvent first, or raw string if caller doesn't use event.target
      onChange(syntheticEvent);
    }
  };

  const handleSelectDate = (dateString) => {
    if (includeTime) {
      const fullValue = `${dateString}T${selectedTime || '00:00'}`;
      emitChange(fullValue);
    } else {
      emitChange(dateString);
      setIsOpen(false);
    }
  };

  const handleTimeChange = (newTime) => {
    setSelectedTime(newTime);
    if (datePart) {
      const fullValue = `${datePart}T${newTime}`;
      emitChange(fullValue);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    emitChange('');
  };

  // Format display text: DD/MM/YYYY
  const formatDisplay = () => {
    if (!datePart) return '';
    const parts = datePart.split('-');
    if (parts.length === 3) {
      const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
      return includeTime ? `${formattedDate} ${selectedTime}` : formattedDate;
    }
    return value;
  };

  const displayText = formatDisplay();

  return (
    <div
      ref={containerRef}
      className={`shadcn-datepicker-container ${className}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        width: '100%',
        ...style
      }}
    >
      {/* ─── TRIGGER BUTTON / INPUT (MATCHING SHADCN BUTTON TRIGGER) ─── */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        style={{
          width: '100%',
          height: '36px',
          padding: '0 10px',
          borderRadius: '6px',
          border: isOpen ? '1px solid #1B5E20' : '1px solid #cbd5e1',
          backgroundColor: disabled ? '#f8fafc' : '#ffffff',
          color: displayText ? '#0f172a' : '#94a3b8',
          fontSize: '12.5px',
          fontWeight: displayText ? 600 : 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          boxShadow: isOpen ? '0 0 0 2px rgba(27, 94, 32, 0.15)' : 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          <CalendarIcon size={14} color={displayText ? '#1B5E20' : '#64748b'} style={{ flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {displayText || placeholder}
          </span>
        </div>

        {clearable && displayText && !disabled && (
          <div
            onClick={handleClear}
            title="Clear"
            style={{
              padding: '2px',
              borderRadius: '4px',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
          >
            <X size={12} />
          </div>
        )}
      </button>

      {/* Hidden native input for form compatibility/validation */}
      <input
        type="hidden"
        value={value}
        required={required}
      />

      {/* ─── POPOVER (SHADCN RADIX STYLE CALENDAR DROPDOWN) ─── */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            [actualPlacement === 'top' ? 'bottom' : 'top']: 'calc(100% + 4px)',
            [actualAlign === 'right' ? 'right' : 'left']: 0,
            zIndex: 1050,
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: actualPlacement === 'top'
              ? '0 -10px 25px -5px rgba(0, 0, 0, 0.15), 0 -8px 10px -6px rgba(0, 0, 0, 0.1)'
              : '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            padding: '8px',
            width: '100%',
            minWidth: '232px',
            maxWidth: '252px',
            boxSizing: 'border-box',
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          <Calendar
            selected={datePart}
            onSelect={handleSelectDate}
            minDate={minDate}
            maxDate={maxDate}
            variant="forest"
          />

          {/* Time Picker row if includeTime is enabled */}
          {includeTime && (
            <div style={{
              marginTop: '10px',
              paddingTop: '10px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569' }}>
                <Clock size={14} color="#1B5E20" />
                <span style={{ fontWeight: 600 }}>Giờ:</span>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  style={{
                    padding: '3px 6px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    outline: 'none',
                    fontWeight: 700
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '4px 12px',
                  backgroundColor: '#1B5E20',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Xong
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

