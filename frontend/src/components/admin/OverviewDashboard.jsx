import React, { useState, useRef, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  Utensils,
  Users,
  Banknote,
  QrCode,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
  Ban,
  XCircle,
  CheckCircle
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

// ─── MAGIC BENTO CARD WITH CURSOR SPOTLIGHT & EDGE LIGHT GLOW (React Bits style) ───
function BentoCard({ children, style = {}, className = '' }) {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: -1000, y: -1000 });
      }}
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: isHovered
          ? '0 14px 30px -10px rgba(27, 94, 32, 0.12), 0 0 0 1px rgba(27, 94, 32, 0.22)'
          : '0 1px 3px rgba(0, 0, 0, 0.03)',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        ...style
      }}
      className={className}
    >
      {/* Magic Bento: radial spotlight following cursor */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.25s ease',
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(27, 94, 32, 0.06), transparent 75%)`,
          zIndex: 1
        }}
      />
      {/* Magic Bento: edge light glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.25s ease',
          background: `radial-gradient(320px circle at ${mousePos.x}px ${mousePos.y}px, rgba(74, 222, 128, 0.35), transparent 60%)`,
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: '1px',
          borderRadius: 'inherit',
          zIndex: 2
        }}
      />
      <div style={{ position: 'relative', zIndex: 3, height: '100%' }}>
        {children}
      </div>
    </div>
  );
}

// ─── SHADCN UI CUSTOM TOOLTIP ───
function ShadcnCustomTooltip({ active, payload, label, unit = 'đ', isCurrency = true }) {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    const formatted = isCurrency
      ? Number(val || 0).toLocaleString('vi-VN') + ' đ'
      : `${val} ${unit}`;

    return (
      <div style={{
        backgroundColor: '#0f172a',
        color: '#ffffff',
        borderRadius: '10px',
        padding: '10px 14px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        border: '1px solid #334155',
        fontSize: '12px'
      }}>
        <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '4px', fontWeight: 600 }}>
          {label}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: payload[0].color || '#4ade80' }} />
          <span style={{ fontSize: '13px', color: '#ffffff' }}>{formatted}</span>
        </div>
      </div>
    );
  }
  return null;
}

export function OverviewDashboard({
  stats,
  users = [],
  tables = [],
  menuData,
  formatMoney,
  formatDishName
}) {
  const { t, formatDishName: ctxFormatDishName, formatDishUnit } = useLanguage();

  // Chart controls: active metric (revenue vs orders), time range (today vs 7days vs 30days), chart style (bar vs area)
  const [activeMetric, setActiveMetric] = useState('revenue'); // 'revenue' | 'orders'
  const [timeRange, setTimeRange] = useState('today'); // 'today' | '7days' | '30days'
  const [chartType, setChartType] = useState('bar'); // 'bar' | 'area'

  // Calculations (real-time direct values from backend stats)
  const totalRevenue = Number(stats?.total_revenue || 0);
  const totalOrders = Number(stats?.total_orders_today || 0);
  const occupiedTables = Number(stats?.occupied_tables || 0);
  const totalTables = tables?.length || 24;
  const billingTables = Number(stats?.billing_tables || 0);
  const staffCount = users?.length || Number(stats?.cashiers_count || 1);
  const revenueGrowth = typeof stats?.revenue_growth === 'number' ? stats.revenue_growth : null;
  const ordersGrowth = typeof stats?.orders_growth === 'number' ? stats.orders_growth : null;

  // Real-time hourly dataset for "Hôm nay" from backend
  const hourlyData = useMemo(() => {
    if (stats?.hourly_data && Array.isArray(stats.hourly_data) && stats.hourly_data.length > 0) {
      return stats.hourly_data.map(d => ({
        time: d.time,
        revenue: Number(d.revenue || 0),
        orders: Number(d.orders || 0)
      }));
    }
    return [
      { time: '08:00', revenue: 0, orders: 0 },
      { time: '10:00', revenue: 0, orders: 0 },
      { time: '12:00', revenue: 0, orders: 0 },
      { time: '14:00', revenue: 0, orders: 0 },
      { time: '16:00', revenue: 0, orders: 0 },
      { time: '18:00', revenue: 0, orders: 0 },
      { time: '20:00', revenue: 0, orders: 0 },
      { time: '22:00', revenue: 0, orders: 0 },
    ];
  }, [stats?.hourly_data]);

  // Real-time 7-day dataset from database
  const sevenDaysData = useMemo(() => {
    if (stats?.seven_days_data && Array.isArray(stats.seven_days_data) && stats.seven_days_data.length > 0) {
      return stats.seven_days_data.map(d => ({
        time: d.time,
        revenue: Number(d.revenue || 0),
        orders: Number(d.orders || 0)
      }));
    }
    return [];
  }, [stats?.seven_days_data]);

  // Real-time 30-day dataset from database
  const thirtyDaysData = useMemo(() => {
    if (stats?.thirty_days_data && Array.isArray(stats.thirty_days_data) && stats.thirty_days_data.length > 0) {
      return stats.thirty_days_data.map(d => ({
        time: d.time,
        revenue: Number(d.revenue || 0),
        orders: Number(d.orders || 0)
      }));
    }
    return [];
  }, [stats?.thirty_days_data]);

  // Current active dataset
  const currentChartData = timeRange === 'today'
    ? hourlyData
    : timeRange === '7days'
    ? sevenDaysData
    : thirtyDaysData;

  // Payment Breakdown scope ('today' | 'all')
  const [paymentScope, setPaymentScope] = useState('today');
  const paymentData = useMemo(() => {
    const raw = (paymentScope === 'today' ? stats?.payment_breakdown_today : stats?.payment_breakdown) || stats?.payment_breakdown || {};
    const cash = Number(raw.cash || 0);
    const qr = Number(raw.qr_banking || 0);
    const card = Number(raw.card || 0);
    const sum = cash + qr + card;

    return [
      { name: t('admin.cash') || 'Tiền Mặt', value: cash, percent: sum > 0 ? Math.round((cash / sum) * 100) : 0, color: '#10b981', sub: t('admin.atCounter') || 'Tại quầy', icon: Banknote },
      { name: t('admin.bankTransfer') || 'Chuyển Khoản VietQR', value: qr, percent: sum > 0 ? Math.round((qr / sum) * 100) : 0, color: '#1B5E20', sub: 'MBBank', icon: QrCode },
      { name: t('admin.cardPayment') || 'Quẹt Thẻ POS', value: card, percent: sum > 0 ? Math.round((card / sum) * 100) : 0, color: '#8b5cf6', sub: 'ATM/Visa', icon: CreditCard },
    ];
  }, [stats?.payment_breakdown_today, stats?.payment_breakdown, paymentScope, t]);

  const totalPaymentSum = paymentData.reduce((acc, cur) => acc + cur.value, 0);

  // Top Selling Dishes scope ('today' | 'all')
  const [dishScope, setDishScope] = useState('today');
  const topProductsList = useMemo(() => {
    const source = dishScope === 'today'
      ? (stats?.top_products_today || [])
      : (stats?.top_products || []);
    if (Array.isArray(source) && source.length > 0) {
      return source.map((p, idx) => ({
        rank: idx + 1,
        name: p.product_name,
        qty: Number(p.total_qty || 0),
        revenue: Number(p.total_sales || 0),
        unit: p.unit || (t('admin.portionUnit') || 'phần')
      }));
    }
    return [];
  }, [stats?.top_products_today, stats?.top_products, dishScope]);

  const maxDishQty = Math.max(...topProductsList.map(p => p.qty || 1), 1);

  // Cancelled Dishes scope ('today' | 'all')
  const [cancelledScope, setCancelledScope] = useState('today');
  const cancelledStats = useMemo(() => {
    return (cancelledScope === 'today' ? stats?.cancelled_stats_today : stats?.cancelled_stats) || {
      total_qty: 0,
      total_value: 0,
      count: 0
    };
  }, [stats?.cancelled_stats_today, stats?.cancelled_stats, cancelledScope]);

  const cancelledDishesList = useMemo(() => {
    const source = cancelledScope === 'today'
      ? (stats?.cancelled_products_today || [])
      : (stats?.cancelled_products || []);
    if (Array.isArray(source) && source.length > 0) {
      return source.map((p, idx) => ({
        rank: idx + 1,
        name: p.product_name,
        qty: Number(p.total_qty || 0),
        value: Number(p.total_value || p.total_sales || 0),
        unit: p.unit || (t('admin.portionUnit') || 'phần'),
        reason: p.reason || '',
        cancelled_at: p.cancelled_at || ''
      }));
    }
    return [];
  }, [stats?.cancelled_products_today, stats?.cancelled_products, cancelledScope, t]);

  const cancelledDetailsList = useMemo(() => {
    const source = cancelledScope === 'today'
      ? (stats?.cancelled_list_today || [])
      : (stats?.cancelled_list || []);
    return Array.isArray(source) ? source : [];
  }, [stats?.cancelled_list_today, stats?.cancelled_list, cancelledScope]);

  const maxCancelledQty = Math.max(...cancelledDishesList.map(p => p.qty || 1), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ══════════════ ROW 1: 4 BENTO KPI CARDS (WITH SPARKLINE & SPOTLIGHT) ══════════════ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px'
      }}>
        {/* KPI 1: Doanh thu hôm nay */}
        <BentoCard style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                {t('admin.totalRevenue')}
              </span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginTop: '6px' }}>
                {formatMoney(totalRevenue)}
              </div>
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#E8F5E9',
              color: '#1B5E20',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <DollarSign size={22} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
            {revenueGrowth !== null ? (
              <span style={{
                fontSize: '12px',
                color: revenueGrowth > 0 ? '#059669' : revenueGrowth < 0 ? '#d97706' : '#64748b',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                {revenueGrowth >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {revenueGrowth > 0 ? `+${revenueGrowth}%` : `${revenueGrowth}%`}
              </span>
            ) : (
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>0%</span>
            )}
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              {t('admin.allShiftsCalc')}
            </span>
          </div>

          {/* Sparkline decoration curve */}
          <div style={{ height: '32px', marginTop: '8px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="kpiRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1B5E20" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#1B5E20" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="revenue" stroke="#1B5E20" strokeWidth={2} fill="url(#kpiRevenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </BentoCard>

        {/* KPI 2: Tổng số đơn Order */}
        <BentoCard style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                {t('admin.totalOrders')}
              </span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginTop: '6px' }}>
                {totalOrders} <span style={{ fontSize: '15px', fontWeight: 600, color: '#64748b' }}>{t('admin.ordersUnit')}</span>
              </div>
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <TrendingUp size={22} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
            {ordersGrowth !== null ? (
              <span style={{
                fontSize: '12px',
                color: ordersGrowth > 0 ? '#059669' : ordersGrowth < 0 ? '#d97706' : '#64748b',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                {ordersGrowth >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {ordersGrowth > 0 ? `+${ordersGrowth}%` : `${ordersGrowth}%`}
              </span>
            ) : (
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>0%</span>
            )}
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              {t('admin.activeOnTables')} {totalTables} {t('table.tables')}
            </span>
          </div>

          {/* Mini Sparkline Bar Chart */}
          <div style={{ height: '32px', marginTop: '8px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sevenDaysData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <Bar dataKey="orders" fill="#059669" radius={[3, 3, 0, 0]} opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </BentoCard>

        {/* KPI 3: Bàn đang phục vụ */}
        <BentoCard style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                {t('admin.tablesOccupied')}
              </span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginTop: '6px' }}>
                {occupiedTables} <span style={{ fontSize: '15px', fontWeight: 600, color: '#94a3b8' }}>/ {totalTables} {t('table.tables')}</span>
              </div>
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Utensils size={22} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '12px', color: '#d97706', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              {billingTables} {t('table.tables')} {t('admin.waitingPayment')}
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              {Math.round((occupiedTables / (totalTables || 1)) * 100)}% {t('admin.capacityRate') || 'công suất'}
            </span>
          </div>

          {/* Progress bar visually */}
          <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden', marginTop: '18px' }}>
            <div style={{
              width: `${Math.round((occupiedTables / (totalTables || 1)) * 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #f59e0b, #d97706)',
              borderRadius: '9999px'
            }} />
          </div>
        </BentoCard>

        {/* KPI 4: Nhân sự thu ngân */}
        <BentoCard style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                {t('admin.staffCount')}
              </span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginTop: '6px' }}>
                {staffCount} <span style={{ fontSize: '15px', fontWeight: 600, color: '#64748b' }}>{t('admin.accountsUnit')}</span>
              </div>
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#f3e8ff',
              color: '#9333ea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Users size={22} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              {users.filter(u => u.is_active !== 0).length} {t('admin.working') || 'đang hoạt động'}
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              {t('admin.allStaff') || 'Toàn bộ nhân sự'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px' }}>
            {users.slice(0, 4).map((u, i) => (
              <div
                key={u.id || i}
                title={u.name}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: ['#1B5E20', '#0284c7', '#d97706', '#9333ea'][i % 4],
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                {(u.name || 'U').charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        </BentoCard>
      </div>

      {/* ══════════════ ROW 2: SHADCN UI INTERACTIVE CHART (EXACT SHADCN CHART REPLICA) ══════════════ */}
      <BentoCard style={{ padding: '24px' }}>
        {/* Header with Title and Range Tabs */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1B5E20' }} />
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>
                {t('admin.chartTitle') || 'Biểu Đồ Doanh Thu & Lưu Lượng Đơn'}
              </h3>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#64748b' }}>
              {t('admin.chartSubtitle') || 'Thống kê trực quan số liệu bán hàng theo khung giờ và chu kỳ kinh doanh'}
            </p>
          </div>

          {/* Time range selector tabs (Shadcn pill style) */}
          <div style={{
            display: 'inline-flex',
            backgroundColor: '#f1f5f9',
            padding: '4px',
            borderRadius: '10px',
            gap: '4px'
          }}>
            {[
              { id: 'today', label: t('admin.reports.today') || 'Hôm nay' },
              { id: '7days', label: t('admin.reports.last7days') || '7 ngày qua' },
              { id: '30days', label: t('admin.last30days') || '30 ngày qua' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTimeRange(tab.id)}
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: timeRange === tab.id ? 700 : 500,
                  color: timeRange === tab.id ? '#1B5E20' : '#64748b',
                  backgroundColor: timeRange === tab.id ? '#ffffff' : 'transparent',
                  borderRadius: '7px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: timeRange === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Shadcn UI Interactive Metric Cards Tabs (Like Image 1: Desktop / Mobile KPI tabs) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr auto',
          gap: '14px',
          margin: '18px 0 20px 0',
          alignItems: 'center'
        }}>
          {/* Tab Metric 1: Doanh thu */}
          <div
            onClick={() => setActiveMetric('revenue')}
            style={{
              padding: '14px 18px',
              borderRadius: '12px',
              border: `1.5px solid ${activeMetric === 'revenue' ? '#1B5E20' : '#e2e8f0'}`,
              backgroundColor: activeMetric === 'revenue' ? '#E8F5E9' : '#f8fafc',
              cursor: 'pointer',
              transition: 'all 0.18s ease'
            }}
          >
            <div style={{ fontSize: '11.5px', color: activeMetric === 'revenue' ? '#1B5E20' : '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              {t('admin.revenueMetric') || 'Doanh Thu'} ({timeRange === 'today' ? (t('admin.reports.today') || 'Hôm nay') : timeRange === '7days' ? (t('admin.reports.last7days') || '7 ngày qua') : (t('admin.last30days') || '30 ngày qua')})
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
              {formatMoney(currentChartData.reduce((acc, c) => acc + (c.revenue || 0), 0))}
            </div>
          </div>

          {/* Tab Metric 2: Số đơn */}
          <div
            onClick={() => setActiveMetric('orders')}
            style={{
              padding: '14px 18px',
              borderRadius: '12px',
              border: `1.5px solid ${activeMetric === 'orders' ? '#059669' : '#e2e8f0'}`,
              backgroundColor: activeMetric === 'orders' ? '#ecfdf5' : '#f8fafc',
              cursor: 'pointer',
              transition: 'all 0.18s ease'
            }}
          >
            <div style={{ fontSize: '11.5px', color: activeMetric === 'orders' ? '#059669' : '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              {t('admin.ordersMetric') || 'Số Đơn Hàng'} ({timeRange === 'today' ? (t('admin.reports.today') || 'Hôm nay') : timeRange === '7days' ? (t('admin.reports.last7days') || '7 ngày qua') : (t('admin.last30days') || '30 ngày qua')})
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
              {currentChartData.reduce((acc, c) => acc + (c.orders || 0), 0)} <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>{t('admin.ordersUnit') || 'đơn'}</span>
            </div>
          </div>

          {/* Chart Type Toggle (Bar vs Area) */}
          <div style={{
            display: 'inline-flex',
            backgroundColor: '#f1f5f9',
            padding: '3px',
            borderRadius: '8px',
            gap: '3px'
          }}>
            <button
              onClick={() => setChartType('bar')}
              title={t('admin.barChartTitle') || 'Biểu đồ cột (Bar Chart)'}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: chartType === 'bar' ? '#ffffff' : 'transparent',
                color: chartType === 'bar' ? '#1B5E20' : '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                boxShadow: chartType === 'bar' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <BarChart3 size={15} />
            </button>
            <button
              onClick={() => setChartType('area')}
              title={t('admin.areaChartTitle') || 'Biểu đồ đường cong (Area Chart)'}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: chartType === 'area' ? '#ffffff' : 'transparent',
                color: chartType === 'area' ? '#1B5E20' : '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                boxShadow: chartType === 'area' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <Sparkles size={15} />
            </button>
          </div>
        </div>

        {/* ── RECHARTS CHART DISPLAY ── */}
        <div style={{ width: '100%', height: '320px', marginTop: '10px' }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={currentChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="shadcnBarGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2e7d32" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#1B5E20" stopOpacity={0.9} />
                  </linearGradient>
                  <linearGradient id="shadcnBarEmerald" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.9} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={(val) => activeMetric === 'revenue' ? (val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : `${Math.round(val / 1000)}k`) : val}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(27, 94, 32, 0.05)' }}
                  content={
                    <ShadcnCustomTooltip
                      isCurrency={activeMetric === 'revenue'}
                      unit={activeMetric === 'revenue' ? 'đ' : (t('admin.ordersUnit') || 'đơn')}
                    />
                  }
                />
                <Bar
                  dataKey={activeMetric}
                  fill={activeMetric === 'revenue' ? 'url(#shadcnBarGreen)' : 'url(#shadcnBarEmerald)'}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={52}
                />
              </BarChart>
            ) : (
              <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="shadcnAreaGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1B5E20" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#1B5E20" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="shadcnAreaEmerald" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={(val) => activeMetric === 'revenue' ? (val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : `${Math.round(val / 1000)}k`) : val}
                />
                <Tooltip
                  content={
                    <ShadcnCustomTooltip
                      isCurrency={activeMetric === 'revenue'}
                      unit={activeMetric === 'revenue' ? 'đ' : (t('admin.ordersUnit') || 'đơn')}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey={activeMetric}
                  stroke={activeMetric === 'revenue' ? '#1B5E20' : '#059669'}
                  strokeWidth={2.5}
                  fill={activeMetric === 'revenue' ? 'url(#shadcnAreaGreen)' : 'url(#shadcnAreaEmerald)'}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </BentoCard>

      {/* ══════════════ ROW 3: BENTO ASYMMETRIC GRID (TOP DISHES & PAYMENT BREAKDOWN) ══════════════ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '20px'
      }}>
        {/* Bento 1: Top Món Ăn Bán Chạy Nhất */}
        <BentoCard style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Flame size={17} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: '#0f172a' }}>
                  {t('admin.topDishes')}
                </h3>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                  {dishScope === 'today' ? (t('admin.topDishesTodaySub') || 'Xếp hạng theo số lượng bán hôm nay') : (t('admin.topDishesAllSub') || 'Xếp hạng theo số lượng bán toàn thời gian')}
                </span>
              </div>
            </div>

            {/* Scope Toggle: Hôm nay | Toàn thời gian */}
            <div style={{ display: 'inline-flex', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px', gap: '3px' }}>
              <button
                type="button"
                onClick={() => setDishScope('today')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: dishScope === 'today' ? 700 : 500,
                  backgroundColor: dishScope === 'today' ? '#ffffff' : 'transparent',
                  color: dishScope === 'today' ? '#1B5E20' : '#64748b',
                  cursor: 'pointer',
                  boxShadow: dishScope === 'today' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                {t('admin.reports.today') || 'Hôm nay'}
              </button>
              <button
                type="button"
                onClick={() => setDishScope('all')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: dishScope === 'all' ? 700 : 500,
                  backgroundColor: dishScope === 'all' ? '#ffffff' : 'transparent',
                  color: dishScope === 'all' ? '#1B5E20' : '#64748b',
                  cursor: 'pointer',
                  boxShadow: dishScope === 'all' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                {t('admin.cashbook.allTime') || 'Toàn thời gian'}
              </button>
            </div>
          </div>

          {topProductsList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '42px 16px', color: '#94a3b8', fontSize: '13px' }}>
              <Utensils size={36} style={{ margin: '0 auto 10px auto', opacity: 0.35 }} />
              <div style={{ fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                {dishScope === 'today' ? (t('admin.noDishesSoldToday') || 'Chưa có món ăn nào bán ra hôm nay') : (t('admin.noDishesSoldAll') || 'Chưa có dữ liệu món bán')}
              </div>
              {dishScope === 'today' && (stats?.top_products?.length > 0) && (
                <button
                  type="button"
                  onClick={() => setDishScope('all')}
                  style={{
                    marginTop: '10px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#1B5E20',
                    cursor: 'pointer',
                    fontWeight: 700
                  }}
                >
                  {t('admin.viewAllTimeRanking') || 'Xem xếp hạng toàn thời gian'} &gt;
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topProductsList.map((dish, i) => {
                const rankBg = i === 0
                  ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                  : i === 1
                  ? 'linear-gradient(135deg, #94a3b8, #64748b)'
                  : i === 2
                  ? 'linear-gradient(135deg, #b45309, #78350f)'
                  : '#1B5E20';
                const percentOfMax = Math.round((dish.qty / maxDishQty) * 100);

                return (
                  <div
                    key={dish.name + i}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #f1f5f9',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          background: rankBg,
                          color: '#ffffff',
                          fontSize: '11.5px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {dish.rank || i + 1}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                          {(formatDishName || ctxFormatDishName) ? (formatDishName || ctxFormatDishName)(dish.name) : dish.name}
                        </span>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#1B5E20' }}>
                          {formatMoney(dish.revenue)}
                        </span>
                        <span style={{ fontSize: '11.5px', color: '#64748b', marginLeft: '6px' }}>
                          ({dish.qty} {formatDishUnit ? formatDishUnit(dish.unit) : (dish.unit || t('admin.portionUnit') || 'phần')})
                        </span>
                      </div>
                    </div>

                    {/* Progress bar showing sales volume share */}
                    <div style={{ width: '100%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${percentOfMax}%`,
                        height: '100%',
                        background: i === 0 ? 'linear-gradient(90deg, #1B5E20, #4ade80)' : '#1B5E20',
                        borderRadius: '9999px',
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </BentoCard>

        {/* Bento 2: Cơ Cấu Phương Thức Thanh Toán (Donut Chart + Legend) */}
        <BentoCard style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PieIcon size={17} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: '#0f172a' }}>
                  {t('admin.paymentMethods')}
                </h3>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                  {paymentScope === 'today' ? (t('admin.cashflowTodaySub') || 'Dòng tiền thu ngân hôm nay') : (t('admin.cashflowAllSub') || 'Dòng tiền thu ngân toàn thời gian')}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Scope Toggle: Hôm nay | Toàn thời gian */}
              <div style={{ display: 'inline-flex', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px', gap: '3px' }}>
                <button
                  type="button"
                  onClick={() => setPaymentScope('today')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: paymentScope === 'today' ? 700 : 500,
                    backgroundColor: paymentScope === 'today' ? '#ffffff' : 'transparent',
                    color: paymentScope === 'today' ? '#1B5E20' : '#64748b',
                    cursor: 'pointer',
                    boxShadow: paymentScope === 'today' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  {t('admin.reports.today') || 'Hôm nay'}
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentScope('all')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: paymentScope === 'all' ? 700 : 500,
                    backgroundColor: paymentScope === 'all' ? '#ffffff' : 'transparent',
                    color: paymentScope === 'all' ? '#1B5E20' : '#64748b',
                    cursor: 'pointer',
                    boxShadow: paymentScope === 'all' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  {t('admin.cashbook.allTime') || 'Toàn thời gian'}
                </button>
              </div>

              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                {formatMoney(totalPaymentSum)}
              </span>
            </div>
          </div>

            <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', gap: '16px', alignItems: 'center' }}>
              {/* Donut Chart */}
              <div style={{ width: '170px', height: '170px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={totalPaymentSum > 0 ? paymentData.filter(p => p.value > 0) : [{ name: t('admin.noTransactions') || 'Chưa có giao dịch', value: 1, color: '#f1f5f9' }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={totalPaymentSum > 0 ? 4 : 0}
                      dataKey="value"
                    >
                      {(totalPaymentSum > 0 ? paymentData.filter(p => p.value > 0) : [{ color: '#f1f5f9' }]).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    {totalPaymentSum > 0 && (
                      <Tooltip
                        content={
                          <ShadcnCustomTooltip isCurrency={true} />
                        }
                      />
                    )}
                  </PieChart>
                </ResponsiveContainer>

                {/* Center donut label */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  pointerEvents: 'none'
                }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                    {t('admin.totalCollected') || 'TỔNG THU'}
                  </div>
                  <div style={{ fontSize: '11.5px', fontWeight: 800, color: totalPaymentSum > 0 ? '#0f172a' : '#94a3b8' }}>
                    {totalPaymentSum > 0 ? '100%' : '0 đ'}
                  </div>
                </div>
              </div>

              {/* Methods Breakdown List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {paymentData.map((m, i) => {
                  return (
                    <div
                      key={i}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: m.color, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>{m.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{m.sub}</div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                          {formatMoney(m.value)}
                        </div>
                        <span style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          color: m.value > 0 ? m.color : '#94a3b8',
                          backgroundColor: '#ffffff',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          border: '1px solid #e2e8f0',
                          display: 'inline-block',
                          marginTop: '2px'
                        }}>
                          {m.percent}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
        </BentoCard>
      </div>

      {/* ══════════════ ROW 4: MÓN ĂN BỊ HỦY (CANCELLED DISHES) ══════════════ */}
      <BentoCard style={{ padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ban size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: '#0f172a' }}>
                  {t('admin.cancelledDishes') || 'Món Ăn Bị Hủy'}
                </h3>
                {cancelledStats.count > 0 && (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    padding: '2px 8px',
                    borderRadius: '9999px'
                  }}>
                    {cancelledStats.count} {t('admin.portionUnit') || 'lượt hủy'}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                {cancelledScope === 'today'
                  ? (t('admin.cancelledDishesTodaySub') || 'Thống kê các món bị hủy trong ca hôm nay')
                  : (t('admin.cancelledDishesAllSub') || 'Thống kê toàn bộ món bị hủy và lý do hủy')}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Summary Pills */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#f8fafc',
              padding: '4px 10px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '12px'
            }}>
              <span style={{ color: '#64748b' }}>{t('admin.totalCancelledItems') || 'Tổng hủy'}:</span>
              <strong style={{ color: cancelledStats.total_qty > 0 ? '#dc2626' : '#0f172a' }}>
                {cancelledStats.total_qty} {formatDishUnit ? formatDishUnit('phần') : (t('admin.portionUnit') || 'phần')}
              </strong>
              <span style={{ color: '#cbd5e1' }}>|</span>
              <span style={{ color: '#64748b' }}>{t('admin.totalCancelledValue') || 'Thiệt hại'}:</span>
              <strong style={{ color: cancelledStats.total_value > 0 ? '#dc2626' : '#0f172a' }}>
                {formatMoney(cancelledStats.total_value)}
              </strong>
            </div>

            {/* Scope Toggle: Hôm nay | Toàn thời gian */}
            <div style={{ display: 'inline-flex', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px', gap: '3px' }}>
              <button
                type="button"
                onClick={() => setCancelledScope('today')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: cancelledScope === 'today' ? 700 : 500,
                  backgroundColor: cancelledScope === 'today' ? '#ffffff' : 'transparent',
                  color: cancelledScope === 'today' ? '#1B5E20' : '#64748b',
                  cursor: 'pointer',
                  boxShadow: cancelledScope === 'today' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                {t('admin.reports.today') || 'Hôm nay'}
              </button>
              <button
                type="button"
                onClick={() => setCancelledScope('all')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: cancelledScope === 'all' ? 700 : 500,
                  backgroundColor: cancelledScope === 'all' ? '#ffffff' : 'transparent',
                  color: cancelledScope === 'all' ? '#1B5E20' : '#64748b',
                  cursor: 'pointer',
                  boxShadow: cancelledScope === 'all' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                {t('admin.cashbook.allTime') || 'Toàn thời gian'}
              </button>
            </div>
          </div>
        </div>

        {cancelledDishesList.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '36px 16px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px dashed #cbd5e1'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px auto'
            }}>
              <CheckCircle size={22} />
            </div>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13.5px', marginBottom: '4px' }}>
              {cancelledScope === 'today'
                ? (t('admin.noCancelledDishesToday') || 'Chưa có món nào bị hủy hôm nay')
                : (t('admin.noCancelledDishesAll') || 'Chưa có dữ liệu món bị hủy')}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', maxWidth: '380px', margin: '0 auto' }}>
              Quy trình phục vụ diễn ra chuẩn xác, không có món nào bị hủy hoặc trả lại.
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '16px'
          }}>
            {/* Cột 1: Xếp hạng món bị hủy nhiều nhất */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '2px' }}>
                Xếp hạng món bị hủy
              </div>
              {cancelledDishesList.map((dish, i) => {
                const percent = Math.round((dish.qty / maxCancelledQty) * 100);
                return (
                  <div
                    key={dish.name + i}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #fee2e2',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '6px',
                          backgroundColor: '#fee2e2',
                          color: '#dc2626',
                          fontSize: '11px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {i + 1}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                          {(formatDishName || ctxFormatDishName) ? (formatDishName || ctxFormatDishName)(dish.name) : dish.name}
                        </span>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#dc2626' }}>
                          {formatMoney(dish.value)}
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '6px' }}>
                          ({dish.qty} {formatDishUnit ? formatDishUnit(dish.unit) : (dish.unit || 'phần')})
                        </span>
                      </div>
                    </div>

                    <div style={{ width: '100%', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${percent}%`,
                        height: '100%',
                        backgroundColor: '#ef4444',
                        borderRadius: '9999px'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cột 2: Danh sách chi tiết các lần hủy gần nhất */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '2px' }}>
                Nhật ký hủy gần nhất
              </div>
              <div style={{
                maxHeight: '260px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {cancelledDetailsList.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                        {(formatDishName || ctxFormatDishName) ? (formatDishName || ctxFormatDishName)(item.product_name) : item.product_name}
                        <span style={{ marginLeft: '6px', fontSize: '11.5px', color: '#dc2626', fontWeight: 700 }}>
                          x{item.quantity}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'flex', gap: '8px' }}>
                        <span>{item.table_name || item.order_code || 'Bàn'}</span>
                        {item.note && <span style={{ color: '#d97706' }}>• {item.note}</span>}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#dc2626' }}>
                        {formatMoney(item.subtotal || item.price * item.quantity)}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                        {item.cancelled_at ? new Date(item.cancelled_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </BentoCard>
    </div>
  );
}

