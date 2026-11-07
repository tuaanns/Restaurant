import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileText, ArrowLeft, Plus, Pencil, Trash2, RotateCcw, Printer,
  Save, X, ChevronDown, Check, Eye, Coffee, QrCode, Wifi,
  Scissors, AlertCircle, CheckCircle, ZoomIn, ZoomOut, Maximize2,
  Code, Undo2, Redo2, Copy, Clipboard, Bold, Italic, Underline,
  Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, Table, Grid, Image, GripVertical, Minus, Palette
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  loadAllPrintTemplates,
  saveAllPrintTemplates,
  DEFAULT_PRINT_TEMPLATES
} from '../../utils/printTemplatesData';

const DEFAULT_TOKENS_STATE = {
  orderCode: true,
  client: true,
  billingTime: true,
  productName: true,
  productNotes: true,
  unitPrice: true,
  quantity: true,
  amount: true,
  subtotal: true,
  discount: true,
  total: true,
  vietqr: true,
  wifi: true,
  points: false,
  thankYou: true
};

const normalizeTemplate = (tpl) => {
  if (!tpl) return null;
  return {
    ...tpl,
    companyName: tpl.companyName !== undefined ? tpl.companyName : 'HỆ THỐNG TRÀ & ẨM THỰC',
    storeName: tpl.storeName || 'QUÁN TRÀ - SPECIALTY TEA & COFFEE',
    address: tpl.address || '103 Trần Hưng Đạo, Đặc khu Phú Quốc, Tỉnh An Giang',
    hotline: tpl.hotline || 'HOTLINE: 0901.234.567 - 0988.888.888',
    title: tpl.title || 'HÓA ĐƠN TÍNH TIỀN',
    footerThankYou: tpl.footerThankYou || 'Cảm ơn Quý Khách & Hẹn Gặp Lại!',
    fontSize: tpl.fontSize || 14,
    textAlign: tpl.textAlign || 'center',
    isBold: tpl.isBold !== undefined ? tpl.isBold : true,
    isItalic: tpl.isItalic !== undefined ? tpl.isItalic : false,
    isUnderline: tpl.isUnderline !== undefined ? tpl.isUnderline : false,
    paperSize: tpl.paperSize || 'k80',
    orientation: tpl.orientation || 'portrait',
    tokensState: {
      ...DEFAULT_TOKENS_STATE,
      ...(tpl.tokensState || {})
    }
  };
};

const TOKEN_MENU_GROUPS = [
  {
    groupTitle: 'Thông tin nhà hàng / quán',
    tokens: [
      { key: 'companyName', label: 'Tên công ty / thương hiệu', tag: 'Company' },
      { key: 'storeName', label: 'Tên cửa hàng / quán', tag: 'Store name' },
      { key: 'address', label: 'Địa chỉ cửa hàng', tag: 'Address' },
      { key: 'hotline', label: 'Hotline liên hệ', tag: 'Hotline' },
      { key: 'wifi', label: 'Thông tin Wifi', tag: 'Wifi' },
      { key: 'vietqr', label: 'Mã thanh toán VietQR', tag: 'VietQR Code' }
    ]
  },
  {
    groupTitle: 'Thông tin đơn hàng',
    tokens: [
      { key: 'orderCode', label: 'Mã đơn hàng (Order code)', tag: 'Order code' },
      { key: 'client', label: 'Tên khách hàng (Client)', tag: 'Client' },
      { key: 'billingTime', label: 'Thời gian in (Billing time)', tag: 'Billing time' },
      { key: 'table', label: 'Bàn / Phòng (Table/Room)', tag: 'Table' }
    ]
  },
  {
    groupTitle: 'Chi tiết món ăn',
    tokens: [
      { key: 'productName', label: 'Tên hàng (Product name)', tag: 'Product name' },
      { key: 'productNotes', label: 'Ghi chú món (Product Notes)', tag: '<> Product Notes' },
      { key: 'unitPrice', label: 'Đơn giá sau giảm (Discounted unit price)', tag: '<> Discounted unit price' },
      { key: 'quantity', label: 'Số lượng (Quantity)', tag: 'Quantity' },
      { key: 'amount', label: 'Thành tiền (Total amount)', tag: 'Total amount' }
    ]
  },
  {
    groupTitle: 'Thanh toán & Tính toán',
    tokens: [
      { key: 'subtotal', label: 'Tổng tiền hàng (Total amount of goods)', tag: 'Total amount of goods' },
      { key: 'discount', label: 'Giảm giá hóa đơn (Invoice discount)', tag: 'Invoice discount' },
      { key: 'total', label: 'Tổng Cộng (Total)', tag: 'Total' },
      { key: 'points', label: 'Điểm tích lũy (Loyalty points)', tag: 'Points' }
    ]
  },
  {
    groupTitle: 'Chân trang',
    tokens: [
      { key: 'thankYou', label: 'Lời cảm ơn (Thank you note)', tag: 'Thank you' }
    ]
  }
];

