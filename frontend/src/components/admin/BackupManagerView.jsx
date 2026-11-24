import React, { useState, useEffect } from 'react';
import {
  Database, Download, Trash2, RefreshCw, ShieldCheck, CheckCircle2,
  Clock, AlertTriangle, FileText, HardDrive, Plus, ArrowDownToLine,
  Calendar, Layers, Check, Info
} from 'lucide-react';
import { api } from '../../api';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';

export function BackupManagerView() {
  const [backups, setBackups] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalSize, setTotalSize] = useState('0 B');
  const [hasBackupToday, setHasBackupToday] = useState(false);
  const [lastBackup, setLastBackup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadBackups = async () => {
    setIsLoading(true);
    try {
      const res = await api.getBackups();
      if (res && res.success) {
        setBackups(res.backups || []);
        setTotalCount(res.total_count || 0);
        setTotalSize(res.total_size_formatted || '0 B');
        setHasBackupToday(res.has_backup_today || false);
        setLastBackup(res.last_backup || null);
      }
    } catch (err) {
      showToast('Không thể tải danh sách sao lưu!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const handleCreateBackup = async () => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const res = await api.createBackup('manual');
      if (res && res.success) {
        showToast('✓ Đã tạo bản sao lưu CSDL thành công!');
        await loadBackups();
      } else {
        showToast(res.message || 'Lỗi khi tạo sao lưu', 'error');
      }
    } catch (err) {
      showToast('Lỗi khi tạo bản sao lưu CSDL', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDownload = (filename) => {
    const token = sessionStorage.getItem('pos_token') || localStorage.getItem('pos_token') || '';
    const url = api.getBackupDownloadUrl(filename);
    
    // Tạo thẻ a và click để tải file
    fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Download failed');
        return res.blob();
      })
      .then(blob => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        showToast(`Đã bắt đầu tải về: ${filename}`);
      })
      .catch(() => {
        showToast('Không thể tải về tệp sao lưu!', 'error');
      });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await api.deleteBackup(deleteTarget.filename);
      if (res && res.success) {
        showToast(`Đã xóa bản sao lưu ${deleteTarget.filename}`);
        setDeleteTarget(null);
        await loadBackups();
      } else {
        showToast(res.message || 'Lỗi khi xóa bản sao lưu', 'error');
      }
    } catch (err) {
      showToast('Không thể xóa bản sao lưu này', 'error');
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'inherit' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          backgroundColor: toastMessage.type === 'error' ? '#ef4444' : '#10b981',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          fontWeight: 600
        }}>
          {toastMessage.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={24} color="#1B5E20" />
            Sao Lưu & Phục Hồi Cơ Sở Dữ Liệu
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
            Quản lý các bản sao lưu an toàn của cơ sở dữ liệu MySQL (Thực đơn, Hóa đơn, Sổ quỹ, Khách hàng)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={loadBackups}
            disabled={isLoading}
            style={{
              padding: '9px 15px',
              borderRadius: '7px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            Làm mới
          </button>

          <button
            onClick={handleCreateBackup}
            disabled={isCreating}
            style={{
              padding: '9px 18px',
              borderRadius: '7px',
              border: 'none',
              backgroundColor: '#1B5E20',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: isCreating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 6px rgba(27,94,32,0.25)',
              opacity: isCreating ? 0.7 : 1
            }}
          >
            {isCreating ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            {isCreating ? 'Đang xuất CSDL...' : 'Sao lưu ngay (1-Click)'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Card 1: Trạng thái bảo vệ */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '18px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            backgroundColor: hasBackupToday ? '#dcfce7' : '#fef3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: hasBackupToday ? '#15803d' : '#b45309'
          }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Trạng thái bảo vệ hôm nay</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: hasBackupToday ? '#15803d' : '#b45309', marginTop: '2px' }}>
              {hasBackupToday ? 'Đã sao lưu hôm nay' : 'Chưa sao lưu hôm nay'}
            </div>
          </div>
        </div>

        {/* Card 2: Tổng số bản lưu */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '18px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            backgroundColor: '#e0f2fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0369a1'
          }}>
            <Layers size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Tổng số bản lưu trữ</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
              {totalCount} bản tệp SQL
            </div>
          </div>
        </div>

        {/* Card 3: Dung lượng lưu trữ */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '18px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            backgroundColor: '#f3e8ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#7e22ce'
          }}>
            <HardDrive size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Tổng dung lượng lưu</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
              {totalSize}
            </div>
          </div>
        </div>

        {/* Card 4: Bản lưu gần nhất */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '18px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            backgroundColor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569'
          }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Lần sao lưu gần nhất</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
              {lastBackup ? lastBackup.created_at_formatted : 'Chưa có'}
            </div>
          </div>
        </div>
      </div>

      {/* Informational banner */}
      <div style={{
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '13px',
        color: '#166534'
      }}>
        <Info size={18} color="#16a34a" style={{ flexShrink: 0 }} />
        <span>
          <strong>Lưu ý an toàn:</strong> Tệp sao lưu CSDL chứa toàn bộ cấu trúc bảng và dữ liệu kinh doanh của quán. Hãy định kỳ tải tệp sao lưu về máy tính hoặc lưu lên Google Drive để phòng ngừa sự cố phần cứng hoặc virus.
        </span>
      </div>

      {/* Table Card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
            Danh Sách Tệp Sao Lưu ({backups.length})
          </h3>
        </div>

        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px' }} />
            <p style={{ margin: 0, fontSize: '13px' }}>Đang tải danh sách bản sao lưu...</p>
          </div>
        ) : backups.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            <Database size={36} color="#cbd5e1" style={{ margin: '0 auto 10px' }} />
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#64748b' }}>Chưa có bản sao lưu nào</p>
            <p style={{ margin: '4px 0 16px', fontSize: '12px' }}>Bấm nút "Sao lưu ngay" để tạo bản sao lưu dữ liệu đầu tiên.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>TÊN TỆP SAO LƯU</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>LOẠI</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>DUNG LƯỢNG</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>NGÀY TẠO</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600, textAlign: 'right' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((b, idx) => (
                  <tr
                    key={b.filename}
                    style={{
                      borderBottom: idx === backups.length - 1 ? 'none' : '1px solid #f1f5f9',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                  >
                    <td style={{ padding: '14px 20px', fontWeight: 600, color: '#1e293b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} color="#0284c7" />
                        <span>{b.filename}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: b.type === 'auto' ? '#f3e8ff' : '#e0f2fe',
                        color: b.type === 'auto' ? '#7e22ce' : '#0369a1'
                      }}>
                        {b.type_label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#475569', fontWeight: 500 }}>
                      {b.size_formatted}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>
                      {b.created_at_formatted}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => handleDownload(b.filename)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            color: '#1B5E20',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Tải về máy tính"
                        >
                          <Download size={14} />
                          Tải về
                        </button>

                        <button
                          onClick={() => setDeleteTarget(b)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid #fee2e2',
                            backgroundColor: '#fff5f5',
                            color: '#dc2626',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}
                          title="Xóa bản sao lưu này"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          isOpen={true}
          title="Xác nhận xóa bản sao lưu"
          message={`Bạn có chắc chắn muốn xóa bản sao lưu "${deleteTarget.filename}" (${deleteTarget.size_formatted}) không? Thao tác này không thể hoàn tác.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
