import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  Save,
  Calendar,
  Clock,
  DollarSign,
  User,
  Phone,
  FileText,
  AlertCircle,
  Building,
  CreditCard,
  Banknote,
  Check
} from 'lucide-react';
import { api } from '../../api';
import { useLanguage } from '../../i18n/LanguageContext';
import { DatePicker } from '../ui/DatePicker';

export function CashTransactionModal({
  isOpen,
  onClose,
  defaultType = 'payment', // 'receipt' (thu) hoặc 'payment' (chi)
  defaultMethod = 'cash', // 'cash' (tiền mặt) hoặc 'bank' (tài khoản ngân hàng)
  onSuccess,
  currentUser = null
}) {
  const { lang, t } = useLanguage();

  const [type, setType] = useState(defaultType); // 'receipt' | 'payment'
  const [paymentMethod, setPaymentMethod] = useState(defaultMethod); // 'cash' | 'bank'
  const [invoiceRef, setInvoiceRef] = useState('');
  const [code, setCode] = useState('');
  
  // Real-time default datetime
  const getNowDateTimeString = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [transactedAt, setTransactedAt] = useState(getNowDateTimeString());
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [targetType, setTargetType] = useState('supplier'); // 'supplier', 'customer', 'staff', 'other'
  const [targetName, setTargetName] = useState('');
  const [targetPhone, setTargetPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isBusinessResult, setIsBusinessResult] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Danh mục loại thu và chi phổ biến
  const paymentCategories = [
    t('admin.cashbook.categories.material'),
    t('admin.cashbook.categories.utilities'),
    t('admin.cashbook.categories.salary'),
    t('admin.cashbook.categories.repair'),
    t('admin.cashbook.categories.marketing'),
    t('admin.cashbook.categories.office'),
    t('admin.cashbook.categories.otherPayment')
  ];

  const receiptCategories = [
    t('admin.cashbook.categories.salesReceipt'),
    t('admin.cashbook.categories.debtReceipt'),
    t('admin.cashbook.categories.refundStaff'),
    t('admin.cashbook.categories.scrapReceipt'),
    t('admin.cashbook.categories.compensation'),
    t('admin.cashbook.categories.interest'),
    t('admin.cashbook.categories.otherReceipt')
  ];

  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      setPaymentMethod(defaultMethod);
      setInvoiceRef('');
      setCode('');
      setTransactedAt(getNowDateTimeString());
      setCategory(defaultType === 'payment' ? paymentCategories[0] : receiptCategories[0]);
      setCustomCategory('');
      setTargetType(defaultType === 'payment' ? 'supplier' : 'other');
      setTargetName('');
      setTargetPhone('');
      setAmount('');
      setDescription('');
      setIsBusinessResult(true);
      setError('');
    }
  }, [isOpen, defaultType, defaultMethod]);

  if (!isOpen) return null;

  // Format số tiền nhập vào
  const handleAmountChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (!rawVal) {
      setAmount('');
      return;
    }
    const num = parseInt(rawVal, 10);
    setAmount(num.toLocaleString('vi-VN'));
  };

  const getNumericAmount = () => {
    if (!amount) return 0;
    return parseInt(amount.replace(/\D/g, ''), 10) || 0;
  };

  // Xử lý lưu phiếu
  const handleSubmit = async (andPrint = false) => {
    const numAmount = getNumericAmount();
    if (numAmount <= 0) {
      setError(t('admin.cashbook.modal.enterAmountAlert'));
      return;
    }

    const finalCategory = (category === t('admin.cashbook.categories.otherPayment') || category === t('admin.cashbook.categories.otherReceipt')) 
      ? (customCategory.trim() || category)
      : category;

    if (!finalCategory.trim()) {
      setError(t('admin.cashbook.modal.enterCategoryAlert'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        code: code.trim() || null,
        type,
        payment_method: paymentMethod,
        category: finalCategory,
        amount: numAmount,
        invoice_ref: invoiceRef.trim() || null,
        target_type: targetType,
        target_name: targetName.trim() || (type === 'payment' ? t('admin.cashbook.modal.targetSupplier') : t('admin.cashbook.defaultTarget')),
        target_phone: targetPhone.trim() || null,
        description: description.trim() || null,
        is_business_result: isBusinessResult,
        transacted_at: transactedAt.replace('T', ' ') + ':00',
        created_by: currentUser?.name ? `${currentUser.name} (${currentUser.role || 'Quản lý'})` : 'Hoàng Nam (Quản trị viên)'
      };

      const res = await api.createCashTransaction(payload);
      if (res && res.success) {
        if (andPrint && res.transaction) {
          handlePrintSlip(res.transaction);
        }
        if (onSuccess) onSuccess(res.transaction);
        onClose();
      } else {
        setError(res?.message || 'Có lỗi xảy ra khi lưu phiếu!');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Lỗi kết nối máy chủ!');
    } finally {
      setLoading(false);
    }
  };

  // In hóa đơn phiếu thu/chi
  const handlePrintSlip = (transaction) => {
    const isPayment = transaction.type === 'payment';
    const title = isPayment
      ? (transaction.payment_method === 'cash' ? 'PHIẾU CHI TIỀN MẶT' : 'ỦY NHIỆM CHI / PHIẾU CHI NGÂN HÀNG')
      : (transaction.payment_method === 'cash' ? 'PHIẾU THU TIỀN MẶT' : 'PHIẾU BÁO CÓ / THU TÀI KHOẢN');

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
          <title>${title} - ${transaction.code}</title>
          <style>
            @page { size: A5 landscape; margin: 10mm; }
            body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; line-height: 1.5; color: #000; padding: 10px; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h2 { margin: 0 0 5px 0; font-size: 18px; text-transform: uppercase; }
            .header p { margin: 2px 0; font-size: 12px; color: #444; }
            .row { display: flex; margin-bottom: 6px; }
            .label { width: 170px; font-weight: 600; }
            .value { flex: 1; border-bottom: 1px dotted #888; }
            .amount-box { margin: 15px 0; padding: 10px; background-color: #f1f5f9; border: 1px solid #cbd5e1; font-size: 15px; font-weight: bold; }
            .signatures { display: flex; justify-content: space-between; margin-top: 35px; text-align: center; }
            .sign-box { width: 30%; }
            .sign-title { font-weight: bold; margin-bottom: 50px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h3 style="margin: 0; font-size: 14px; letter-spacing: 0.5px;">QUÁN TRÀ - HỆ THỐNG QUẢN LÝ F&B</h3>
            <p>103 Trần Hưng Đạo, Đặc khu Phú Quốc, Tỉnh An Giang - Hotline: 0348974111</p>
            <div style="border-bottom: 1px solid #ccc; margin: 8px 0 12px 0;"></div>
            <h2>${title}</h2>
            <p>Mã phiếu: <strong>${transaction.code}</strong> | Thời gian: ${transaction.transacted_at || new Date().toLocaleString('vi-VN')}</p>
          </div>

          <div class="row">
            <div class="label">${isPayment ? 'Người nhận tiền:' : 'Người nộp tiền:'}</div>
            <div class="value">${transaction.target_name || 'Khách lẻ / Đối tác'} ${transaction.target_phone ? '(' + transaction.target_phone + ')' : ''}</div>
          </div>
          <div class="row">
            <div class="label">Hình thức thanh toán:</div>
            <div class="value">${transaction.payment_method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản ngân hàng'}</div>
          </div>
          <div class="row">
            <div class="label">Lý do / Loại chứng từ:</div>
            <div class="value">${transaction.category} ${transaction.invoice_ref ? ' (HĐ: ' + transaction.invoice_ref + ')' : ''}</div>
          </div>
          <div class="row">
            <div class="label">Ghi chú nội dung:</div>
            <div class="value">${transaction.description || '---'}</div>
          </div>

          <div class="amount-box">
            Số tiền: <span style="color: ${isPayment ? '#b91c1c' : '#047857'}; font-size: 17px;">${Number(transaction.amount || 0).toLocaleString('vi-VN')} đ</span>
          </div>

          <div class="signatures">
            <div class="sign-box">
              <div class="sign-title">Người lập phiếu</div>
              <div>${transaction.created_by || 'Hoàng Nam'}</div>
            </div>
            <div class="sign-box">
              <div class="sign-title">${isPayment ? 'Người nhận tiền' : 'Người nộp tiền'}</div>
              <div>(Ký, ghi rõ họ tên)</div>
            </div>
            <div class="sign-box">
              <div class="sign-title">Thủ quỹ / Kế toán</div>
              <div>(Ký, ghi rõ họ tên)</div>
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 250);
  };

  const isPayment = type === 'payment';

  const getModalTitle = () => {
    if (type === 'payment') {
      return paymentMethod === 'cash'
        ? t('admin.cashbook.modal.titlePaymentCash')
        : t('admin.cashbook.modal.titlePaymentBank');
    } else {
      return paymentMethod === 'cash'
        ? t('admin.cashbook.modal.titleReceiptCash')
        : t('admin.cashbook.modal.titleReceiptBank');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        width: '680px',
        maxWidth: '100%',
        maxHeight: '94vh',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          backgroundColor: isPayment ? '#f8fafc' : '#f0fdf4',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: '17px',
              fontWeight: 800,
              color: isPayment ? '#0f172a' : '#065f46'
            }}>
              {getModalTitle()}
            </h3>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              {t('admin.cashbook.branchBadge')}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body Form */}
        <div style={{
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          fontSize: '13px'
        }}>
          {error && (
            <div style={{
              padding: '10px 14px',
              backgroundColor: '#fef2f2',
              color: '#b91c1c',
              borderRadius: '6px',
              border: '1px solid #fecaca',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12.5px'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Nhóm switch loại phiếu & phương thức nếu người dùng muốn đổi */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{
              flex: 1,
              display: 'flex',
              backgroundColor: '#f1f5f9',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1'
            }}>
              <button
                type="button"
                onClick={() => {
                  setType('payment');
                  setCategory(paymentCategories[0]);
                }}
                style={{
                  flex: 1,
                  padding: '6px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: type === 'payment' ? '#ef4444' : 'transparent',
                  color: type === 'payment' ? '#ffffff' : '#64748b'
                }}
              >
                {t('admin.cashbook.payment')} (−)
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('receipt');
                  setCategory(receiptCategories[0]);
                }}
                style={{
                  flex: 1,
                  padding: '6px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: type === 'receipt' ? '#1B5E20' : 'transparent',
                  color: type === 'receipt' ? '#ffffff' : '#64748b'
                }}
              >
                {t('admin.cashbook.receipt')} (+)
              </button>
            </div>

            <div style={{
              flex: 1,
              display: 'flex',
              backgroundColor: '#f1f5f9',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1'
            }}>
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '6px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: paymentMethod === 'cash' ? '#0f172a' : 'transparent',
                  color: paymentMethod === 'cash' ? '#ffffff' : '#64748b'
                }}
              >
                <Banknote size={14} />
                <span>{t('admin.cashbook.fundCash')}</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('bank')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '6px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: paymentMethod === 'bank' ? '#0284c7' : 'transparent',
                  color: paymentMethod === 'bank' ? '#ffffff' : '#64748b'
                }}
              >
                <CreditCard size={14} />
                <span>{t('admin.cashbook.fundBank')}</span>
              </button>
            </div>
          </div>

          {/* 1. Số - Ngày hóa đơn */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
              {t('admin.cashbook.modal.invoiceRef')}
            </label>
            <input
              type="text"
              value={invoiceRef}
              onChange={(e) => setInvoiceRef(e.target.value)}
              placeholder={t('admin.cashbook.modal.invoiceRefPlaceholder')}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* 2. Mã phiếu & Thời gian */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                {t('admin.cashbook.modal.code')}
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={t('admin.cashbook.modal.codePlaceholder')}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  backgroundColor: '#f8fafc',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                {t('admin.cashbook.modal.time')}
              </label>
              <DatePicker
                value={transactedAt}
                includeTime={true}
                onChange={(e) => setTransactedAt(e.target.value)}
              />
            </div>
          </div>

          {/* 3. Loại thu/chi & Người chi/thu */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                {isPayment ? t('admin.cashbook.modal.categoryPayment') : t('admin.cashbook.modal.categoryReceipt')} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
              >
                {(isPayment ? paymentCategories : receiptCategories).map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
              {(category === t('admin.cashbook.categories.otherPayment') || category === t('admin.cashbook.categories.otherReceipt')) && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder={t('admin.cashbook.modal.customCategoryPlaceholder')}
                  style={{
                    width: '100%',
                    marginTop: '6px',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12.5px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                {isPayment ? t('admin.cashbook.modal.creator') : t('admin.cashbook.modal.creatorReceipt')}
              </label>
              <div style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 600
              }}>
                {currentUser?.name ? `${currentUser.name} (${currentUser.role || 'Quản lý'})` : `${t('admin.cashbook.branchShort')} - Hoàng Nam (Quản lý)`}
              </div>
            </div>
          </div>

          {/* 4. Đối tượng nhận/nộp & Tên người nhận/nộp */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                {isPayment ? t('admin.cashbook.modal.targetType') : t('admin.cashbook.modal.targetTypeReceipt')}
              </label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
              >
                <option value="supplier">{t('admin.cashbook.modal.targetSupplier')}</option>
                <option value="customer">{t('admin.cashbook.modal.targetCustomer')}</option>
                <option value="staff">{t('admin.cashbook.modal.targetStaff')}</option>
                <option value="other">{t('admin.cashbook.modal.targetOther')}</option>
              </select>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                <label style={{ fontWeight: 600, color: '#334155' }}>
                  {isPayment ? t('admin.cashbook.modal.targetName') : t('admin.cashbook.modal.targetNameReceipt')}
                </label>
                <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600, cursor: 'pointer' }}>
                  {t('admin.cashbook.modal.createTarget')}
                </span>
              </div>
              <input
                type="text"
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                placeholder={t('admin.cashbook.modal.targetNamePlaceholder')}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* 5. Số tiền */}
          <div>
            <label style={{ display: 'block', fontWeight: 700, color: '#0f172a', marginBottom: '5px' }}>
              {t('admin.cashbook.modal.amount')} (VNĐ) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder={t('admin.cashbook.modal.amountPlaceholder')}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: '1.5px solid #1B5E20',
                  fontSize: '17px',
                  fontWeight: 800,
                  color: isPayment ? '#dc2626' : '#047857',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <span style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontWeight: 700,
                color: '#64748b',
                fontSize: '14px'
              }}>
                VNĐ
              </span>
            </div>
          </div>

          {/* 6. Ghi chú */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
              {t('admin.cashbook.modal.description')}
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('admin.cashbook.modal.descriptionPlaceholder')}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* 7. Checkbox hạch toán vào kết quả hoạt động kinh doanh */}
          <div style={{
            padding: '12px 14px',
            backgroundColor: '#eff6ff',
            borderRadius: '8px',
            border: '1px solid #bfdbfe'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              fontWeight: 700,
              color: '#1e40af',
              fontSize: '13px'
            }}>
              <input
                type="checkbox"
                checked={isBusinessResult}
                onChange={(e) => setIsBusinessResult(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer' }}
              />
              <span>{t('admin.cashbook.modal.accountingCheck')}</span>
            </label>

            <div style={{
              fontSize: '12px',
              color: '#3b82f6',
              marginTop: '6px',
              paddingLeft: '26px'
            }}>
              ⓘ {isPayment ? t('admin.cashbook.modal.accountingNotice') : t('admin.cashbook.modal.accountingNoticeReceipt')}
            </div>
          </div>
        </div>

        {/* Modal Footer Buttons */}
        <div style={{
          padding: '14px 20px',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '10px'
        }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '9px 18px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {t('admin.cashbook.modal.cancel')}
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={loading}
            style={{
              padding: '9px 18px',
              borderRadius: '6px',
              border: '1px solid #0284c7',
              backgroundColor: '#f0f9ff',
              color: '#0284c7',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Printer size={15} />
            <span>{t('admin.cashbook.modal.saveAndPrint')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={loading}
            style={{
              padding: '9px 24px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: isPayment ? '#ef4444' : '#1B5E20',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Save size={15} />
            <span>{loading ? t('loading') : t('admin.cashbook.modal.save')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
