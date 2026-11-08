// ════════════════════════════════════════════════════════════════
//  AuraPOS — Menu Settings Helper
//  Quản lý Tag món, Đơn vị tính và Thuộc tính biến thể trong Thiết lập
// ════════════════════════════════════════════════════════════════

export const MENU_TAGS_STORAGE_KEY = 'quan_tra_menu_tags';
export const MENU_UNITS_STORAGE_KEY = 'quan_tra_menu_units';
export const MENU_ATTRS_STORAGE_KEY = 'quan_tra_menu_attributes';

// 1. Tag món thực tế của Quán Trà & Nhà hàng ẩm thực
export const DEFAULT_MENU_TAGS = [
  { id: 'tag_banchay', name: 'Bán chạy', color: '#E65100', bg: '#FFF3E0', desc: 'Món bán chạy nhất của quán' },
  { id: 'tag_nenthu', name: 'Nên thử', color: '#1B5E20', bg: '#E8F5E9', desc: 'Món đặc trưng khuyến nghị nên trải nghiệm' },
  { id: 'tag_monmoi', name: 'Món mới', color: '#0284C7', bg: '#E0F2FE', desc: 'Món mới ra mắt trong thực đơn' },
  { id: 'tag_dacsan', name: 'Đặc sản Quán Trà', color: '#B45309', bg: '#FEF3C7', desc: 'Hương vị độc quyền tại Quán Trà' },
  { id: 'tag_cay', name: 'Cay', color: '#DC2626', bg: '#FEE2E2', desc: 'Món có vị cay kích thích vị giác' },
  { id: 'tag_monchay', name: 'Món chay', color: '#15803D', bg: '#DCFCE7', desc: 'Phù hợp khách ăn chay hoặc ăn thanh đạm' },
  { id: 'tag_uongnong', name: 'Uống nóng', color: '#C2410C', bg: '#FFEDD5', desc: 'Trà nóng & đồ uống phục vụ ấm' },
  { id: 'tag_giainhiet', name: 'Giải nhiệt', color: '#0891B2', bg: '#CFFAFE', desc: 'Trà lạnh mát, sinh tố & nước ép' },
  { id: 'tag_thitcuu', name: 'Thịt cừu nướng', color: '#991B1B', bg: '#FEE2E2', desc: 'Các món kebab cừu nướng xiên than hoa' },
  { id: 'tag_thitbo', name: 'Thịt bò cao cấp', color: '#7C2D12', bg: '#FFEDD5', desc: 'Bò hầm Goulash, bò xào cay' },
  { id: 'tag_haisan', name: 'Hải sản tươi', color: '#0369A1', bg: '#E0F2FE', desc: 'Tôm, sushi hải sản tươi sống' },
  { id: 'tag_tradao', name: 'Trà đạo thượng hạng', color: '#2E7D32', bg: '#E8F5E9', desc: 'Trà Thiết Quan Âm, Ô Long, Trà đen cao cấp' },
  { id: 'tag_banhtruyenthong', name: 'Bánh truyền thống', color: '#A16207', bg: '#FEF9C3', desc: 'Bánh Manti, bánh Samusa nướng lò' },
  { id: 'tag_ankem', name: 'Món ăn kèm', color: '#4B5563', bg: '#F3F4F6', desc: 'Salad, khoai tây chiên, kim chi' },
  { id: 'tag_khongduong', name: 'Không đường', color: '#059669', bg: '#D1FAE5', desc: 'Đồ uống thuần vị tự nhiên' },
  { id: 'tag_itngot', name: 'Ít ngọt', color: '#0D9488', bg: '#CCFBF1', desc: 'Công thức giảm ngọt nhẹ dịu' }
];