export function PrintTemplatesManager({ onBack, initialDocType = 'invoice' }) {
  const { t, formatMoney } = useLanguage();

  // Selected document category (invoice, prebill, kitchen, shift_closing, cash_receipt, cash_payment)
  const [selectedDocType, setSelectedDocType] = useState(initialDocType || 'invoice');
  const [templatesData, setTemplatesData] = useState(() => loadAllPrintTemplates());
  
  // Active template id within selected document category
  const [activeTemplateId, setActiveTemplateId] = useState(() => {
    const list = loadAllPrintTemplates()[initialDocType || 'invoice'] || [];
    return list[0]?.id || 'inv_k80_default';
  });

  useEffect(() => {
    if (initialDocType) {
      setSelectedDocType(initialDocType);
      const list = loadAllPrintTemplates()[initialDocType] || [];
      if (list.length > 0) setActiveTemplateId(list[0].id);
    }
  }, [initialDocType]);

  // Editor Modal state
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editorZoom, setEditorZoom] = useState(90);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [showTokenMenu, setShowTokenMenu] = useState(false);
  const tokenMenuRef = useRef(null);

  // Delete Confirmation Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 2500);
  };

  // Close token menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (tokenMenuRef.current && !tokenMenuRef.current.contains(e.target)) {
        setShowTokenMenu(false);
      }
    };
    if (showTokenMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showTokenMenu]);

  // List of templates for current docType
  const currentTemplatesList = useMemo(() => {
    return templatesData[selectedDocType] || [];
  }, [templatesData, selectedDocType]);

  // Active template object
  const activeTemplate = useMemo(() => {
    const found = currentTemplatesList.find(t => t.id === activeTemplateId) || currentTemplatesList[0] || null;
    return normalizeTemplate(found);
  }, [currentTemplatesList, activeTemplateId]);

  // Document types hierarchy
  const DOC_CATEGORIES = [
    {
      groupKey: 'orders',
      groupLabel: t('admin.settings.docTypeOrders') || 'Đơn hàng',
      items: [
        { id: 'invoice', label: t('admin.settings.docInvoice') || 'Hóa đơn thanh toán', icon: FileText },
        { id: 'prebill', label: t('admin.settings.docPreBill') || 'Phiếu tạm tính', icon: FileText },
        { id: 'kitchen', label: t('admin.settings.docKitchen') || 'Phiếu Bar/Bếp', icon: Coffee },
        { id: 'shift_closing', label: t('admin.settings.docShiftClosing') || 'Phiếu bàn giao ca', icon: FileText },
      ]
    },
    {
      groupKey: 'cashbook',
      groupLabel: t('admin.settings.docTypeCashBook') || 'Sổ quỹ',
      items: [
        { id: 'cash_receipt', label: t('admin.settings.docCashReceipt') || 'Phiếu thu tiền', icon: FileText },
        { id: 'cash_payment', label: t('admin.settings.docCashPayment') || 'Phiếu chi tiền', icon: FileText },
      ]
    }
  ];

  // When switching docType, auto select its first template
  const handleSelectDocType = (docId) => {
    setSelectedDocType(docId);
    const list = templatesData[docId] || [];
    if (list.length > 0) {
      setActiveTemplateId(list[0].id);
    }
  };

  // Open Editor for Creating new template
  const handleOpenCreateModal = () => {
    const newId = `${selectedDocType}_${Date.now()}`;
    const base = activeTemplate || DEFAULT_PRINT_TEMPLATES[selectedDocType]?.[0] || {};
    const newTpl = normalizeTemplate({
      ...base,
      id: newId,
      name: `${base.name || 'Mẫu in'} (Mới)`,
      isDefault: false
    });
    setEditingTemplate(newTpl);
    setIsSourceMode(false);
    setShowTokenMenu(false);
    setEditorModalOpen(true);
  };

  // Open Editor for Editing active template
  const handleOpenEditModal = () => {
    if (!activeTemplate) return;
    setEditingTemplate(normalizeTemplate(JSON.parse(JSON.stringify(activeTemplate))));
    setIsSourceMode(false);
    setShowTokenMenu(false);
    setEditorModalOpen(true);
  };

  // Toggle token in editing template
  const handleToggleToken = (tokenKey) => {
    if (!editingTemplate) return;
    setEditingTemplate(prev => {
      const currentState = prev.tokensState?.[tokenKey] !== false;
      return {
        ...prev,
        tokensState: {
          ...(prev.tokensState || {}),
          [tokenKey]: !currentState
        }
      };
    });
  };

  // Enable token from dropdown menu
  const handleEnableToken = (tokenKey) => {
    if (!editingTemplate) return;
    setEditingTemplate(prev => ({
      ...prev,
      tokensState: {
        ...(prev.tokensState || {}),
        [tokenKey]: true
      }
    }));
    setShowTokenMenu(false);
    showToast(`Đã thêm trường "${tokenKey}" vào mẫu in`);
  };

  // Save template from Editor
  const handleSaveFromEditor = () => {
    if (!editingTemplate || !editingTemplate.name.trim()) {
      alert('Vui lòng nhập tên mẫu in!');
      return;
    }

    const updatedList = [...currentTemplatesList];
    const existingIdx = updatedList.findIndex(t => t.id === editingTemplate.id);
    if (existingIdx >= 0) {
      updatedList[existingIdx] = editingTemplate;
    } else {
      updatedList.push(editingTemplate);
    }

    const newAllData = {
      ...templatesData,
      [selectedDocType]: updatedList
    };

    setTemplatesData(newAllData);
    saveAllPrintTemplates(newAllData);
    setActiveTemplateId(editingTemplate.id);
    setEditorModalOpen(false);
    showToast(t('admin.settings.templateSavedSuccess') || 'Đã lưu mẫu in thành công!');
  };

  // Request Delete Template
  const handleRequestDelete = () => {
    if (!activeTemplate) return;
    if (currentTemplatesList.length <= 1) {
      alert(t('admin.settings.cannotDeleteLastTemplate') || 'Không thể xóa mẫu in duy nhất của danh mục này!');
      return;
    }
    setTemplateToDelete(activeTemplate);
    setDeleteModalOpen(true);
  };

  // Confirm Delete Template
  const handleConfirmDelete = () => {
    if (!templateToDelete) return;
    const filtered = currentTemplatesList.filter(t => t.id !== templateToDelete.id);
    const newAllData = {
      ...templatesData,
      [selectedDocType]: filtered
    };

    setTemplatesData(newAllData);
    saveAllPrintTemplates(newAllData);
    if (filtered.length > 0) {
      setActiveTemplateId(filtered[0].id);
    }
    setDeleteModalOpen(false);
    setTemplateToDelete(null);
    showToast(t('admin.settings.templateDeletedSuccess') || 'Đã xóa mẫu in thành công!');
  };

  // Test Print
  const handleTestPrint = () => {
    window.print();
  };

  // Render Sample Thermal Bill for Preview
  const renderThermalBillPreview = (tpl, zoom = 100) => {
    if (!tpl) return null;
    const isK57 = tpl.paperSize === 'k57';
    const isLandscape = tpl.orientation === 'landscape';
    const width = isK57 ? '270px' : (isLandscape ? '460px' : '330px');
    const tokens = tpl.tokensState || DEFAULT_TOKENS_STATE;

    return (
      <div
        id="thermal-bill-preview-area"
        className="print-area"
        style={{
          width,
          height: 'fit-content',
          minHeight: 'fit-content',
          flexShrink: 0,
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          padding: '20px 16px 28px 16px',
          boxSizing: 'border-box',
          fontFamily: "'Times New Roman', Times, serif",
          fontSize: isK57 ? '11px' : `${tpl.fontSize || 13}px`,
          color: '#000000',
          lineHeight: '1.35',
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top center',
          transition: 'transform 0.15s ease',
          margin: '0 auto 40px auto'
        }}
      >
        {/* Store Header */}
        <div style={{ textAlign: tpl.textAlign || 'center', marginBottom: '10px' }}>
          {tpl.showLogo && (
            <div style={{ display: 'flex', justifyContent: tpl.textAlign === 'left' ? 'flex-start' : 'center', marginBottom: '4px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#0f172a',
                color: '#d4af37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Coffee size={18} />
              </div>
            </div>
          )}
          {tpl.companyName && (
            <div style={{ fontSize: isK57 ? '11px' : '13px', fontWeight: 700, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              {tpl.companyName}
            </div>
          )}
          <div style={{ fontSize: isK57 ? '13px' : '16px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: '1px' }}>
            {tpl.storeName || 'QUÁN TRÀ - SPECIALTY TEA & COFFEE'}
          </div>
          {tpl.address && (
            <div style={{ fontSize: '10.5px', color: '#1e293b', marginTop: '2px' }}>
              {tpl.address}
            </div>
          )}
          {tpl.hotline && (
            <div style={{ fontSize: '10.5px', color: '#1e293b', fontWeight: 700 }}>
              {tpl.hotline}
            </div>
          )}
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', borderTop: '1px dashed #cbd5e1', paddingTop: '8px', margin: '8px 0' }}>
          <div style={{ fontSize: isK57 ? '14px' : '16px', fontWeight: 900, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            {tpl.title || 'HÓA ĐƠN TÍNH TIỀN'}
          </div>
          {tpl.headerNote && (
            <div style={{ fontSize: '10px', color: '#64748b', fontStyle: 'italic', marginTop: '1px' }}>
              {tpl.headerNote}
            </div>
          )}
          {tokens.orderCode !== false && (
            <div style={{ fontSize: '11px', fontWeight: 800, marginTop: '3px' }}>
              ORD-20261107-003 • BÀN 03 (TẦNG 1)
            </div>
          )}
          {(tokens.client !== false || tokens.billingTime !== false) && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#1e293b', marginTop: '4px' }}>
              {tokens.client !== false ? <span>Khách: Anh Hoàng Nam (VIP)</span> : <span />}
              {tokens.billingTime !== false ? <span>07/11/2026 10:45 • Thu ngân: Mỹ Linh</span> : <span />}
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px dashed #cbd5e1', margin: '6px 0' }} />

        {/* Content Table by Doc Type */}
        {selectedDocType === 'kitchen' ? (
          <div>
            <div style={{ fontWeight: 800, fontSize: '11px', marginBottom: '4px' }}>DANH SÁCH MÓN GỬI CHẾ BIẾN:</div>
            <table style={{ width: '100%', fontSize: '11.5px', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px dashed #e2e8f0' }}>
                  <td style={{ padding: '5px 0', fontWeight: 800 }}>1. Trà đào cam sả thanh nhiệt</td>
                  <td style={{ padding: '5px 0', textAlign: 'right', fontWeight: 900, fontSize: '13px' }}>SL: 2</td>
                </tr>
                {tokens.productNotes !== false && (
                  <tr>
                    <td colSpan={2} style={{ fontSize: '10px', color: '#ef4444', paddingBottom: '4px' }}>* Ít ngọt 50% đường, nhiều đá</td>
                  </tr>
                )}
                <tr style={{ borderBottom: '1px dashed #e2e8f0' }}>
                  <td style={{ padding: '5px 0', fontWeight: 800 }}>2. Mì xào bò thượng hạng</td>
                  <td style={{ padding: '5px 0', textAlign: 'right', fontWeight: 900, fontSize: '13px' }}>SL: 1</td>
                </tr>
                {tokens.productNotes !== false && (
                  <tr>
                    <td colSpan={2} style={{ fontSize: '10px', color: '#ef4444', paddingBottom: '4px' }}>* Không hành lá, bò tái vừa</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : selectedDocType === 'cash_receipt' || selectedDocType === 'cash_payment' ? (
          <div style={{ fontSize: '11px', lineHeight: '1.6' }}>
            <div>Số phiếu: <strong>PT261107-F7CA</strong></div>
            <div>Đối tượng: <strong>Khách hàng vãng lai (Nguyễn Văn A)</strong></div>
            <div>Lý do: <strong>Thu tiền bán hàng hóa đơn trực tiếp</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: '4px', marginTop: '6px' }}>
              <span>Số tiền:</span>
              <strong style={{ fontSize: '13px' }}>115.000 đ</strong>
            </div>
            <div style={{ fontSize: '10px', fontStyle: 'italic', color: '#475569' }}>
              (Bằng chữ: Một trăm mười lăm nghìn đồng chẵn)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', textAlign: 'center', marginTop: '16px', fontSize: '10.5px' }}>
              <div><strong>Người lập biểu</strong><br /><span style={{ fontSize: '9px', color: '#64748b' }}>(Ký, họ tên)</span></div>
              <div><strong>Thủ quỹ / Thu ngân</strong><br /><span style={{ fontSize: '9px', color: '#64748b' }}>(Ký, họ tên)</span></div>
            </div>
          </div>
        ) : (
          <div>
            {/* Standard Order Items Table matching Quán Trà F&B Menu */}
            <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px dashed #cbd5e1', textAlign: 'left' }}>
                  <th style={{ padding: '4px 0', fontWeight: 700 }}>Tên món</th>
                  {tokens.unitPrice !== false && <th style={{ padding: '4px 0', textAlign: 'center', fontWeight: 700 }}>Đ.Giá</th>}
                  {tokens.quantity !== false && <th style={{ padding: '4px 0', textAlign: 'center', fontWeight: 700 }}>SL</th>}
                  {tokens.amount !== false && <th style={{ padding: '4px 0', textAlign: 'right', fontWeight: 700 }}>Thành tiền</th>}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '4px 0' }}>
                    <div style={{ fontWeight: 600 }}>Trà đào cam sả thanh nhiệt</div>
                    {tokens.productNotes !== false && <div style={{ fontSize: '9.5px', color: '#64748b' }}>Ít ngọt 50% đường, nhiều đào miếng</div>}
                  </td>
                  {tokens.unitPrice !== false && (
                    <td style={{ padding: '4px 0', textAlign: 'center' }}>
                      <span style={{ textDecoration: 'line-through', fontSize: '9.5px', color: '#94a3b8', display: 'block' }}>45.000</span>
                      <span>40.000</span>
                    </td>
                  )}
                  {tokens.quantity !== false && <td style={{ padding: '4px 0', textAlign: 'center' }}>x 2</td>}
                  {tokens.amount !== false && <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 700 }}>80.000</td>}
                </tr>
                <tr>
                  <td style={{ padding: '4px 0' }}>
                    <div style={{ fontWeight: 600 }}>Trà sữa Ô Long nướng trân châu</div>
                    {tokens.productNotes !== false && <div style={{ fontSize: '9.5px', color: '#64748b' }}>70% đá, thêm trân châu hoàng kim</div>}
                  </td>
                  {tokens.unitPrice !== false && (
                    <td style={{ padding: '4px 0', textAlign: 'center' }}>
                      <span style={{ textDecoration: 'line-through', fontSize: '9.5px', color: '#94a3b8', display: 'block' }}>55.000</span>
                      <span>50.000</span>
                    </td>
                  )}
                  {tokens.quantity !== false && <td style={{ padding: '4px 0', textAlign: 'center' }}>x 2</td>}
                  {tokens.amount !== false && <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 700 }}>100.000</td>}
                </tr>
                <tr>
                  <td style={{ padding: '4px 0' }}>
                    <div style={{ fontWeight: 600 }}>Mì xào bò thượng hạng</div>
                    {tokens.productNotes !== false && <div style={{ fontSize: '9.5px', color: '#64748b' }}>Bò mềm tái vừa, không hành lá</div>}
                  </td>
                  {tokens.unitPrice !== false && (
                    <td style={{ padding: '4px 0', textAlign: 'center' }}>
                      <span>110.000</span>
                    </td>
                  )}
                  {tokens.quantity !== false && <td style={{ padding: '4px 0', textAlign: 'center' }}>x 1</td>}
                  {tokens.amount !== false && <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 700 }}>110.000</td>}
                </tr>
                <tr>
                  <td style={{ padding: '4px 0' }}>
                    <div style={{ fontWeight: 600 }}>Bò lúc lắc khoai tây chiên</div>
                    {tokens.productNotes !== false && <div style={{ fontSize: '9.5px', color: '#64748b' }}>Sốt tiêu đen, kèm bánh mì bơ tỏi</div>}
                  </td>
                  {tokens.unitPrice !== false && (
                    <td style={{ padding: '4px 0', textAlign: 'center' }}>
                      <span>195.000</span>
                    </td>
                  )}
                  {tokens.quantity !== false && <td style={{ padding: '4px 0', textAlign: 'center' }}>x 1</td>}
                  {tokens.amount !== false && <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 700 }}>195.000</td>}
                </tr>
                <tr>
                  <td style={{ padding: '4px 0' }}>
                    <div style={{ fontWeight: 600 }}>Chè khúc bạch hạnh nhân</div>
                    {tokens.productNotes !== false && <div style={{ fontSize: '9.5px', color: '#64748b' }}>Thanh mát ít ngọt, nhiều hạnh nhân</div>}
                  </td>
                  {tokens.unitPrice !== false && <td style={{ padding: '4px 0', textAlign: 'center' }}>35.000</td>}
                  {tokens.quantity !== false && <td style={{ padding: '4px 0', textAlign: 'center' }}>x 1</td>}
                  {tokens.amount !== false && <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 700 }}>35.000</td>}
                </tr>
              </tbody>
            </table>

            <div style={{ borderTop: '1px dashed #cbd5e1', margin: '6px 0' }} />

            {/* Calculations */}
            {tokens.subtotal !== false && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                <span>Tổng tiền hàng:</span>
                <span style={{ fontWeight: 700 }}>520.000</span>
              </div>
            )}
            {tokens.discount !== false && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                <span>Giảm giá (CTKM Khai Trương 10%):</span>
                <span style={{ fontWeight: 700 }}>-52.000</span>
              </div>
            )}
            {tokens.total !== false && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 0',
                borderTop: '1px dashed #94a3b8',
                marginTop: '4px',
                fontSize: '13px',
                fontWeight: 900
              }}>
                <span>TỔNG CỘNG:</span>
                <span>468.000 đ</span>
              </div>
            )}

            {/* Points */}
            {tokens.points !== false && tpl.showPoints && (
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '4px 8px',
                borderRadius: '4px',
                margin: '6px 0',
                fontSize: '10px',
                border: '1px solid #e2e8f0'
              }}>
                Khách: Anh Hoàng Nam (VIP Platinum) • Tích lũy: +47 điểm (Tổng: 320 điểm)
              </div>
            )}
          </div>
        )}

        {/* VietQR */}
        {tokens.vietqr !== false && tpl.showVietQr && (
          <div style={{ textAlign: 'center', margin: '10px 0 6px 0', borderTop: '1px dashed #cbd5e1', paddingTop: '8px' }}>
            <div style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '6px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff'
            }}>
              <div style={{ width: '85px', height: '85px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <QrCode size={75} color="#000000" />
              </div>
              <div style={{ fontSize: '8.5px', fontWeight: 800, marginTop: '3px', color: '#00796b' }}>
                QUÉT MÃ VIETQR THANH TOÁN
              </div>
            </div>
          </div>
        )}

        {/* Wifi */}
        {tokens.wifi !== false && tpl.showWifi && tpl.wifiInfo && (
          <div style={{ textAlign: 'center', fontSize: '9.5px', color: '#475569', margin: '4px 0', fontWeight: 600 }}>
            📶 {tpl.wifiInfo}
          </div>
        )}

        {/* Footer */}
        {tokens.thankYou !== false && tpl.footerThankYou && (
          <div style={{
            textAlign: 'center',
            fontSize: '11px',
            fontStyle: 'italic',
            marginTop: '10px',
            borderTop: '1px dashed #cbd5e1',
            paddingTop: '6px'
          }}>
            {tpl.footerThankYou}
          </div>
        )}
      </div>
    );
  };

  const sourceHtml = useMemo(() => {
    if (!editingTemplate) return '';
    const tok = editingTemplate.tokensState || DEFAULT_TOKENS_STATE;
    return `<!-- ============================================== -->
<!--   BẢNG MẪU IN HÓA ĐƠN WYSIWYG - PHIÊN BẢN SOURCE   -->
<!-- ============================================== -->
<div class="print-template" style="font-family: 'Times New Roman', serif; font-size: ${editingTemplate.fontSize || 14}px; text-align: ${editingTemplate.textAlign || 'center'};">
  <!-- KHỐI 1: THÔNG TIN CỬA HÀNG / QUÁN -->
  <div class="store-header" style="border: 1px dashed #cbd5e1; padding: 12px; margin-bottom: 8px;">
    <div style="font-weight: 700; font-size: 15px;">${editingTemplate.companyName || 'HỆ THỐNG TRÀ & ẨM THỰC'}</div>
    <div style="font-weight: 900; font-size: 18px;">${editingTemplate.storeName || 'QUÁN TRÀ - SPECIALTY TEA & COFFEE'}</div>
    <div style="font-size: 12px;">${editingTemplate.address || '103 Trần Hưng Đạo, Đặc khu Phú Quốc, Tỉnh An Giang'}</div>
    <div style="font-weight: 700; font-size: 12px;">${editingTemplate.hotline || 'HOTLINE: 0901.234.567 - 0988.888.888'}</div>
  </div>

  <!-- KHỐI 2: TIÊU ĐỀ & MÃ HÓA ĐƠN -->
  <div class="title-block" style="border: 1px dashed #cbd5e1; padding: 10px; margin-bottom: 8px;">
    <h2 style="font-size: 18px; font-weight: 900; margin: 0;">${editingTemplate.title || 'HÓA ĐƠN TÍNH TIỀN'}</h2>
    ${tok.orderCode !== false ? '<div class="token-chip" style="color: #0284c7;">{{order_code}}</div>' : ''}
  </div>

  <!-- KHỐI 3: KHÁCH HÀNG & THỜI GIAN -->
  <div class="meta-row" style="display: grid; grid-template-columns: 1fr 1fr; border: 1px dashed #cbd5e1; margin-bottom: 8px;">
    <div style="padding: 8px; border-right: 1px dashed #cbd5e1;">Khách hàng: ${tok.client !== false ? '{{client}}' : ''}</div>
    <div style="padding: 8px;">Thời gian: ${tok.billingTime !== false ? '{{billing_time}}' : ''}</div>
  </div>

  <!-- KHỐI 4: BẢNG DANH SÁCH MÓN ĂN -->
  <table class="items-table" style="width: 100%; border: 1px dashed #cbd5e1; border-collapse: collapse; margin-bottom: 8px;">
    <thead>
      <tr style="border-bottom: 1px dashed #cbd5e1;">
        <th style="padding: 6px; text-align: left; border-right: 1px dashed #cbd5e1;">Tên hàng</th>
        ${tok.unitPrice !== false ? '<th style="padding: 6px; text-align: center; border-right: 1px dashed #cbd5e1;">Đ.Giá</th>' : ''}
        <th style="padding: 6px 2px; border-right: 1px dashed #cbd5e1;"></th>
        ${tok.quantity !== false ? '<th style="padding: 6px; text-align: center; border-right: 1px dashed #cbd5e1;">SL</th>' : ''}
        ${tok.amount !== false ? '<th style="padding: 6px; text-align: right;">Thành tiền</th>' : ''}
      </tr>
    </thead>
    <tbody>
      <!-- {{#each items}} -->
      <tr>
        <td style="padding: 6px; text-align: left; border-right: 1px dashed #cbd5e1;">
          ${tok.productName !== false ? '<div>{{product_name}}</div>' : ''}
          ${tok.productNotes !== false ? '<small style="color: #c2410c;">&lt;&gt; {{product_notes}}</small>' : ''}
        </td>
        ${tok.unitPrice !== false ? '<td style="padding: 6px; text-align: center; border-right: 1px dashed #cbd5e1;">{{unit_price}}</td>' : ''}
        <td style="padding: 6px 2px; text-align: center; border-right: 1px dashed #cbd5e1;">x</td>
        ${tok.quantity !== false ? '<td style="padding: 6px; text-align: center; border-right: 1px dashed #cbd5e1;">{{quantity}}</td>' : ''}
        ${tok.amount !== false ? '<td style="padding: 6px; text-align: right;">{{total_amount}}</td>' : ''}
      </tr>
      <!-- {{/each}} -->
    </tbody>
  </table>

  <!-- KHỐI 5: TÍNH TIỀN & TỔNG CỘNG -->
  <table class="summary-table" style="width: 100%; border: 1px dashed #cbd5e1; border-collapse: collapse; margin-bottom: 8px;">
    <tbody>
      ${tok.subtotal !== false ? '<tr><td style="padding: 6px; border-right: 1px dashed #cbd5e1; width: 45%;">Tổng tiền hàng:</td><td style="padding: 6px; text-align: right;">{{subtotal}}</td></tr>' : ''}
      ${tok.discount !== false ? '<tr><td style="padding: 6px; border-right: 1px dashed #cbd5e1; width: 45%;">Giảm giá:</td><td style="padding: 6px; text-align: right;">{{discount}}</td></tr>' : ''}
      ${tok.total !== false ? '<tr><td style="padding: 7px; border-right: 1px dashed #cbd5e1; width: 45%; font-weight: 900;">Tổng Cộng:</td><td style="padding: 7px; text-align: right; font-weight: 900;">{{total}}</td></tr>' : ''}
    </tbody>
  </table>

  <!-- KHỐI 6: LỜI CẢM ƠN CHÂN TRANG -->
  ${tok.thankYou !== false ? `<div class="footer-note" style="border: 1px dashed #cbd5e1; padding: 12px; font-style: italic; margin-top: 10px;">${editingTemplate.footerThankYou || 'Cảm ơn quý khách !'}</div>` : ''}
</div>`;
  }, [editingTemplate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
      
      {/* ═══ TOP HEADER (KiotViet Style) ═══ */}
      <div style={{
        height: '56px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0
      }}>
        {/* Left: Back Link & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              <ArrowLeft size={14} />
              <span>{t('admin.settings.managePrintTemplates') || 'Quản lý mẫu in'}</span>
            </button>
          )}

          <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
            {t('admin.settings.managePrintTemplates') || 'Quản lý mẫu in'}
          </h2>
        </div>

        {/* Right: + Tạo mẫu in Button (Green Theme) */}
        <div>
          <button
            onClick={handleOpenCreateModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '6px',
              backgroundColor: '#009688',
              color: '#ffffff',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 150, 136, 0.3)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#00796b'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#009688'}
          >
            <Plus size={15} />
            <span>{t('admin.settings.createPrintTemplate') || 'Tạo mẫu in'}</span>
          </button>
        </div>
      </div>

      {/* ═══ BODY LAYOUT (Left Doc Types + Right Tabs & Preview) ═══ */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* ─── LEFT SIDEBAR: Document Categories ─── */}
        <div style={{
          width: '240px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          overflowY: 'auto',
          padding: '16px 10px'
        }}>
          {DOC_CATEGORIES.map((group) => (
            <div key={group.groupKey} style={{ marginBottom: '16px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                padding: '4px 10px 8px 10px'
              }}>
                {group.groupLabel}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedDocType === item.id;
                  const count = (templatesData[item.id] || []).length;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectDocType(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '9px 12px',
                        borderRadius: '7px',
                        border: 'none',
                        backgroundColor: isSelected ? '#e6f7f5' : 'transparent',
                        color: isSelected ? '#009688' : '#334155',
                        fontWeight: isSelected ? 800 : 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icon size={15} color={isSelected ? '#009688' : '#64748b'} />
                        <span>{item.label}</span>
                      </div>
                      <span style={{
                        fontSize: '10.5px',
                        padding: '1px 6px',
                        borderRadius: '9999px',
                        backgroundColor: isSelected ? '#b2dfdb' : '#f1f5f9',
                        color: isSelected ? '#004d40' : '#64748b',
                        fontWeight: 700
                      }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ─── MAIN PREVIEW & TEMPLATE TABS ─── */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f1f5f9',
          overflow: 'hidden'
        }}>
          {/* Horizontal Template Tabs Header */}
          <div style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            height: '48px'
          }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', height: '100%', alignItems: 'center' }}>
              {currentTemplatesList.map((tpl) => {
                const isActive = tpl.id === activeTemplateId;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => setActiveTemplateId(tpl.id)}
                    style={{
                      height: '100%',
                      padding: '0 14px',
                      background: 'none',
                      border: 'none',
                      borderBottom: isActive ? '2.5px solid #009688' : '2.5px solid transparent',
                      color: isActive ? '#009688' : '#64748b',
                      fontWeight: isActive ? 800 : 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span>{tpl.name}</span>
                    {tpl.isDefault && (
                      <span style={{ fontSize: '10px', backgroundColor: '#e6f7f5', color: '#00796b', padding: '1px 5px', borderRadius: '4px' }}>
                        Mặc định
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Action Buttons: Edit & Delete (KiotViet Image 1 Style) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handleOpenEditModal}
                title={t('admin.settings.editPrintTemplate') || 'Chỉnh sửa mẫu in'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                <Pencil size={13} color="#009688" />
                <span>{t('admin.settings.btnEditTemplate') || 'Sửa'}</span>
              </button>

              <button
                onClick={handleRequestDelete}
                title={t('admin.settings.deletePrintTemplate') || 'Xóa mẫu in'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: '1px solid #fee2e2',
                  backgroundColor: '#ffffff',
                  color: '#ef4444',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                <Trash2 size={13} color="#ef4444" />
                <span>{t('admin.settings.btnDeleteTemplate') || 'Xóa'}</span>
              </button>
            </div>
          </div>

          {/* Paper View Container */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '30px 20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            backgroundColor: '#e2e8f0'
          }}>
            {activeTemplate ? (
              renderThermalBillPreview(activeTemplate, 100)
            ) : (
              <div style={{ textAlign: 'center', color: '#64748b', marginTop: '40px' }}>
                Chưa có mẫu in nào trong danh mục này.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════
          MODAL: CHỈNH SỬA MẪU IN / TẠO MẪU IN (KIOTVIET IMAGE 2 STYLE)
          ══════════════════════════════════════════════════════════════ */}
      {editorModalOpen && editingTemplate && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '16px'
        }}>
          <div style={{
            width: '98vw',
            maxWidth: '1280px',
            height: '92vh',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            overflow: 'hidden'
          }}>
            
            {/* Modal Topbar (Image 2) */}
            <div style={{
              height: '56px',
              padding: '0 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#ffffff',
              flexShrink: 0
            }}>
              {/* Left: Title + Name Input + Preset dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                  {t('admin.settings.editPrintTemplate') || 'Chỉnh sửa mẫu in'}
                </span>

                <input
                  type="text"
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  placeholder={t('admin.settings.templateNamePlaceholder') || 'Nhập tên mẫu in...'}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontWeight: 700,
                    width: '260px',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#009688'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />

                <select
                  onChange={(e) => {
                    const presetKey = e.target.value;
                    const presets = DEFAULT_PRINT_TEMPLATES[selectedDocType] || [];
                    const found = presets.find(p => p.id === presetKey);
                    if (found) {
                      setEditingTemplate(prev => ({ ...prev, ...found, id: prev.id, name: prev.name }));
                    }
                  }}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12.5px',
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">{t('admin.settings.suggestedTemplates') || 'Chọn mẫu gợi ý'} ▾</option>
                  {(DEFAULT_PRINT_TEMPLATES[selectedDocType] || []).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Right: Reset, Test Print, Save (Green), Close */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => {
                    const base = DEFAULT_PRINT_TEMPLATES[selectedDocType]?.[0];
                    if (base) setEditingTemplate(prev => ({ ...prev, ...base, id: prev.id }));
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <RotateCcw size={13} />
                  <span>{t('admin.settings.resetBtn') || 'Đặt lại'}</span>
                </button>

                <button
                  onClick={handleTestPrint}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Printer size={13} />
                  <span>{t('admin.settings.testPrintBtn') || 'In thử'}</span>
                </button>

                <button
                  onClick={handleSaveFromEditor}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 18px',
                    borderRadius: '6px',
                    backgroundColor: '#009688',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0, 150, 136, 0.3)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#00796b'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#009688'}
                >
                  <Save size={14} />
                  <span>{t('admin.settings.saveTemplateBtn') || 'Lưu mẫu'}</span>
                </button>

                <button
                  onClick={() => setEditorModalOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    padding: '6px'
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Split Screen Body: Left Editor + Right Preview */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              
              {/* ─── LEFT: EXACT WYSIWYG EDITOR CANVAS (IMAGE FEDE25C9 STYLE) ─── */}
              <div style={{
                width: '52%',
                borderRight: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#ffffff',
                overflow: 'hidden'
              }}>
                {/* ─── TOOLBAR ROW 1 ─── */}
                <div style={{
                  padding: '6px 14px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#ffffff',
                  gap: '8px',
                  flexShrink: 0
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                    {/* Source Toggle Button */}
                    <button
                      onClick={() => setIsSourceMode(!isSourceMode)}
                      title="Chuyển đổi giữa giao diện trực quan và mã nguồn HTML"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        border: isSourceMode ? '1px solid #009688' : '1px solid #cbd5e1',
                        backgroundColor: isSourceMode ? '#e6f7f5' : '#ffffff',
                        color: isSourceMode ? '#00796b' : '#334155',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <Code size={13} color={isSourceMode ? '#009688' : '#64748b'} />
                      <span>Source</span>
                    </button>

                    {/* Token Dropdown (Chọn... ▾) */}
                    <div style={{ position: 'relative' }} ref={tokenMenuRef}>
                      <button
                        onClick={() => setShowTokenMenu(!showTokenMenu)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          border: showTokenMenu ? '1px solid #009688' : '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          color: '#334155',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <span>Chọn...</span>
                        <ChevronDown size={12} color="#64748b" />
                      </button>

                      {/* Dropdown Popover */}
                      {showTokenMenu && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          marginTop: '4px',
                          width: '320px',
                          maxHeight: '380px',
                          overflowY: 'auto',
                          backgroundColor: '#ffffff',
                          borderRadius: '8px',
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.1)',
                          border: '1px solid #e2e8f0',
                          padding: '8px',
                          zIndex: 99999
                        }}>
                          <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', padding: '4px 8px 6px 8px', borderBottom: '1px solid #f1f5f9' }}>
                            Chèn trường thông tin vào mẫu in
                          </div>

                          {TOKEN_MENU_GROUPS.map((group, gIdx) => (
                            <div key={gIdx} style={{ marginTop: '8px' }}>
                              <div style={{ fontSize: '11px', fontWeight: 700, color: '#009688', padding: '2px 8px', backgroundColor: '#f0fdfa', borderRadius: '4px', marginBottom: '4px' }}>
                                {group.groupTitle}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                {group.tokens.map((tok) => {
                                  const isActive = editingTemplate.tokensState?.[tok.key] !== false;
                                  return (
                                    <button
                                      key={tok.key}
                                      onClick={() => handleEnableToken(tok.key)}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '5px 8px',
                                        borderRadius: '4px',
                                        border: 'none',
                                        backgroundColor: 'transparent',
                                        fontSize: '12px',
                                        color: '#334155',
                                        textAlign: 'left',
                                        cursor: 'pointer'
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                      <span style={{ fontWeight: 500 }}>{tok.label}</span>
                                      <span style={{
                                        fontSize: '10px',
                                        padding: '1px 6px',
                                        borderRadius: '4px',
                                        backgroundColor: isActive ? '#e6f7f5' : '#f1f5f9',
                                        color: isActive ? '#00796b' : '#64748b',
                                        fontWeight: 700
                                      }}>
                                        {isActive ? '✓ Đã có' : '+ Thêm'}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Font Size Stepper: [-] [ 14 ] [+] */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden' }}>
                      <button
                        onClick={() => setEditingTemplate(prev => ({ ...prev, fontSize: Math.max(10, (prev.fontSize || 14) - 1) }))}
                        title="Giảm cỡ chữ"
                        style={{ padding: '3px 8px', border: 'none', background: '#ffffff', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center' }}
                      >
                        <Minus size={11} />
                      </button>
                      <span style={{ width: '28px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#1e293b', borderLeft: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1', padding: '2px 0' }}>
                        {editingTemplate.fontSize || 14}
                      </span>
                      <button
                        onClick={() => setEditingTemplate(prev => ({ ...prev, fontSize: Math.min(22, (prev.fontSize || 14) + 1) }))}
                        title="Tăng cỡ chữ"
                        style={{ padding: '3px 8px', border: 'none', background: '#ffffff', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center' }}
                      >
                        <Plus size={11} />
                      </button>
                    </div>

                    {/* Insert Image Button */}
                    <button
                      onClick={() => setEditingTemplate(prev => ({ ...prev, showLogo: !prev.showLogo }))}
                      title="Bật / tắt Logo nhà hàng"
                      style={{
                        padding: '4px 6px',
                        borderRadius: '4px',
                        border: editingTemplate.showLogo ? '1px solid #009688' : '1px solid #cbd5e1',
                        backgroundColor: editingTemplate.showLogo ? '#e6f7f5' : '#ffffff',
                        color: editingTemplate.showLogo ? '#00796b' : '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Image size={14} />
                    </button>

                    {/* Insert Table Button */}
                    <button
                      title="Khung bảng chi tiết món ăn"
                      style={{
                        padding: '4px 6px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        color: '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Table size={14} />
                    </button>

                    {/* Equation / Divider Button */}
                    <button
                      title="Đường kẻ ngang phân cách"
                      style={{
                        padding: '4px 6px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        color: '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 800, lineHeight: 1 }}>=</span>
                    </button>
                  </div>

                  {/* Right label: Gõ / để chèn thông tin */}
                  <div style={{ fontSize: '12px', color: '#475569' }}>
                    Gõ / để{' '}
                    <span
                      onClick={() => setShowTokenMenu(true)}
                      style={{ color: '#009688', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      chèn thông tin
                    </span>
                  </div>
                </div>

                {/* ─── TOOLBAR ROW 2 ─── */}
                <div style={{
                  padding: '5px 14px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#f8fafc',
                  gap: '4px',
                  flexShrink: 0
                }}>
                  {/* Undo / Redo */}
                  <button title="Hoàn tác (Undo)" style={{ padding: '3px 5px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                    <Undo2 size={13} />
                  </button>
                  <button title="Làm lại (Redo)" style={{ padding: '3px 5px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                    <Redo2 size={13} />
                  </button>

                  <div style={{ width: '1px', height: '14px', backgroundColor: '#cbd5e1', margin: '0 3px' }} />

                  {/* Copy / Paste / Cut */}
                  <button title="Sao chép (Copy)" style={{ padding: '3px 5px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                    <Copy size={13} />
                  </button>
                  <button title="Dán (Paste)" style={{ padding: '3px 5px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                    <Clipboard size={13} />
                  </button>
                  <button title="Cắt (Cut)" style={{ padding: '3px 5px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                    <Scissors size={13} />
                  </button>

                  <div style={{ width: '1px', height: '14px', backgroundColor: '#cbd5e1', margin: '0 3px' }} />

                  {/* Text Styles: Bold, Italic, Underline, Sub, Super */}
                  <button
                    onClick={() => setEditingTemplate(prev => ({ ...prev, isBold: !prev.isBold }))}
                    title="Đậm (Bold)"
                    style={{
                      padding: '3px 6px',
                      borderRadius: '3px',
                      border: editingTemplate.isBold ? '1px solid #009688' : '1px solid transparent',
                      backgroundColor: editingTemplate.isBold ? '#e6f7f5' : 'transparent',
                      color: editingTemplate.isBold ? '#00796b' : '#334155',
                      fontWeight: 900,
                      cursor: 'pointer'
                    }}
                  >
                    <Bold size={13} />
                  </button>

                  <button
                    onClick={() => setEditingTemplate(prev => ({ ...prev, isItalic: !prev.isItalic }))}
                    title="Nghiêng (Italic)"
                    style={{
                      padding: '3px 6px',
                      borderRadius: '3px',
                      border: editingTemplate.isItalic ? '1px solid #009688' : '1px solid transparent',
                      backgroundColor: editingTemplate.isItalic ? '#e6f7f5' : 'transparent',
                      color: editingTemplate.isItalic ? '#00796b' : '#334155',
                      cursor: 'pointer'
                    }}
                  >
                    <Italic size={13} />
                  </button>

                  <button
                    onClick={() => setEditingTemplate(prev => ({ ...prev, isUnderline: !prev.isUnderline }))}
                    title="Gạch chân (Underline)"
                    style={{
                      padding: '3px 6px',
                      borderRadius: '3px',
                      border: editingTemplate.isUnderline ? '1px solid #009688' : '1px solid transparent',
                      backgroundColor: editingTemplate.isUnderline ? '#e6f7f5' : 'transparent',
                      color: editingTemplate.isUnderline ? '#00796b' : '#334155',
                      cursor: 'pointer'
                    }}
                  >
                    <Underline size={13} />
                  </button>

                  <button title="Chỉ số dưới (Subscript)" style={{ padding: '2px 5px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '11px', color: '#475569', fontWeight: 700 }}>
                    X₁
                  </button>

                  <button title="Chỉ số trên (Superscript)" style={{ padding: '2px 5px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '11px', color: '#475569', fontWeight: 700 }}>
                    X¹
                  </button>

                  <div style={{ width: '1px', height: '14px', backgroundColor: '#cbd5e1', margin: '0 3px' }} />

                  {/* Colors: Text color, Fill color */}
                  <div title="Màu chữ" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', padding: '2px 4px', cursor: 'pointer' }}>
                    <span style={{ fontSize: '12px', fontWeight: 900, lineHeight: 1, color: '#0f172a' }}>A</span>
                    <div style={{ width: '11px', height: '2.5px', backgroundColor: '#009688', marginTop: '1px' }} />
                  </div>

                  <button title="Màu nền" style={{ padding: '3px 5px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                    <Palette size={13} />
                  </button>

                  <div style={{ width: '1px', height: '14px', backgroundColor: '#cbd5e1', margin: '0 3px' }} />

                  {/* Alignments */}
                  <button
                    onClick={() => setEditingTemplate(prev => ({ ...prev, textAlign: 'left' }))}
                    title="Căn lề trái"
                    style={{
                      padding: '3px 5px',
                      borderRadius: '3px',
                      border: editingTemplate.textAlign === 'left' ? '1px solid #80cbc4' : '1px solid transparent',
                      backgroundColor: editingTemplate.textAlign === 'left' ? '#e6f7f5' : 'transparent',
                      color: editingTemplate.textAlign === 'left' ? '#00796b' : '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    <AlignLeft size={13} />
                  </button>

                  <button
                    onClick={() => setEditingTemplate(prev => ({ ...prev, textAlign: 'center' }))}
                    title="Căn giữa (Mặc định)"
                    style={{
                      padding: '3px 5px',
                      borderRadius: '3px',
                      border: (editingTemplate.textAlign || 'center') === 'center' ? '1px solid #80cbc4' : '1px solid transparent',
                      backgroundColor: (editingTemplate.textAlign || 'center') === 'center' ? '#e6f7f5' : 'transparent',
                      color: (editingTemplate.textAlign || 'center') === 'center' ? '#00796b' : '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    <AlignCenter size={13} />
                  </button>

                  <button
                    onClick={() => setEditingTemplate(prev => ({ ...prev, textAlign: 'right' }))}
                    title="Căn lề phải"
                    style={{
                      padding: '3px 5px',
                      borderRadius: '3px',
                      border: editingTemplate.textAlign === 'right' ? '1px solid #80cbc4' : '1px solid transparent',
                      backgroundColor: editingTemplate.textAlign === 'right' ? '#e6f7f5' : 'transparent',
                      color: editingTemplate.textAlign === 'right' ? '#00796b' : '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    <AlignRight size={13} />
                  </button>

                  <button title="Căn đều 2 bên" style={{ padding: '3px 5px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                    <AlignJustify size={13} />
                  </button>

                  <button title="Danh sách đầu dòng" style={{ padding: '3px 5px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                    <List size={13} />
                  </button>

                  <div style={{ width: '1px', height: '14px', backgroundColor: '#cbd5e1', margin: '0 3px' }} />

                  {/* Grid / Border icons */}
                  <button title="Viền bảng" style={{ padding: '3px 5px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                    <Grid size={13} color="#009688" />
                  </button>
                </div>

                {/* ─── CANVAS AREA ─── */}
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '20px 24px',
                  backgroundColor: '#f8fafc'
                }}>
                  {isSourceMode ? (
                    /* SOURCE CODE MODE */
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                          Mã nguồn HTML / Template Markup:
                        </span>
                        <button
                          onClick={() => setIsSourceMode(false)}
                          style={{
                            padding: '3px 10px',
                            borderRadius: '4px',
                            border: '1px solid #009688',
                            backgroundColor: '#e6f7f5',
                            color: '#00796b',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Quay lại giao diện trực quan
                        </button>
                      </div>
                      <textarea
                        readOnly
                        value={sourceHtml}
                        style={{
                          flex: 1,
                          width: '100%',
                          minHeight: '440px',
                          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                          fontSize: '12px',
                          backgroundColor: '#0f172a',
                          color: '#38bdf8',
                          padding: '14px',
                          borderRadius: '6px',
                          border: '1px solid #334155',
                          resize: 'none',
                          outline: 'none',
                          lineHeight: '1.6'
                        }}
                      />
                    </div>
                  ) : (
                    /* INTERACTIVE WYSIWYG CANVAS WITH DASHED WIREFRAMES (IMAGE FEDE25C9 STYLE) */
                    <div style={{
                      backgroundColor: '#ffffff',
                      padding: '24px 28px',
                      borderRadius: '4px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      fontFamily: "'Times New Roman', Times, 'Song Myung', serif",
                      color: '#000000',
                      maxWidth: '560px',
                      margin: '0 auto',
                      boxSizing: 'border-box'
                    }}>

                      {/* ─── KHỐI 1: THÔNG TIN CỬA HÀNG (DASHED BOX) ─── */}
                      <div style={{
                        border: '1px dashed #cbd5e1',
                        padding: '12px 14px',
                        textAlign: editingTemplate.textAlign || 'center',
                        marginBottom: '8px',
                        borderRadius: '2px',
                        transition: 'border-color 0.15s ease'
                      }}>
                        {/* Line 1: Company Name */}
                        <input
                          type="text"
                          value={editingTemplate.companyName || ''}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, companyName: e.target.value })}
                          placeholder="HỆ THỐNG TRÀ & ẨM THỰC"
                          style={{
                            width: '100%',
                            border: 'none',
                            outline: 'none',
                            background: 'transparent',
                            textAlign: editingTemplate.textAlign || 'center',
                            fontWeight: editingTemplate.isBold ? 900 : 700,
                            fontSize: '15px',
                            color: '#000000',
                            fontFamily: 'inherit',
                            letterSpacing: '0.4px',
                            margin: 0,
                            padding: '2px 0'
                          }}
                        />

                        {/* Line 2: Main Store Name */}
                        <input
                          type="text"
                          value={editingTemplate.storeName || ''}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, storeName: e.target.value })}
                          placeholder="QUÁN TRÀ - SPECIALTY TEA & COFFEE"
                          style={{
                            width: '100%',
                            border: 'none',
                            outline: 'none',
                            background: 'transparent',
                            textAlign: editingTemplate.textAlign || 'center',
                            fontWeight: editingTemplate.isBold ? 900 : 700,
                            fontSize: '18px',
                            color: '#000000',
                            fontFamily: 'inherit',
                            letterSpacing: '0.4px',
                            margin: '2px 0',
                            padding: '2px 0'
                          }}
                        />

                        {/* Line 3: Address */}
                        <input
                          type="text"
                          value={editingTemplate.address || ''}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, address: e.target.value })}
                          placeholder="103 Trần Hưng Đạo, Đặc khu Phú Quốc, Tỉnh An Giang"
                          style={{
                            width: '100%',
                            border: 'none',
                            outline: 'none',
                            background: 'transparent',
                            textAlign: editingTemplate.textAlign || 'center',
                            fontSize: '11.5px',
                            color: '#1e293b',
                            fontFamily: 'inherit',
                            margin: '1px 0',
                            padding: '1px 0'
                          }}
                        />

                        {/* Line 4: Hotline */}
                        <input
                          type="text"
                          value={editingTemplate.hotline || ''}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, hotline: e.target.value })}
                          placeholder="HOTLINE: 0901.234.567 - 0988.888.888"
                          style={{
                            width: '100%',
                            border: 'none',
                            outline: 'none',
                            background: 'transparent',
                            textAlign: editingTemplate.textAlign || 'center',
                            fontWeight: 700,
                            fontSize: '11.5px',
                            color: '#000000',
                            fontFamily: 'inherit',
                            margin: '1px 0',
                            padding: '1px 0'
                          }}
                        />
                      </div>

                      {/* ─── KHỐI 2: TIÊU ĐỀ & TOKEN ORDER CODE (DASHED BOX) ─── */}
                      <div style={{
                        border: '1px dashed #cbd5e1',
                        padding: '10px 14px',
                        textAlign: 'center',
                        marginBottom: '8px',
                        borderRadius: '2px'
                      }}>
                        <input
                          type="text"
                          value={editingTemplate.title || ''}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, title: e.target.value })}
                          placeholder="HÓA ĐƠN TÍNH TIỀN"
                          style={{
                            width: '100%',
                            border: 'none',
                            outline: 'none',
                            background: 'transparent',
                            textAlign: 'center',
                            fontWeight: 900,
                            fontSize: '17px',
                            color: '#000000',
                            fontFamily: 'inherit',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            margin: 0,
                            padding: '2px 0'
                          }}
                        />

                        {editingTemplate.tokensState?.orderCode !== false && (
                          <div style={{ marginTop: '5px', display: 'flex', justifyContent: 'center' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: '#e0f2fe',
                              color: '#0284c7',
                              border: '1px solid #bae6fd',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              fontFamily: 'system-ui, sans-serif'
                            }}>
                              Order code
                              <X
                                size={11}
                                style={{ cursor: 'pointer', strokeWidth: 2.5 }}
                                onClick={() => handleToggleToken('orderCode')}
                                title="Xóa trường Order code"
                              />
                            </span>
                          </div>
                        )}
                      </div>

                      {/* ─── KHỐI 3: KHÁCH HÀNG & THỜI GIAN (SPLIT 2 CỘT) ─── */}
                      <div style={{
                        border: '1px dashed #cbd5e1',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        marginBottom: '8px',
                        borderRadius: '2px'
                      }}>
                        {/* Cột trái: Khách hàng */}
                        <div style={{
                          padding: '7px 10px',
                          borderRight: '1px dashed #cbd5e1',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px'
                        }}>
                          <span>Khách hàng:</span>
                          {editingTemplate.tokensState?.client !== false ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              backgroundColor: '#e0f2fe',
                              color: '#0284c7',
                              border: '1px solid #bae6fd',
                              fontSize: '11px',
                              fontWeight: 600,
                              fontFamily: 'system-ui, sans-serif'
                            }}>
                              Client
                              <X size={10} style={{ cursor: 'pointer', strokeWidth: 2.5 }} onClick={() => handleToggleToken('client')} title="Xóa trường Client" />
                            </span>
                          ) : (
                            <span
                              onClick={() => handleToggleToken('client')}
                              style={{ fontSize: '10.5px', color: '#94a3b8', fontStyle: 'italic', cursor: 'pointer' }}
                            >
                              + Thêm Client
                            </span>
                          )}
                        </div>

                        {/* Cột phải: Thời gian */}
                        <div style={{
                          padding: '7px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px'
                        }}>
                          <span>Thời gian:</span>
                          {editingTemplate.tokensState?.billingTime !== false ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              backgroundColor: '#e0f2fe',
                              color: '#0284c7',
                              border: '1px solid #bae6fd',
                              fontSize: '11px',
                              fontWeight: 600,
                              fontFamily: 'system-ui, sans-serif'
                            }}>
                              Billing time
                              <X size={10} style={{ cursor: 'pointer', strokeWidth: 2.5 }} onClick={() => handleToggleToken('billingTime')} title="Xóa trường Billing time" />
                            </span>
                          ) : (
                            <span
                              onClick={() => handleToggleToken('billingTime')}
                              style={{ fontSize: '10.5px', color: '#94a3b8', fontStyle: 'italic', cursor: 'pointer' }}
                            >
                              + Thêm Thời gian
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ─── KHỐI 4: BẢNG CHI TIẾT MÓN ĂN (TABLE VỚI GRIP :::) ─── */}
                      <div style={{
                        border: '1px dashed #cbd5e1',
                        marginBottom: '8px',
                        borderRadius: '2px',
                        position: 'relative'
                      }}>
                        {/* Floating Grip Handle ::: trên góc dưới trái */}
                        <div style={{
                          position: 'absolute',
                          bottom: '-9px',
                          left: '12px',
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          borderRadius: '3px',
                          padding: '1px 3px',
                          color: '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'move',
                          zIndex: 2
                        }} title="Kéo thả di chuyển bảng">
                          <GripVertical size={11} />
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                          <thead>
                            <tr>
                              <th style={{ width: '32%', textAlign: 'left', padding: '6px 8px', fontWeight: 700, borderRight: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1' }}>
                                Tên hàng
                              </th>
                              <th style={{ width: '24%', textAlign: 'center', padding: '6px 8px', fontWeight: 700, borderRight: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1' }}>
                                Đ.Giá
                              </th>
                              <th style={{ width: '5%', textAlign: 'center', padding: '6px 2px', borderRight: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1' }}>
                              </th>
                              <th style={{ width: '14%', textAlign: 'center', padding: '6px 8px', fontWeight: 700, borderRight: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1' }}>
                                SL
                              </th>
                              <th style={{ width: '25%', textAlign: 'right', padding: '6px 8px', fontWeight: 700, borderBottom: '1px dashed #cbd5e1' }}>
                                Thành tiền
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              {/* Cột 1: Tên món & Ghi chú món */}
                              <td style={{ padding: '8px', borderRight: '1px dashed #cbd5e1', verticalAlign: 'top' }}>
                                {editingTemplate.tokensState?.productName !== false && (
                                  <div style={{ marginBottom: '4px' }}>
                                    <span style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '2px 7px',
                                      borderRadius: '4px',
                                      backgroundColor: '#e0f2fe',
                                      color: '#0284c7',
                                      border: '1px solid #bae6fd',
                                      fontSize: '11px',
                                      fontWeight: 600,
                                      fontFamily: 'system-ui, sans-serif'
                                    }}>
                                      Product name
                                      <X size={10} style={{ cursor: 'pointer' }} onClick={() => handleToggleToken('productName')} />
                                    </span>
                                  </div>
                                )}
                                {editingTemplate.tokensState?.productNotes !== false && (
                                  <div>
                                    <span style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      backgroundColor: '#ffedd5',
                                      color: '#c2410c',
                                      border: '1px solid #fed7aa',
                                      fontSize: '10.5px',
                                      fontStyle: 'italic',
                                      fontWeight: 600,
                                      fontFamily: 'system-ui, sans-serif'
                                    }}>
                                      &lt;&gt; Product Notes
                                      <X size={10} style={{ cursor: 'pointer' }} onClick={() => handleToggleToken('productNotes')} />
                                    </span>
                                  </div>
                                )}
                              </td>

                              {/* Cột 2: Đơn giá sau giảm */}
                              <td style={{ padding: '8px', borderRight: '1px dashed #cbd5e1', textAlign: 'center', verticalAlign: 'middle' }}>
                                {editingTemplate.tokensState?.unitPrice !== false ? (
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    backgroundColor: '#ffedd5',
                                    color: '#c2410c',
                                    border: '1px solid #fed7aa',
                                    fontSize: '10.5px',
                                    fontWeight: 600,
                                    fontFamily: 'system-ui, sans-serif'
                                  }}>
                                    &lt;&gt; Discounted unit price
                                    <X size={10} style={{ cursor: 'pointer' }} onClick={() => handleToggleToken('unitPrice')} />
                                  </span>
                                ) : (
                                  <span onClick={() => handleToggleToken('unitPrice')} style={{ fontSize: '10px', color: '#94a3b8', cursor: 'pointer' }}>+ Thêm</span>
                                )}
                              </td>

                              {/* Cột 3: Dấu x */}
                              <td style={{ padding: '8px 2px', borderRight: '1px dashed #cbd5e1', textAlign: 'center', verticalAlign: 'middle', color: '#64748b' }}>
                                x
                              </td>

                              {/* Cột 4: Số lượng */}
                              <td style={{ padding: '8px', borderRight: '1px dashed #cbd5e1', textAlign: 'center', verticalAlign: 'middle' }}>
                                {editingTemplate.tokensState?.quantity !== false ? (
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '2px 7px',
                                    borderRadius: '4px',
                                    backgroundColor: '#e0f2fe',
                                    color: '#0284c7',
                                    border: '1px solid #bae6fd',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    fontFamily: 'system-ui, sans-serif'
                                  }}>
                                    Quantity
                                    <X size={10} style={{ cursor: 'pointer' }} onClick={() => handleToggleToken('quantity')} />
                                  </span>
                                ) : (
                                  <span onClick={() => handleToggleToken('quantity')} style={{ fontSize: '10px', color: '#94a3b8', cursor: 'pointer' }}>+ Thêm</span>
                                )}
                              </td>

                              {/* Cột 5: Thành tiền */}
                              <td style={{ padding: '8px', textAlign: 'right', verticalAlign: 'middle' }}>
                                {editingTemplate.tokensState?.amount !== false ? (
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '2px 7px',
                                    borderRadius: '4px',
                                    backgroundColor: '#e0f2fe',
                                    color: '#0284c7',
                                    border: '1px solid #bae6fd',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    fontFamily: 'system-ui, sans-serif'
                                  }}>
                                    Total amount
                                    <X size={10} style={{ cursor: 'pointer' }} onClick={() => handleToggleToken('amount')} />
                                  </span>
                                ) : (
                                  <span onClick={() => handleToggleToken('amount')} style={{ fontSize: '10px', color: '#94a3b8', cursor: 'pointer' }}>+ Thêm</span>
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* ─── KHỐI 5: TÍNH TIỀN & TỔNG CỘNG (DASHED BOX) ─── */}
                      <div style={{
                        border: '1px dashed #cbd5e1',
                        marginBottom: '8px',
                        borderRadius: '2px'
                      }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                          <tbody>
                            {/* Dòng 1: Tổng tiền hàng */}
                            <tr>
                              <td style={{ width: '42%', padding: '6px 10px', borderRight: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1' }}>
                                Tổng tiền hàng:
                              </td>
                              <td style={{ padding: '6px 10px', textAlign: 'right', borderBottom: '1px dashed #cbd5e1' }}>
                                {editingTemplate.tokensState?.subtotal !== false ? (
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: '#e0f2fe',
                                    color: '#0284c7',
                                    border: '1px solid #bae6fd',
                                    fontSize: '11.5px',
                                    fontWeight: 600,
                                    fontFamily: 'system-ui, sans-serif'
                                  }}>
                                    Total amount of goods
                                    <X size={10} style={{ cursor: 'pointer' }} onClick={() => handleToggleToken('subtotal')} />
                                  </span>
                                ) : (
                                  <span onClick={() => handleToggleToken('subtotal')} style={{ fontSize: '10px', color: '#94a3b8', cursor: 'pointer' }}>+ Thêm</span>
                                )}
                              </td>
                            </tr>

                            {/* Dòng 2: Giảm giá */}
                            <tr>
                              <td style={{ width: '42%', padding: '6px 10px', borderRight: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1' }}>
                                Giảm giá:
                              </td>
                              <td style={{ padding: '6px 10px', textAlign: 'right', borderBottom: '1px dashed #cbd5e1' }}>
                                {editingTemplate.tokensState?.discount !== false ? (
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: '#e0f2fe',
                                    color: '#0284c7',
                                    border: '1px solid #bae6fd',
                                    fontSize: '11.5px',
                                    fontWeight: 600,
                                    fontFamily: 'system-ui, sans-serif'
                                  }}>
                                    Invoice discount
                                    <X size={10} style={{ cursor: 'pointer' }} onClick={() => handleToggleToken('discount')} />
                                  </span>
                                ) : (
                                  <span onClick={() => handleToggleToken('discount')} style={{ fontSize: '10px', color: '#94a3b8', cursor: 'pointer' }}>+ Thêm</span>
                                )}
                              </td>
                            </tr>

                            {/* Dòng 3: Tổng Cộng */}
                            <tr>
                              <td style={{ width: '42%', padding: '7px 10px', borderRight: '1px dashed #cbd5e1', fontWeight: 900, fontSize: '13px' }}>
                                Tổng Cộng:
                              </td>
                              <td style={{ padding: '7px 10px', textAlign: 'right' }}>
                                {editingTemplate.tokensState?.total !== false ? (
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '3px 10px',
                                    borderRadius: '4px',
                                    backgroundColor: '#e0f2fe',
                                    color: '#0284c7',
                                    border: '1px solid #bae6fd',
                                    fontSize: '12px',
                                    fontWeight: 800,
                                    fontFamily: 'system-ui, sans-serif'
                                  }}>
                                    Total
                                    <X size={11} style={{ cursor: 'pointer' }} onClick={() => handleToggleToken('total')} />
                                  </span>
                                ) : (
                                  <span onClick={() => handleToggleToken('total')} style={{ fontSize: '10px', color: '#94a3b8', cursor: 'pointer' }}>+ Thêm</span>
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* ─── KHỐI 6: LỜI CẢM ƠN CHÂN TRANG (DASHED BOX VỚI GRIP & CHEVRON) ─── */}
                      <div style={{
                        border: '1px dashed #cbd5e1',
                        padding: '14px 16px',
                        textAlign: 'center',
                        borderRadius: '2px',
                        position: 'relative',
                        marginTop: '10px'
                      }}>
                        {/* Floating Grip Handle ::: trên góc dưới trái */}
                        <div style={{
                          position: 'absolute',
                          bottom: '-8px',
                          left: '12px',
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          borderRadius: '3px',
                          padding: '1px 3px',
                          color: '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'move',
                          zIndex: 2
                        }}>
                          <GripVertical size={11} />
                        </div>

                        {/* Floating Dropdown Chevron v trên góc dưới phải */}
                        <div style={{
                          position: 'absolute',
                          bottom: '-8px',
                          right: '12px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '3px',
                          padding: '1px 3px',
                          color: '#0284c7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          zIndex: 2
                        }}>
                          <ChevronDown size={11} />
                        </div>

                        <input
                          type="text"
                          value={editingTemplate.footerThankYou || ''}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, footerThankYou: e.target.value })}
                          placeholder="Cảm ơn Quý Khách & Hẹn Gặp Lại!"
                          style={{
                            width: '100%',
                            border: 'none',
                            outline: 'none',
                            background: 'transparent',
                            textAlign: 'center',
                            fontStyle: 'italic',
                            fontSize: '13px',
                            color: '#000000',
                            fontFamily: 'inherit',
                            margin: 0,
                            padding: '2px 0'
                          }}
                        />
                      </div>

                    </div>
                  )}
                </div>
              </div>

              {/* ─── RIGHT: Live Preview (Image 2) ─── */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#f1f5f9',
                position: 'relative'
              }}>
                {/* Preview Controls Bar */}
                <div style={{
                  height: '46px',
                  padding: '0 16px',
                  backgroundColor: '#ffffff',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexShrink: 0
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>
                    {t('admin.settings.previewPrintTemplate') || 'Xem trước mẫu in'}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Paper Size */}
                    <select
                      value={editingTemplate.paperSize}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, paperSize: e.target.value })}
                      style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    >
                      <option value="k80">Khổ K80 (80mm)</option>
                      <option value="k57">Khổ K57 (57mm)</option>
                    </select>

                    {/* Orientation Toggle */}
                    <div style={{ display: 'flex', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                      <button
                        onClick={() => setEditingTemplate({ ...editingTemplate, orientation: 'portrait' })}
                        style={{
                          padding: '4px 10px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          border: 'none',
                          backgroundColor: editingTemplate.orientation === 'portrait' ? '#009688' : '#ffffff',
                          color: editingTemplate.orientation === 'portrait' ? '#ffffff' : '#64748b',
                          cursor: 'pointer'
                        }}
                      >
                        {t('admin.settings.formatPortrait') || 'Khổ dọc'}
                      </button>
                      <button
                        onClick={() => setEditingTemplate({ ...editingTemplate, orientation: 'landscape' })}
                        style={{
                          padding: '4px 10px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          border: 'none',
                          backgroundColor: editingTemplate.orientation === 'landscape' ? '#009688' : '#ffffff',
                          color: editingTemplate.orientation === 'landscape' ? '#ffffff' : '#64748b',
                          cursor: 'pointer'
                        }}
                      >
                        {t('admin.settings.formatLandscape') || 'Khổ ngang'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Real-time Paper Rendering */}
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '24px 20px 60px 20px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  backgroundColor: '#cbd5e1',
                  position: 'relative'
                }}>
                  {renderThermalBillPreview(editingTemplate, editorZoom)}

                  {/* Floating Zoom Controls in bottom right corner (Image 2 style) */}
                  <div style={{
                    position: 'absolute',
                    bottom: '16px',
                    right: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#ffffff',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    border: '1px solid #cbd5e1',
                    overflow: 'hidden',
                    zIndex: 10
                  }}>
                    <button
                      onClick={() => setEditorZoom(prev => Math.max(60, prev - 10))}
                      title="Thu nhỏ"
                      style={{ padding: '4px 8px', border: 'none', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <Minus size={12} color="#475569" />
                    </button>
                    <span style={{ minWidth: '42px', textAlign: 'center', fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>
                      {editorZoom}%
                    </span>
                    <button
                      onClick={() => setEditorZoom(prev => Math.min(130, prev + 10))}
                      title="Phóng to"
                      style={{ padding: '4px 8px', border: 'none', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <Plus size={12} color="#475569" />
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          CONFIRM DELETE TEMPLATE MODAL (Yêu cầu thông báo xóa mẫu in)
          ══════════════════════════════════════════════════════════════ */}
      {deleteModalOpen && templateToDelete && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            maxWidth: '420px',
            width: '100%',
            padding: '20px 24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444', marginBottom: '12px' }}>
              <AlertCircle size={22} />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                {t('admin.settings.confirmDeleteTemplateTitle') || 'Xác nhận xóa mẫu in'}
              </h3>
            </div>

            <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', margin: '0 0 20px 0' }}>
              Bạn có chắc chắn muốn xóa mẫu in <strong>"{templateToDelete.name}"</strong> không? Thao tác này sẽ xóa vĩnh viễn mẫu in khỏi hệ thống.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setDeleteModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {t('cancel') || 'Hủy'}
              </button>

              <button
                onClick={handleConfirmDelete}
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {t('confirm') || 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TOAST NOTIFICATION ═══ */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '10px 18px',
          borderRadius: '8px',
          fontSize: '12.5px',
          fontWeight: 700,
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 9999999,
          animation: 'fadeIn 0.2s ease'
        }}>
          <CheckCircle size={15} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
