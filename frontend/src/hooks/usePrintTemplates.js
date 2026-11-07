import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  loadAllPrintTemplates,
  saveAllPrintTemplates,
  resetPrintTemplatesToDefault
} from '../utils/printTemplatesData';

/**
 * Custom Hook: Quản lý nạp, lưu, xóa và phục hồi mẫu in (Clean Code / Single Responsibility)
 */
export function usePrintTemplates(initialDocType = 'invoice') {
  const [selectedDocType, setSelectedDocType] = useState(initialDocType);
  const [templatesData, setTemplatesData] = useState(() => loadAllPrintTemplates());
  const [activeTemplateId, setActiveTemplateId] = useState(null);

  // Danh sách mẫu in theo loại chứng từ hiện tại
  const currentTemplates = useMemo(() => {
    return templatesData[selectedDocType] || [];
  }, [templatesData, selectedDocType]);

  // Tự động chọn mẫu in mặc định khi chuyển loại chứng từ
  useEffect(() => {
    if (currentTemplates.length > 0) {
      const defaultTpl = currentTemplates.find(t => t.isDefault) || currentTemplates[0];
      setActiveTemplateId(defaultTpl.id);
    } else {
      setActiveTemplateId(null);
    }
  }, [selectedDocType, currentTemplates]);

  // Mẫu in đang kích hoạt để xem trước / in ấn
  const activeTemplate = useMemo(() => {
    return currentTemplates.find(t => t.id === activeTemplateId) || currentTemplates[0] || null;
  }, [currentTemplates, activeTemplateId]);

  // Lưu hoặc cập nhật mẫu in
  const saveTemplate = useCallback((templateToSave) => {
    if (!templateToSave || !templateToSave.name?.trim()) {
      return { success: false, message: 'Vui lòng nhập tên mẫu in!' };
    }

    setTemplatesData(prev => {
      const list = [...(prev[selectedDocType] || [])];
      const idx = list.findIndex(t => t.id === templateToSave.id);
      if (idx >= 0) {
        list[idx] = templateToSave;
      } else {
        list.push(templateToSave);
      }

      const updated = { ...prev, [selectedDocType]: list };
      saveAllPrintTemplates(updated);
      return updated;
    });

    setActiveTemplateId(templateToSave.id);
    return { success: true };
  }, [selectedDocType]);

  // Xóa mẫu in
  const deleteTemplate = useCallback((idToDelete) => {
    if (currentTemplates.length <= 1) {
      return { success: false, message: 'Không thể xóa mẫu in duy nhất của danh mục này!' };
    }

    setTemplatesData(prev => {
      const list = (prev[selectedDocType] || []).filter(t => t.id !== idToDelete);
      const updated = { ...prev, [selectedDocType]: list };
      saveAllPrintTemplates(updated);
      return updated;
    });

    const remaining = currentTemplates.filter(t => t.id !== idToDelete);
    if (remaining.length > 0) {
      setActiveTemplateId(remaining[0].id);
    }

    return { success: true };
  }, [currentTemplates, selectedDocType]);

  // Khôi phục cài đặt gốc
  const resetToDefault = useCallback(() => {
    const defaultData = resetPrintTemplatesToDefault();
    setTemplatesData(defaultData);
    const list = defaultData[selectedDocType] || [];
    if (list.length > 0) {
      setActiveTemplateId(list[0].id);
    }
    return { success: true };
  }, [selectedDocType]);

  return {
    selectedDocType,
    setSelectedDocType,
    templatesData,
    currentTemplates,
    activeTemplate,
    activeTemplateId,
    setActiveTemplateId,
    saveTemplate,
    deleteTemplate,
    resetToDefault,
  };
}
