import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Star,
  Edit2,
  Trash2,
  QrCode,
  CheckCircle2,
  Copy,
  Check,
  Building,
  Info,
  X,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Zap,
  Bell,
  Smartphone,
  Radio,
  Play
} from 'lucide-react';
import { api } from '../../api';
import { useLanguage } from '../../i18n/LanguageContext';
import { useBankAccounts } from '../../hooks';

export const VIETNAM_BANKS = [
  { code: 'MB', bin: '970422', shortName: 'MBBank', name: 'Ngân hàng TMCP Quân đội (MBBank)', color: '#103986' },
  { code: 'VCB', bin: '970436', shortName: 'Vietcombank', name: 'Ngân hàng Ngoại thương Việt Nam (Vietcombank)', color: '#005b38' },
  { code: 'TCB', bin: '970407', shortName: 'Techcombank', name: 'Ngân hàng Kỹ thương Việt Nam (Techcombank)', color: '#e31837' },
  { code: 'BIDV', bin: '970418', shortName: 'BIDV', name: 'Ngân hàng Đầu tư và Phát triển Việt Nam (BIDV)', color: '#0b5b42' },
  { code: 'VBA', bin: '970405', shortName: 'Agribank', name: 'Ngân hàng Nông nghiệp & PTNT (Agribank)', color: '#800000' },
  { code: 'ACB', bin: '970416', shortName: 'ACB', name: 'Ngân hàng Á Châu (ACB)', color: '#0065b3' },
  { code: 'VPB', bin: '970432', shortName: 'VPBank', name: 'Ngân hàng Việt Nam Thịnh Vượng (VPBank)', color: '#009a3e' },
  { code: 'TPB', bin: '970423', shortName: 'TPBank', name: 'Ngân hàng Tiên Phong (TPBank)', color: '#68257d' },
  { code: 'STB', bin: '970403', shortName: 'Sacombank', name: 'Ngân hàng Sài Gòn Thương Tín (Sacombank)', color: '#004f9e' },
  { code: 'CTG', bin: '970415', shortName: 'VietinBank', name: 'Ngân hàng Công thương Việt Nam (VietinBank)', color: '#004c8f' },
  { code: 'HDB', bin: '970437', shortName: 'HDBank', name: 'Ngân hàng Phát triển TP.HCM (HDBank)', color: '#d30000' },
  { code: 'VIB', bin: '970441', shortName: 'VIB', name: 'Ngân hàng Quốc tế (VIB)', color: '#005baa' },
  { code: 'SHB', bin: '970443', shortName: 'SHB', name: 'Ngân hàng Sài Gòn - Hà Nội (SHB)', color: '#ff6600' },
  { code: 'OCB', bin: '970448', shortName: 'OCB', name: 'Ngân hàng Phương Đông (OCB)', color: '#008744' },
  { code: 'MSB', bin: '970426', shortName: 'MSB', name: 'Ngân hàng Hàng Hải (MSB)', color: '#e31b23' },
  { code: 'SEAB', bin: '970468', shortName: 'SeABank', name: 'Ngân hàng Đông Nam Á (SeABank)', color: '#e41c2b' },
  { code: 'LPB', bin: '970449', shortName: 'LPBank', name: 'Ngân hàng Lộc Phát Việt Nam (LPBank)', color: '#ea5414' },
  { code: 'NAB', bin: '970428', shortName: 'Nam A Bank', name: 'Ngân hàng Nam Á (Nam A Bank)', color: '#ffcc00' },
  { code: 'BAB', bin: '970409', shortName: 'Bac A Bank', name: 'Ngân hàng Bắc Á (Bac A Bank)', color: '#993333' },
  { code: 'EIB', bin: '970431', shortName: 'Eximbank', name: 'Ngân hàng Xuất Nhập Khẩu (Eximbank)', color: '#005ba4' }
];

