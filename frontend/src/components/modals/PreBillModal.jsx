import React from 'react';
import { X, Printer } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

/**
 * Chuyển đổi số tiền thành chữ Tiếng Việt chuẩn theo văn phong hóa đơn tài chính
 */
function readNumberGroup(n, isLastGroup) {
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
      const grpStr = readNumberGroup(grp, i === groups.length - 1);
      words.push(grpStr + ' ' + scales[i]);
    }
  }

  let full = words.join(' ').replace(/\s+/g, ' ').trim();
  full = full.charAt(0).toUpperCase() + full.slice(1) + ' đồng chẵn';
  return full;
}

export function PreBillModal({
  isOpen,
  onClose,
  selectedTable,
  order,
  onConfirmPrintPreBill
}) {
  const { t, formatTableName, formatDishName, formatDishUnit } = useLanguage();
  if (!isOpen) return null;

  const items = order?.items || [];
  
  // Format số tiền có dấu phẩy ngăn cách hàng nghìn theo mẫu hóa đơn
  const formatNumber = (val) => Number(val || 0).toLocaleString('en-US');

  const now = new Date();
  const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateStr = now.toLocaleDateString('vi-VN');

  // Lấy nhãn số bàn (hiển thị trong khung tròn/oval)
  const getTableBadge = (tableName) => {
    const defaultTitle = t('table.tablePrefix') || 'Bàn';
    if (!tableName) return { title: defaultTitle, num: '---' };
    if (/^BÀN\s*/i.test(tableName)) {
      return { title: defaultTitle, num: tableName.replace(/^BÀN\s*/i, '').trim() };
    }
    return { title: '', num: formatTableName(tableName) };
  };

  const tableBadge = getTableBadge(selectedTable?.name);

  // Tính toán chính xác các khoản tiền thực tế của đơn hàng
  const subtotal = items.length > 0
    ? (order?.subtotal ?? items.reduce((acc, it) => acc + (it.price * it.quantity), 0))
    : 0;

  const vatPercent = order?.vat_percent ?? 8;
  const discountAmount = order?.discount_amount ?? 0;
  const surchargeFee = order?.surcharge_amount ?? (order?.fee_amount || 0);
  const surchargeName = order?.surcharge_name || 'Phí dịch vụ:';
  
  const vatAmount = subtotal > 0
    ? (order?.vat_amount ?? Math.round(((subtotal - discountAmount) * vatPercent) / 100))
    : 0;

  const totalAmount = subtotal > 0
    ? (order?.total_amount ?? (subtotal + vatAmount - discountAmount + surchargeFee))
    : 0;

  const totalInWords = numberToVietnameseWords(totalAmount);

  // Mã hóa đơn thực tế
  const orderCode = order?.order_code || (order?.id ? `ORD-${order.id}` : `ORD-${selectedTable?.name || '01'}`);

  const handlePrint = () => {
    if (onConfirmPrintPreBill) onConfirmPrintPreBill();
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '16px'
    }}>
      <div style={{
        width: '430px',
        maxWidth: '100%',
        maxHeight: '94vh',
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header Modal (Không in - Đã bỏ chữ K80 80mm) */}
        <div className="no-print" style={{
          padding: '14px 18px',
          backgroundColor: '#064e3b',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Printer size={18} color="#ffffff" />
            <span style={{ fontSize: '15px', fontWeight: 800 }}>{t('preBill.previewTitle')}</span>
          </div>
          <button onClick={onClose} style={{ color: '#ffffff', opacity: 0.8, cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Khung cuộn xem trước hóa đơn */}
        <div style={{
          padding: '16px',
          backgroundColor: '#f1f5f9',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          justifyContent: 'center'
        }}>
          {/* ========================================================
              VÙNG IN HÓA ĐƠN (.print-area) - CHUẨN IN VỪA VẶN MÁY IN
              ======================================================== */}
          <div
            className="print-area"
            style={{
              width: '72mm',
              maxWidth: '72mm',
              backgroundColor: '#ffffff',
              padding: '16px 12px 24px 12px',
              boxSizing: 'border-box',
              fontFamily: "'Times New Roman', Times, serif",
              fontSize: '11.5px',
              color: '#000000',
              lineHeight: 1.35,
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}
          >
            {/* 1. THÔNG TIN NHÀ HÀNG (THÔNG TIN THỰC TẾ CỦA HỆ THỐNG AURA POS) */}
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <div style={{
                fontSize: '15px',
                fontWeight: 700,
                letterSpacing: '0.4px',
                lineHeight: 1.2
              }}>
                NHÀ HÀNG
              </div>
              <div style={{
                fontSize: '17px',
                fontWeight: 900,
                letterSpacing: '0.5px',
                marginTop: '2px',
                lineHeight: 1.2
              }}>
                AURA RESTAURANT
              </div>
              <div style={{ fontSize: '11px', marginTop: '4px', lineHeight: 1.3 }}>
                ĐC: Chi nhánh 01 - Tràng Tiền, Hoàn Kiếm, Hà Nội
              </div>
              <div style={{ fontSize: '11.5px', fontWeight: 600, marginTop: '2px' }}>
                Hotline: 1900 6868
              </div>
            </div>

            {/* 2. KHỐI TIÊU ĐỀ: BÀN (BÊN TRÁI) & PHIẾU TẠM TÍNH (BÊN PHẢI) */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              {/* Badge Bàn hình quả trám/oval bo tròn */}
              <div style={{
                border: '1.5px solid #000000',
                borderRadius: '24px',
                padding: '4px 10px',
                minWidth: '44px',
                textAlign: 'center',
                boxSizing: 'border-box'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>
                  {tableBadge.title}
                </div>
                <div style={{ fontSize: '17px', fontWeight: 900, lineHeight: 1.1 }}>
                  {tableBadge.num}
                </div>
              </div>

              {/* Tiêu đề Phiếu Tạm Tính, Mã HĐ, Ngày Bán */}
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '15px',
                  fontWeight: 900,
                  letterSpacing: '0.3px',
                  lineHeight: 1.2
                }}>
                  PHIẾU TẠM TÍNH
                </div>
                <div style={{ fontSize: '11.5px', marginTop: '3px' }}>
                  Mã HĐ: <strong style={{ fontWeight: 900 }}>{orderCode}</strong>
                </div>
                <div style={{ fontSize: '11px', marginTop: '1px' }}>
                  Ngày bán: {dateStr}
                </div>
                <div style={{ fontSize: '11px', marginTop: '1px' }}>
                  {timeStr}
                </div>
              </div>
            </div>

            {/* 3. BẢNG MÓN ĂN KẺ KHUNG VIỀN ĐẦY ĐỦ */}
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1.5px solid #000000',
              fontSize: '11.5px',
              tableLayout: 'fixed'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#ffffff' }}>
                  <th style={{
                    border: '1.5px solid #000000',
                    padding: '4px 3px',
                    textAlign: 'left',
                    width: '42%',
                    fontWeight: 700
                  }}>
                    Tên Hàng
                  </th>
                  <th style={{
                    border: '1.5px solid #000000',
                    padding: '4px 3px',
                    textAlign: 'right',
                    width: '23%',
                    fontWeight: 700
                  }}>
                    Đ.Giá
                  </th>
                  <th style={{
                    border: '1.5px solid #000000',
                    padding: '4px 3px',
                    textAlign: 'center',
                    width: '11%',
                    fontWeight: 700
                  }}>
                    SL
                  </th>
                  <th style={{
                    border: '1.5px solid #000000',
                    padding: '4px 3px',
                    textAlign: 'right',
                    width: '24%',
                    fontWeight: 700,
                    lineHeight: 1.1
                  }}>
                    Thành tiền
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item, idx) => {
                    const itemUnit = item.unit || item.product?.unit || 'Phần';
                    const itemSubtotal = item.subtotal ?? (item.price * item.quantity);
                    return (
                      <tr key={item.id || idx}>
                        <td style={{
                          border: '1px solid #000000',
                          padding: '4px 3px',
                          textAlign: 'left',
                          wordBreak: 'break-word'
                        }}>
                          <div>{formatDishName(item.product_name, item.code || item.product_code)}</div>
                          <div style={{ fontSize: '10.5px' }}>({formatDishUnit(itemUnit)})</div>
                        </td>
                        <td style={{
                          border: '1px solid #000000',
                          padding: '4px 3px',
                          textAlign: 'right',
                          verticalAlign: 'middle',
                          whiteSpace: 'nowrap'
                        }}>
                          {formatNumber(item.price)}
                        </td>
                        <td style={{
                          border: '1px solid #000000',
                          padding: '4px 2px',
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          fontWeight: 600
                        }}>
                          {item.quantity}
                        </td>
                        <td style={{
                          border: '1px solid #000000',
                          padding: '4px 3px',
                          textAlign: 'right',
                          verticalAlign: 'middle',
                          fontWeight: 600,
                          whiteSpace: 'nowrap'
                        }}>
                          {formatNumber(itemSubtotal)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        border: '1px solid #000000',
                        padding: '14px 6px',
                        textAlign: 'center',
                        color: '#64748b',
                        fontStyle: 'italic'
                      }}
                    >
                      Bàn chưa có món ăn nào được gọi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* 4. KHỐI TỔNG KẾT TIỀN THỰC TẾ */}
            <div style={{ marginTop: '8px', lineHeight: 1.5, fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
                <span>Tổng tiền hàng:</span>
                <span style={{ fontSize: '13.5px', fontWeight: 800 }}>
                  {formatNumber(subtotal)}
                </span>
              </div>

              {surchargeFee > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
                  <span>{surchargeName}</span>
                  <span style={{ fontWeight: 600 }}>{formatNumber(surchargeFee)}</span>
                </div>
              )}

              {vatAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
                  <span>VAT {vatPercent}%:</span>
                  <span style={{ fontWeight: 600 }}>
                    {formatNumber(vatAmount)}
                  </span>
                </div>
              )}

              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
                  <span>Chiết khấu:</span>
                  <span style={{ fontWeight: 600 }}>
                    -{formatNumber(discountAmount)}
                  </span>
                </div>
              )}

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '3px 0 2px 0',
                marginTop: '2px',
                fontSize: '14.5px',
                fontWeight: 900
              }}>
                <span>Tổng cộng:</span>
                <span style={{ fontSize: '15.5px' }}>
                  {formatNumber(totalAmount)}
                </span>
              </div>

              {/* Số tiền viết bằng chữ in nghiêng */}
              <div style={{
                textAlign: 'center',
                fontStyle: 'italic',
                fontSize: '11px',
                marginTop: '4px',
                lineHeight: 1.3,
                padding: '0 2px'
              }}>
                {totalInWords}
              </div>
            </div>

            {/* 5. MÃ VIETQR CHUYỂN KHOẢN (AURA RESTAURANT) */}
            <div style={{
              textAlign: 'center',
              marginTop: '12px',
              paddingTop: '6px'
            }}>
              <div style={{
                display: 'inline-block',
                padding: '4px',
                backgroundColor: '#ffffff'
              }}>
                <img
                  src={`https://img.vietqr.io/image/970422-19006888-compact2.png?amount=${Math.round(totalAmount)}&addInfo=${encodeURIComponent('AURA BAN ' + tableBadge.num)}&accountName=AURA%20RESTAURANT`}
                  alt="VietQR Payment"
                  style={{
                    width: '135px',
                    height: '135px',
                    display: 'block',
                    margin: '0 auto',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=135x135&data=${encodeURIComponent('AURA PAYMENT AMOUNT ' + totalAmount)}`;
                  }}
                />
              </div>
            </div>

            {/* 6. LỜI CẢM ƠN DƯỚI CÙNG */}
            <div style={{
              textAlign: 'center',
              marginTop: '10px',
              fontStyle: 'italic',
              fontSize: '11.5px',
              fontWeight: 500
            }}>
              Xin Cám Ơn & Hẹn Gặp Lại!!!
            </div>
          </div>
        </div>

        {/* Nút thao tác dưới Modal (Không in - Đã bỏ chữ Khổ 80mm) */}
        <div className="no-print" style={{
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
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              color: '#475569',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {t('close')}
          </button>

          <button
            onClick={handlePrint}
            style={{
              padding: '9px 20px',
              borderRadius: '6px',
              backgroundColor: '#064e3b',
              color: '#ffffff',
              fontSize: '13.5px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 3px 10px rgba(6, 78, 59, 0.3)',
              cursor: 'pointer'
            }}
          >
            <Printer size={16} />
            <span>{t('preBill.printPreBill')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
