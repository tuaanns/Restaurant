import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  X, Upload, Download, FileSpreadsheet, CheckCircle2,
  AlertCircle, Trash2, RefreshCw, FileText, ArrowRight,
  ShieldCheck, UserCheck, Clock, Phone, Mail, User
} from 'lucide-react';
import { api } from '../../api';
import { useLanguage } from '../../i18n/LanguageContext';

export function ImportUserModal({
  isOpen,
  onClose,
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

  // ── Normalize Column Names for Staff / Users ──
  const normalizeHeader = (rawHeader) => {
    if (!rawHeader) return '';
    const h = String(rawHeader).trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (h.includes('ho va ten') || h.includes('ho ten') || h.includes('ten nhan vien') || h === 'ten' || h === 'name' || h === 'fullname' || h === 'full name' || h === 'staff') {
      return 'name';
    }
    if (h.includes('ten dang nhap') || h.includes('tai khoan') || h === 'username' || h === 'user' || h === 'account' || h === 'login') {
      return 'username';
    }
    if (h.includes('email') || h.includes('thu dien tu') || h === 'mail') {
      return 'email';
    }
    if (h.includes('vai tro') || h.includes('chuc vu') || h.includes('quyen') || h === 'role' || h === 'position') {
      return 'role';
    }
    if (h.includes('ca lam viec') || h.includes('ca truc') || h === 'ca' || h === 'shift' || h === 'work shift') {
      return 'shift';
    }
    if (h.includes('so dien thoai') || h.includes('dien thoai') || h.includes('sdt') || h === 'phone' || h === 'tel' || h === 'mobile') {
      return 'phone';
    }
    if (h.includes('mat khau') || h === 'password' || h === 'pass' || h === 'pwd') {
      return 'password';
    }
    return rawHeader;
  };

  // ── Normalize Role ──
  const normalizeRole = (rawRole) => {
    if (!rawRole) return 'cashier';
    const s = String(rawRole).trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (s.includes('admin') || s.includes('quan tri') || s.includes('quan ly') || s.includes('manager')) {
      return 'admin';
    }
    return 'cashier';
  };

  // ── Normalize Shift ──
  const normalizeShift = (rawShift) => {
    if (!rawShift) return 'Ca sáng (07:00 - 15:00)';
    const s = String(rawShift).trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (s.includes('chieu') || s.includes('15') || s.includes('afternoon')) {
      return 'Ca chiều (15:00 - 23:00)';
    }
    if (s.includes('toan') || s.includes('full') || s.includes('quan ly')) {
      return 'Toàn ca (Quản lý nhà hàng)';
    }
    return 'Ca sáng (07:00 - 15:00)';
  };

  // ── Clean & Parse Raw Objects to User Items ──
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
      const username = String(normalizedRow.username || '').trim();
      const email = String(normalizedRow.email || '').trim();
      const role = normalizeRole(normalizedRow.role);
      const shift = normalizeShift(normalizedRow.shift);
      let phone = String(normalizedRow.phone || '').trim();
      if (phone === '-' || phone === '—' || phone.toLowerCase() === 'null') phone = '';
      const password = String(normalizedRow.password || '').trim() || '123456';

      const isValid = name.length > 0;
      let error = '';
      if (!isValid) {
        error = 'Thiếu họ và tên nhân viên';
      }

      return {
        id: idx + 1,
        name,
        username,
        email,
        role,
        shift,
        phone,
        password,
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
        const lines = pasteText.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length === 0) {
          setErrorMsg(t('admin.importNoData') || 'Không tìm thấy dữ liệu.');
          return;
        }
        const rows = lines.map(line => {
          const parts = line.split(/[,\t]/).map(p => p.trim());
          return {
            'Họ và tên': parts[0] || '',
            'Tên đăng nhập': parts[1] || '',
            'Email': parts[2] || '',
            'Vai trò': parts[3] || 'Thu ngân',
            'Ca làm việc': parts[4] || 'Ca sáng (07:00 - 15:00)',
            'Số điện thoại': parts[5] || '',
            'Mật khẩu': parts[6] || '123456'
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
        'Họ và tên': 'Nguyễn Hoàng Phúc',
        'Tên đăng nhập': 'hoangphuc',
        'Email': 'hoangphuc@aura.vn',
        'Vai trò': 'Thu ngân',
        'Ca làm việc': 'Ca sáng (07:00 - 15:00)',
        'Số điện thoại': '0912345678',
        'Mật khẩu': '123456'
      },
      {
        'Họ và tên': 'Trần Bích Ngọc',
        'Tên đăng nhập': 'bichngoc',
        'Email': 'bichngoc@aura.vn',
        'Vai trò': 'Thu ngân',
        'Ca làm việc': 'Ca chiều (15:00 - 23:00)',
        'Số điện thoại': '0987654321',
        'Mật khẩu': '123456'
      },
      {
        'Họ và tên': 'Lê Đức Minh',
        'Tên đăng nhập': 'ducminh',
        'Email': 'ducminh@aura.vn',
        'Vai trò': 'Quản lý',
        'Ca làm việc': 'Toàn ca (Quản lý nhà hàng)',
        'Số điện thoại': '0905112233',
        'Mật khẩu': '123456'
      },
      {
        'Họ và tên': 'Phạm Thu Hằng',
        'Tên đăng nhập': '',
        'Email': '',
        'Vai trò': 'Thu ngân',
        'Ca làm việc': 'Ca sáng (07:00 - 15:00)',
        'Số điện thoại': '0933557799',
        'Mật khẩu': '123456'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    worksheet['!cols'] = [
      { wch: 26 }, // Họ và tên
      { wch: 18 }, // Tên đăng nhập
      { wch: 24 }, // Email
      { wch: 15 }, // Vai trò
      { wch: 30 }, // Ca làm việc
      { wch: 16 }, // Số điện thoại
      { wch: 14 }  // Mật khẩu
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh_Sach_Nhan_Vien');
    XLSX.writeFile(workbook, 'Mau_Import_Nhan_Vien_Aura.xlsx');
  };

  // ── Remove single item from preview ──
  const handleRemoveRow = (id) => {
    setParsedRows(prev => prev.filter(r => r.id !== id));
  };

  // ── Submit Import to Backend ──
  const handleConfirmImport = async () => {
    const validItems = parsedRows.filter(r => r.isValid);
    if (validItems.length === 0) {
      setErrorMsg(t('admin.importNoData') || 'Không có nhân viên hợp lệ để nhập vào hệ thống!');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const payload = validItems.map(item => ({
        name: item.name,
        username: item.username || undefined,
        email: item.email || undefined,
        role: item.role,
        shift: item.shift,
        phone: item.phone || '',
        password: item.password || '123456'
      }));

      const res = await api.importUsers(payload);

      if (onSuccess) {
        onSuccess(res, payload);
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
          width: '920px',
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
                {t('admin.importUserTitle') || 'Nhập Nhân Viên Từ File Excel'}
              </h3>
              <p style={{ margin: '3px 0 0 0', fontSize: '12.5px', color: '#64748b' }}>
                {t('admin.importUserSubtitle') || 'Tải tệp .xlsx, .xls, .csv để thêm nhiều tài khoản nhân viên vào hệ thống cùng một lúc'}
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
            {t('admin.downloadUserTemplate') || 'Tải file mẫu Nhân viên (.xlsx)'}
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
                {t('admin.pasteUserInstruction') || 'Dán dữ liệu sao chép từ Excel hoặc Google Sheets (Họ tên, Username, Email, Vai trò, Ca, SĐT, Mật khẩu):'}
              </div>
              <textarea
                rows={5}
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
                placeholder={'Họ và tên\tTên đăng nhập\tEmail\tVai trò\tCa làm việc\tSố điện thoại\nNguyễn Hoàng Phúc\thoangphuc\thoangphuc@aura.vn\tThu ngân\tCa sáng (07:00 - 15:00)\t0912345678\nTrần Bích Ngọc\tbichngoc\tbichngoc@aura.vn\tThu ngân\tCa chiều (15:00 - 23:00)\t0987654321\nLê Đức Minh\tducminh\tducminh@aura.vn\tQuản lý\tToàn ca (Quản lý nhà hàng)\t0905112233'}
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
                  {t('admin.previewUsers') || 'Xem trước danh sách nhân viên'}: <strong>{parsedRows.length}</strong> {t('admin.usersUnit') || 'nhân viên'}
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
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8fafc', zIndex: 1 }}>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '8px 10px', textAlign: 'left', color: '#64748b', fontWeight: 700 }}>STT</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', color: '#64748b', fontWeight: 700 }}>{t('admin.fullName') || 'Họ và tên'}</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', color: '#64748b', fontWeight: 700 }}>{t('admin.loginName') || 'Tên đăng nhập'}</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', color: '#64748b', fontWeight: 700 }}>{t('admin.email') || 'Email'}</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center', color: '#64748b', fontWeight: 700 }}>{t('admin.role') || 'Vai trò'}</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', color: '#64748b', fontWeight: 700 }}>{t('admin.shift') || 'Ca làm việc'}</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', color: '#64748b', fontWeight: 700 }}>{t('admin.phone') || 'SĐT'}</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center', color: '#64748b', fontWeight: 700 }}>{t('actions') || 'Xóa'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.map((r, i) => {
                      const isAdmin = r.role === 'admin';
                      return (
                        <tr
                          key={r.id}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            backgroundColor: r.isValid ? '#ffffff' : '#fef2f2'
                          }}
                        >
                          <td style={{ padding: '8px 10px', color: '#94a3b8' }}>{i + 1}</td>
                          <td style={{ padding: '8px 10px', fontWeight: 700, color: r.isValid ? '#0f172a' : '#ef4444' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{
                                width: '26px',
                                height: '26px',
                                borderRadius: '50%',
                                backgroundColor: isAdmin ? '#f3e8ff' : '#e0f2fe',
                                color: isAdmin ? '#7e22ce' : '#0369a1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                fontWeight: 700
                              }}>
                                {(r.name || '?').charAt(0).toUpperCase()}
                              </div>
                              <span>{r.name || <em style={{ color: '#ef4444' }}>{t('admin.noUserName') || 'Chưa có họ tên'}</em>}</span>
                            </div>
                          </td>
                          <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#0284c7', fontSize: '11.5px' }}>
                            {r.username ? r.username : (
                              <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '11px' }}>
                                ({t('admin.autoGenCode') || 'Tự động sinh'})
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '8px 10px', color: '#475569', fontSize: '11.5px' }}>
                            {r.email ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Mail size={11} color="#94a3b8" />
                                <span>{r.email}</span>
                              </div>
                            ) : (
                              <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '11px' }}>
                                ({t('admin.autoGenCode') || 'Tự động sinh'})
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '11px',
                              fontWeight: 700,
                              backgroundColor: isAdmin ? '#f3e8ff' : '#ecfdf5',
                              color: isAdmin ? '#7e22ce' : '#059669',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              {isAdmin ? <ShieldCheck size={11} /> : <UserCheck size={11} />}
                              {isAdmin ? (t('admin.roleAdmin') || 'Quản trị viên') : (t('admin.roleCashier') || 'Thu ngân')}
                            </span>
                          </td>
                          <td style={{ padding: '8px 10px', color: '#475569', fontSize: '11.5px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={11} color="#94a3b8" />
                              <span>{r.shift}</span>
                            </div>
                          </td>
                          <td style={{ padding: '8px 10px', color: '#64748b', fontSize: '11.5px' }}>
                            {r.phone ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Phone size={11} color="#94a3b8" />
                                <span>{r.phone}</span>
                              </div>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>—</span>
                            )}
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
                      );
                    })}
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
                    ? (t('admin.importUserBtnAction') ? t('admin.importUserBtnAction').replace('{count}', validCount) : `Nhập ${validCount} nhân viên vào hệ thống`)
                    : (t('admin.addStaff') || 'Nhập vào hệ thống')}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
