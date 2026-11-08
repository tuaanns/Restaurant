import React, { useState, useMemo, useEffect } from 'react';
import { Tag, Plus, Search, Edit3, Trash2, X, Check, RotateCcw, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { ConfirmDeleteModal } from '../../modals/ConfirmDeleteModal';
import {
  getMenuTags,
  saveMenuTags,
  DEFAULT_MENU_TAGS
} from '../../../utils/menuSettingsHelper';

const COLOR_PALETTE = [
  { name: 'Xanh lá rừng', color: '#1B5E20', bg: '#E8F5E9' },
  { name: 'Cam tươi', color: '#E65100', bg: '#FFF3E0' },
  { name: 'Đỏ ớt', color: '#DC2626', bg: '#FEE2E2' },
  { name: 'Xanh dương', color: '#0284C7', bg: '#E0F2FE' },
  { name: 'Vàng hổ phách', color: '#B45309', bg: '#FEF3C7' },
  { name: 'Tím hoàng gia', color: '#7E22CE', bg: '#F3E8FF' },
  { name: 'Lục bảo ngọc', color: '#059669', bg: '#D1FAE5' },
  { name: 'Xám đá slate', color: '#4B5563', bg: '#F3F4F6' },
  { name: 'Nâu đất', color: '#7C2D12', bg: '#FFEDD5' },
];

export function MenuTagsModal({ isOpen, onClose, onTagsChanged }) {
  const { t, lang } = useLanguage();
  const [tags, setTags] = useState(() => getMenuTags());
  const [searchTerm, setSearchTerm] = useState('');

  // Form edit / add state
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#1B5E20',
    bg: '#E8F5E9',
    desc: ''
  });
  const [formError, setFormError] = useState('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setTags(getMenuTags());
      setIsEditing(false);
      setEditingId(null);
      setFormError('');
      setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredTags = tags.filter(tag => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return tag.name.toLowerCase().includes(q) || (tag.desc && tag.desc.toLowerCase().includes(q));
  });

  const handleStartAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      color: '#1B5E20',
      bg: '#E8F5E9',
      desc: ''
    });
    setFormError('');
    setIsEditing(true);
  };

  const handleStartEdit = (tag) => {
    setEditingId(tag.id);
    setFormData({
      name: tag.name,
      color: tag.color || '#1B5E20',
      bg: tag.bg || '#E8F5E9',
      desc: tag.desc || ''
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
      setFormError(t('admin.settings.tagNameRequired') || 'Vui lòng nhập tên tag món');
      return;
    }

    // Check duplicate
    const isDup = tags.some(tItem => tItem.id !== editingId && tItem.name.toLowerCase() === trimmedName.toLowerCase());
    if (isDup) {
      setFormError(t('admin.settings.tagDuplicate') || 'Tên tag này đã tồn tại');
      return;
    }

    let updatedList;
    if (editingId) {
      // Edit
      updatedList = tags.map(item => item.id === editingId ? {
        ...item,
        name: trimmedName,
        color: formData.color,
        bg: formData.bg,
        desc: formData.desc.trim()
      } : item);
    } else {
      // Add
      const newTag = {
        id: `tag_${Date.now()}`,
        name: trimmedName,
        color: formData.color,
        bg: formData.bg,
        desc: formData.desc.trim()
      };
      updatedList = [newTag, ...tags];
    }

    setTags(updatedList);
    saveMenuTags(updatedList);
    if (onTagsChanged) onTagsChanged(updatedList);
    setIsEditing(false);
    setEditingId(null);
    setFormError('');
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const updatedList = tags.filter(item => item.id !== deleteTarget.id);
    setTags(updatedList);
    saveMenuTags(updatedList);
    if (onTagsChanged) onTagsChanged(updatedList);
    setDeleteTarget(null);
  };

  const handleResetDefaults = () => {
    setTags(DEFAULT_MENU_TAGS);
    saveMenuTags(DEFAULT_MENU_TAGS);
    if (onTagsChanged) onTagsChanged(DEFAULT_MENU_TAGS);
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
              <Tag size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                {t('admin.settings.manageTags') || 'Quản lý Tag món'}
              </h2>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                {tags.length} {t('admin.settings.tagItem') || 'tag món'} ({t('admin.settings.tagItemDesc') || 'Mô tả chi tiết như bán chạy, nên thử, món mới'})
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
              placeholder={t('admin.settings.searchTagPlaceholder') || 'Tìm kiếm tên tag hoặc mô tả...'}
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
              title={t('admin.settings.resetDefaultTags') || 'Khôi phục danh sách tag mặc định'}
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
              <span>{t('admin.settings.addTag') || 'Thêm tag món'}</span>
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
                  {editingId ? (t('admin.settings.editTag') || 'Chỉnh sửa tag món') : (t('admin.settings.addTag') || 'Thêm tag món mới')}
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  * {t('admin.settings.requiredFields') || 'Bắt buộc nhập tên tag'}
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                      {t('admin.settings.tagName') || 'Tên tag món'} *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => {
                        setFormData({ ...formData, name: e.target.value });
                        if (formError) setFormError('');
                      }}
                      placeholder={t('admin.settings.tagNamePlaceholder') || 'Ví dụ: Bán chạy, Đặc sản, Cay...'}
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
                      {t('admin.settings.tagDesc') || 'Mô tả / Ý nghĩa'}
                    </label>
                    <input
                      type="text"
                      value={formData.desc}
                      onChange={e => setFormData({ ...formData, desc: e.target.value })}
                      placeholder={t('admin.settings.tagDescPlaceholder') || 'Ví dụ: Món đặc trưng của quán, vị cay nồng...'}
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

                {/* Color Selector */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    {t('admin.settings.tagColor') || 'Màu sắc hiển thị'}
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {COLOR_PALETTE.map((pal, idx) => {
                      const isSelected = formData.color === pal.color;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormData({ ...formData, color: pal.color, bg: pal.bg })}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '5px 10px',
                            borderRadius: '9999px',
                            border: `1.5px solid ${isSelected ? pal.color : 'transparent'}`,
                            backgroundColor: pal.bg,
                            color: pal.color,
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: pal.color }} />
                          <span>{formData.name || pal.name}</span>
                          {isSelected && <Check size={12} />}
                        </button>
                      );
                    })}
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

          {/* Tags Table */}
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
                  <th style={{ padding: '10px 16px', fontWeight: 700, color: '#475569', width: '220px' }}>
                    {t('admin.settings.tagName') || 'Tag món'}
                  </th>
                  <th style={{ padding: '10px 16px', fontWeight: 700, color: '#475569' }}>
                    {t('admin.settings.tagDesc') || 'Mô tả'}
                  </th>
                  <th style={{ padding: '10px 16px', fontWeight: 700, color: '#475569', width: '110px', textAlign: 'center' }}>
                    {t('actions') || 'Thao tác'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTags.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                      {t('admin.settings.noTagsFound') || 'Không tìm thấy tag món nào'}
                    </td>
                  </tr>
                ) : (
                  filteredTags.map((tag) => (
                    <tr
                      key={tag.id}
                      style={{ borderBottom: '1px solid #f1f5f9' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          backgroundColor: tag.bg || '#E8F5E9',
                          color: tag.color || '#1B5E20',
                          fontSize: '12px',
                          fontWeight: 700,
                          border: `1px solid ${tag.color ? tag.color + '33' : '#A5D6A7'}`
                        }}>
                          <Tag size={12} />
                          <span>{tag.name}</span>
                        </span>
                      </td>
                      <td style={{ padding: '10px 16px', color: '#64748b', fontSize: '12.5px' }}>
                        {tag.desc || '—'}
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => handleStartEdit(tag)}
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
                            onClick={() => setDeleteTarget(tag)}
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
            {t('admin.settings.tagAutoSync') || 'Tag món được đồng bộ tự động với hệ thống gọi món và thực đơn'}
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
        title={t('admin.settings.confirmDeleteTagTitle') || 'Xác nhận xóa tag món'}
        message={t('admin.settings.confirmDeleteTagMsg') || 'Bạn có chắc chắn muốn xóa tag món này không?'}
        itemName={deleteTarget ? deleteTarget.name : ''}
        confirmText={t('delete') || 'Xóa'}
        cancelText={t('cancel') || 'Hủy'}
      />
    </div>
  );
}