export function BankAccountsView() {
  const { t } = useLanguage();

  // Quản lý dữ liệu tài khoản ngân hàng qua Custom Hook (Clean Code)
  const {
    bankAccounts,
    loading,
    fetchBankAccounts,
    setDefaultAccount,
    deleteAccount
  } = useBankAccounts();

  const [modalOpen, setModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    bank_code: 'MB',
    bank_name: 'Ngân hàng TMCP Quân đội (MBBank)',
    bin: '970422',
    account_number: '',
    account_name: '',
    branch: '',
    is_default: false,
    qr_template: 'compact2',
    notes: ''
  });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Preview options in Preview Modal
  const [previewAmount, setPreviewAmount] = useState('50000');
  const [previewNote, setPreviewNote] = useState('QUAN TRA BAN 01');

  // Webhook integration state
  const [testTableNum, setTestTableNum] = useState('1');
  const [testAmount, setTestAmount] = useState('50000');
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [webhookCopied, setWebhookCopied] = useState(false);

  const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
  const webhookUrl = `http://${host}:8000/api/payment/webhook`;

  const handleTestSimulate = async () => {
    try {
      setTestingWebhook(true);
      setTestResult(null);
      const res = await api.simulatePaymentWebhook({
        table_num: testTableNum,
        amount: testAmount
      });
      setTestResult({
        success: res.success,
        message: res.message || (res.success ? 'Đã gạch nợ thành công!' : 'Không tìm thấy bàn phù hợp')
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: err.response?.data?.message || err.message || 'Lỗi khi gửi webhook giả lập'
      });
    } finally {
      setTestingWebhook(false);
    }
  };

  const handleCopyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setWebhookCopied(true);
    setTimeout(() => setWebhookCopied(false), 2000);
  };

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setFormData({
      bank_code: 'MB',
      bank_name: 'Ngân hàng TMCP Quân đội (MBBank)',
      bin: '970422',
      account_number: '',
      account_name: '',
      branch: 'Chi nhánh Phú Quốc',
      is_default: bankAccounts.length === 0,
      qr_template: 'compact2',
      notes: ''
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (acc) => {
    setEditingAccount(acc);
    setFormData({
      bank_code: acc.bank_code,
      bank_name: acc.bank_name,
      bin: acc.bin,
      account_number: acc.account_number,
      account_name: acc.account_name,
      branch: acc.branch || '',
      is_default: !!acc.is_default,
      qr_template: acc.qr_template || 'compact2',
      notes: acc.notes || ''
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleBankSelect = (e) => {
    const code = e.target.value;
    const found = VIETNAM_BANKS.find(b => b.code === code);
    if (found) {
      setFormData(prev => ({
        ...prev,
        bank_code: found.code,
        bank_name: found.name,
        bin: found.bin
      }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.account_number.trim()) {
      setFormError('Vui lòng nhập số tài khoản!');
      return;
    }
    if (!formData.account_name.trim()) {
      setFormError('Vui lòng nhập tên chủ tài khoản!');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');

      const payload = {
        ...formData,
        account_name: formData.account_name.trim().toUpperCase()
      };

      if (editingAccount) {
        await api.updateBankAccount(editingAccount.id, payload);
      } else {
        await api.createBankAccount(payload);
      }

      setModalOpen(false);
      await fetchBankAccounts();
    } catch (err) {
      console.error('Save bank account error:', err);
      setFormError(err.response?.data?.message || err.message || 'Lỗi khi lưu tài khoản');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (acc) => {
    const res = await setDefaultAccount(acc.id);
    if (!res.success && res.message) {
      alert('Không thể đặt làm mặc định: ' + res.message);
    }
  };

  const handleDelete = async (acc) => {
    const confirmMsg = t('admin.cashbook.deleteConfirmBank') || `Bạn có chắc chắn muốn xóa tài khoản ${acc.bank_code} - ${acc.account_number} không?`;
    if (!window.confirm(confirmMsg)) return;

    const res = await deleteAccount(acc.id);
    if (!res.success && res.message) {
      alert('Không thể xóa tài khoản: ' + res.message);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenPreview = (acc) => {
    setSelectedAccount(acc);
    setPreviewAmount('50000');
    setPreviewNote(`QUAN TRA ${acc.bank_code}`);
    setPreviewModalOpen(true);
  };

  // Generate VietQR URL
  const getVietQrUrl = (bin, accNum, amount = 0, content = '', template = 'compact2', name = '') => {
    const cleanAmount = parseInt(amount, 10) || 0;
    const url = new URL(`https://img.vietqr.io/image/${bin}-${accNum}-${template}.png`);
    if (cleanAmount > 0) url.searchParams.set('amount', cleanAmount);
    if (content) url.searchParams.set('addInfo', content);
    if (name) url.searchParams.set('accountName', name);
    return url.toString();
  };

  return (
    <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '24px', overflowY: 'auto' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Top Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div>
            <h1 style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 6px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <CreditCard size={24} color="#1B5E20" />
              <span>{t('admin.cashbook.bankAccountsTitle') || 'Thiết lập tài khoản ngân hàng & VietQR'}</span>
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              {t('admin.cashbook.bankAccountsSubtitle') || 'Quản lý tài khoản ngân hàng nhận tiền chuyển khoản tự động qua mã VietQR tại quầy thu ngân'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#1B5E20',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 18px',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(27, 94, 32, 0.3)',
              transition: 'background-color 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2E7D32'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1B5E20'}
          >
            <Plus size={18} />
            <span>{t('admin.cashbook.addBankAccount') || 'Thêm tài khoản ngân hàng'}</span>
          </button>
        </div>

        {/* Guidance / Information Banner */}
        <div style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '10px',
          padding: '14px 18px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <ShieldCheck size={22} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '13px', color: '#1e40af', lineHeight: '1.6' }}>
            <strong>{t('admin.cashbook.bannerTitle') || 'Chuẩn thanh toán quốc gia VietQR (NAPAS):'}</strong>{' '}
            {t('admin.cashbook.bannerDesc') || 'Quán có thể thêm mọi tài khoản ngân hàng tại Việt Nam (MB, Vietcombank, Techcombank, BIDV, ACB,...). Mã QR sẽ tự động được tạo theo chuẩn VietQR hiển thị trực tiếp tại màn hình thanh toán Thu ngân (POS). Khách hàng có thể mở bất kỳ ứng dụng ngân hàng hoặc ví điện tử nào để quét và tự động điền đúng số tiền và nội dung bàn, hoàn toàn miễn phí và không cần ký hợp đồng API ngân hàng phức tạp.'}
          </div>
        </div>

        {/* Bank Accounts Grid / Cards */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px auto', color: '#1B5E20' }} />
            <div>Đang tải danh sách tài khoản ngân hàng...</div>
          </div>
        ) : bankAccounts.length === 0 ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px dashed #cbd5e1',
            padding: '48px 24px',
            textAlign: 'center'
          }}>
            <CreditCard size={48} color="#94a3b8" style={{ margin: '0 auto 16px auto' }} />
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Chưa có tài khoản ngân hàng nào
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              Hãy thêm ít nhất một tài khoản ngân hàng để hệ thống tự động tạo mã VietQR tại quầy thu ngân.
            </div>
            <button
              type="button"
              onClick={handleOpenAdd}
              style={{
                backgroundColor: '#1B5E20',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '9px 18px',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              + Thêm tài khoản đầu tiên
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '20px'
          }}>
            {bankAccounts.map((acc) => {
              const bankInfo = VIETNAM_BANKS.find(b => b.code === acc.bank_code) || {
                color: '#1B5E20',
                shortName: acc.bank_code
              };
              const isDefault = !!acc.is_default;

              return (
                <div
                  key={acc.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: isDefault ? '2px solid #1B5E20' : '1px solid #e2e8f0',
                    boxShadow: isDefault ? '0 8px 20px -4px rgba(27, 94, 32, 0.18)' : '0 2px 6px rgba(0,0,0,0.04)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'transform 0.15s, box-shadow 0.15s'
                  }}
                >
                  {/* Default Ribbon / Badge */}
                  {isDefault && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: '#ecfdf5',
                      color: '#059669',
                      border: '1px solid #a7f3d0',
                      borderRadius: '16px',
                      padding: '3px 10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Star size={12} fill="#059669" color="#059669" />
                      <span>{t('admin.cashbook.defaultBadge') || 'Mặc định (VietQR)'}</span>
                    </div>
                  )}

                  {/* Card Header with Bank Color / Code */}
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px'
                  }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      backgroundColor: bankInfo.color || '#1B5E20',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: 800,
                      letterSpacing: '0.5px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                    }}>
                      {acc.bank_code}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, paddingRight: isDefault ? '90px' : '0' }}>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {bankInfo.shortName || acc.bank_name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        BIN: {acc.bin} • {acc.branch || 'Toàn quốc'}
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '16px 20px', flex: 1 }}>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '11.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '3px' }}>
                        {t('admin.cashbook.accountNumber') || 'Số tài khoản'}
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '6px 10px'
                      }}>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.8px' }}>
                          {acc.account_number}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(acc.account_number, acc.id)}
                          title="Sao chép số tài khoản"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: copiedId === acc.id ? '#059669' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '3px 6px',
                            borderRadius: '4px',
                            backgroundColor: copiedId === acc.id ? '#ecfdf5' : '#ffffff',
                            border: '1px solid #cbd5e1'
                          }}
                        >
                          {copiedId === acc.id ? (
                            <>
                              <Check size={13} color="#059669" />
                              <span>Đã chép</span>
                            </>
                          ) : (
                            <>
                              <Copy size={13} />
                              <span>Chép</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>
                        {t('admin.cashbook.accountName') || 'Chủ tài khoản'}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                        {acc.account_name}
                      </div>
                    </div>

                    {acc.notes && (
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '10px', fontStyle: 'italic' }}>
                        {acc.notes}
                      </div>
                    )}
                  </div>

                  {/* Card Actions Footer */}
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#fafafa',
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px'
                  }}>
                    {/* View VietQR */}
                    <button
                      type="button"
                      onClick={() => handleOpenPreview(acc)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#0f172a',
                        cursor: 'pointer'
                      }}
                    >
                      <QrCode size={14} color="#1B5E20" />
                      <span>{t('admin.cashbook.qrPreview') || 'Mã VietQR'}</span>
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {/* Set Default */}
                      {!isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(acc)}
                          title="Đặt làm tài khoản nhận tiền mặc định"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#16a34a',
                            cursor: 'pointer'
                          }}
                        >
                          <Star size={13} />
                          <span>Mặc định</span>
                        </button>
                      )}

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(acc)}
                        title="Chỉnh sửa tài khoản"
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '6px 8px',
                          color: '#475569',
                          cursor: 'pointer'
                        }}
                      >
                        <Edit2 size={14} />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(acc)}
                        title="Xóa tài khoản"
                        style={{
                          background: '#ffffff',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          padding: '6px 8px',
                          color: '#dc2626',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── CẤU HÌNH WEBHOOK SEPAY (TỰ ĐỘNG NHẬN TIỀN) ─── */}
        <div style={{
          marginTop: '36px',
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          overflow: 'hidden'
        }}>
          {/* Section Header */}
          <div style={{
            padding: '18px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            backgroundColor: '#fafafa'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#E8F5E9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Zap size={20} color="#1B5E20" />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {t('admin.cashbook.sepayTitle') || 'Cấu hình Webhook SePay (Tự động nhận tiền)'}
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                  {t('admin.cashbook.sepaySubtitle') || 'Khách chuyển khoản xong ➔ Máy POS tự động phát hiện tiền vào và đóng bàn mà thu ngân không cần chạm tay.'}
                </p>
              </div>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              border: '1px solid #a7f3d0',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700
            }}>
              <CheckCircle2 size={14} />
              <span>SePay Webhook Ready</span>
            </div>
          </div>

          <div style={{ padding: '22px 24px' }}>
            {/* Webhook URL bar */}
            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                {t('admin.cashbook.sepayWebhookUrl') || 'Đường dẫn Webhook nhận thông báo biến động số dư (Webhook URL):'}
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '6px 10px'
              }}>
                <code style={{
                  flex: 1,
                  fontSize: '13.5px',
                  fontFamily: 'monospace',
                  color: '#1B5E20',
                  fontWeight: 700,
                  wordBreak: 'break-all'
                }}>
                  {webhookUrl}
                </code>
                <button
                  type="button"
                  onClick={handleCopyWebhookUrl}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: webhookCopied ? '#059669' : '#1B5E20',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background-color 0.15s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {webhookCopied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{webhookCopied ? (t('admin.cashbook.copied') || 'Đã sao chép!') : (t('admin.cashbook.copyUrl') || 'Sao chép URL')}</span>
                </button>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                {t('admin.cashbook.sepayWebhookHint') || 'Dán đường dẫn này vào cấu hình Webhook tại SePay (sepay.vn).'}
              </div>
            </div>

            {/* SePay Guide Information */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                  {t('admin.cashbook.sepayGuideTitle') || 'Hướng dẫn kết nối SePay (sepay.vn):'}
                </div>
                <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
                  {t('admin.cashbook.sepayGuideDesc') || 'Đăng ký tài khoản tại sepay.vn ➔ Thêm tài khoản ngân hàng của quán ➔ Vào mục Tích hợp Webhook ➔ Dán link Webhook ở trên vào là xong.'}
                </div>
              </div>
            </div>

            {/* Test Simulation Tool */}
            <div style={{
              backgroundColor: '#ecfdf5',
              border: '1.5px dashed #059669',
              borderRadius: '10px',
              padding: '16px 18px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Play size={16} color="#059669" />
                <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#065f46' }}>
                  Công cụ thử nghiệm giả lập nhận tiền (Test Simulator)
                </span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#047857', margin: '0 0 12px 0' }}>
                Bạn có thể bấm thử nút dưới đây để kiểm tra máy POS tự động gạch nợ và đóng bàn ra sao:
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#065f46' }}>Số bàn:</span>
                  <input
                    type="text"
                    value={testTableNum}
                    onChange={e => setTestTableNum(e.target.value)}
                    style={{
                      width: '60px',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: '1px solid #a7f3d0',
                      fontSize: '13px',
                      fontWeight: 700,
                      textAlign: 'center'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#065f46' }}>Số tiền (VNĐ):</span>
                  <input
                    type="number"
                    value={testAmount}
                    onChange={e => setTestAmount(e.target.value)}
                    style={{
                      width: '120px',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: '1px solid #a7f3d0',
                      fontSize: '13px',
                      fontWeight: 700
                    }}
                  />
                </div>

                <button
                  type="button"
                  disabled={testingWebhook}
                  onClick={handleTestSimulate}
                  style={{
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '7px 16px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(5, 150, 105, 0.25)'
                  }}
                >
                  {testingWebhook ? 'Đang gửi...' : '⚡ Bắn thử tín hiệu nhận tiền (Simulate)'}
                </button>
              </div>

              {testResult && (
                <div style={{
                  marginTop: '12px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: testResult.success ? '#d1fae5' : '#fee2e2',
                  color: testResult.success ? '#065f46' : '#991b1b',
                  fontSize: '12.5px',
                  fontWeight: 600
                }}>
                  {testResult.message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── MODAL THÊM / SỬA TÀI KHOẢN NGÂN HÀNG ─── */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '620px',
            boxShadow: '0 20px 40px -8px rgba(0,0,0,0.25)',
            overflow: 'hidden',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 22px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CreditCard size={20} color="#1B5E20" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {editingAccount
                    ? (t('admin.cashbook.editBankAccount') || 'Chỉnh sửa tài khoản ngân hàng')
                    : (t('admin.cashbook.addBankAccount') || 'Thêm tài khoản ngân hàng mới')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} style={{ overflowY: 'auto', padding: '20px 22px' }}>
              {formError && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#b91c1c',
                  fontSize: '13px',
                  marginBottom: '16px'
                }}>
                  {formError}
                </div>
              )}

              {/* Ngân hàng chọn */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  {t('admin.cashbook.bankName') || 'Ngân hàng thụ hưởng'} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={formData.bank_code}
                  onChange={handleBankSelect}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    color: '#0f172a',
                    backgroundColor: '#ffffff',
                    outline: 'none'
                  }}
                >
                  {VIETNAM_BANKS.map(b => (
                    <option key={b.code} value={b.code}>
                      {b.shortName} - {b.name} (BIN: {b.bin})
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
                  Mã BIN NAPAS: <strong>{formData.bin}</strong> • Mã ngân hàng: <strong>{formData.bank_code}</strong>
                </div>
              </div>

              {/* Số tài khoản */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  {t('admin.cashbook.accountNumber') || 'Số tài khoản'} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 19006888 hoặc 0011001234567"
                  value={formData.account_number}
                  onChange={e => setFormData({ ...formData, account_number: e.target.value.replace(/[^0-9a-zA-Z]/g, '') })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    color: '#0f172a',
                    outline: 'none',
                    letterSpacing: '0.5px',
                    fontWeight: 600,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Tên chủ tài khoản */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  {t('admin.cashbook.accountName') || 'Tên chủ tài khoản (In hoa không dấu)'} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: QUAN TRA hoặc NGUYEN VAN A"
                  value={formData.account_name}
                  onChange={e => setFormData({ ...formData, account_name: e.target.value.toUpperCase() })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    color: '#0f172a',
                    outline: 'none',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Chi nhánh & Ghi chú */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    {t('admin.cashbook.accountBranch') || 'Chi nhánh (Tùy chọn)'}
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Chi nhánh Phú Quốc"
                    value={formData.branch}
                    onChange={e => setFormData({ ...formData, branch: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13.5px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Ghi chú
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Tài khoản chính"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13.5px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Checkbox Đặt làm mặc định */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer'
              }}
              onClick={() => setFormData({ ...formData, is_default: !formData.is_default })}
              >
                <input
                  type="checkbox"
                  id="is_default_checkbox"
                  checked={formData.is_default}
                  onChange={e => setFormData({ ...formData, is_default: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#1B5E20', cursor: 'pointer' }}
                />
                <label htmlFor="is_default_checkbox" style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', cursor: 'pointer' }}>
                  {t('admin.cashbook.isDefaultAccount') || 'Đặt làm tài khoản nhận tiền mặc định (VietQR POS)'}
                </label>
              </div>

              {/* VietQR Live Preview inside Form */}
              {formData.account_number && (
                <div style={{
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}>
                  <img
                    src={getVietQrUrl(formData.bin, formData.account_number, 10000, 'TEST POS', 'compact2', formData.account_name)}
                    alt="VietQR Preview"
                    style={{
                      width: '75px',
                      height: '75px',
                      borderRadius: '6px',
                      border: '1px solid #059669',
                      backgroundColor: '#ffffff'
                    }}
                  />
                  <div style={{ fontSize: '12px', color: '#065f46' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '2px' }}>
                      Xem trước mã VietQR tự động
                    </div>
                    <div>Hệ thống sẽ dùng mã QR này trên màn hình thanh toán thu ngân. Quét được tức thì bằng 100% ứng dụng ngân hàng.</div>
                  </div>
                </div>
              )}

              {/* Modal Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid #e2e8f0'
              }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '9px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#1B5E20',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(27, 94, 32, 0.3)'
                  }}
                >
                  {submitting ? 'Đang lưu...' : (editingAccount ? 'Cập nhật tài khoản' : 'Thêm tài khoản')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL XEM TRƯỚC MÃ VIETQR MẪU ─── */}
      {previewModalOpen && selectedAccount && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '460px',
            boxShadow: '0 20px 40px -8px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            textAlign: 'center'
          }}>
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc'
            }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={18} color="#1B5E20" />
                <span>Mã VietQR mẫu - {selectedAccount.bank_code}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* QR Image Container */}
            <div style={{ padding: '24px 20px' }}>
              <div style={{
                display: 'inline-block',
                padding: '12px',
                backgroundColor: '#ffffff',
                border: '2px solid #1B5E20',
                borderRadius: '14px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                marginBottom: '16px'
              }}>
                <img
                  src={getVietQrUrl(
                    selectedAccount.bin,
                    selectedAccount.account_number,
                    previewAmount,
                    previewNote,
                    'compact2',
                    selectedAccount.account_name
                  )}
                  alt="VietQR Standard"
                  style={{
                    width: '260px',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '8px'
                  }}
                />
              </div>

              {/* Account summary */}
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>
                {selectedAccount.bank_name}
              </div>
              <div style={{ fontSize: '13px', color: '#475569', marginBottom: '16px' }}>
                STK: <strong>{selectedAccount.account_number}</strong> • Chủ TK: <strong>{selectedAccount.account_name}</strong>
              </div>

              {/* Controls to test amount / note */}
              <div style={{
                backgroundColor: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                padding: '12px 14px',
                textAlign: 'left',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Thử nghiệm quét QR trên điện thoại
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: '#475569', display: 'block', marginBottom: '3px' }}>Số tiền (VNĐ):</label>
                    <input
                      type="number"
                      value={previewAmount}
                      onChange={e => setPreviewAmount(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        fontWeight: 600,
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: '#475569', display: 'block', marginBottom: '3px' }}>Nội dung:</label>
                    <input
                      type="text"
                      value={previewNote}
                      onChange={e => setPreviewNote(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        fontWeight: 600,
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <a
                  href={getVietQrUrl(
                    selectedAccount.bin,
                    selectedAccount.account_number,
                    previewAmount,
                    previewNote,
                    'compact2',
                    selectedAccount.account_name
                  )}
                  download={`VietQR-${selectedAccount.bank_code}-${selectedAccount.account_number}.png`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 18px',
                    borderRadius: '8px',
                    backgroundColor: '#1B5E20',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                >
                  <ExternalLink size={14} />
                  <span>Tải ảnh mã QR</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewModalOpen(false)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

