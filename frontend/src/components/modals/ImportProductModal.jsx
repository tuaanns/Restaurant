import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  X, Upload, Download, FileSpreadsheet, CheckCircle2,
  AlertCircle, Trash2, RefreshCw, FileText, ArrowRight
} from 'lucide-react';
import { api } from '../../api';
import { useLanguage } from '../../i18n/LanguageContext';

export function ImportProductModal({
  isOpen,
  onClose,
  categories = [],
  onSuccess
}) {
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'paste'
  const [file, setFile] = useState(null);
  const [pasteText, setPasteText] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // ── Normalize Column Names ──
  const normalizeHeader = (rawHeader) => {
    if (!rawHeader) return '';
    const h = String(rawHeader).trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // remove accents for robust matching

    if (h.includes('ten mon') || h.includes('ten san pham') || h.includes('mon an') || h === 'ten' || h === 'name' || h === 'dish' || h === 'item') {
      return 'name';
    }
    if (h.includes('gia ban') || h.includes('don gia') || h.includes('gia tien') || h === 'gia' || h === 'price' || h === 'cost') {
      return 'price';
    }
    if (h.includes('don vi tinh') || h.includes('don vi') || h === 'dvt' || h === 'unit') {
      return 'unit';
    }
    if (h.includes('nhom mon') || h.includes('nhom thuc don') || h.includes('danh muc') || h === 'nhom' || h === 'category' || h === 'group') {
      return 'category_name';
    }
    if (h.includes('ma mon') || h.includes('ma san pham') || h.includes('ma code') || h === 'ma' || h === 'code' || h === 'sku') {
      return 'code';
    }
    if (h.includes('mo ta') || h.includes('ghi chu') || h === 'description' || h === 'note') {
      return 'description';
    }
    return rawHeader;
  };

  // ── Clean & Parse Raw Objects to Product Items ──
  const processRawRows = (rawArray) => {
    if (!rawArray || !rawArray.length) {
      setParsedRows([]);
      setErrorMsg(t('admin.importNoData') || 'Không tìm thấy dữ liệu hợp lệ.');
      return;
    }

    const items = rawArray.map((row, idx) => {
      const normalizedRow = {};
      Object.keys(row).forEach(key => {
        const normKey = normalizeHeader(key);
        normalizedRow[normKey] = row[key];
      });

      const name = String(normalizedRow.name || '').trim();

      // Clean price: remove non-digits (keep dot if float)
      let priceRaw = String(normalizedRow.price || '').replace(/[^0-9.]/g, '');
      let price = parseFloat(priceRaw);
      if (isNaN(price) || price < 0) price = 0;

      const unit = String(normalizedRow.unit || '').trim() || 'phần';
      const categoryName = String(normalizedRow.category_name || '').trim();
      const code = String(normalizedRow.code || '').trim();
      const description = String(normalizedRow.description || '').trim();

      const isValid = name.length > 0;
      let error = '';
      if (!isValid) {
        error = 'Thiếu tên món';
      }

      return {
        id: idx + 1,
        name,
        price,
        unit,
        category_name: categoryName,
        code,
        description,
        isValid,
        error
      };
    });

    setParsedRows(items);
    setErrorMsg('');
  };

  // ── Parse File (.xlsx, .xls, .csv) ──
  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!json || json.length === 0) {
          setErrorMsg(t('admin.importNoData') || 'File Excel không có dữ liệu!');
          setParsedRows([]);
          return;
        }

        processRawRows(json);
      } catch (err) {
        setErrorMsg('Lỗi khi đọc file Excel: ' + (err.message || 'Định dạng file không hỗ trợ'));
        setParsedRows([]);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  // ── Parse Pasted Text (CSV or Tab-Delimited) ──
  const handleParsePaste = () => {
    if (!pasteText.trim()) {
      setErrorMsg(t('admin.importEmptyNotice') || 'Vui lòng dán dữ liệu vào ô trước khi xem trước!');
      return;
    }

    try {
      const workbook = XLSX.read(pasteText, { type: 'string' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (json && json.length > 0) {
        processRawRows(json);
      } else {
        // Fallback manual CSV split
        const lines = pasteText.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length === 0) {
          setErrorMsg(t('admin.importNoData') || 'Không tìm thấy dữ liệu.');
          return;
        }
        const rows = lines.map(line => {
          const parts = line.split(/[,\t]/).map(p => p.trim());
          return {
            'Tên món': parts[0] || '',
            'Giá bán': parts[1] || '0',
            'Đơn vị tính': parts[2] || 'phần',
            'Nhóm thực đơn': parts[3] || '',
            'Mã món': parts[4] || '',
            'Mô tả': parts[5] || ''
          };
        });
        processRawRows(rows);
      }
    } catch {
      setErrorMsg('Không thể phân tích dữ liệu dán vào. Vui lòng kiểm tra định dạng.');
    }
  };

  // ── Download Sample Excel File ──
  const handleDownloadTemplate = () => {
    const sampleData = [
      {
        'Tên món': 'Phở bò tái nạm đặc biệt',
        'Giá bán': 65000,
        'Đơn vị tính': 'bát',
        'Nhóm thực đơn': 'Món xào & Cơm',
        'Mã món': 'PB01',
        'Mô tả': 'Nước dùng hầm xương bò 24h đậm đà'
      },
      {
        'Tên món': 'Cơm rang dưa bò giòn',
        'Giá bán': 55000,
        'Đơn vị tính': 'đĩa',
        'Nhóm thực đơn': 'Món xào & Cơm',
        'Mã món': 'CR02',
        'Mô tả': 'Kèm dưa chua và canh thanh nhiệt'
      },
      {
        'Tên món': 'Bò sốt tiêu đen bánh bao',
        'Giá bán': 185000,
        'Đơn vị tính': 'phần',
        'Nhóm thực đơn': 'Món bò & Gà',
        'Mã món': 'BS03',
        'Mô tả': 'Thịt bò mềm sốt cay nhẹ kèm 4 bánh bao'
      },
      {
        'Tên món': 'Trà đào cam sả thanh nhiệt',
        'Giá bán': 40000,
        'Đơn vị tính': 'ly',
        'Nhóm thực đơn': 'Đồ uống & Tráng miệng',
        'Mã món': 'TD04',
        'Mô tả': 'Trà đào pha quả cam tươi và tinh dầu sả'
      },
      {
        'Tên món': 'Lẩu Thái Tomyum hải sản',
        'Giá bán': 350000,
        'Đơn vị tính': 'nồi',
        'Nhóm thực đơn': 'Món lẩu đặc biệt',
        'Mã món': 'LT05',
        'Mô tả': 'Tôm sú, mực, ngao, nấm và rau ăn kèm'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    worksheet['!cols'] = [
      { wch: 30 }, // Tên món
      { wch: 14 }, // Giá bán
      { wch: 14 }, // Đơn vị tính
      { wch: 25 }, // Nhóm thực đơn
      { wch: 12 }, // Mã món
      { wch: 36 }  // Mô tả
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Thuc_Don_Mau');
    XLSX.writeFile(workbook, 'Mau_Thuc_Don_Aura_Restaurant.xlsx');
  };

  // ── Remove single item from preview ──
  const handleRemoveRow = (id) => {
    setParsedRows(prev => prev.filter(r => r.id !== id));
  };

  // ── Submit Import to Backend ──
  const handleConfirmImport = async () => {
    const validItems = parsedRows.filter(r => r.isValid);
    if (validItems.length === 0) {
      setErrorMsg(t('admin.importNoData') || 'Không có món ăn hợp lệ để nhập vào hệ thống!');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const payload = validItems.map(item => ({
        name: item.name,
        price: item.price,
        unit: item.unit,
        category_name: item.category_name,
        code: item.code || undefined,
        description: item.description
      }));

      const res = await api.importProducts(payload);

      if (onSuccess) {
        onSuccess(res);
      }
      onClose();
    } catch (err) {
      setErrorMsg('Lỗi nhập dữ liệu: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.filter(r => !r.isValid).length;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 400,
        padding: '20px'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '840px',
          maxWidth: '100%',
          maxHeight: '92vh',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                {t('admin.importProductTitle') || 'Nhập Món Ăn Từ File Excel'}
              </h3>
              <p style={{ margin: '3px 0 0 0', fontSize: '12.5px', color: '#64748b' }}>
                {t('admin.importProductSubtitle') || 'Tải tệp .xlsx, .xls, .csv để thêm nhiều món ăn vào thực đơn cùng một lúc'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Bar: Tabs & Download Template */}
        <div style={{
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('upload')}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'upload' ? '#009688' : '#f1f5f9',
                color: activeTab === 'upload' ? '#ffffff' : '#475569',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Upload size={14} />
              {t('admin.fileUploadTab') || 'Tải tệp Excel / CSV'}
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'paste' ? '#009688' : '#f1f5f9',
                color: activeTab === 'paste' ? '#ffffff' : '#475569',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FileText size={14} />
              {t('admin.pasteDataTab') || 'Dán dữ liệu (Copy & Paste)'}
            </button>
          </div>

          <button
            onClick={handleDownloadTemplate}
            title="Tải file Excel mẫu chuẩn format"
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              border: '1px solid #10b981',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s'
            }}
          >
            <Download size={14} />
            {t('admin.downloadTemplate') || 'Tải file mẫu Excel (.xlsx)'}
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {/* Error Message banner */}
          {errorMsg && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#dc2626',
              fontSize: '13px',
              marginBottom: '16px'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: UPLOAD EXCEL / CSV */}
          {activeTab === 'upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                style={{ display: 'none' }}
                onChange={e => handleFileChange(e.target.files[0])}
              />
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileChange(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${isDragging ? '#009688' : '#cbd5e1'}`,
                  borderRadius: '12px',
                  backgroundColor: isDragging ? '#f0fdf4' : '#f8fafc',
                  padding: '30px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginBottom: '16px'
                }}
              >
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: '#e0f2fe',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto'
                }}>
                  <Upload size={24} />
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                  {file ? file.name : (t('admin.dropExcelHere') || 'Kéo & thả file Excel (.xlsx, .xls, .csv) vào đây')}
                </div>
                <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '4px' }}>
                  {file ? `${(file.size / 1024).toFixed(1)} KB — Nhấn để chọn file khác` : (t('admin.orBrowseFile') || 'Hoặc nhấn để chọn tệp từ máy tính')}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PASTE TEXT / CSV */}
          {activeTab === 'paste' && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12.5px', color: '#475569', marginBottom: '6px' }}>
                {t('admin.pasteInstruction') || 'Dán dữ liệu sao chép từ Excel hoặc Google Sheets (mỗi cột cách nhau dấu tab hoặc phẩy):'}
              </div>
              <textarea
                rows={5}
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
                placeholder={'Tên món\tGiá bán\tĐơn vị tính\tNhóm thực đơn\tMã món\tMô tả\nPhở bò đặc biệt\t65000\tbát\tMón xào & Cơm\tPB01\tHầm xương 24h'}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={handleParsePaste}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    backgroundColor: '#0284c7',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={13} /> {t('admin.parsePastedBtn') || 'Phân tích dữ liệu dán'}
                </button>
              </div>
            </div>
          )}

          {/* PREVIEW SECTION */}
          {parsedRows.length > 0 && (
            <div>
              {/* Summary Stats */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: '#f1f5f9',
                borderRadius: '8px',
                marginBottom: '12px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                  {t('admin.previewProducts') || 'Xem trước dữ liệu món ăn'}: <strong>{parsedRows.length}</strong> {t('table.items') || 'dòng'}
                </div>
                <div style={{ display: 'flex', gap: '14px', fontSize: '12px', fontWeight: 600 }}>
                  <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={14} /> {validCount} {t('admin.validItemsCount') || 'hợp lệ'}
                  </span>
                  {invalidCount > 0 && (
                    <span style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={14} /> {invalidCount} {t('admin.invalidItemsCount') || 'không hợp lệ (bỏ qua)'}
                    </span>
                  )}
                </div>
              </div>

              {/* Preview Table */}
              <div style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                maxHeight: '260px',
                overflowY: 'auto'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8fafc', zIndex: 1 }}>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '8px 10px', textAlign: 'left', color: '#64748b', fontWeight: 700 }}>STT</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', color: '#64748b', fontWeight: 700 }}>{t('admin.productName') || 'Tên món ăn'}</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', color: '#64748b', fontWeight: 700 }}>{t('admin.productPrice') || 'Giá bán'}</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center', color: '#64748b', fontWeight: 700 }}>{t('menu.unit') || 'ĐVT'}</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', color: '#64748b', fontWeight: 700 }}>{t('admin.productGroup') || 'Nhóm thực đơn'}</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', color: '#64748b', fontWeight: 700 }}>{t('admin.productCode') || 'Mã món'}</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center', color: '#64748b', fontWeight: 700 }}>{t('actions') || 'Xóa'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.map((r, i) => (
                      <tr
                        key={r.id}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          backgroundColor: r.isValid ? '#ffffff' : '#fef2f2'
                        }}
                      >
                        <td style={{ padding: '8px 10px', color: '#94a3b8' }}>{i + 1}</td>
                        <td style={{ padding: '8px 10px', fontWeight: 700, color: r.isValid ? '#0f172a' : '#ef4444' }}>
                          {r.name || <em style={{ color: '#ef4444' }}>Chưa có tên</em>}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#009688' }}>
                          {Number(r.price).toLocaleString('vi-VN')} đ
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center', color: '#64748b' }}>
                          {r.unit}
                        </td>
                        <td style={{ padding: '8px 10px', color: '#475569' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: '#e0f2fe',
                            color: '#0369a1',
                            fontSize: '11px',
                            fontWeight: 600
                          }}>
                            {r.category_name || (categories[0]?.name || 'Món chính')}
                          </span>
                        </td>
                        <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#64748b' }}>
                          {r.code || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>{t('admin.autoGenCode') || 'Tự động sinh'}</span>}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(r.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '2px 4px'
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: '#f8fafc'
        }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {t('cancel')}
          </button>

          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={isLoading || validCount === 0}
            style={{
              padding: '9px 22px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: validCount > 0 ? '#009688' : '#94a3b8',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: validCount > 0 && !isLoading ? 'pointer' : 'not-allowed',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: validCount > 0 ? '0 4px 12px rgba(0, 150, 136, 0.3)' : 'none'
            }}
          >
            {isLoading ? (
              <>
                <RefreshCw size={14} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>{t('admin.importingData') || 'Đang nhập dữ liệu...'}</span>
              </>
            ) : (
              <>
                <ArrowRight size={14} />
                <span>
                  {validCount > 0
                    ? (t('admin.importBtnAction') ? t('admin.importBtnAction').replace('{count}', validCount) : `Nhập ${validCount} món vào thực đơn`)
                    : (t('admin.addProduct') || 'Nhập vào thực đơn')}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
