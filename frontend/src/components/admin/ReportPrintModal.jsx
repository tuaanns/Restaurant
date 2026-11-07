import React, { useRef } from 'react';
import { X, Printer } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

// Tiếng Việt
function readNumberGroupVi(n, isLastGroup) {
  const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const u = n % 10;
  let res = '';

  if (h > 0 || !isLastGroup) res += digits[h] + ' trăm ';

  if (t > 1) {
    res += digits[t] + ' mươi ';
    if (u === 1) res += 'mốt ';
    else if (u === 5) res += 'lăm ';
    else if (u > 0) res += digits[u] + ' ';
  } else if (t === 1) {
    res += 'mười ';
    if (u === 5) res += 'lăm ';
    else if (u > 0) res += digits[u] + ' ';
  } else if (t === 0 && u > 0) {
    if (h > 0 || !isLastGroup) res += 'lẻ ';
    res += digits[u] + ' ';
  }

  return res.trim();
}

function numberToVietnameseWords(num) {
  if (!num || num === 0) return 'Không đồng chẵn';
  num = Math.round(Math.abs(num));
  const scales = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ'];
  const groups = [];

  while (num > 0) {
    groups.push(num % 1000);
    num = Math.floor(num / 1000);
  }

  const words = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const grp = groups[i];
    if (grp > 0) {
      const grpStr = readNumberGroupVi(grp, i === groups.length - 1);
      words.push(grpStr + ' ' + scales[i]);
    }
  }

  let full = words.join(' ').replace(/\s+/g, ' ').trim();
  full = full.charAt(0).toUpperCase() + full.slice(1) + ' đồng chẵn';
  return full;
}

// English
function numberToEnglishWords(num) {
  if (!num || num === 0) return 'Zero VND';
  num = Math.round(Math.abs(num));
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  function helper(n) {
    if (n === 0) return '';
    if (n < 20) return ones[n] + ' ';
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + ones[n % 10] : '') + ' ';
    return ones[Math.floor(n / 100)] + ' hundred ' + helper(n % 100);
  }

  const scales = ['', 'thousand', 'million', 'billion'];
  let res = '';
  let scaleIdx = 0;
  while (num > 0) {
    const chunk = num % 1000;
    if (chunk !== 0) {
      res = helper(chunk).trim() + (scales[scaleIdx] ? ' ' + scales[scaleIdx] + ' ' : ' ') + res;
    }
    num = Math.floor(num / 1000);
    scaleIdx++;
  }
  let str = res.trim();
  return (str.charAt(0).toUpperCase() + str.slice(1) + ' VND').replace(/\s+/g, ' ');
}

// Korean
function numberToKoreanWords(num) {
  if (!num || num === 0) return '영 동';
  num = Math.round(Math.abs(num));
  const digits = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  const smallUnits = ['', '십', '백', '천'];
  const bigUnits = ['', '만', '억', '조'];

  let res = '';
  let unitIdx = 0;
  while (num > 0) {
    const chunk = num % 10000;
    if (chunk > 0) {
      let chunkStr = '';
      let temp = chunk;
      for (let i = 0; i < 4; i++) {
        const d = temp % 10;
        if (d > 0) {
          chunkStr = (d === 1 && i > 0 ? '' : digits[d]) + smallUnits[i] + chunkStr;
        }
        temp = Math.floor(temp / 10);
      }
      res = chunkStr + (bigUnits[unitIdx] ? ' ' + bigUnits[unitIdx] + ' ' : ' ') + res;
    }
    num = Math.floor(num / 10000);
    unitIdx++;
  }
  return res.trim().replace(/\s+/g, ' ') + ' 동';
}

