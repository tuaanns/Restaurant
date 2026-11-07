import React, { useState, useEffect, useRef } from 'react';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  ChevronDown,
  Download,
  Search,
  RotateCcw,
  Printer,
  Trash2,
  Calendar,
  Building,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
  Eye,
  Filter,
  Check,
  SlidersHorizontal
} from 'lucide-react';
import { api } from '../../api';
import { useLanguage } from '../../i18n/LanguageContext';
import { useCashBook } from '../../hooks';
import { CashTransactionModal } from './CashTransactionModal';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';

export function CashBookView({ currentUser = null }) {
  const { lang, t, formatCashCategory, formatCashTarget, formatCashCreatedBy } = useLanguage();

  // Column visibility state (matching KiotViet popover screenshot)
  const DEFAULT_COLUMNS = {
    code: true,
    time: true,
    createdBy: false,
    branch: false,
    category: true,
    fundType: false,
    accountNo: false,
    target: true,
    amount: true,
    note: false,
    status: false,
  };

  const [visibleColumns, setVisibleColumns] = useState(() => {
    try {
      const saved = localStorage.getItem('cashbook_columns');
      return saved ? JSON.parse(saved) : DEFAULT_COLUMNS;
    } catch {
      return DEFAULT_COLUMNS;
    }
  });

  const toggleColumn = (key) => {
    setVisibleColumns(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('cashbook_columns', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const columnDropdownRef = useRef(null);

  // Logic Sổ Quỹ được quản lý tập trung qua Custom Hook useCashBook (Clean Code & SRP)
  const {
    fundType, setFundType,
    dateFilterMode, setDateFilterMode,
    presetOption, setPresetOption,
    fromDate, setFromDate,
    toDate, setToDate,
    includeReceipt, setIncludeReceipt,
    includePayment, setIncludePayment,
    categoryFilter, setCategoryFilter,
    businessFilter, setBusinessFilter,
    searchTerm, setSearchTerm,
    loading,
    transactions,
    summary,
    fetchTransactions,
    deleteTransaction,
    getLocalDateString
  } = useCashBook();

  // State modal & dropdowns
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('payment'); // 'receipt' | 'payment'
  const [modalMethod, setModalMethod] = useState('cash'); // 'cash' | 'bank'
  const [showReceiptDropdown, setShowReceiptDropdown] = useState(false);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);

  const receiptDropdownRef = useRef(null);
  const paymentDropdownRef = useRef(null);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (receiptDropdownRef.current && !receiptDropdownRef.current.contains(e.target)) {
        setShowReceiptDropdown(false);
      }
      if (paymentDropdownRef.current && !paymentDropdownRef.current.contains(e.target)) {
        setShowPaymentDropdown(false);
      }
      if (columnDropdownRef.current && !columnDropdownRef.current.contains(e.target)) {
        setShowColumnDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Xóa phiếu thu / chi
  const [txToDelete, setTxToDelete] = useState(null);
  const [isDeletingTx, setIsDeletingTx] = useState(false);

  const handleDeleteTransaction = (id, code) => {
    setTxToDelete({ id, code });
  };

  const handleConfirmDeleteTx = async () => {
    if (!txToDelete) return;
    setIsDeletingTx(true);
    try {
      const res = await deleteTransaction(txToDelete.id);
      if (!res.success && res.message) {
        alert(res.message);
      }
    } finally {
      setIsDeletingTx(false);
      setTxToDelete(null);
    }
  };

  // Mở modal tạo phiếu với loại và phương thức cụ thể
  const handleOpenCreateModal = (type, method) => {
    setModalType(type);
    setModalMethod(method);
    setShowReceiptDropdown(false);
    setShowPaymentDropdown(false);
    setIsModalOpen(true);
  };

  // Định dạng tiền tệ
  const formatMoney = (val) => {
    return Number(val || 0).toLocaleString('vi-VN') + ' đ';
  };

  // Xuất file CSV UTF-8
  const handleExportFile = () => {
    let csvContent = '\uFEFF';
    csvContent += `SỔ QUỸ - QUÁN TRÀ (103 Trần Hưng Đạo, Phú Quốc)\n`;
    csvContent += `Thời gian xuất: ${new Date().toLocaleString('vi-VN')} | Người xuất: ${currentUser?.name || 'Hoàng Nam'}\n`;
    csvContent += `Quỹ đầu kỳ: "${formatMoney(summary.opening_balance)}" | Tổng thu: "${formatMoney(summary.total_receipt)}" | Tổng chi: "${formatMoney(summary.total_payment)}" | Tồn quỹ: "${formatMoney(summary.closing_balance)}"\n\n`;

    csvContent += `Mã phiếu,Thời gian,Loại chứng từ,Phương thức,Loại thu chi,Người nộp/nhận,SĐT,Giá trị (VNĐ),Hạch toán KQKD,Số HĐ tham chiếu,Ghi chú,Người lập\n`;

    transactions.forEach(item => {
      const isPay = item.type === 'payment';
      const typeStr = isPay ? t('admin.cashbook.payment') : t('admin.cashbook.receipt');
      const methodStr = item.payment_method === 'cash' ? t('admin.cashbook.fundCash') : t('admin.cashbook.fundBank');
      const valStr = (isPay ? '-' : '+') + Number(item.amount || 0);
      const bizStr = item.is_business_result ? t('yes') : t('no');
      csvContent += `"${item.code}","${item.transacted_at}","${typeStr}","${methodStr}","${item.category}","${item.target_name || ''}","${item.target_phone || ''}",${valStr},"${bizStr}","${item.invoice_ref || ''}","${(item.description || '').replace(/"/g, '""')}","${item.created_by || ''}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SoQuy_${fundType}_${getLocalDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // In nhanh phiếu từ bảng
  const handlePrintExisting = (item) => {
    const isPayment = item.type === 'payment';
    const title = isPayment
      ? (item.payment_method === 'cash' ? 'PHIẾU CHI TIỀN MẶT' : 'PHIẾU CHI NGÂN HÀNG')
      : (item.payment_method === 'cash' ? 'PHIẾU THU TIỀN MẶT' : 'PHIẾU THU NGÂN HÀNG');

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - ${item.code}</title>
          <style>
            @page { size: A5 landscape; margin: 10mm; }
            body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; line-height: 1.5; padding: 10px; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h2 { margin: 0 0 5px 0; font-size: 18px; text-transform: uppercase; }
            .row { display: flex; margin-bottom: 6px; }
            .label { width: 170px; font-weight: 600; }
            .value { flex: 1; border-bottom: 1px dotted #888; }
            .amount-box { margin: 15px 0; padding: 10px; background-color: #f1f5f9; border: 1px solid #cbd5e1; font-size: 16px; font-weight: bold; }
            .signatures { display: flex; justify-content: space-between; margin-top: 35px; text-align: center; }
            .sign-box { width: 30%; }
            .sign-title { font-weight: bold; margin-bottom: 50px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h3 style="margin: 0; font-size: 14px;">QUÁN TRÀ - HỆ THỐNG QUẢN LÝ F&B</h3>
            <p style="margin: 2px 0; font-size: 11.5px; color: #555;">103 Trần Hưng Đạo, Đặc khu Phú Quốc, Tỉnh An Giang</p>
            <div style="border-bottom: 1px solid #ccc; margin: 8px 0 12px 0;"></div>
            <h2>${isPayment ? (t('admin.cashbook.printVoucherTitlePayment') || 'PHIẾU CHI') : (t('admin.cashbook.printVoucherTitleReceipt') || 'PHIẾU THU')}</h2>
            <p style="margin: 0; font-size: 12px;">Mã phiếu: <strong>${item.code}</strong> | Ngày lập: ${item.transacted_at}</p>
          </div>
          <div class="row"><div class="label">${isPayment ? (t('admin.cashbook.printPayee') || 'Người nhận tiền:') : (t('admin.cashbook.printPayer') || 'Người nộp tiền:')}</div><div class="value">${formatCashTarget(item.target_name) || t('admin.cashbook.defaultTarget')}</div></div>
          <div class="row"><div class="label">${t('admin.cashbook.printMethod') || 'Phương thức:'}</div><div class="value">${item.payment_method === 'cash' ? t('admin.cashbook.fundCash') : t('admin.cashbook.fundBank')}</div></div>
          <div class="row"><div class="label">${t('admin.cashbook.printReason') || 'Lý do thu/chi:'}</div><div class="value">${formatCashCategory(item.category)}</div></div>
          <div class="row"><div class="label">${t('admin.cashbook.printNote') || 'Ghi chú:'}</div><div class="value">${item.description || '---'}</div></div>
          <div class="amount-box">${t('admin.cashbook.printAmount') || 'Số tiền:'} <span style="color: ${isPayment ? '#b91c1c' : '#047857'};">${formatMoney(item.amount)}</span></div>
          <div class="signatures">
            <div class="sign-box"><div class="sign-title">Người lập phiếu</div><div>${formatCashCreatedBy(item.created_by) || item.created_by || 'Hoàng Nam'}</div></div>
            <div class="sign-box"><div class="sign-title">${isPayment ? 'Người nhận tiền' : 'Người nộp tiền'}</div><div>(Ký họ tên)</div></div>
            <div class="sign-box"><div class="sign-title">Thủ quỹ / Kế toán</div><div>(Ký họ tên)</div></div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 250);
  };

  // Tính toán hiển thị tiêu đề quỹ đang chọn
  const getFundTitle = () => {
    if (fundType === 'cash') return t('admin.cashbook.fundCash');
    if (fundType === 'bank') return t('admin.cashbook.fundBank');
    return t('admin.cashbook.fundTotal');
  };

  const formatCashDescription = (rawDesc) => {
    if (!rawDesc) return '---';
    if (typeof rawDesc === 'string' && rawDesc.startsWith('Thanh toán tự động qua')) {
      return rawDesc
        .replace('Thanh toán tự động qua', t('admin.cashbook.autoPaymentVia') || 'Thanh toán tự động qua')
        .replace('Nội dung:', t('admin.cashbook.contentLabel') || 'Nội dung:')
        .replace('Mã GD:', t('admin.cashbook.txCodeLabel') || 'Mã GD:');
    }
    return rawDesc;
  };

  // Tính tổng số cột hiển thị cho colSpan
  const totalVisibleCols = Object.values(visibleColumns).filter(Boolean).length + 1; // + 1 cho cột Thao tác

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', minHeight: '680px', flex: 1 }}>
      {/* ─── TITLE BAR CỦA TRANG SỔ QUỸ ─── */}
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
            <Wallet size={18} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              {getFundTitle()}
            </h2>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              {t('admin.cashbook.branchBadge')}
            </div>
          </div>
        </div>

        {/* Nhanh chóng chuyển đổi Quỹ tiền: Tổng quỹ | Tiền mặt | Ngân hàng */}
        <div style={{
          display: 'flex',
          backgroundColor: '#f1f5f9',
          padding: '3px',
          borderRadius: '8px',
          border: '1px solid #cbd5e1'
        }}>
          {[
            { key: 'all', label: t('admin.cashbook.fundTotal') },
            { key: 'cash', label: t('admin.cashbook.fundCash') },
            { key: 'bank', label: t('admin.cashbook.fundBank') },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFundType(tab.key)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: fundType === tab.key ? 700 : 500,
                backgroundColor: fundType === tab.key ? '#1B5E20' : 'transparent',
                color: fundType === tab.key ? '#ffffff' : '#475569',
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

      {/* ─── THÂN SỔ QUỸ: CỘT BỘ LỌC BÊN TRÁI & BẢNG DỮ LIỆU BÊN PHẢI ─── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* ─── CỘT BỘ LỌC (SIDEBAR) ─── */}
        <div style={{
          width: '280px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          padding: '16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          fontSize: '13px'
        }}>
          {/* 1. Quỹ tiền */}
          <div>
            <div style={{ fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              {t('admin.cashbook.fundTotal')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="fundTypeRadio"
                  checked={fundType === 'all'}
                  onChange={() => setFundType('all')}
                  style={{ accentColor: '#1B5E20', width: '15px', height: '15px' }}
                />
                <span style={{ fontWeight: fundType === 'all' ? 700 : 400 }}>{t('admin.cashbook.fundTotal')}</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="fundTypeRadio"
                  checked={fundType === 'cash'}
                  onChange={() => setFundType('cash')}
                  style={{ accentColor: '#1B5E20', width: '15px', height: '15px' }}
                />
                <span style={{ fontWeight: fundType === 'cash' ? 700 : 400 }}>{t('admin.cashbook.fundCash')}</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="fundTypeRadio"
                  checked={fundType === 'bank'}
                  onChange={() => setFundType('bank')}
                  style={{ accentColor: '#1B5E20', width: '15px', height: '15px' }}
                />
                <span style={{ fontWeight: fundType === 'bank' ? 700 : 400 }}>{t('admin.cashbook.fundBank')}</span>
              </label>
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: '#f1f5f9' }} />

          {/* 2. Chi nhánh */}
          <div>
            <div style={{ fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              {t('admin.cashbook.branch')}
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
              <span>{t('admin.cashbook.branchShort')}</span>
              <span style={{ cursor: 'pointer', fontSize: '13px', marginLeft: '2px' }}>✕</span>
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: '#f1f5f9' }} />

          {/* 3. Thời gian */}
          <div>
            <div style={{ fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              {t('admin.cashbook.time')}
            </div>

            {/* Option 1: Preset */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '6px' }}>
                <input
                  type="radio"
                  name="dateMode"
                  checked={dateFilterMode === 'preset'}
                  onChange={() => setDateFilterMode('preset')}
                  style={{ accentColor: '#1B5E20', width: '15px', height: '15px' }}
                />
                <span style={{ fontWeight: dateFilterMode === 'preset' ? 600 : 400 }}>{t('admin.cashbook.timeRange')}</span>
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
                    <option value="today">{t('admin.cashbook.today')}</option>
                    <option value="yesterday">{t('admin.cashbook.yesterday')}</option>
                    <option value="last7days">{t('admin.cashbook.last7days')}</option>
                    <option value="thismonth">{t('admin.cashbook.thisMonth')}</option>
                    <option value="all">{t('admin.cashbook.allTime')}</option>
                  </select>
                </div>
              )}
            </div>

            {/* Option 2: Custom range */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '6px' }}>
                <input
                  type="radio"
                  name="dateMode"
                  checked={dateFilterMode === 'custom'}
                  onChange={() => setDateFilterMode('custom')}
                  style={{ accentColor: '#1B5E20', width: '15px', height: '15px' }}
                />
                <span style={{ fontWeight: dateFilterMode === 'custom' ? 600 : 400 }}>{t('admin.cashbook.otherOptions')}</span>
              </label>

              {dateFilterMode === 'custom' && (
                <div style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{t('admin.cashbook.fromDate')}</div>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{t('admin.cashbook.toDate')}</div>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: '#f1f5f9' }} />

          {/* 4. Loại chứng từ (Phiếu thu / Phiếu chi) */}
          <div>
            <div style={{ fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              {t('admin.cashbook.docType')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={includeReceipt}
                  onChange={(e) => setIncludeReceipt(e.target.checked)}
                  style={{ accentColor: '#1B5E20', width: '15px', height: '15px' }}
                />
                <span>{t('admin.cashbook.receipt')}</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={includePayment}
                  onChange={(e) => setIncludePayment(e.target.checked)}
                  style={{ accentColor: '#1B5E20', width: '15px', height: '15px' }}
                />
                <span>{t('admin.cashbook.payment')}</span>
              </label>
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: '#f1f5f9' }} />

          {/* 5. Loại thu/chi */}
          <div>
            <div style={{ fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              {t('admin.cashbook.category')}
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
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
              <option value="all">{t('admin.cashbook.allCategories')}</option>
              <option value="Chi tiền mua nguyên vật liệu">{t('admin.cashbook.categories.material')}</option>
              <option value="Chi trả tiền nhà / điện nước">{t('admin.cashbook.categories.utilities')}</option>
              <option value="Chi trả lương nhân viên">{t('admin.cashbook.categories.salary')}</option>
              <option value="Chi sửa chữa & bảo trì thiết bị">{t('admin.cashbook.categories.repair')}</option>
              <option value="Chi tiếp khách & quảng cáo">{t('admin.cashbook.categories.marketing')}</option>
              <option value="Thu thanh lý tài sản">{t('admin.cashbook.categories.scrapReceipt')}</option>
              <option value="Thu hoàn ứng nhân viên">{t('admin.cashbook.categories.refundStaff')}</option>
              <option value="Thu khác">{t('admin.cashbook.categories.otherReceipt')}</option>
              <option value="Chi khác">{t('admin.cashbook.categories.otherPayment')}</option>
            </select>
          </div>

          {/* 6. Hạch toán kết quả kinh doanh */}
          <div>
            <div style={{ fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              {t('admin.cashbook.businessResultAccounting')}
            </div>
            <select
              value={businessFilter}
              onChange={(e) => setBusinessFilter(e.target.value)}
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
              <option value="all">{t('admin.cashbook.allBusinessFilter')}</option>
              <option value="true">{t('admin.cashbook.onlyBusinessResult')}</option>
              <option value="false">{t('admin.cashbook.noBusinessResult')}</option>
            </select>
          </div>

          {/* Reset button */}
          <button
            onClick={() => {
              setFundType('all');
              setDateFilterMode('preset');
              setPresetOption('thismonth');
              setIncludeReceipt(true);
              setIncludePayment(true);
              setCategoryFilter('all');
              setBusinessFilter('all');
              setSearchTerm('');
            }}
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              color: '#64748b',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <RotateCcw size={13} />
            <span>{t('admin.cashbook.resetFilter')}</span>
          </button>
        </div>

        {/* ─── CỘT PHẢI: BẢNG DỮ LIỆU & THANH SỐ LIỆU TỔNG QUỸ ─── */}
        <div style={{
          flex: 1,
          backgroundColor: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* THANH TỔNG HỢP SỐ LIỆU (QUỸ ĐẦU KỲ, TỔNG THU, TỔNG CHI, TỒN QUỸ) - SHADCN METRIC STYLE */}
          <div style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '12px 20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px'
          }}>
            {/* Quỹ đầu kỳ */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px' }}>
              <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>{t('admin.cashbook.openingBalance')}</div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginTop: '3px', letterSpacing: '-0.3px' }}>
                {formatMoney(summary.opening_balance)}
              </div>
            </div>

            {/* Tổng thu */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px' }}>
              <div style={{ fontSize: '11.5px', color: '#047857', fontWeight: 600 }}>{t('admin.cashbook.totalReceipt')}</div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#047857', marginTop: '3px', letterSpacing: '-0.3px' }}>
                {formatMoney(summary.total_receipt)}
              </div>
            </div>

            {/* Tổng chi */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px' }}>
              <div style={{ fontSize: '11.5px', color: '#dc2626', fontWeight: 600 }}>{t('admin.cashbook.totalPayment')}</div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#dc2626', marginTop: '3px', letterSpacing: '-0.3px' }}>
                {formatMoney(summary.total_payment)}
              </div>
            </div>

            {/* Tồn quỹ */}
            <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '8px', padding: '10px 14px' }}>
              <div style={{ fontSize: '11.5px', color: '#2E7D32', fontWeight: 700 }}>{t('admin.cashbook.closingBalance')}</div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#1B5E20', marginTop: '3px', letterSpacing: '-0.3px' }}>
                {formatMoney(summary.closing_balance)}
              </div>
            </div>
          </div>

          {/* ACTION TOOLBAR: Ô TÌM KIẾM, NÚT + PHIẾU THU, + PHIẾU CHI, XUẤT FILE, TÙY CHỌN CỘT */}
          <div style={{
            padding: '12px 20px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            {/* Ô tìm kiếm */}
            <div style={{ position: 'relative', width: '380px', maxWidth: '100%' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') fetchTransactions(); }}
                placeholder={t('admin.cashbook.searchPlaceholder')}
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 32px',
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

            {/* Nhóm nút bên phải: + Phiếu thu v, + Phiếu chi v, Xuất file, Popover tùy chỉnh cột */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* NÚT + PHIẾU THU (DROPDOWN: TIỀN MẶT / NGÂN HÀNG) */}
              <div ref={receiptDropdownRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowReceiptDropdown(!showReceiptDropdown);
                    setShowPaymentDropdown(false);
                    setShowColumnDropdown(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: '6px',
                    backgroundColor: '#1B5E20',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(27, 94, 32, 0.3)'
                  }}
                >
                  <Plus size={15} />
                  <span>{t('admin.cashbook.receiptBtn')}</span>
                  <ChevronDown size={13} />
                </button>

                {showReceiptDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '36px',
                    right: 0,
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                    border: '1px solid #e2e8f0',
                    width: '190px',
                    zIndex: 100,
                    overflow: 'hidden'
                  }}>
                    <button
                      type="button"
                      onClick={() => handleOpenCreateModal('receipt', 'cash')}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        textAlign: 'left',
                        backgroundColor: '#ffffff',
                        border: 'none',
                        borderBottom: '1px solid #f1f5f9',
                        fontSize: '13px',
                        color: '#0f172a',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
                    >
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1B5E20' }} />
                      <span>{t('admin.cashbook.receiptCash')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenCreateModal('receipt', 'bank')}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        textAlign: 'left',
                        backgroundColor: '#ffffff',
                        border: 'none',
                        fontSize: '13px',
                        color: '#0f172a',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
                    >
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1B5E20' }} />
                      <span>{t('admin.cashbook.receiptBank')}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* NÚT + PHIẾU CHI (DROPDOWN: TIỀN MẶT / NGÂN HÀNG) */}
              <div ref={paymentDropdownRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentDropdown(!showPaymentDropdown);
                    setShowReceiptDropdown(false);
                    setShowColumnDropdown(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: '6px',
                    backgroundColor: '#1B5E20',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
                  }}
                >
                  <Plus size={15} />
                  <span>{t('admin.cashbook.paymentBtn')}</span>
                  <ChevronDown size={13} />
                </button>

                {showPaymentDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '36px',
                    right: 0,
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                    border: '1px solid #e2e8f0',
                    width: '190px',
                    zIndex: 100,
                    overflow: 'hidden'
                  }}>
                    <button
                      type="button"
                      onClick={() => handleOpenCreateModal('payment', 'cash')}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        textAlign: 'left',
                        backgroundColor: '#ffffff',
                        border: 'none',
                        borderBottom: '1px solid #f1f5f9',
                        fontSize: '13px',
                        color: '#0f172a',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
                    >
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                      <span>{t('admin.cashbook.paymentCash')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenCreateModal('payment', 'bank')}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        textAlign: 'left',
                        backgroundColor: '#ffffff',
                        border: 'none',
                        fontSize: '13px',
                        color: '#0f172a',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
                    >
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1B5E20' }} />
                      <span>{t('admin.cashbook.paymentBank')}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* NÚT XUẤT FILE */}
              <button
                type="button"
                onClick={handleExportFile}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer'
                }}
              >
                <Download size={14} />
                <span>{t('admin.cashbook.exportFile')}</span>
              </button>

              {/* NÚT TÙY CHỌN CỘT HIỂN THỊ (POPOVER 2 CỘT CHECKBOX GIỐNG KIOTVIET) */}
              <div ref={columnDropdownRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                  title={t('admin.cashbook.customizeColumns')}
                  style={{
                    padding: '7px 9px',
                    borderRadius: '6px',
                    backgroundColor: showColumnDropdown ? '#e2e8f0' : '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <SlidersHorizontal size={15} />
                </button>

                {showColumnDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '38px',
                    right: 0,
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.18), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #e2e8f0',
                    padding: '16px 20px',
                    width: '320px',
                    zIndex: 100
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      columnGap: '20px',
                      rowGap: '12px'
                    }}>
                      {/* Cột 1 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#1e293b' }}>
                          <input
                            type="checkbox"
                            checked={visibleColumns.code}
                            onChange={() => toggleColumn('code')}
                            style={{ accentColor: '#2563eb', width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                          <span>{t('admin.cashbook.cols.code')}</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#1e293b' }}>
                          <input
                            type="checkbox"
                            checked={visibleColumns.time}
                            onChange={() => toggleColumn('time')}
                            style={{ accentColor: '#2563eb', width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                          <span>{t('admin.cashbook.cols.time')}</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#1e293b' }}>
                          <input
                            type="checkbox"
                            checked={visibleColumns.createdBy}
                            onChange={() => toggleColumn('createdBy')}
                            style={{ accentColor: '#2563eb', width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                          <span>{t('admin.cashbook.cols.createdBy')}</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#1e293b' }}>
                          <input
                            type="checkbox"
                            checked={visibleColumns.branch}
                            onChange={() => toggleColumn('branch')}
                            style={{ accentColor: '#2563eb', width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                          <span>{t('admin.cashbook.cols.branch')}</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#1e293b' }}>
                          <input
                            type="checkbox"
                            checked={visibleColumns.category}
                            onChange={() => toggleColumn('category')}
                            style={{ accentColor: '#2563eb', width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                          <span>{t('admin.cashbook.cols.category')}</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#1e293b' }}>
                          <input
                            type="checkbox"
                            checked={visibleColumns.fundType}
                            onChange={() => toggleColumn('fundType')}
                            style={{ accentColor: '#2563eb', width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                          <span>{t('admin.cashbook.cols.fundType')}</span>
                        </label>
                      </div>

                      {/* Cột 2 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#1e293b' }}>
                          <input
                            type="checkbox"
                            checked={visibleColumns.accountNo}
                            onChange={() => toggleColumn('accountNo')}
                            style={{ accentColor: '#2563eb', width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                          <span>{t('admin.cashbook.cols.accountNo')}</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#1e293b' }}>
                          <input
                            type="checkbox"
                            checked={visibleColumns.target}
                            onChange={() => toggleColumn('target')}
                            style={{ accentColor: '#2563eb', width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                          <span>{t('admin.cashbook.cols.target')}</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#1e293b' }}>
                          <input
                            type="checkbox"
                            checked={visibleColumns.amount}
                            onChange={() => toggleColumn('amount')}
                            style={{ accentColor: '#2563eb', width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                          <span>{t('admin.cashbook.cols.amount')}</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#1e293b' }}>
                          <input
                            type="checkbox"
                            checked={visibleColumns.note}
                            onChange={() => toggleColumn('note')}
                            style={{ accentColor: '#2563eb', width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                          <span>{t('admin.cashbook.cols.note')}</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#1e293b' }}>
                          <input
                            type="checkbox"
                            checked={visibleColumns.status}
                            onChange={() => toggleColumn('status')}
                            style={{ accentColor: '#2563eb', width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                          <span>{t('admin.cashbook.cols.status')}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* VÙNG CUỘN HIỂN THỊ BẢNG DỮ LIỆU */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              overflowX: 'auto'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1', color: '#475569' }}>
                    {visibleColumns.code && (
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, width: '120px' }}>
                        {t('admin.cashbook.cols.code')}
                      </th>
                    )}
                    {visibleColumns.time && (
                      <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, width: '130px' }}>
                        {t('admin.cashbook.cols.time')}
                      </th>
                    )}
                    {visibleColumns.createdBy && (
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, width: '140px' }}>
                        {t('admin.cashbook.cols.createdBy')}
                      </th>
                    )}
                    {visibleColumns.branch && (
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, width: '150px' }}>
                        {t('admin.cashbook.cols.branch')}
                      </th>
                    )}
                    {visibleColumns.category && (
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, width: '180px' }}>
                        {t('admin.cashbook.cols.category')}
                      </th>
                    )}
                    {visibleColumns.fundType && (
                      <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, width: '120px' }}>
                        {t('admin.cashbook.cols.fundType')}
                      </th>
                    )}
                    {visibleColumns.accountNo && (
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, width: '140px' }}>
                        {t('admin.cashbook.cols.accountNo')}
                      </th>
                    )}
                    {visibleColumns.target && (
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, width: '160px' }}>
                        {t('admin.cashbook.cols.target')}
                      </th>
                    )}
                    {visibleColumns.amount && (
                      <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, width: '130px' }}>
                        {t('admin.cashbook.cols.amount')}
                      </th>
                    )}
                    {visibleColumns.note && (
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>
                        {t('admin.cashbook.cols.note')}
                      </th>
                    )}
                    {visibleColumns.status && (
                      <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, width: '110px' }}>
                        {t('admin.cashbook.cols.status')}
                      </th>
                    )}
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, width: '80px' }}>
                      {t('admin.cashbook.cols.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={totalVisibleCols} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        {t('admin.cashbook.loading')}
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={totalVisibleCols} style={{ padding: '50px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            backgroundColor: '#E8F5E9',
                            color: '#1B5E20',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Search size={24} />
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>
                            {t('admin.cashbook.emptyTitle')}
                          </div>
                          <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                            {t('admin.cashbook.emptyDesc')}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setDateFilterMode('preset');
                              setPresetOption('all');
                            }}
                            style={{
                              marginTop: '8px',
                              padding: '8px 16px',
                              borderRadius: '6px',
                              backgroundColor: '#1B5E20',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '12.5px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {t('admin.cashbook.filterAllTimeBtn')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    transactions.map((item, idx) => {
                      const isPayment = item.type === 'payment';
                      return (
                        <tr
                          key={item.id || idx}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa'
                          }}
                        >
                          {/* Mã phiếu */}
                          {visibleColumns.code && (
                            <td style={{ padding: '9px 12px', fontWeight: 700, color: '#1B5E20' }}>
                              {item.code}
                            </td>
                          )}

                          {/* Thời gian */}
                          {visibleColumns.time && (
                            <td style={{ padding: '9px 12px', textAlign: 'center', color: '#475569' }}>
                              {item.transacted_date_str || (item.transacted_at ? item.transacted_at.replace('T', ' ').slice(0, 16) : '---')}
                            </td>
                          )}

                          {/* Người dùng tạo */}
                          {visibleColumns.createdBy && (
                            <td style={{ padding: '9px 12px', color: '#334155', fontWeight: 500 }}>
                              {formatCashCreatedBy(item.created_by) || item.created_by || 'Hoàng Nam'}
                            </td>
                          )}

                          {/* Chi nhánh */}
                          {visibleColumns.branch && (
                            <td style={{ padding: '9px 12px', color: '#475569', fontSize: '12px' }}>
                              {item.branch_name || t('admin.cashbook.branchShort')}
                            </td>
                          )}

                          {/* Loại thu chi */}
                          {visibleColumns.category && (
                            <td style={{ padding: '9px 12px', fontWeight: 600, color: '#0f172a' }}>
                              {formatCashCategory(item.category)}
                            </td>
                          )}

                          {/* Loại sổ quỹ: Tiền mặt hay Ngân hàng */}
                          {visibleColumns.fundType && (
                            <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                              <span style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 700,
                                backgroundColor: item.payment_method === 'cash' ? '#f1f5f9' : '#E8F5E9',
                                color: item.payment_method === 'cash' ? '#475569' : '#2E7D32',
                                border: `1px solid ${item.payment_method === 'cash' ? '#cbd5e1' : '#bae6fd'}`
                              }}>
                                {item.payment_method === 'cash' ? t('admin.cashbook.fundCash') : t('admin.cashbook.fundBank')}
                              </span>
                            </td>
                          )}

                          {/* Số tài khoản / Mã tham chiếu */}
                          {visibleColumns.accountNo && (
                            <td style={{ padding: '9px 12px', color: '#64748b', fontSize: '12px' }}>
                              {item.invoice_ref || '---'}
                            </td>
                          )}

                          {/* Người nộp / nhận */}
                          {visibleColumns.target && (
                            <td style={{ padding: '9px 12px', color: '#334155' }}>
                              <div>{formatCashTarget(item.target_name) || t('admin.cashbook.defaultTarget')}</div>
                              {item.target_phone && (
                                <div style={{ fontSize: '11px', color: '#64748b' }}>{item.target_phone}</div>
                              )}
                            </td>
                          )}

                          {/* Giá trị */}
                          {visibleColumns.amount && (
                            <td style={{
                              padding: '9px 12px',
                              textAlign: 'right',
                              fontWeight: 800,
                              color: isPayment ? '#dc2626' : '#047857'
                            }}>
                              {isPayment ? '−' : '+'}{formatMoney(item.amount)}
                            </td>
                          )}

                          {/* Ghi chú */}
                          {visibleColumns.note && (
                            <td style={{ padding: '9px 12px', color: '#64748b', fontSize: '12px' }}>
                              {formatCashDescription(item.description)}
                            </td>
                          )}

                          {/* Trạng thái (Hạch toán KQKD) */}
                          {visibleColumns.status && (
                            <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                              {item.is_business_result ? (
                                <span style={{
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '10.5px',
                                  fontWeight: 700,
                                  backgroundColor: '#dcfce7',
                                  color: '#15803d'
                                }}>
                                  {t('admin.cashbook.statusAccounted')}
                                </span>
                              ) : (
                                <span style={{
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '10.5px',
                                  fontWeight: 600,
                                  backgroundColor: '#f1f5f9',
                                  color: '#94a3b8'
                                }}>
                                  {t('admin.cashbook.statusNotAccounted')}
                                </span>
                              )}
                            </td>
                          )}

                          {/* Thao tác: In & Xóa */}
                          <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => handlePrintExisting(item)}
                                title={t('admin.cashbook.print')}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#1B5E20',
                                  cursor: 'pointer',
                                  padding: '4px'
                                }}
                              >
                                <Printer size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTransaction(item.id, item.code)}
                                title={t('admin.cashbook.delete')}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  padding: '4px'
                                }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL TẠO PHIẾU THU / PHIẾU CHI */}
      <CashTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultType={modalType}
        defaultMethod={modalMethod}
        onSuccess={() => fetchTransactions()}
        currentUser={currentUser}
      />

      {/* MODAL XÁC NHẬN XÓA PHIẾU THU / PHIẾU CHI */}
      <ConfirmDeleteModal
        isOpen={Boolean(txToDelete)}
        onClose={() => setTxToDelete(null)}
        onConfirm={handleConfirmDeleteTx}
        title={t('admin.cashbook.confirmDeleteTxTitle') || 'Xác nhận xóa phiếu'}
        message={t('admin.cashbook.confirmDeleteMsg') || 'Bạn có chắc chắn muốn xóa phiếu thu/chi này không?'}
        itemName={txToDelete?.code}
        warningText={t('cannotUndo') || 'Hành động này không thể hoàn tác.'}
        confirmText={t('confirmDelete') || 'Xóa phiếu'}
        cancelText={t('cancel') || 'Hủy'}
        loading={isDeletingTx}
      />
    </div>
  );
}
