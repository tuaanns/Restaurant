import React, { useState, useEffect } from 'react';
import { Layers, Plus, Search, Edit3, Trash2, X, RotateCcw, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { ConfirmDeleteModal } from '../../modals/ConfirmDeleteModal';
import {
  getMenuUnits,
  saveMenuUnits,
  DEFAULT_MENU_UNITS
} from '../../../utils/menuSettingsHelper';

export function MenuUnitsModal({ isOpen, onClose, onUnitsChanged }) {
  const { t, formatDishUnit } = useLanguage();
  const [units, setUnits] = useState(() => getMenuUnits());
  const [searchTerm, setSearchTerm] = useState('');

  // Form edit / add state
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    desc: ''
  });
  const [formError, setFormError] = useState('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setUnits(getMenuUnits());
      setIsEditing(false);
      setEditingId(null);
      setFormError('');
      setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredUnits = units.filter(unit => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return unit.name.toLowerCase().includes(q) || (unit.desc && unit.desc.toLowerCase().includes(q));
  });

  const handleStartAdd = () => {
    setEditingId(null);
    setFormData({ name: '', desc: '' });
    setFormError('');
    setIsEditing(true);
  };

  const handleStartEdit = (unit) => {
    setEditingId(unit.id);
    setFormData({
      name: unit.name,
      desc: unit.desc || ''
    });
    setFormError('');
    setIsEditing(true);
  };

  const handleCancelForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormError('');
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setFormError(t('admin.settings.unitNameRequired') || 'Vui lòng nhập tên đơn vị tính');
      return;
    }

    // Check duplicate
    const isDup = units.some(u => u.id !== editingId && u.name.toLowerCase() === trimmedName.toLowerCase());
    if (isDup) {
      setFormError(t('admin.settings.unitDuplicate') || 'Đơn vị tính này đã tồn tại trong danh sách');
      return;
    }

    let updatedList;
    if (editingId) {
      updatedList = units.map(item => item.id === editingId ? {
        ...item,
        name: trimmedName,
        desc: formData.desc.trim()
      } : item);
    } else {
      const newUnit = {
        id: `unit_${Date.now()}`,
        name: trimmedName,
        desc: formData.desc.trim()
      };
      updatedList = [newUnit, ...units];
    }

    setUnits(updatedList);
    saveMenuUnits(updatedList);
    if (onUnitsChanged) onUnitsChanged(updatedList);
    setIsEditing(false);
    setEditingId(null);
    setFormError('');
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const updatedList = units.filter(item => item.id !== deleteTarget.id);
    setUnits(updatedList);
    saveMenuUnits(updatedList);
    if (onUnitsChanged) onUnitsChanged(updatedList);
    setDeleteTarget(null);
  };

  const handleResetDefaults = () => {
    setUnits(DEFAULT_MENU_UNITS);
    saveMenuUnits(DEFAULT_MENU_UNITS);
    if (onUnitsChanged) onUnitsChanged(DEFAULT_MENU_UNITS);
    setIsEditing(false);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 500,
        padding: '16px'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '780px',
          maxWidth: '96vw',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#E8F5E9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1B5E20'
            }}>
              <Layers size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                {t('admin.settings.manageUnits') || 'Quản lý Đơn vị tính'}
              </h2>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                {units.length} {t('admin.settings.unitCountSuffix') || 'đơn vị tính của quán'} ({t('admin.settings.unitSettingDesc') || 'Quản lý món, hàng hóa theo đơn vị bán hoặc nhập như phần, dĩa, tô, ấm, ly...'})
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              color: '#94a3b8',
              borderRadius: '6px'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Toolbar: Search + Add button */}
        <div style={{
          padding: '14px 24px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          backgroundColor: '#ffffff'
        }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '340px' }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={t('admin.settings.searchUnitPlaceholder') || 'Tìm kiếm đơn vị tính...'}
              style={{
                width: '100%',
                padding: '7px 12px 7px 32px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '12.5px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleResetDefaults}
              title={t('admin.settings.resetDefaultUnits') || 'Khôi phục danh sách đơn vị của quán'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#64748b',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              <RotateCcw size={13} />
              <span>{t('admin.settings.resetDefaults') || 'Mặc định'}</span>
            </button>

            <button
              onClick={handleStartAdd}
              disabled={isEditing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                backgroundColor: '#1B5E20',
                color: '#ffffff',
                border: 'none',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: isEditing ? 'not-allowed' : 'pointer',
                opacity: isEditing ? 0.6 : 1
              }}
              onMouseEnter={e => { if (!isEditing) e.currentTarget.style.backgroundColor = '#2E7D32'; }}
              onMouseLeave={e => { if (!isEditing) e.currentTarget.style.backgroundColor = '#1B5E20'; }}
            >
              <Plus size={15} />
              <span>{t('admin.settings.addUnit') || 'Thêm đơn vị tính'}</span>
            </button>
          </div>
        </div>

        {/* Content Body: Table or Form */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', backgroundColor: '#fafbfc' }}>
          
          {/* Add / Edit Form Panel */}
          {isEditing && (
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              border: '1.5px solid #1B5E20',
              padding: '16px 20px',
              marginBottom: '16px',
              boxShadow: '0 4px 12px rgba(27, 94, 32, 0.08)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                  {editingId ? (t('admin.settings.editUnit') || 'Chỉnh sửa đơn vị tính') : (t('admin.settings.addUnit') || 'Thêm đơn vị tính mới')}
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  * {t('admin.settings.requiredFields') || 'Bắt buộc'}
                </span>
              </div>

              {formError && (
                <div style={{
                  padding: '8px 12px',
                  backgroundColor: '#fee2e2',
                  color: '#b91c1c',
                  borderRadius: '6px',
                  fontSize: '12px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <AlertCircle size={14} />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSaveForm}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                      {t('admin.settings.unitName') || 'Tên đơn vị tính'} *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => {
                        setFormData({ ...formData, name: e.target.value });
                        if (formError) setFormError('');
                      }}
                      placeholder={t('admin.settings.unitNamePlaceholder') || 'Ví dụ: phần, dĩa, tô, ấm, ly...'}
                      autoFocus
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

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                      {t('admin.settings.unitDesc') || 'Mô tả / Nhóm món áp dụng'}
                    </label>
                    <input
                      type="text"
                      value={formData.desc}
                      onChange={e => setFormData({ ...formData, desc: e.target.value })}
                      placeholder={t('admin.settings.unitDescPlaceholder') || 'Ví dụ: Khẩu phần cơm, trà ấm nóng, nước ép...'}
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

                {/* Form Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#475569',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {t('cancel') || 'Hủy'}
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '6px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: '#1B5E20',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {editingId ? (t('admin.settings.update') || 'Cập nhật') : (t('admin.settings.create') || 'Tạo mới')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Units Table */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '10px 16px', fontWeight: 700, color: '#475569', width: '180px' }}>
                    {t('admin.settings.unitName') || 'Đơn vị tính'}
                  </th>
                  <th style={{ padding: '10px 16px', fontWeight: 700, color: '#475569', width: '160px' }}>
                    {t('admin.settings.unitLocalized') || 'Bản dịch hệ thống'}
                  </th>
                  <th style={{ padding: '10px 16px', fontWeight: 700, color: '#475569' }}>
                    {t('admin.settings.unitDesc') || 'Mô tả'}
                  </th>
                  <th style={{ padding: '10px 16px', fontWeight: 700, color: '#475569', width: '110px', textAlign: 'center' }}>
                    {t('actions') || 'Thao tác'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUnits.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                      {t('admin.settings.noUnitsFound') || 'Không tìm thấy đơn vị tính nào'}
                    </td>
                  </tr>
                ) : (
                  filteredUnits.map((u) => (
                    <tr
                      key={u.id}
                      style={{ borderBottom: '1px solid #f1f5f9' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '3px 10px',
                          borderRadius: '6px',
                          backgroundColor: '#E8F5E9',
                          color: '#1B5E20',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          border: '1px solid #A5D6A7'
                        }}>
                          {u.name}
                        </span>
                      </td>
                      <td style={{ padding: '10px 16px', color: '#2E7D32', fontSize: '12px', fontWeight: 600 }}>
                        {formatDishUnit ? formatDishUnit(u.name) : u.name}
                      </td>
                      <td style={{ padding: '10px 16px', color: '#64748b', fontSize: '12.5px' }}>
                        {u.desc || '—'}
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => handleStartEdit(u)}
                            title={t('edit') || 'Sửa'}
                            style={{
                              padding: '5px',
                              borderRadius: '4px',
                              border: '1px solid #e2e8f0',
                              backgroundColor: '#ffffff',
                              color: '#0284C7',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(u)}
                            title={t('delete') || 'Xóa'}
                            style={{
                              padding: '5px',
                              borderRadius: '4px',
                              border: '1px solid #e2e8f0',
                              backgroundColor: '#ffffff',
                              color: '#ef4444',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#ffffff'
        }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            {t('admin.settings.unitAutoSync') || 'Đơn vị tính của quán được áp dụng trực tiếp khi tạo món, nhập kho và in hóa đơn'}
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '7px 20px',
              borderRadius: '8px',
              backgroundColor: '#1B5E20',
              color: '#ffffff',
              border: 'none',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {t('close') || 'Đóng'}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={t('admin.settings.confirmDeleteUnitTitle') || 'Xác nhận xóa đơn vị tính'}
        message={t('admin.settings.confirmDeleteUnitMsg') || 'Bạn có chắc chắn muốn xóa đơn vị tính này không?'}
        itemName={deleteTarget ? deleteTarget.name : ''}
        confirmText={t('delete') || 'Xóa'}
        cancelText={t('cancel') || 'Hủy'}
      />
    </div>
  );
}