// Russian
function numberToRussianWords(num) {
  if (!num || num === 0) return 'Ноль вьетнамских донгов';
  num = Math.round(Math.abs(num));
  const ones = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
  const onesFem = ['', 'одна', 'две', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
  const teens = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать'];
  const tens = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'];
  const hundreds = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'];

  function chunkToRu(n, isFem) {
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const u = n % 10;
    let s = '';
    if (h > 0) s += hundreds[h] + ' ';
    if (t === 1) {
      s += teens[u] + ' ';
    } else {
      if (t > 1) s += tens[t] + ' ';
      if (u > 0) s += (isFem ? onesFem[u] : ones[u]) + ' ';
    }
    return s.trim();
  }

  const chunks = [];
  while (num > 0) {
    chunks.push(num % 1000);
    num = Math.floor(num / 1000);
  }

  const words = [];
  for (let i = chunks.length - 1; i >= 0; i--) {
    const c = chunks[i];
    if (c === 0) continue;
    const str = chunkToRu(c, i === 1);
    if (i === 3) {
      words.push(str + ' млрд');
    } else if (i === 2) {
      const u = c % 10;
      const t = Math.floor((c % 100) / 10);
      let suf = 'миллионов';
      if (t !== 1 && u === 1) suf = 'миллион';
      else if (t !== 1 && u >= 2 && u <= 4) suf = 'миллиона';
      words.push(str + ' ' + suf);
    } else if (i === 1) {
      const u = c % 10;
      const t = Math.floor((c % 100) / 10);
      let suf = 'тысяч';
      if (t !== 1 && u === 1) suf = 'тысяча';
      else if (t !== 1 && u >= 2 && u <= 4) suf = 'тысячи';
      words.push(str + ' ' + suf);
    } else {
      words.push(str);
    }
  }
  const res = words.join(' ').trim();
  if (!res) return 'Ноль вьетнамских донгов';
  return res.charAt(0).toUpperCase() + res.slice(1) + ' вьетнамских донгов';
}

function numberToWords(num, lang) {
  if (lang === 'en') return numberToEnglishWords(num);
  if (lang === 'ko') return numberToKoreanWords(num);
  if (lang === 'ru') return numberToRussianWords(num);
  return numberToVietnameseWords(num);
}

export function ReportPrintModal({
  isOpen,
  onClose,
  reportType = 'sales',
  reportTitle = '',
  dateStr = '',
  orders = [],
  goods = [],
  summary = {},
  currentUser = null
}) {
  const { lang, t, formatTableName, formatDishName, formatDishUnit } = useLanguage();
  const printAreaRef = useRef(null);

  if (!isOpen) return null;

  const localeMap = { vi: 'vi-VN', en: 'en-US', ko: 'ko-KR', ru: 'ru-RU' };
  const currentLocale = localeMap[lang] || 'vi-VN';

  const formatCurrency = (val) => {
    const formatted = Number(val || 0).toLocaleString(currentLocale);
    return lang === 'vi' ? `${formatted} đ` : (lang === 'en' ? `${formatted} VND` : `${formatted} ₫`);
  };

  const now = new Date();
  const printHours = String(now.getHours()).padStart(2, '0');
  const printMinutes = String(now.getMinutes()).padStart(2, '0');
  const printSeconds = String(now.getSeconds()).padStart(2, '0');
  const printDay = String(now.getDate()).padStart(2, '0');
  const printMonth = String(now.getMonth() + 1).padStart(2, '0');
  const printYear = now.getFullYear();

  const printTimeStr = `${printHours}:${printMinutes}:${printSeconds}`;
  const printDateStr = `${printDay}/${printMonth}/${printYear}`;

  const totalRev = summary.total_revenue || 0;
  const totalOrders = summary.total_orders || orders.length || 0;
  const totalItems = summary.total_items || 0;
  const totalDiscount = summary.total_discount || 0;
  const totalVat = summary.total_vat || 0;
  const totalPaid = summary.total_paid || totalRev;
  const payments = summary.payment_breakdown || { cash: 0, qr_banking: 0, card: 0 };

  const finalTitle = reportTitle || t('admin.reports.titleEndOfDay').toUpperCase();

  const handlePrint = () => {
    const printContent = printAreaRef.current;
    if (!printContent) {
      window.print();
      return;
    }

    // In bằng invisible iframe để không bao giờ làm vỡ layout của trang
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
          <title>${finalTitle}</title>
          <style>
            @page {
              size: auto;
              margin: 8mm 10mm;
            }
            body {
              font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif;
              color: #000;
              background: #fff;
              margin: 0;
              padding: 0;
              font-size: 12px;
              line-height: 1.4;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #333;
              padding: 5px 6px;
            }
            th {
              background-color: #f1f5f9;
              font-weight: 700;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-left { text-align: left; }
            .font-bold { font-weight: bold; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
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

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        width: '560px',
        maxWidth: '100%',
        maxHeight: '94vh',
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header Modal */}
        <div style={{
          padding: '14px 18px',
          backgroundColor: '#064e3b',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Printer size={18} color="#ffffff" />
            <span style={{ fontSize: '15px', fontWeight: 800 }}>
              {t('admin.reports.printModalTitle')} — {t('appName')}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              opacity: 0.8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Printable slip preview container */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: '#f8fafc',
          padding: '16px'
        }}>
          <div
            ref={printAreaRef}
            style={{
              backgroundColor: '#ffffff',
              padding: '24px 20px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              color: '#000000',
              fontFamily: "'Segoe UI', Roboto, sans-serif"
            }}
          >
            {/* Top Brand */}
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '0.5px' }}>
                {t('appName')}
              </div>
              <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '2px' }}>
                103 Trần Hưng Đạo, Đặc khu Phú Quốc, Tỉnh An Giang
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                Hotline: 0348974111
              </div>
              <div style={{ borderBottom: '1.5px dashed #000000', margin: '10px 0' }} />
            </div>

            {/* Report Title */}
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '15px', fontWeight: 900, textTransform: 'uppercase' }}>
                {finalTitle}
              </div>
              <div style={{ fontSize: '11.5px', marginTop: '3px', fontWeight: 600 }}>
                {t('admin.reports.salesDate')}: {dateStr || printDateStr}
              </div>
              <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                {t('admin.reports.timeCol')}: {printTimeStr} • {printDateStr}
              </div>
              <div style={{ fontSize: '11px', color: '#475569' }}>
                {t('admin.reports.signPreparedBy')}: {currentUser?.name || 'Hoàng Nam'} ({t('admin.reports.manager') || 'Quản lý'})
              </div>
            </div>

            {/* Report Summary Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              marginBottom: '14px',
              fontSize: '11.5px',
              backgroundColor: '#f8fafc',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1'
            }}>
              <div><strong>{t('admin.reports.totalOrdersCount')}</strong> {totalOrders} {t('admin.reports.ordersCount')}</div>
              <div><strong>{t('admin.reports.totalItemsSold')}</strong> {totalItems} {t('dishUnits.portion') || 'phần'}</div>
              <div><strong>{t('admin.reports.totalRevenueCard')}</strong> {formatCurrency(totalRev)}</div>
              <div><strong>{t('admin.reports.discountPromoCard')}</strong> -{formatCurrency(totalDiscount)}</div>
              <div><strong>{t('admin.reports.vatTaxCard')}</strong> +{formatCurrency(totalVat)}</div>
              <div><strong>{t('admin.reports.netCollectedCard')}</strong> <span style={{ fontWeight: 800, color: '#047857' }}>{formatCurrency(totalPaid)}</span></div>
            </div>

            {/* Payment Method Breakdown */}
            <div style={{
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '8px 10px',
              marginBottom: '14px',
              fontSize: '11px'
            }}>
              <div style={{ fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', color: '#334155' }}>
                {t('admin.reports.sectionRevenueSummary')}:
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                <span>• {t('admin.reports.paymentCash')}:</span>
                <strong>{formatCurrency(payments.cash || 0)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                <span>• {t('admin.reports.paymentTransfer')}:</span>
                <strong>{formatCurrency(payments.qr_banking || 0)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                <span>• {t('admin.reports.paymentCard')}:</span>
                <strong>{formatCurrency(payments.card || 0)}</strong>
              </div>
              {summary.operating_expenses !== undefined && summary.operating_expenses > 0 && (
                <div style={{ borderTop: '1px dashed #cbd5e1', marginTop: '4px', paddingTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#b91c1c' }}>
                    <span>• Chi phí hoạt động (Phiếu chi):</span>
                    <strong>−{formatCurrency(summary.operating_expenses)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#047857', fontWeight: 800 }}>
                    <span>• Lợi nhuận kinh doanh thuần:</span>
                    <strong>{formatCurrency(summary.net_profit || summary.total_revenue || 0)}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Detailed Table (depending on reportType) */}
            {reportType === 'goods' && (
              <div>
                <div style={{ fontWeight: 700, fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase' }}>
                  {t('admin.reports.sectionGoods')} ({goods.length} {t('admin.reports.itemsCount')})
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9' }}>
                      <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'left' }}>{t('admin.reports.itemName')}</th>
                      <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', width: '50px' }}>{t('admin.reports.unit')}</th>
                      <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', width: '45px' }}>{t('admin.reports.qty')}</th>
                      <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'right', width: '85px' }}>{t('admin.reports.amount')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {goods.length > 0 ? (
                      goods.map((g, idx) => (
                        <tr key={idx}>
                          <td style={{ border: '1px solid #000', padding: '4px' }}>{formatDishName(g.product_name, g.product_code)}</td>
                          <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>{formatDishUnit(g.unit)}</td>
                          <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', fontWeight: 700 }}>{g.quantity}</td>
                          <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}>{formatCurrency(g.revenue)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{t('admin.reports.noGoodsFound')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {reportType === 'sales' && (
              <div>
                <div style={{ fontWeight: 700, fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase' }}>
                  {t('admin.reports.sectionOrders')} ({orders.length} {t('admin.reports.ordersCount')})
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9' }}>
                      <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'left' }}>{t('admin.reports.orderCode')}</th>
                      <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>{t('admin.reports.timeCol')}</th>
                      <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'left' }}>{t('admin.reports.tableCol')}</th>
                      <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', width: '35px' }}>{t('admin.reports.qty')}</th>
                      <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}>{t('admin.reports.amount')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length > 0 ? (
                      orders.map((ord, idx) => (
                        <tr key={idx}>
                          <td style={{ border: '1px solid #000', padding: '4px', fontWeight: 600 }}>{ord.order_code}</td>
                          <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>{ord.created_time || ord.created_at?.split(' ')[1] || '---'}</td>
                          <td style={{ border: '1px solid #000', padding: '4px' }}>{formatTableName(ord.table_name)}</td>
                          <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>{ord.total_items_count}</td>
                          <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'right', fontWeight: 700 }}>{formatCurrency(ord.total_amount)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{t('admin.reports.noOrdersFound')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {reportType === 'end_of_day' && (
              <div>
                {/* PHẦN I: HÓA ĐƠN */}
                <div style={{ fontWeight: 700, fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase' }}>
                  {t('admin.reports.sectionOrders')} ({orders.length} {t('admin.reports.ordersCount')})
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9' }}>
                      <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'left' }}>{t('admin.reports.orderCode')}</th>
                      <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>{t('admin.reports.timeCol')}</th>
                      <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'left' }}>{t('admin.reports.tableCol')}</th>
                      <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', width: '35px' }}>{t('admin.reports.qty')}</th>
                      <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}>{t('admin.reports.amount')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length > 0 ? (
                      orders.map((ord, idx) => (
                        <tr key={idx}>
                          <td style={{ border: '1px solid #000', padding: '4px', fontWeight: 600 }}>{ord.order_code}</td>
                          <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>{ord.created_time || ord.created_at?.split(' ')[1] || '---'}</td>
                          <td style={{ border: '1px solid #000', padding: '4px' }}>{formatTableName(ord.table_name)}</td>
                          <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>{ord.total_items_count}</td>
                          <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'right', fontWeight: 700 }}>{formatCurrency(ord.total_amount)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{t('admin.reports.noOrdersFound')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* PHẦN II: HÀNG HÓA BÁN RA */}
                <div style={{ fontWeight: 700, fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase', marginTop: '12px' }}>
                  {t('admin.reports.sectionGoods')} ({goods.length} {t('admin.reports.itemsCount')})
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9' }}>
                      <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'left' }}>{t('admin.reports.itemName')}</th>
                      <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', width: '50px' }}>{t('admin.reports.unit')}</th>
                      <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', width: '45px' }}>{t('admin.reports.qty')}</th>
                      <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'right', width: '85px' }}>{t('admin.reports.amount')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {goods.length > 0 ? (
                      goods.map((g, idx) => (
                        <tr key={idx}>
                          <td style={{ border: '1px solid #000', padding: '4px' }}>{formatDishName(g.product_name, g.product_code)}</td>
                          <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>{formatDishUnit(g.unit)}</td>
                          <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', fontWeight: 700 }}>{g.quantity}</td>
                          <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}>{formatCurrency(g.revenue)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{t('admin.reports.noGoodsFound')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Total in words */}
            <div style={{
              fontSize: '11.5px',
              fontStyle: 'italic',
              marginTop: '8px',
              padding: '6px 0',
              borderTop: '1px solid #e2e8f0'
            }}>
              <strong>{t('admin.reports.inWords')}</strong> {numberToWords(totalRev, lang)}
            </div>

            {/* Signature section */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '24px',
              textAlign: 'center',
              fontSize: '11.5px'
            }}>
              <div>
                <div style={{ fontWeight: 700 }}>{t('admin.reports.signCashier')}</div>
                <div style={{ fontSize: '10.5px', color: '#64748b' }}>{t('admin.reports.signHint')}</div>
                <div style={{ marginTop: '38px', fontWeight: 600 }}>Thu Hằng</div>
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>{t('admin.reports.signPreparedBy')}</div>
                <div style={{ fontSize: '10.5px', color: '#64748b' }}>{t('admin.reports.signHint')}</div>
                <div style={{ marginTop: '38px', fontWeight: 600 }}>{currentUser?.name || 'Hoàng Nam'}</div>
              </div>
            </div>

            <div style={{ borderBottom: '1.5px dashed #000000', margin: '14px 0 10px 0' }} />
            <div style={{ textAlign: 'center', fontSize: '10.5px', color: '#64748b', fontStyle: 'italic' }}>
              {t('admin.reports.systemFooterNotice')}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{
          padding: '12px 18px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#ffffff'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              color: '#475569',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: '#fff'
            }}
          >
            {t('close')}
          </button>

          <button
            onClick={handlePrint}
            style={{
              padding: '9px 22px',
              borderRadius: '6px',
              backgroundColor: '#1B5E20',
              color: '#ffffff',
              fontSize: '13.5px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 3px 10px rgba(27, 94, 32, 0.35)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Printer size={16} />
            <span>{t('admin.reports.printReport')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
