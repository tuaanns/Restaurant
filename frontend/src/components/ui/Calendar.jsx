import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

/**
 * shadcn/ui style Calendar Component
 * Matches https://ui.shadcn.com/docs/components/radix/calendar
 */
export function Calendar({
  selected,
  onSelect,
  mode = 'single', // 'single' | 'range'
  startDate,
  endDate,
  onRangeSelect,
  minDate,
  maxDate,
  className = '',
  style = {},
  variant = 'forest', // 'forest' | 'dark'
}) {
  const { lang } = useLanguage();

  // Helper to parse 'YYYY-MM-DD' or Date into safe local year, month, date
  const parseLocalDate = (val) => {
    if (!val) return null;
    if (val instanceof Date) return val;
    if (typeof val === 'string') {
      const parts = val.split('T')[0].split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      }
    }
    return new Date(val);
  };

  const initialDate = useMemo(() => {
    return parseLocalDate(selected) || parseLocalDate(startDate) || new Date();
  }, [selected, startDate]);

  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [isMonthSelectOpen, setIsMonthSelectOpen] = useState(false);
  const [isYearSelectOpen, setIsYearSelectOpen] = useState(false);
  const monthDropdownRef = useRef(null);
  const yearDropdownRef = useRef(null);

  // Sync viewed month if selected date changes externally
  useEffect(() => {
    const d = parseLocalDate(selected) || parseLocalDate(startDate);
    if (d && !isNaN(d.getTime())) {
      setCurrentMonth(d.getMonth());
      setCurrentYear(d.getFullYear());
    }
  }, [selected, startDate]);

  // Click outside to close month/year dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(e.target)) {
        setIsMonthSelectOpen(false);
      }
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(e.target)) {
        setIsYearSelectOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Locale translations
  const localeData = useMemo(() => {
    switch (lang) {
      case 'vi':
        return {
          weekdays: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
          months: [
            'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
            'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
            'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
          ],
          todayBtn: 'Hôm nay'
        };
      case 'ko':
        return {
          weekdays: ['일', '월', '화', '수', '목', '금', '토'],
          months: [
            '1월', '2월', '3월', '4월',
            '5월', '6월', '7월', '8월',
            '9월', '10월', '11월', '12월'
          ],
          todayBtn: '오늘'
        };
      case 'ru':
        return {
          weekdays: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
          months: [
            'Январь', 'Февраль', 'Март', 'Апрель',
            'Май', 'Июнь', 'Июль', 'Август',
            'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
          ],
          todayBtn: 'Сегодня'
        };
      case 'en':
      default:
        return {
          weekdays: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
          months: [
            'January', 'February', 'March', 'April',
            'May', 'June', 'July', 'August',
            'September', 'October', 'November', 'December'
          ],
          todayBtn: 'Today'
        };
    }
  }, [lang]);

  // Year range for selector (from 1940 to 2035)
  const yearsList = useMemo(() => {
    const list = [];
    const thisYear = new Date().getFullYear();
    for (let y = thisYear + 5; y >= thisYear - 80; y--) {
      list.push(y);
    }
    return list;
  }, []);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
    if (onSelect) {
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      onSelect(`${y}-${m}-${d}`);
    }
  };

  // Generate days matrix (including prev month trailing & next month leading days)
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // Prev month trailing days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      days.push({
        dayNumber: d,
        month: prevM,
        year: prevY,
        isCurrentMonth: false,
        dateString: `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        dayNumber: d,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true,
        dateString: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      });
    }

    // Next month leading days to complete full 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    const totalNeeded = (days.length + remaining <= 35) ? 35 : 42;
    const additional = totalNeeded - days.length;

    for (let d = 1; d <= additional; d++) {
      const nextM = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      days.push({
        dayNumber: d,
        month: nextM,
        year: nextY,
        isCurrentMonth: false,
        dateString: `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Today string YYYY-MM-DD
  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  const selectedStr = useMemo(() => {
    if (!selected) return '';
    if (typeof selected === 'string') return selected.split('T')[0];
    const y = selected.getFullYear();
    const m = String(selected.getMonth() + 1).padStart(2, '0');
    const d = String(selected.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [selected]);

  const startStr = useMemo(() => {
    if (!startDate) return '';
    if (typeof startDate === 'string') return startDate.split('T')[0];
    return `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
  }, [startDate]);

  const endStr = useMemo(() => {
    if (!endDate) return '';
    if (typeof endDate === 'string') return endDate.split('T')[0];
    return `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
  }, [endDate]);

  const handleDayClick = (item) => {
    if (mode === 'single') {
      if (onSelect) {
        onSelect(item.dateString);
      }
    } else if (mode === 'range') {
      if (!startStr || (startStr && endStr)) {
        if (onRangeSelect) onRangeSelect(item.dateString, null);
      } else if (startStr && !endStr) {
        if (item.dateString < startStr) {
          if (onRangeSelect) onRangeSelect(item.dateString, startStr);
        } else {
          if (onRangeSelect) onRangeSelect(startStr, item.dateString);
        }
      }
    }
  };

  // Primary active color theme (default #1B5E20 forest, matches our application)
  const activeBg = variant === 'dark' ? '#0f172a' : '#1B5E20';
  const rangeMidBg = variant === 'dark' ? '#f1f5f9' : '#E8F5E9';
  const rangeMidColor = variant === 'dark' ? '#0f172a' : '#1B5E20';

  return (
    <div
      className={`shadcn-calendar ${className}`}
      style={{
        width: '272px',
        backgroundColor: '#ffffff',
        userSelect: 'none',
        fontFamily: 'inherit',
        ...style
      }}
    >
      {/* ─── 1. HEADER (CHEVRONS + MONTH/YEAR SELECTORS) ─── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 2px 12px 2px'
      }}>
        {/* Prev month button */}
        <button
          type="button"
          onClick={handlePrevMonth}
          title="Previous month"
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            backgroundColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#475569',
            transition: 'background-color 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <ChevronLeft size={15} />
        </button>

        {/* Center: Month and Year Dropdown buttons (matching shadcn preview in user image) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Month selector */}
          <div ref={monthDropdownRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                setIsMonthSelectOpen(!isMonthSelectOpen);
                setIsYearSelectOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid transparent',
                backgroundColor: isMonthSelectOpen ? '#f1f5f9' : 'transparent',
                fontSize: '13px',
                fontWeight: 700,
                color: '#0f172a',
                cursor: 'pointer'
              }}
              onMouseEnter={e => { if (!isMonthSelectOpen) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
              onMouseLeave={e => { if (!isMonthSelectOpen) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <span>{localeData.months[currentMonth]}</span>
              <ChevronDown size={13} color="#64748b" />
            </button>

            {isMonthSelectOpen && (
              <div style={{
                position: 'absolute',
                top: '32px',
                left: '0',
                width: '130px',
                maxHeight: '190px',
                overflowY: 'auto',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                padding: '4px',
                zIndex: 50
              }}>
                {localeData.months.map((mName, mIdx) => (
                  <button
                    key={mName}
                    type="button"
                    onClick={() => {
                      setCurrentMonth(mIdx);
                      setIsMonthSelectOpen(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '5px 8px',
                      borderRadius: '5px',
                      fontSize: '12px',
                      fontWeight: mIdx === currentMonth ? 700 : 500,
                      backgroundColor: mIdx === currentMonth ? rangeMidBg : 'transparent',
                      color: mIdx === currentMonth ? activeBg : '#334155',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={e => { if (mIdx !== currentMonth) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                    onMouseLeave={e => { if (mIdx !== currentMonth) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    {mName}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Year selector */}
          <div ref={yearDropdownRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                setIsYearSelectOpen(!isYearSelectOpen);
                setIsMonthSelectOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid transparent',
                backgroundColor: isYearSelectOpen ? '#f1f5f9' : 'transparent',
                fontSize: '13px',
                fontWeight: 700,
                color: '#0f172a',
                cursor: 'pointer'
              }}
              onMouseEnter={e => { if (!isYearSelectOpen) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
              onMouseLeave={e => { if (!isYearSelectOpen) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <span>{currentYear}</span>
              <ChevronDown size={13} color="#64748b" />
            </button>

            {isYearSelectOpen && (
              <div style={{
                position: 'absolute',
                top: '32px',
                right: '0',
                width: '90px',
                maxHeight: '190px',
                overflowY: 'auto',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                padding: '4px',
                zIndex: 50
              }}>
                {yearsList.map(y => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => {
                      setCurrentYear(y);
                      setIsYearSelectOpen(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      padding: '5px 6px',
                      borderRadius: '5px',
                      fontSize: '12px',
                      fontWeight: y === currentYear ? 700 : 500,
                      backgroundColor: y === currentYear ? rangeMidBg : 'transparent',
                      color: y === currentYear ? activeBg : '#334155',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={e => { if (y !== currentYear) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                    onMouseLeave={e => { if (y !== currentYear) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Next month button */}
        <button
          type="button"
          onClick={handleNextMonth}
          title="Next month"
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            backgroundColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#475569',
            transition: 'background-color 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* ─── 2. WEEKDAY LABELS (Su Mo Tu We Th Fr Sa) ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '2px',
        marginBottom: '6px'
      }}>
        {localeData.weekdays.map((wd, i) => (
          <div
            key={i}
            style={{
              textAlign: 'center',
              fontSize: '11px',
              fontWeight: 600,
              color: '#64748b',
              padding: '4px 0'
            }}
          >
            {wd}
          </div>
        ))}
      </div>

      {/* ─── 3. DAYS GRID (MATCHING SHADCN RADIX CALENDAR) ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '3px'
      }}>
        {calendarDays.map((item, idx) => {
          const isSelected = mode === 'single'
            ? selectedStr === item.dateString
            : (startStr === item.dateString || endStr === item.dateString);

          const isRangeMiddle = mode === 'range' && startStr && endStr && (item.dateString > startStr && item.dateString < endStr);
          const isToday = item.dateString === todayStr;

          // Styling
          let cellBg = 'transparent';
          let cellColor = item.isCurrentMonth ? '#0f172a' : '#cbd5e1';
          let fontWeight = item.isCurrentMonth ? 500 : 400;
          let borderRadius = '7px';

          if (isSelected) {
            cellBg = activeBg;
            cellColor = '#ffffff';
            fontWeight = 700;
          } else if (isRangeMiddle) {
            cellBg = rangeMidBg;
            cellColor = rangeMidColor;
            borderRadius = '0px';
          } else if (isToday) {
            fontWeight = 800;
            cellColor = activeBg;
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleDayClick(item)}
              style={{
                width: '36px',
                height: '34px',
                borderRadius: borderRadius,
                backgroundColor: cellBg,
                color: cellColor,
                fontSize: '12px',
                fontWeight: fontWeight,
                border: isToday && !isSelected ? `1px solid ${activeBg}` : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                position: 'relative'
              }}
              onMouseEnter={e => {
                if (!isSelected && !isRangeMiddle) {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                }
              }}
              onMouseLeave={e => {
                if (!isSelected && !isRangeMiddle) {
                  e.currentTarget.style.backgroundColor = isToday ? 'transparent' : 'transparent';
                }
              }}
            >
              {item.dayNumber}
            </button>
          );
        })}
      </div>

      {/* ─── 4. QUICK FOOTER ("Hôm nay" button) ─── */}
      <div style={{
        marginTop: '10px',
        paddingTop: '8px',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          type="button"
          onClick={handleGoToday}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '11.5px',
            fontWeight: 700,
            color: activeBg,
            cursor: 'pointer',
            padding: '2px 4px',
            borderRadius: '4px'
          }}
          onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
          onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
        >
          {localeData.todayBtn}
        </button>

        {selectedStr && (
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            {selectedStr.split('-').reverse().join('/')}
          </span>
        )}
      </div>
    </div>
  );
}

