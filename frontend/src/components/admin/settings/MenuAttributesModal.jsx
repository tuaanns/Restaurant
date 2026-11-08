import React, { useState, useEffect } from 'react';
import { Sliders, Plus, Search, Edit3, Trash2, X, RotateCcw, AlertCircle, Tag } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { ConfirmDeleteModal } from '../../modals/ConfirmDeleteModal';
import {
  getMenuAttributes,
  saveMenuAttributes,
  DEFAULT_MENU_ATTRIBUTES
} from '../../../utils/menuSettingsHelper';

export function MenuAttributesModal({ isOpen, onClose, onAttributesChanged }) {
  const { t } = useLanguage();
  const [attributes, setAttributes] = useState(() => getMenuAttributes());
  const [searchTerm, setSearchTerm] = useState('');

  // Form edit / add state
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    desc: '',
    values: []
  });
  const [newValueInput, setNewValueInput] = useState('');
  const [formError, setFormError] = useState('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setAttributes(getMenuAttributes());
      setIsEditing(false);
      setEditingId(null);
      setFormError('');
      setSearchTerm('');
      setNewValueInput('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredAttributes = attributes.filter(attr => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return attr.name.toLowerCase().includes(q) ||
      (attr.desc && attr.desc.toLowerCase().includes(q)) ||
      (attr.values && attr.values.some(v => v.toLowerCase().includes(q)));
  });

  const handleStartAdd = () => {
    setEditingId(null);
    setFormData({ name: '', desc: '', values: [] });
    setNewValueInput('');
    setFormError('');
    setIsEditing(true);
  };

  const handleStartEdit = (attr) => {
    setEditingId(attr.id);
    setFormData({
      name: attr.name,
      desc: attr.desc || '',
      values: Array.isArray(attr.values) ? [...attr.values] : []
    });
    setNewValueInput('');
    setFormError('');
    setIsEditing(true);
  };

  const handleCancelForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormError('');
    setNewValueInput('');
  };

  const handleAddValueChip = () => {
    const trimmed = newValueInput.trim();
    if (!trimmed) return;
    if (formData.values.includes(trimmed)) {
      setNewValueInput('');
      return;
    }
    setFormData({
      ...formData,
      values: [...formData.values, trimmed]
    });
    setNewValueInput('');
  };

  const handleRemoveValueChip = (valToRemove) => {
    setFormData({
      ...formData,
      values: formData.values.filter(v => v !== valToRemove)
    });
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setFormError(t('admin.settings.attrNameRequired') || 'Vui lòng nhập tên thuộc tính');
      return;
    }

    const isDup = attributes.some(a => a.id !== editingId && a.name.toLowerCase() === trimmedName.toLowerCase());
    if (isDup) {
      setFormError(t('admin.settings.attrDuplicate') || 'Tên thuộc tính này đã tồn tại');
      return;
    }

    let finalValues = [...formData.values];
    if (newValueInput.trim() && !finalValues.includes(newValueInput.trim())) {
      finalValues.push(newValueInput.trim());
    }

    let updatedList;
    if (editingId) {
      updatedList = attributes.map(item => item.id === editingId ? {
        ...item,
        name: trimmedName,
        desc: formData.desc.trim(),
        values: finalValues
      } : item);
    } else {
      const newAttr = {
        id: `attr_${Date.now()}`,
        name: trimmedName,
        desc: formData.desc.trim(),
        values: finalValues
      };
      updatedList = [newAttr, ...attributes];
    }

    setAttributes(updatedList);
    saveMenuAttributes(updatedList);
    if (onAttributesChanged) onAttributesChanged(updatedList);
    setIsEditing(false);
    setEditingId(null);
    setFormError('');
    setNewValueInput('');
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const updatedList = attributes.filter(item => item.id !== deleteTarget.id);
    setAttributes(updatedList);
    saveMenuAttributes(updatedList);
    if (onAttributesChanged) onAttributesChanged(updatedList);
    setDeleteTarget(null);
  };

  const handleResetDefaults = () => {
    setAttributes(DEFAULT_MENU_ATTRIBUTES);
    saveMenuAttributes(DEFAULT_MENU_ATTRIBUTES);
    if (onAttributesChanged) onAttributesChanged(DEFAULT_MENU_ATTRIBUTES);
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
              <Sliders size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                {t('admin.settings.manageAttributes') || 'Quản lý Thuộc tính & Biến thể'}
              </h2>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                {attributes.length} {t('admin.settings.attributeCountSuffix') || 'thuộc tính'} ({t('admin.settings.itemAttributesDesc') || 'Quản lý các biến thể của món theo thuộc tính size, mức đường, mức đá...'})
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
              placeholder={t('admin.settings.searchAttrPlaceholder') || 'Tìm kiếm thuộc tính hoặc giá trị...'}
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
              title={t('admin.settings.resetDefaults') || 'Khôi phục mặc định'}
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
              <span>{t('admin.settings.addAttribute') || 'Thêm thuộc tính'}</span>
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
                  {editingId ? (t('admin.settings.editAttribute') || 'Chỉnh sửa thuộc tính') : (t('admin.settings.addAttribute') || 'Thêm thuộc tính mới')}
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
                      {t('admin.settings.attrName') || 'Tên thuộc tính'} *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => {
                        setFormData({ ...formData, name: e.target.value });
                        if (formError) setFormError('');
                      }}
                      placeholder={t('admin.settings.attrNamePlaceholder') || 'Ví dụ: Kích cỡ (Size), Độ cay, Topping...'}
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
                      {t('admin.settings.attrDesc') || 'Mô tả'}
                    </label>
                    <input
                      type="text"
                      value={formData.desc}
                      onChange={e => setFormData({ ...formData, desc: e.target.value })}
                      placeholder={t('admin.settings.attrDescPlaceholder') || 'Ví dụ: Biến thể chọn khi phục vụ...'}
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

                {/* Values Chips */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    {t('admin.settings.attrValues') || 'Các giá trị biến thể lựa chọn'}
                  </label>
                  
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      value={newValueInput}
                      onChange={e => setNewValueInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddValueChip();
                        }
                      }}
                      placeholder={t('admin.settings.addValueHint') || 'Nhập giá trị (ví dụ: Size Lớn, Ít đá...) và bấm Enter'}
                      style={{
                        flex: 1,
                        padding: '7px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12.5px',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddValueChip}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '6px',
                        border: '1px solid #1B5E20',
                        backgroundColor: '#E8F5E9',
                        color: '#1B5E20',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {t('add') || '+ Thêm'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', minHeight: '32px' }}>
                    {formData.values.length === 0 ? (
                      <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                        {t('admin.settings.noValuesYet') || 'Chưa có giá trị nào. Bạn có thể thêm sau khi cần.'}
                      </span>
                    ) : (
                      formData.values.map((val, idx) => (
                        <span
                          key={idx}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px 4px 10px',
                            borderRadius: '9999px',
                            backgroundColor: '#f1f5f9',
                            color: '#1e293b',
                            fontSize: '12px',
                            fontWeight: 600,
                            border: '1px solid #cbd5e1'
                          }}
                        >
                          <span>{val}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveValueChip(val)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: '1px',
                              cursor: 'pointer',
                              color: '#64748b',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))
                    )}
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

          {/* Attributes Table */}
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
                  <th style={{ padding: '10px 16px', fontWeight: 700, color: '#475569', width: '200px' }}>
                    {t('admin.settings.attrName') || 'Thuộc tính'}
                  </th>
                  <th style={{ padding: '10px 16px', fontWeight: 700, color: '#475569' }}>
                    {t('admin.settings.attrValues') || 'Giá trị biến thể'}
                  </th>
                  <th style={{ padding: '10px 16px', fontWeight: 700, color: '#475569', width: '110px', textAlign: 'center' }}>
                    {t('actions') || 'Thao tác'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAttributes.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                      {t('admin.settings.noAttributesFound') || 'Chưa có thuộc tính nào. Bấm "+ Thêm thuộc tính" khi có nhu cầu.'}
                    </td>
                  </tr>
                ) : (
                  filteredAttributes.map((attr) => (
                    <tr
                      key={attr.id}
                      style={{ borderBottom: '1px solid #f1f5f9' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{attr.name}</div>
                        {attr.desc && (
                          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>{attr.desc}</div>
                        )}
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {Array.isArray(attr.values) && attr.values.length > 0 ? (
                            attr.values.map((v, i) => (
                              <span
                                key={i}
                                style={{
                                  display: 'inline-block',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  backgroundColor: '#E8F5E9',
                                  color: '#1B5E20',
                                  fontSize: '11.5px',
                                  fontWeight: 600,
                                  border: '1px solid #C8E6C9'
                                }}
                              >
                                {v}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '12px' }}>
                              {t('admin.settings.noValuesDefined') || '(Chưa gán giá trị biến thể)'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => handleStartEdit(attr)}
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
                            onClick={() => setDeleteTarget(attr)}
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
            {t('admin.settings.attrHint') || 'Thuộc tính cho phép tùy biến biến thể món khi gọi món và in phiếu'}
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
        title={t('admin.settings.confirmDeleteAttrTitle') || 'Xác nhận xóa thuộc tính'}
        message={t('admin.settings.confirmDeleteAttrMsg') || 'Bạn có chắc chắn muốn xóa thuộc tính này không?'}
        itemName={deleteTarget ? deleteTarget.name : ''}
        confirmText={t('delete') || 'Xóa'}
        cancelText={t('cancel') || 'Hủy'}
      />
    </div>
  );
}
