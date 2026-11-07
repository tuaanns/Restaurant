import React, { useState } from 'react';
import { X, Scissors, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export function SplitOrderModal({
  isOpen,
  onClose,
  selectedTable,
  order,
  tables = [],
  onConfirmSplit
}) {
  const { t, formatTableName, formatDishName, formatDishUnit } = useLanguage();
  const [targetTableId, setTargetTableId] = useState(null);
  const [splitQuantities, setSplitQuantities] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const items = order?.items || [];
  const emptyTables = tables.filter(tbl => tbl.id !== selectedTable?.id && tbl.status === 'empty');
  const formatNumber = (val) => Number(val || 0).toLocaleString('en-US');

  // Khởi tạo số lượng tách nếu chưa có
  const getQty = (itemId) => splitQuantities[itemId] || 0;

  const handleSetQty = (itemId, maxQty, delta) => {
    setErrorMessage('');
    const current = getQty(itemId);
    const next = Math.max(0, Math.min(maxQty, current + delta));
    setSplitQuantities(prev => ({ ...prev, [itemId]: next }));
  };

  const handleSetAll = (itemId, maxQty) => {
    setErrorMessage('');
    setSplitQuantities(prev => ({ ...prev, [itemId]: maxQty }));
  };

  // Tính toán tóm tắt
  const totalSplitItemsCount = Object.values(splitQuantities).reduce((acc, q) => acc + q, 0);

  const splitSubtotal = items.reduce((acc, it) => {
    const q = getQty(it.id);
    return acc + (q * (it.price || 0));
  }, 0);

  const originalSubtotal = items.reduce((acc, it) => acc + ((it.price || 0) * (it.quantity || 0)), 0);
  const remainingSubtotal = Math.max(0, originalSubtotal - splitSubtotal);

  const handleConfirm = () => {
    if (!targetTableId) {
      setErrorMessage('Vui lòng chọn bàn nhận món tách!');
      return;
    }

    if (totalSplitItemsCount === 0) {
      setErrorMessage('Vui lòng chọn số lượng ít nhất 1 món để tách đơn!');
      return;
    }

    const splitItemsPayload = items
      .filter(it => getQty(it.id) > 0)
      .map(it => ({
        item_id: it.id,
        quantity: getQty(it.id),
      }));

    if (onConfirmSplit) {
      onConfirmSplit(selectedTable.id, targetTableId, splitItemsPayload);
    }
    onClose();
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
      zIndex: 100,
      padding: '16px'
    }}>
      <div style={{
        width: '540px',
        maxWidth: '96vw',
        maxHeight: '90vh',
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header Modal */}
        <div style={{
          padding: '14px 18px',
          backgroundColor: '#0b1320',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              backgroundColor: '#1e293b',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Scissors size={18} color="#38bdf8" />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800 }}>
                TÁCH ĐƠN HÀNG - {formatTableName(selectedTable?.name)}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                Chọn món và số lượng muốn tách sang bàn mới
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              color: '#94a3b8',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nội dung cuộn */}
        <div style={{ padding: '16px 20px', flex: 1, overflowY: 'auto' }}>
          {/* Thông báo lỗi nếu có */}
          {errorMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12.5px',
              marginBottom: '12px'
            }}>
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Chọn bàn nhận */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              fontSize: '12.5px',
              fontWeight: 700,
              color: '#0f172a',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>1. Chọn bàn nhận món tách:</span>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 400 }}>
                (Chọn bàn đang trống)
              </span>
            </div>

            {emptyTables.length === 0 ? (
              <div style={{
                backgroundColor: '#fffbeb',
                color: '#b45309',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                border: '1px solid #fde68a'
              }}>
                Không có bàn trống nào trong nhà hàng để tách sang.
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                gap: '8px',
                maxHeight: '130px',
                overflowY: 'auto',
                padding: '2px'
              }}>
                {emptyTables.map(tbl => {
                  const isSelected = targetTableId === tbl.id;
                  return (
                    <div
                      key={tbl.id}
                      onClick={() => {
                        setTargetTableId(tbl.id);
                        setErrorMessage('');
                      }}
                      style={{
                        padding: '10px 6px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid #009688' : '1px solid #cbd5e1',
                        backgroundColor: isSelected ? '#e6f7f5' : '#ffffff',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{
                        fontSize: '12.5px',
                        fontWeight: 800,
                        color: isSelected ? '#00796b' : '#334155'
                      }}>
                        {formatTableName(tbl.name)}
                      </div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                        {tbl.seats || 4} chỗ
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Chọn món và số lượng tách */}
          <div>
            <div style={{
              fontSize: '12.5px',
              fontWeight: 700,
              color: '#0f172a',
              marginBottom: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>2. Chọn số lượng món muốn chuyển:</span>
              <span style={{ fontSize: '11px', color: '#009688', fontWeight: 600 }}>
                Đã chọn: {totalSplitItemsCount} phần
              </span>
            </div>

            {items.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '24px 0',
                color: '#94a3b8',
                fontSize: '13px'
              }}>
                Bàn này hiện chưa có món ăn nào được gọi.
              </div>
            ) : (
              <div style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                {items.map((it, idx) => {
                  const splitQty = getQty(it.id);
                  const isSelected = splitQty > 0;
                  const itemUnit = it.unit || it.product?.unit || 'Phần';

                  return (
                    <div
                      key={it.id || idx}
                      style={{
                        padding: '10px 12px',
                        borderBottom: idx < items.length - 1 ? '1px solid #f1f5f9' : 'none',
                        backgroundColor: isSelected ? '#f0fdfa' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px'
                      }}
                    >
                      {/* Tên món & đơn giá */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#1e293b',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {formatDishName(it.product_name, it.code || it.product_code)}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          {formatNumber(it.price)} đ • ({formatDishUnit(itemUnit)}) • Hiện có: <strong>{it.quantity}</strong>
                        </div>
                      </div>

                      {/* Bộ điều khiển số lượng tách */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleSetQty(it.id, it.quantity, -1)}
                          disabled={splitQty <= 0}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: splitQty > 0 ? '#ffffff' : '#f8fafc',
                            color: splitQty > 0 ? '#0f172a' : '#cbd5e1',
                            fontWeight: 800,
                            cursor: splitQty > 0 ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          -
                        </button>

                        <span style={{
                          minWidth: '24px',
                          textAlign: 'center',
                          fontSize: '13px',
                          fontWeight: 800,
                          color: isSelected ? '#00796b' : '#64748b'
                        }}>
                          {splitQty}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleSetQty(it.id, it.quantity, 1)}
                          disabled={splitQty >= it.quantity}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: splitQty < it.quantity ? '#ffffff' : '#f8fafc',
                            color: splitQty < it.quantity ? '#0f172a' : '#cbd5e1',
                            fontWeight: 800,
                            cursor: splitQty < it.quantity ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          +
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSetAll(it.id, it.quantity)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            color: '#0284c7',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Tất cả
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Tóm tắt sau khi tách */}
          {totalSplitItemsCount > 0 && (
            <div style={{
              marginTop: '16px',
              padding: '12px 14px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#64748b' }}>
                  {formatTableName(selectedTable?.name)} còn lại:
                </span>
                <strong style={{ color: '#0f172a' }}>{formatNumber(remainingSubtotal)} đ</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#00796b', fontWeight: 600 }}>
                  Đơn tách mới ({targetTableId ? formatTableName(tables.find(t => t.id === targetTableId)?.name) : 'Bàn mới'}):
                </span>
                <strong style={{ color: '#00796b' }}>+{formatNumber(splitSubtotal)} đ</strong>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
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
              backgroundColor: '#ffffff'
            }}
          >
            {t('close')}
          </button>

          <button
            id="btn-confirm-split-order"
            onClick={handleConfirm}
            disabled={totalSplitItemsCount === 0 || !targetTableId}
            style={{
              padding: '9px 20px',
              borderRadius: '6px',
              backgroundColor: (totalSplitItemsCount > 0 && targetTableId) ? '#009688' : '#cbd5e1',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              cursor: (totalSplitItemsCount > 0 && targetTableId) ? 'pointer' : 'not-allowed',
              boxShadow: (totalSplitItemsCount > 0 && targetTableId) ? '0 3px 10px rgba(0, 150, 136, 0.3)' : 'none'
            }}
          >
            <Scissors size={15} />
            <span>Xác Nhận Tách Đơn</span>
          </button>
        </div>
      </div>
    </div>
  );
}