// 2. Đơn vị tính thực tế của menu món ăn & đồ uống của quán
export const DEFAULT_MENU_UNITS = [
  { id: 'unit_phan', name: 'phần', desc: 'Khẩu phần ăn cơm pilaf, bò hầm, bánh manti' },
  { id: 'unit_dia', name: 'dĩa', desc: 'Salad Caesar, mì Lagman chiên, đồ nguội' },
  { id: 'unit_to', name: 'tô', desc: 'Súp Shurpa, súp Lagman, súp Borscht củ dền' },
  { id: 'unit_xien', name: 'xiên', desc: 'Kebab cừu nướng xiên, bò nướng xiên, gà nướng' },
  { id: 'unit_am', name: 'ấm', desc: 'Ấm trà thảo mộc, trà Ô Long, Thiết Quan Âm' },
  { id: 'unit_ly', name: 'ly', desc: 'Nước ép cam tươi, sinh tố, trà đào, trà đá' },
  { id: 'unit_lon', name: 'lon', desc: 'Coca-Cola, 7Up, Pepsi, nước ngọt có ga' },
  { id: 'unit_chai', name: 'chai', desc: 'Nước suối khoáng, bia chai, nước trái cây' },
  { id: 'unit_cai', name: 'cái', desc: 'Bánh mì nướng naan, bánh pastry, bánh Samusa' },
  { id: 'unit_set', name: 'set', desc: 'Set sushi tổng hợp, combo tiệc nướng gia đình' },
  { id: 'unit_cuon', name: 'cuộn', desc: 'Sushi cuộn maki, roll' },
  { id: 'unit_chen', name: 'chén', desc: 'Chén sốt chấm, gia vị ăn kèm, súp nhỏ' },
  { id: 'unit_met', name: 'mẹt', desc: 'Mẹt nướng thịt thập cẩm' },
  { id: 'unit_hop', name: 'hộp', desc: 'Hộp đóng gói mang về' },
  { id: 'unit_suat', name: 'suất', desc: 'Suất ăn đặc biệt theo thực đơn' }
];

// 3. Thuộc tính & Biến thể món (Size, Mức đường, Mức đá,...)
export const DEFAULT_MENU_ATTRIBUTES = [
  {
    id: 'attr_size',
    name: 'Kích cỡ (Size)',
    desc: 'Kích cỡ ly đồ uống hoặc phần ăn',
    values: ['Size S (Nhỏ)', 'Size M (Vừa)', 'Size L (Lớn)']
  },
  {
    id: 'attr_sugar',
    name: 'Mức đường',
    desc: 'Mức độ ngọt cho các loại trà và nước ép',
    values: ['0% (Không đường)', '30%', '50%', '70%', '100% (Chuẩn)']
  },
  {
    id: 'attr_ice',
    name: 'Mức đá',
    desc: 'Lượng đá làm mát đồ uống',
    values: ['Không đá', 'Ít đá (30%)', 'Đá vừa (50%)', 'Bình thường (100%)']
  }
];

export function getMenuTags() {
  try {
    const raw = localStorage.getItem(MENU_TAGS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Lỗi đọc menu tags từ localStorage:', e);
  }
  return DEFAULT_MENU_TAGS;
}

export function saveMenuTags(tags) {
  try {
    localStorage.setItem(MENU_TAGS_STORAGE_KEY, JSON.stringify(tags));
    window.dispatchEvent(new CustomEvent('quan_tra_menu_tags_changed', { detail: tags }));
  } catch (e) {
    console.warn('Lỗi lưu menu tags vào localStorage:', e);
  }
}

export function getMenuUnits() {
  try {
    const raw = localStorage.getItem(MENU_UNITS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Lỗi đọc menu units từ localStorage:', e);
  }
  return DEFAULT_MENU_UNITS;
}

export function saveMenuUnits(units) {
  try {
    localStorage.setItem(MENU_UNITS_STORAGE_KEY, JSON.stringify(units));
    window.dispatchEvent(new CustomEvent('quan_tra_menu_units_changed', { detail: units }));
  } catch (e) {
    console.warn('Lỗi lưu menu units vào localStorage:', e);
  }
}

export function getMenuAttributes() {
  try {
    const raw = localStorage.getItem(MENU_ATTRS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Lỗi đọc menu attributes từ localStorage:', e);
  }
  return DEFAULT_MENU_ATTRIBUTES;
}

export function saveMenuAttributes(attrs) {
  try {
    localStorage.setItem(MENU_ATTRS_STORAGE_KEY, JSON.stringify(attrs));
    window.dispatchEvent(new CustomEvent('quan_tra_menu_attributes_changed', { detail: attrs }));
  } catch (e) {
    console.warn('Lỗi lưu menu attributes vào localStorage:', e);
  }
}
