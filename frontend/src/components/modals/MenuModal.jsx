import React, { useState } from 'react';
import { X, Search, Plus, Utensils, Check } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export function MenuModal({
  isOpen,
  onClose,
  menuCategories = [],
  selectedTable,
  onAddItemToOrder
}) {
  const { t, formatTableName, formatDishName, formatCategoryName, formatDishUnit } = useLanguage();
  const [selectedCatId, setSelectedCatId] = useState('all');
  const [searchWord, setSearchWord] = useState('');
  const [activeNote, setActiveNote] = useState('');
  const [lastAddedId, setLastAddedId] = useState(null);

  if (!isOpen) return null;

  const notePresets = [
    { key: 'lessOnion', label: t('notePresets.lessOnion') },
    { key: 'mildSpicy', label: t('notePresets.mildSpicy') },
    { key: 'noSugarExtraIce', label: t('notePresets.noSugarExtraIce') },
    { key: 'noChili', label: t('notePresets.noChili') },
    { key: 'lessSugarLessIce', label: t('notePresets.lessSugarLessIce') },
    { key: 'wellDone', label: t('notePresets.wellDone') },
    { key: 'serveFirst', label: t('notePresets.serveFirst') },
    { key: 'takeawayNote', label: t('notePresets.takeawayNote') },
  ];

  // Flatten products
  const allProducts = menuCategories.flatMap(cat =>
    (cat.products || []).map(p => ({ ...p, categoryName: cat.name, catId: cat.id }))
  );

  const filteredProducts = allProducts.filter(p => {
    if (selectedCatId !== 'all' && p.catId !== selectedCatId) return false;
    if (searchWord.trim() !== '') {
      const q = searchWord.toLowerCase().trim();
      const locName = formatDishName(p.name, p.code).toLowerCase();
      return p.name.toLowerCase().includes(q) || locName.includes(q) || (p.code && p.code.toLowerCase().includes(q));
    }
    return true;
  });

  const handleAdd = (product) => {
    onAddItemToOrder(product, 1, activeNote);
    setLastAddedId(product.id);
    setTimeout(() => setLastAddedId(null), 1200);
  };

  const formatMoney = (val) => Number(val || 0).toLocaleString('vi-VN') + ' đ';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }}>
      <div style={{
        width: '900px',
        maxWidth: '95vw',
        height: '85vh',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          backgroundColor: '#0b1320',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#009688',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Utensils size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800 }}>{t('menu.title')} (F2)</h2>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                {t('menu.addToOrder')}: <strong style={{ color: '#38bdf8' }}>{selectedTable ? formatTableName(selectedTable.name) : t('table.selectTable')}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: '#ffffff'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Note Quick Chips */}
        <div style={{
          padding: '12px 20px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{
              flex: 1,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '0 12px',
              height: '38px'
            }}>
              <Search size={16} color="#94a3b8" style={{ marginRight: '8px' }} />
              <input
                type="text"
                autoFocus
                placeholder={t('menu.searchPlaceholder')}
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '13px' }}
              />
            </div>

            {/* Quick Note input */}
            <input
              type="text"
              placeholder={t('itemNote.placeholder')}
              value={activeNote}
              onChange={(e) => setActiveNote(e.target.value)}
              style={{
                width: '320px',
                height: '38px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0 12px',
                fontSize: '12.5px'
              }}
            />
          </div>

          {/* Preset Note Chips */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{t('notePresets.noteSuggestion')}</span>
            {notePresets.map((note) => (
              <button
                key={note.key}
                onClick={() => setActiveNote(activeNote === note.label ? '' : note.label)}
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  backgroundColor: activeNote === note.label ? '#009688' : '#e2e8f0',
                  color: activeNote === note.label ? '#ffffff' : '#475569',
                  fontWeight: 500
                }}
              >
                {note.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content: Left Category Sidebar & Right Dishes Grid */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Categories Sidebar */}
          <div style={{
            width: '200px',
            backgroundColor: '#f1f5f9',
            borderRight: '1px solid #e2e8f0',
            overflowY: 'auto',
            padding: '10px 8px'
          }}>
            <button
              onClick={() => setSelectedCatId('all')}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 600,
                marginBottom: '4px',
                backgroundColor: selectedCatId === 'all' ? '#009688' : 'transparent',
                color: selectedCatId === 'all' ? '#ffffff' : '#334155'
              }}
            >
              {t('menu.allCategories')} ({allProducts.length})
            </button>

            {menuCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  marginBottom: '4px',
                  backgroundColor: selectedCatId === cat.id ? '#009688' : 'transparent',
                  color: selectedCatId === cat.id ? '#ffffff' : '#334155'
                }}
              >
                {formatCategoryName(cat.name)} ({cat.products ? cat.products.length : 0})
              </button>
            ))}
          </div>

          {/* Dishes Grid */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            backgroundColor: '#ffffff'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '12px'
            }}>
              {filteredProducts.map((p) => {
                const isJustAdded = lastAddedId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleAdd(p)}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: isJustAdded ? '2px solid #009688' : '1px solid #e2e8f0',
                      backgroundColor: isJustAdded ? '#e6f7f5' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '100px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isJustAdded) e.currentTarget.style.borderColor = '#009688';
                    }}
                    onMouseLeave={(e) => {
                      if (!isJustAdded) e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    <div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '4px'
                      }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                          {formatDishName(p.name, p.code)}
                        </span>
                        {isJustAdded ? (
                          <span style={{ color: '#009688' }}><Check size={16} /></span>
                        ) : (
                          <span style={{
                            backgroundColor: '#f1f5f9',
                            color: '#009688',
                            borderRadius: '50%',
                            padding: '3px'
                          }}>
                            <Plus size={13} />
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {p.code} • {formatDishUnit(p.unit)}
                      </div>
                    </div>

                    <div style={{
                      marginTop: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#009688' }}>
                        {formatMoney(p.price)}
                      </span>
                      <span style={{
                        fontSize: '10.5px',
                        fontWeight: 600,
                        backgroundColor: '#f1f5f9',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        color: '#64748b'
                      }}>
                        + {t('add')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                <p style={{ fontSize: '15px', fontWeight: 600 }}>Không tìm thấy món nào</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              borderRadius: '6px',
              backgroundColor: '#009688',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700
            }}
          >
            {t('close')} (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
