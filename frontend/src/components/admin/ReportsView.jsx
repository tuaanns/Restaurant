import React, { useState, useEffect, useRef } from 'react';
import {
  Printer,
  Download,
  Cloud,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Search,
  Calendar,
  Clock,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  Store,
  DollarSign,
  Layers,
  ChevronLeft
} from 'lucide-react';
import { api } from '../../api';
import { useLanguage } from '../../i18n/LanguageContext';
import { ReportPrintModal } from './ReportPrintModal';

export function ReportsView({
  subTab = 'report_end_of_day',
  onSubTabChange = () => {},
  currentUser = null
}) {
  const { lang, t, formatTableName, formatDishName, formatCategoryName, formatDishUnit } = useLanguage();

  const localeMap = { vi: 'vi-VN', en: 'en-US', ko: 'ko-KR', ru: 'ru-RU' };
  const currentLocale = localeMap[lang] || 'vi-VN';

  // Helper lấy ngày hiện tại YYYY-MM-DD theo giờ địa phương thực tế (tránh lệch timezone UTC của toISOString)
  const getLocalDateString = (d = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // State bộ lọc bên trái (Filter Panel)
  const [orientation, setOrientation] = useState('vertical'); // 'vertical' (dọc) hoặc 'horizontal' (ngang)
  const [reportType, setReportType] = useState(subTab); // 'report_end_of_day' | 'report_sales' | 'report_goods'
  const [dateFilterMode, setDateFilterMode] = useState('custom'); // 'custom' hoặc 'preset'
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());
  const [fromTime, setFromTime] = useState('00:00');
  const [toTime, setToTime] = useState('23:59');
  const [presetOption, setPresetOption] = useState('today'); // 'today', 'yesterday', 'last7days', 'thismonth'
  const [customerSearch, setCustomerSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all'); // 'all', 'cash', 'qr_banking', 'card'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'paid', 'active'

  // Đồng hồ thời gian thực (Real-time clock) cập nhật từng giây cho Ngày lập
  const [liveNow, setLiveNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Định dạng ngày hiển thị dd/mm/yyyy 2 chữ số chuẩn Việt Nam
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    if (typeof dateStr === 'string' && dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
      }
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Định dạng ngày giờ real-time dd/mm/yyyy HH:mm:ss hoặc dd/mm/yyyy HH:mm
  const formatLiveDateTime = (d, withSeconds = false) => {
    if (!d) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return withSeconds 
      ? `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
      : `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // Dữ liệu báo cáo (Real Data từ API)
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [goods, setGoods] = useState([]);
  const [summary, setSummary] = useState({
    total_orders: 0,
    total_revenue: 0,
    total_items: 0,
    total_discount: 0,
    total_vat: 0,
    total_paid: 0,
    payment_breakdown: { cash: 0, qr_banking: 0, card: 0 }
  });

  // State giao diện
  const [expandedOrders, setExpandedOrders] = useState({});
  const [zoomScale, setZoomScale] = useState(1);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const downloadDropdownRef = useRef(null);
  const reportPaperRef = useRef(null);

  // Đồng bộ khi prop subTab từ NAV_ITEMS thay đổi
  useEffect(() => {
    if (subTab) {
      setReportType(subTab);
    }
  }, [subTab]);

  // Đóng dropdown tải xuống khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (downloadDropdownRef.current && !downloadDropdownRef.current.contains(e.target)) {
        setShowDownloadDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch dữ liệu báo cáo từ API
  const fetchReportData = async () => {
    setLoading(true);
    try {
      let queryDate = selectedDate;
      if (dateFilterMode === 'preset') {
        const d = new Date();
        if (presetOption === 'yesterday') {
          d.setDate(d.getDate() - 1);
          queryDate = getLocalDateString(d);
        } else if (presetOption === 'today') {
          queryDate = getLocalDateString(d);
        }
      }

      const res = await api.getReports({
        type: reportType === 'report_goods' ? 'goods' : (reportType === 'report_sales' ? 'sales' : 'end_of_day'),
        date: queryDate,
        from_time: fromTime,
        to_time: toTime,
        search: customerSearch,
        status: statusFilter
      });

      if (res && res.success) {
        let fetchedOrders = res.orders || [];
        let fetchedGoods = res.goods || [];
        let fetchedSummary = res.summary || {};

        // Lọc phương thức thanh toán nếu có chọn
        if (paymentFilter !== 'all') {
          fetchedOrders = fetchedOrders.filter(o => o.payment_method === paymentFilter);
        }

        setOrders(fetchedOrders);
        setGoods(fetchedGoods);
        setSummary(fetchedSummary);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu báo cáo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [reportType, selectedDate, dateFilterMode, presetOption, paymentFilter, statusFilter]);

  // Toggle mở rộng dòng chi tiết đơn hàng
  const toggleOrderExpand = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Mở rộng hoặc thu gọn toàn bộ
  const toggleAllExpand = () => {
    const allExpanded = orders.every(o => expandedOrders[o.id]);
    const newState = {};
    if (!allExpanded) {
      orders.forEach(o => { newState[o.id] = true; });
    }
    setExpandedOrders(newState);
  };

  // Tiêu đề báo cáo theo loại
  const getReportTitle = () => {
    if (reportType === 'report_end_of_day') return t('admin.reports.titleEndOfDay');
    if (reportType === 'report_sales') return t('admin.reports.titleSales');
    if (reportType === 'report_goods') return t('admin.reports.titleGoods');
    return t('admin.reports.reportEndOfDay');
  };

  const formatNumber = (num) => Number(num || 0).toLocaleString(currentLocale);
  const formatCurrency = (num) => {
    const val = Number(num || 0).toLocaleString(currentLocale);
    return lang === 'vi' ? `${val} đ` : (lang === 'en' ? `${val} VND` : `${val} ₫`);
  };

  const formatPaymentMethod = (pm) => {
    if (pm === 'qr_banking') return t('admin.reports.paymentTransfer');
    if (pm === 'card') return t('admin.reports.paymentCard');
    return t('admin.reports.paymentCash');
  };

  // Xuất file Excel (.csv chuẩn UTF-8 BOM hỗ trợ đa ngôn ngữ)
  const exportToExcel = () => {
    setShowDownloadDropdown(false);
    let csvContent = '\uFEFF'; // UTF-8 BOM

    if (reportType === 'report_goods') {
      csvContent += `${t('admin.reports.titleGoods').toUpperCase()} - ${t('appName')}\n`;
      csvContent += `${t('admin.reports.createdDate')}: ${formatLiveDateTime(new Date(), true)}\n`;
      csvContent += `${t('admin.reports.branchTitle')}\n\n`;
      csvContent += `${t('admin.reports.goodsCode')},${t('admin.reports.goodsName')},${t('admin.reports.menuGroup')},${t('admin.reports.unit')},${t('admin.reports.qtySold')},${t('admin.reports.revenueCol')},${t('admin.reports.share')}\n`;

      goods.forEach(g => {
        csvContent += `"${g.product_code}","${formatDishName(g.product_name, g.product_code)}","${formatCategoryName(g.category_name)}","${formatDishUnit(g.unit)}",${g.quantity},${g.revenue},${g.percentage}%\n`;
      });
    } else if (reportType === 'report_end_of_day') {
      csvContent += `${t('admin.reports.titleEndOfDay').toUpperCase()} - ${t('appName')}\n`;
      csvContent += `${t('admin.reports.salesDate')}: ${formatDisplayDate(selectedDate)} | ${t('admin.reports.createdDate')}: ${formatLiveDateTime(new Date(), true)}\n`;
      csvContent += `${t('admin.reports.branchTitle')}\n\n`;

      csvContent += `--- ${t('admin.reports.sectionOrders')} ---\n`;
      csvContent += `${t('admin.reports.orderCode')},${t('admin.reports.timeCol')},${t('admin.reports.tableCol')},${t('admin.reports.customer')},${t('admin.reports.itemsQtyCol')},${t('admin.reports.revenueCol')},${t('admin.reports.otherFeeCol')},${t('admin.reports.taxCol')},${t('admin.reports.discountCol')},${t('admin.reports.paymentCol')},${t('admin.reports.paymentMethod')},${t('admin.reports.cashier')}\n`;
      orders.forEach(o => {
        csvContent += `"${o.order_code}","${o.created_at}","${formatTableName(o.table_name)}","${o.customer_name}",${o.total_items_count},${o.subtotal},${o.other_fee},${o.vat_amount},${o.discount_amount},${o.total_amount},"${formatPaymentMethod(o.payment_method)}","${o.cashier_name}"\n`;
      });
      csvContent += `${t('total')},,,,${summary.total_items || 0},${summary.total_revenue || 0},0,${summary.total_vat || 0},${summary.total_discount || 0},${summary.total_paid || summary.total_revenue || 0},,\n\n`;

      csvContent += `--- ${t('admin.reports.sectionGoods')} ---\n`;
      csvContent += `${t('admin.reports.goodsCode')},${t('admin.reports.goodsName')},${t('admin.reports.menuGroup')},${t('admin.reports.unit')},${t('admin.reports.qtySold')},${t('admin.reports.revenueCol')},${t('admin.reports.share')}\n`;
      goods.forEach(g => {
        csvContent += `"${g.product_code}","${formatDishName(g.product_name, g.product_code)}","${formatCategoryName(g.category_name)}","${formatDishUnit(g.unit)}",${g.quantity},${g.revenue},${g.percentage}%\n`;
      });
      csvContent += `${t('total')},,,,${goods.reduce((acc, g) => acc + (g.quantity || 0), 0)},${goods.reduce((acc, g) => acc + (g.revenue || 0), 0)},100%\n\n`;

      csvContent += `--- ${t('admin.reports.sectionRevenueSummary')} ---\n`;
      csvContent += `${t('admin.reports.cashLabel')} "${summary.payment_breakdown?.cash || 0}"\n`;
      csvContent += `${t('admin.reports.transferLabel')} "${summary.payment_breakdown?.qr_banking || 0}"\n`;
      csvContent += `${t('admin.reports.cardLabel')} "${summary.payment_breakdown?.card || 0}"\n`;
      csvContent += `${t('admin.reports.totalNetRevenue')} "${summary.total_revenue || 0}"\n`;
    } else {
      csvContent += `${getReportTitle().toUpperCase()} - ${t('appName')}\n`;
      csvContent += `${t('admin.reports.salesDate')}: ${formatDisplayDate(selectedDate)} | ${t('admin.reports.createdDate')}: ${formatLiveDateTime(new Date(), true)}\n`;
      csvContent += `${t('admin.reports.branchTitle')}\n\n`;
      csvContent += `${t('admin.reports.orderCode')},${t('admin.reports.timeCol')},${t('admin.reports.tableCol')},${t('admin.reports.customer')},${t('admin.reports.itemsQtyCol')},${t('admin.reports.revenueCol')},${t('admin.reports.otherFeeCol')},${t('admin.reports.taxCol')},${t('admin.reports.discountCol')},${t('admin.reports.paymentCol')},${t('admin.reports.paymentMethod')},${t('admin.reports.cashier')}\n`;

      orders.forEach(o => {
        csvContent += `"${o.order_code}","${o.created_at}","${formatTableName(o.table_name)}","${o.customer_name}",${o.total_items_count},${o.subtotal},${o.other_fee},${o.vat_amount},${o.discount_amount},${o.total_amount},"${formatPaymentMethod(o.payment_method)}","${o.cashier_name}"\n`;
      });

      csvContent += `\n${t('total')},,,,${summary.total_items || 0},${summary.total_revenue || 0},0,${summary.total_vat || 0},${summary.total_discount || 0},${summary.total_paid || summary.total_revenue || 0},,\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BaoCao_${reportType}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Xuất file PDF (Tạo và tải trực tiếp file .pdf về máy tính như file Excel, không mở máy in)
  const exportToPdf = async () => {
    setShowDownloadDropdown(false);
    const element = reportPaperRef.current;
    if (!element) return;

    setIsExportingPdf(true);
    try {
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default || html2pdfModule;

      // Nhân bản phần tử báo cáo để loại bỏ transform scale zoom, giữ chuẩn kích thước A4
      const clone = element.cloneNode(true);
      clone.style.transform = 'none';
      clone.style.boxShadow = 'none';
      clone.style.margin = '0';
      clone.style.width = orientation === 'horizontal' ? '1060px' : '880px';
      clone.style.position = 'fixed';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.zIndex = '-1';
      document.body.appendChild(clone);

      const filename = `BaoCao_${reportType}_${selectedDate}.pdf`;
      const opt = {
        margin: [8, 8, 8, 8],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: orientation === 'horizontal' ? 'landscape' : 'portrait' }
      };

      await html2pdf().set(opt).from(clone).save();
      document.body.removeChild(clone);
    } catch (err) {
      console.error('Lỗi khi xuất file PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Reset toàn bộ bộ lọc
  const handleResetFilter = () => {
    setSelectedDate(getLocalDateString());
    setFromTime('00:00');
    setToTime('23:59');
    setCustomerSearch('');
    setPaymentFilter('all');
    setStatusFilter('all');
    setDateFilterMode('custom');
  };

  // ─── RENDER BẢNG HÓA ĐƠN BÁN HÀNG (ORDERS TABLE) ───
  const renderOrdersTable = (isSectionHeader = false) => (
    <div style={{ marginBottom: isSectionHeader ? '24px' : '0' }}>
      {isSectionHeader && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          margin: '18px 0 8px 0',
          paddingBottom: '4px',
          borderBottom: '1.5px solid #1B5E20'
        }}>
          <div style={{ fontWeight: 800, fontSize: '13px', color: '#2E7D32', textTransform: 'uppercase' }}>
            {t('admin.reports.sectionOrders')} ({orders.length} {t('admin.reports.ordersCount')})
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            {t('admin.reports.expandHint')}
          </div>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr style={{ backgroundColor: '#a7f3d0', color: '#2E7D32' }}>
            <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 700, width: '120px' }}>{t('admin.reports.orderCode')}</th>
            <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 700, width: '85px' }}>{t('admin.reports.timeCol')}</th>
            <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 700, width: '110px' }}>{t('admin.reports.tableCol')}</th>
            <th style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 700, width: '65px' }}>{t('admin.reports.itemsQtyCol')}</th>
            <th style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 700, width: '110px' }}>{t('admin.reports.revenueCol')}</th>
            <th style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 700, width: '75px' }}>{t('admin.reports.otherFeeCol')}</th>
            <th style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 700, width: '70px' }}>{t('admin.reports.taxCol')}</th>
            <th style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 700, width: '85px' }}>{t('admin.reports.discountCol')}</th>
            <th style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 700, width: '115px' }}>{t('admin.reports.paymentCol')}</th>
          </tr>
        </thead>
        <tbody>
          {/* DÒNG TỔNG HỢP NHÓM MÀU VÀNG NHẠT */}
          <tr style={{ backgroundColor: '#fef3c7', fontWeight: 700, color: '#92400e' }}>
            <td style={{ padding: '8px 6px' }}>{t('admin.reports.orderTotalPrefix')} {orders.length}</td>
            <td colSpan="2" style={{ padding: '8px 6px' }}></td>
            <td style={{ padding: '8px 6px', textAlign: 'right' }}>
              {summary.total_items || orders.reduce((acc, o) => acc + (o.total_items_count || 0), 0)}
            </td>
            <td style={{ padding: '8px 6px', textAlign: 'right' }}>
              {formatNumber(summary.total_revenue || orders.reduce((acc, o) => acc + (o.total_amount || 0), 0))}
            </td>
            <td style={{ padding: '8px 6px', textAlign: 'right' }}>0</td>
            <td style={{ padding: '8px 6px', textAlign: 'right' }}>{formatNumber(summary.total_vat || 0)}</td>
            <td style={{ padding: '8px 6px', textAlign: 'right' }}>{formatNumber(summary.total_discount || 0)}</td>
            <td style={{ padding: '8px 6px', textAlign: 'right', color: '#b45309' }}>
              {formatNumber(summary.total_paid || summary.total_revenue || 0)}
            </td>
          </tr>

          {loading ? (
            <tr>
              <td colSpan="9" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                {t('admin.reports.loadingLiveDb')}
              </td>
            </tr>
          ) : orders.length === 0 ? (
            <tr>
              <td colSpan="9" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                {t('admin.reports.noOrdersFound')}
              </td>
            </tr>
          ) : (
            orders.map((ord, idx) => (
              <React.Fragment key={ord.id || idx}>
                <tr
                  style={{
                    borderBottom: '1px solid #e2e8f0',
                    backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleOrderExpand(ord.id)}
                >
                  <td style={{ padding: '7px 6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '3px',
                      border: '1px solid #94a3b8',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      color: '#475569'
                    }}>
                      {expandedOrders[ord.id] ? '−' : '+'}
                    </span>
                    <span style={{ fontWeight: 700, color: '#1B5E20' }}>{ord.order_code}</span>
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', color: '#475569' }}>
                    {ord.created_time || ord.created_at?.split(' ')[1] || '---'}
                  </td>
                  <td style={{ padding: '7px 6px', fontWeight: 600 }}>{formatTableName(ord.table_name)}</td>
                  <td style={{ padding: '7px 6px', textAlign: 'right' }}>{ord.total_items_count}</td>
                  <td style={{ padding: '7px 6px', textAlign: 'right', fontWeight: 600 }}>
                    {formatNumber(ord.total_amount)}
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'right', color: '#64748b' }}>0</td>
                  <td style={{ padding: '7px 6px', textAlign: 'right', color: '#64748b' }}>
                    {formatNumber(ord.vat_amount || 0)}
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'right', color: '#64748b' }}>
                    {formatNumber(ord.discount_amount || 0)}
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'right', fontWeight: 700, color: '#047857' }}>
                    {formatNumber(ord.total_amount)}
                  </td>
                </tr>

                {/* DÒNG CHI TIẾT MÓN KHI MỞ RỘNG */}
                {expandedOrders[ord.id] && (
                  <tr>
                    <td colSpan="9" style={{ padding: '8px 12px 12px 32px', backgroundColor: '#f1f5f9' }}>
                      <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
                        <div style={{
                          padding: '6px 12px',
                          backgroundColor: '#f8fafc',
                          borderBottom: '1px solid #e2e8f0',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#475569',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}>
                          <span>{t('admin.reports.orderDetailsTitle')} {ord.order_code} • {formatTableName(ord.table_name)}</span>
                          <span>{t('admin.reports.cashier')}: {ord.cashier_name || 'Thu Hằng'} • {t('admin.reports.paymentType')}: {formatPaymentMethod(ord.payment_method)}</span>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f8fafc', color: '#475569' }}>
                              <th style={{ padding: '5px 8px', textAlign: 'left', width: '35px' }}>{t('admin.reports.stt')}</th>
                              <th style={{ padding: '5px 8px', textAlign: 'left', width: '90px' }}>{t('admin.reports.itemCode')}</th>
                              <th style={{ padding: '5px 8px', textAlign: 'left' }}>{t('admin.reports.itemName')}</th>
                              <th style={{ padding: '5px 8px', textAlign: 'center', width: '50px' }}>{t('admin.reports.unit')}</th>
                              <th style={{ padding: '5px 8px', textAlign: 'right', width: '90px' }}>{t('admin.reports.unitPrice')}</th>
                              <th style={{ padding: '5px 8px', textAlign: 'center', width: '50px' }}>{t('admin.reports.qty')}</th>
                              <th style={{ padding: '5px 8px', textAlign: 'right', width: '100px' }}>{t('admin.reports.amount')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ord.items && ord.items.length > 0 ? (
                              ord.items.map((it, itIdx) => (
                                <tr key={it.id || itIdx} style={{ borderTop: '1px solid #f1f5f9' }}>
                                  <td style={{ padding: '5px 8px', textAlign: 'center', color: '#64748b' }}>{itIdx + 1}</td>
                                  <td style={{ padding: '5px 8px', color: '#1B5E20', fontWeight: 600 }}>{it.product_code || '---'}</td>
                                  <td style={{ padding: '5px 8px', fontWeight: 600 }}>{formatDishName(it.product_name, it.product_code)}</td>
                                  <td style={{ padding: '5px 8px', textAlign: 'center', color: '#64748b' }}>{formatDishUnit(it.unit || 'phần')}</td>
                                  <td style={{ padding: '5px 8px', textAlign: 'right' }}>{formatNumber(it.price)}</td>
                                  <td style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 700 }}>{it.quantity}</td>
                                  <td style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 700 }}>{formatNumber(it.subtotal)}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="7" style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>{t('admin.reports.noItemsInOrder')}</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  // ─── RENDER BẢNG HÀNG HÓA BÁN RA (GOODS TABLE) ───
  const renderGoodsTable = (isSectionHeader = false) => (
    <div>
      {isSectionHeader && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          margin: '20px 0 8px 0',
          paddingBottom: '4px',
          borderBottom: '1.5px solid #1B5E20'
        }}>
          <div style={{ fontWeight: 800, fontSize: '13px', color: '#2E7D32', textTransform: 'uppercase' }}>
            {t('admin.reports.sectionGoods')} ({goods.length} {t('admin.reports.itemsCount')})
          </div>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr style={{ backgroundColor: '#a7f3d0', color: '#2E7D32' }}>
            <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, width: '110px' }}>{t('admin.reports.goodsCode')}</th>
            <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700 }}>{t('admin.reports.goodsName')}</th>
            <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, width: '140px' }}>{t('admin.reports.menuGroup')}</th>
            <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, width: '70px' }}>{t('admin.reports.unit')}</th>
            <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, width: '80px' }}>{t('admin.reports.qtySold')}</th>
            <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, width: '130px' }}>{t('admin.reports.revenueCol')}</th>
            <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, width: '90px' }}>{t('admin.reports.share')}</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ backgroundColor: '#fef3c7', fontWeight: 700, color: '#92400e' }}>
            <td colSpan="4" style={{ padding: '8px 10px' }}>
              {t('admin.reports.totalItemsCount')} {goods.length} {t('admin.reports.itemsCount')}
            </td>
            <td style={{ padding: '8px 10px', textAlign: 'right' }}>
              {goods.reduce((acc, g) => acc + (g.quantity || 0), 0)}
            </td>
            <td style={{ padding: '8px 10px', textAlign: 'right' }}>
              {formatCurrency(goods.reduce((acc, g) => acc + (g.revenue || 0), 0))}
            </td>
            <td style={{ padding: '8px 10px', textAlign: 'right' }}>100%</td>
          </tr>

          {loading ? (
            <tr>
              <td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                {t('admin.reports.loadingLiveDb')}
              </td>
            </tr>
          ) : goods.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                {t('admin.reports.noGoodsFound')}
              </td>
            </tr>
          ) : (
            goods.map((item, index) => (
              <tr
                key={index}
                style={{
                  borderBottom: '1px solid #e2e8f0',
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                }}
              >
                <td style={{ padding: '7px 10px', fontWeight: 600, color: '#1B5E20' }}>{item.product_code}</td>
                <td style={{ padding: '7px 10px', fontWeight: 600 }}>{formatDishName(item.product_name, item.product_code)}</td>
                <td style={{ padding: '7px 10px', color: '#64748b' }}>{formatCategoryName(item.category_name)}</td>
                <td style={{ padding: '7px 10px', textAlign: 'center' }}>{formatDishUnit(item.unit)}</td>
                <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700 }}>{item.quantity}</td>
                <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700 }}>{formatCurrency(item.revenue)}</td>
                <td style={{ padding: '7px 10px', textAlign: 'right', color: '#047857', fontWeight: 600 }}>{item.percentage}%</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', minHeight: '680px', flex: 1 }}>
      {/* ─── TITLE BAR CỦA TRANG ─── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#E8F5E9',
            color: '#1B5E20',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileSpreadsheet size={18} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              {getReportTitle()}
            </h2>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              {t('admin.reports.branchTitle')}
            </div>
          </div>
        </div>

        {/* Nhanh chóng chuyển đổi 3 loại báo cáo */}
        <div style={{
          display: 'flex',
          backgroundColor: '#f1f5f9',
          padding: '3px',
          borderRadius: '8px',
          border: '1px solid #cbd5e1'
        }}>
          {[
            { key: 'report_end_of_day', label: t('admin.reports.reportEndOfDay') },
            { key: 'report_sales', label: t('admin.reports.reportSales') },
            { key: 'report_goods', label: t('admin.reports.reportGoods') },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setReportType(tab.key);
                onSubTabChange(tab.key);
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: reportType === tab.key ? 700 : 500,
                backgroundColor: reportType === tab.key ? '#1B5E20' : 'transparent',
                color: reportType === tab.key ? '#ffffff' : '#475569',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── THÂN BÁO CÁO: GỒM CỘT LỌC BÊN TRÁI & KHUNG GIẤY BÊN PHẢI ─── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* ─── CỘT BỘ LỌC (FILTER SIDEBAR) ─── */}
        <div style={{
          width: '300px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          padding: '16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          fontSize: '13px'
        }}>
          {/* 1. Kiểu hiển thị (Dọc / Ngang) */}
          <div>
            <div style={{ fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              {t('admin.reports.displayStyle')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="orientation"
                  checked={orientation === 'vertical'}
                  onChange={() => setOrientation('vertical')}
                  style={{ accentColor: '#1B5E20', width: '15px', height: '15px' }}
                />
                <span style={{ fontWeight: orientation === 'vertical' ? 600 : 400 }}>{t('admin.reports.portrait')}</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="orientation"
                  checked={orientation === 'horizontal'}
                  onChange={() => setOrientation('horizontal')}
                  style={{ accentColor: '#1B5E20', width: '15px', height: '15px' }}
                />
                <span style={{ fontWeight: orientation === 'horizontal' ? 600 : 400 }}>{t('admin.reports.landscape')}</span>
              </label>
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: '#f1f5f9' }} />

          {/* 2. Mối quan tâm */}
          <div>
            <div style={{ fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              {t('admin.reports.concern')}
            </div>
            <select
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                onSubTabChange(e.target.value);
              }}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                backgroundColor: '#ffffff',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="report_end_of_day">{t('admin.reports.reportEndOfDay')}</option>
              <option value="report_sales">{t('admin.reports.reportSales')}</option>
              <option value="report_goods">{t('admin.reports.reportGoods')}</option>
            </select>
          </div>

          <div style={{ height: '1px', backgroundColor: '#f1f5f9' }} />

          {/* 3. Chi nhánh */}
          <div>
            <div style={{ fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              {t('admin.reports.branch')}
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#E8F5E9',
              color: '#1B5E20',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              border: '1px solid #bae6fd'
            }}>
              <span>{t('admin.reports.branchShort')}</span>
              <span style={{ cursor: 'pointer', fontSize: '13px', marginLeft: '2px' }}>✕</span>
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: '#f1f5f9' }} />

          {/* 4. Thời gian */}
          <div>
            <div style={{ fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              {t('admin.reports.time')}
            </div>

            {/* Option 1: Chọn ngày cụ thể */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '6px' }}>
                <input
                  type="radio"
                  name="dateMode"
                  checked={dateFilterMode === 'custom'}
                  onChange={() => setDateFilterMode('custom')}
                  style={{ accentColor: '#1B5E20', width: '15px', height: '15px' }}
                />
                <span style={{ fontWeight: dateFilterMode === 'custom' ? 600 : 400 }}>{t('admin.reports.selectDate')}</span>
              </label>

              {dateFilterMode === 'custom' && (
                <div style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12.5px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                    <span style={{ color: '#64748b' }}>{t('admin.reports.fromTime')}</span>
                    <input
                      type="time"
                      value={fromTime}
                      onChange={(e) => setFromTime(e.target.value)}
                      style={{
                        padding: '4px 6px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12px'
                      }}
                    />
                    <span style={{ color: '#64748b' }}>{t('admin.reports.toTime')}</span>
                    <input
                      type="time"
                      value={toTime}
                      onChange={(e) => setToTime(e.target.value)}
                      style={{
                        padding: '4px 6px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12px'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Option 2: Lựa chọn khác (Presets) */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '6px' }}>
                <input
                  type="radio"
                  name="dateMode"
                  checked={dateFilterMode === 'preset'}
                  onChange={() => setDateFilterMode('preset')}
                  style={{ accentColor: '#1B5E20', width: '15px', height: '15px' }}
                />
                <span style={{ fontWeight: dateFilterMode === 'preset' ? 600 : 400 }}>{t('admin.reports.otherOptions')}</span>
              </label>

              {dateFilterMode === 'preset' && (
                <div style={{ paddingLeft: '24px' }}>
                  <select
                    value={presetOption}
                    onChange={(e) => setPresetOption(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12.5px',
                      backgroundColor: '#ffffff',
                      outline: 'none'
                    }}
                  >
                    <option value="today">{t('admin.reports.today')}</option>
                    <option value="yesterday">{t('admin.reports.yesterday')}</option>
                    <option value="last7days">{t('admin.reports.last7days')}</option>
                    <option value="thismonth">{t('admin.reports.thisMonth')}</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: '#f1f5f9' }} />

          {/* 5. Khách hàng */}
          <div>
            <div style={{ fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              {t('admin.reports.customer')}
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') fetchReportData(); }}
                placeholder={t('admin.reports.customerPlaceholder')}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 30px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12.5px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <Search
                size={14}
                color="#94a3b8"
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          {/* 6. Phương thức thanh toán */}
          <div>
            <div style={{ fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              {t('admin.reports.paymentMethod')}
            </div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '12.5px',
                backgroundColor: '#ffffff',
                outline: 'none'
              }}
            >
              <option value="all">{t('admin.reports.allPaymentMethods')}</option>
              <option value="cash">{t('admin.reports.paymentCash')}</option>
              <option value="qr_banking">{t('admin.reports.paymentTransfer')}</option>
              <option value="card">{t('admin.reports.paymentCard')}</option>
            </select>
          </div>

          {/* Nút lọc & Reset */}
          <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', gap: '8px' }}>
            <button
              onClick={fetchReportData}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: '#1B5E20',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '12.5px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Search size={14} />
              <span>{t('admin.reports.viewReport')}</span>
            </button>

            <button
              onClick={handleResetFilter}
              title={t('admin.reports.resetFilter')}
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                color: '#64748b',
                backgroundColor: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* ─── KHUNG XEM TRƯỚC GIẤY BÁO CÁO (PREVIEW CANVAS) ─── */}
        <div style={{
          flex: 1,
          backgroundColor: '#475569',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* TOOLBAR PHÍA TRÊN KHUNG GIẤY (Thanh công cụ in ấn, tải về, zoom) */}
          <div style={{
            height: '46px',
            backgroundColor: '#334155',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            color: '#f8fafc',
            userSelect: 'none'
          }}>
            {/* Nhóm nút trái: Undo/Redo & Làm mới */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={fetchReportData}
                title={t('admin.reports.refreshData')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1e293b'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <RefreshCw size={15} />
              </button>

              <div style={{ height: '18px', width: '1px', backgroundColor: '#64748b', margin: '0 4px' }} />

              {/* Phân trang */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#cbd5e1' }}>
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(1)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px 4px' }}
                >
                  |&lt;
                </button>
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px 4px' }}
                >
                  &lt;
                </button>
                <span style={{
                  padding: '2px 8px',
                  backgroundColor: '#1e293b',
                  borderRadius: '4px',
                  fontWeight: 600,
                  fontSize: '11.5px'
                }}>
                  {currentPage} / 1
                </span>
                <button
                  disabled={true}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px 4px' }}
                >
                  &gt;
                </button>
                <button
                  disabled={true}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px 4px' }}
                >
                  &gt;|
                </button>
              </div>

              {reportType !== 'report_goods' && (
                <button
                  onClick={toggleAllExpand}
                  style={{
                    marginLeft: '8px',
                    fontSize: '11.5px',
                    color: '#38bdf8',
                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {orders.every(o => expandedOrders[o.id]) ? t('admin.reports.collapseAll') : t('admin.reports.expandAll')}
                </button>
              )}
            </div>

            {/* Nhóm nút phải: Tải về (Cloud dropdown), Máy in (Print Modal), Zoom */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* NÚT TẢI VỀ ĐÁM MÂY VỚI DROPDOWN XỔ XUỐNG PDF / EXCEL */}
              <div ref={downloadDropdownRef} style={{ position: 'relative' }}>
                <button
                  disabled={isExportingPdf}
                  onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    backgroundColor: isExportingPdf ? '#059669' : '#10b981',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: isExportingPdf ? 'wait' : 'pointer',
                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.35)'
                  }}
                >
                  {isExportingPdf ? <RefreshCw size={15} className="animate-spin" /> : <Cloud size={15} />}
                  <span>{isExportingPdf ? 'Đang tạo PDF...' : t('admin.reports.download')}</span>
                  <ChevronDown size={13} />
                </button>

                {/* Dropdown Menu tải về */}
                {showDownloadDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '36px',
                    right: '0',
                    width: '210px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                    overflow: 'hidden',
                    zIndex: 100,
                    padding: '4px'
                  }}>
                    <button
                      onClick={exportToPdf}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '9px 12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#b91c1c',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <FileText size={16} color="#dc2626" />
                      <span>{t('admin.reports.downloadPdf')}</span>
                    </button>

                    <button
                      onClick={exportToExcel}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '9px 12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#047857',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ecfdf5'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <FileSpreadsheet size={16} color="#059669" />
                      <span>{t('admin.reports.downloadExcel')}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* NÚT MÁY IN - XEM TRƯỚC VÀ IN GIỐNG IN TẠM TÍNH */}
              <button
                onClick={() => setShowPrintModal(true)}
                title={t('admin.reports.printReport')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#1B5E20',
                  color: '#ffffff',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.35)'
                }}
              >
                <Printer size={15} />
                <span>{t('admin.reports.printReport')}</span>
              </button>

              <div style={{ height: '18px', width: '1px', backgroundColor: '#64748b', margin: '0 4px' }} />

              {/* Zoom controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  onClick={() => setZoomScale(z => Math.max(0.6, Number((z - 0.1).toFixed(1))))}
                  title="Thu nhỏ"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px'
                  }}
                >
                  <ZoomOut size={15} />
                </button>

                <span style={{ fontSize: '11.5px', minWidth: '40px', textAlign: 'center', color: '#f1f5f9', fontWeight: 600 }}>
                  {Math.round(zoomScale * 100)}%
                </span>

                <button
                  onClick={() => setZoomScale(z => Math.min(1.5, Number((z + 0.1).toFixed(1))))}
                  title="Phóng to"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px'
                  }}
                >
                  <ZoomIn size={15} />
                </button>

                <button
                  onClick={() => setZoomScale(1)}
                  title="Tỷ lệ 100%"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    marginLeft: '2px'
                  }}
                >
                  <Maximize2 size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* VÙNG CUỘN HIỂN THỊ TỜ GIẤY A4 BÁO CÁO */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '24px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start'
          }}>
            {/* TỜ GIẤY BÁO CÁO TRẮNG CHUẨN A4 */}
            <div
              ref={reportPaperRef}
              style={{
                width: orientation === 'horizontal' ? '1060px' : '880px',
                minHeight: orientation === 'horizontal' ? '720px' : '980px',
              backgroundColor: '#ffffff',
              borderRadius: '2px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
              padding: orientation === 'horizontal' ? '28px 36px' : '32px 42px',
              transform: `scale(${zoomScale})`,
              transformOrigin: 'top center',
              transition: 'transform 0.1s ease, width 0.2s ease',
              fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
              color: '#0f172a',
              boxSizing: 'border-box'
            }}>
              {/* Tiêu đề & Thông tin ngày lập real-time */}
              <div style={{ fontSize: '11px', color: '#475569', marginBottom: '8px' }}>
                {t('admin.reports.createdDate')} <strong>{formatLiveDateTime(liveNow, false)}</strong>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h1 style={{
                  margin: '0 0 6px 0',
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '0.3px',
                  textTransform: 'none'
                }}>
                  {getReportTitle()}
                </h1>
                <div style={{ fontSize: '12px', color: '#475569', fontWeight: 500 }}>
                  {t('admin.reports.salesDate')} <strong>{formatDisplayDate(selectedDate)}</strong>
                </div>
                <div style={{ fontSize: '12px', color: '#1B5E20', fontWeight: 700, marginTop: '2px' }}>
                  {t('admin.reports.branchTitle')}
                </div>
              </div>

              {/* BẢNG DỮ LIỆU BÁO CÁO */}
              
              {/* === TRƯỜNG HỢP 1: BÁO CÁO CUỐI NGÀY (BAO GỒM CẢ BÁN HÀNG LẪN HÀNG HÓA) === */}
              {reportType === 'report_end_of_day' && (
                <div>
                  {renderOrdersTable(true)}
                  {renderGoodsTable(true)}
                </div>
              )}

              {/* === TRƯỜNG HỢP 2: BÁO CÁO HÀNG HÓA CHUYÊN BIỆT === */}
              {reportType === 'report_goods' && renderGoodsTable(false)}

              {/* === TRƯỜNG HỢP 3: BÁO CÁO BÁN HÀNG CHUYÊN BIỆT === */}
              {reportType === 'report_sales' && renderOrdersTable(false)}

              {/* TỔNG HỢP CUỐI TRANG GIẤY (CƠ CẤU THANH TOÁN & CHỮ KÝ) */}
              <div style={{
                marginTop: '30px',
                borderTop: '1.5px solid #0f172a',
                paddingTop: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px'
              }}>
                <div style={{ width: '45%' }}>
                  <div style={{ fontWeight: 800, marginBottom: '6px', textTransform: 'uppercase', color: '#0f172a' }}>
                    {t('admin.reports.sectionRevenueSummary')}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px dashed #cbd5e1' }}>
                    <span>{t('admin.reports.cashLabel')}</span>
                    <strong>{formatCurrency(summary.payment_breakdown?.cash || 0)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px dashed #cbd5e1' }}>
                    <span>{t('admin.reports.transferLabel')}</span>
                    <strong>{formatCurrency(summary.payment_breakdown?.qr_banking || 0)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px dashed #cbd5e1' }}>
                    <span>{t('admin.reports.cardLabel')}</span>
                    <strong>{formatCurrency(summary.payment_breakdown?.card || 0)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontWeight: 800, color: '#2E7D32', fontSize: '13px', borderBottom: '1px solid #cbd5e1' }}>
                    <span>{t('admin.reports.totalNetRevenue')}</span>
                    <span>{formatCurrency(summary.total_revenue || 0)}</span>
                  </div>

                  {/* Hạch toán Sổ Quỹ vào Kết quả hoạt động kinh doanh (Chỉ hiển thị khi có phát sinh thực tế) */}
                  {((summary.operating_expenses || 0) > 0 || (summary.other_income || 0) > 0) && (
                    <div style={{ marginTop: '10px', paddingTop: '4px' }}>
                      <div style={{ fontWeight: 800, fontSize: '11px', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Hạch toán Sổ quỹ vào KQKD:
                      </div>
                      {summary.other_income > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#047857' }}>
                          <span>(+) Thu ngoài bán hàng:</span>
                          <strong>+{formatCurrency(summary.other_income)}</strong>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#dc2626' }}>
                        <span>(−) Chi phí hoạt động (Phiếu chi):</span>
                        <strong>−{formatCurrency(summary.operating_expenses || 0)}</strong>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '5px 8px',
                        marginTop: '4px',
                        fontWeight: 900,
                        color: (summary.net_profit || 0) >= 0 ? '#047857' : '#dc2626',
                        fontSize: '13px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '4px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <span>LỢI NHUẬN THUẦN:</span>
                        <span>{formatCurrency(summary.net_profit !== undefined ? summary.net_profit : (summary.total_revenue || 0))}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ width: '45%', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{t('admin.reports.signCashier')}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{t('admin.reports.signHint')}</div>
                    <div style={{ marginTop: '50px', fontWeight: 600 }}>Thu Hằng</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{t('admin.reports.signPreparedBy')}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{t('admin.reports.signHint')}</div>
                    <div style={{ marginTop: '50px', fontWeight: 600 }}>{currentUser?.name || 'Hoàng Nam'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL IN BÁO CÁO (HIỆN RA KHI ẤN ICON MÁY IN - GIỐNG IN TẠM TÍNH) */}
      <ReportPrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        reportType={reportType === 'report_goods' ? 'goods' : (reportType === 'report_sales' ? 'sales' : 'end_of_day')}
        reportTitle={getReportTitle().toUpperCase()}
        dateStr={formatDisplayDate(selectedDate)}
        orders={orders}
        goods={goods}
        summary={summary}
        currentUser={currentUser}
      />
    </div>
  );
}
