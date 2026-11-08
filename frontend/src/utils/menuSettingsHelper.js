// ════════════════════════════════════════════════════════════════
//  AuraPOS — Menu Settings Helper
//  Quản lý Tag món, Đơn vị tính và Thuộc tính biến thể trong Thiết lập
//  Hỗ trợ đồng bộ đa ngôn ngữ: vi, en, ko, ru
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

// ════════════════════════════════════════════════════════════════
//  TỪ ĐIỂN ĐA NGÔN NGỮ (MULTILINGUAL DICTIONARY)
// ════════════════════════════════════════════════════════════════

export const TAG_I18N_MAP = {
  tag_banchay: {
    vi: { name: 'Bán chạy', desc: 'Món bán chạy nhất của quán' },
    en: { name: 'Best Seller', desc: 'Best-selling dishes of the store' },
    ko: { name: '베스트셀러', desc: '매장 내 최고 인기 메뉴' },
    ru: { name: 'Хит продаж', desc: 'Самые популярные блюда заведения' }
  },
  tag_nenthu: {
    vi: { name: 'Nên thử', desc: 'Món đặc trưng khuyến nghị nên trải nghiệm' },
    en: { name: 'Must Try', desc: 'Signature dishes recommended for first-time guests' },
    ko: { name: '추천 메뉴', desc: '꼭 맛보아야 할 시그니처 추천 메뉴' },
    ru: { name: 'Рекомендуем', desc: 'Фирменные блюда, рекомендованные к дегустации' }
  },
  tag_monmoi: {
    vi: { name: 'Món mới', desc: 'Món mới ra mắt trong thực đơn' },
    en: { name: 'New Item', desc: 'Newly released dishes in the menu' },
    ko: { name: '신메뉴', desc: '새롭게 출시된 신규 메뉴' },
    ru: { name: 'Новинка', desc: 'Новые позиции в нашем меню' }
  },
  tag_dacsan: {
    vi: { name: 'Đặc sản Quán Trà', desc: 'Hương vị độc quyền tại Quán Trà' },
    en: { name: 'Quan Tra Specialty', desc: 'Exclusive signature flavors at Quan Tra restaurant' },
    ko: { name: '콴짜 특선', desc: '콴짜 레스토랑의 독점적인 시그니처 풍미' },
    ru: { name: 'Фирменное «Куан Ча»', desc: 'Эксклюзивный фирменный вкус ресторана' }
  },
  tag_cay: {
    vi: { name: 'Cay', desc: 'Món có vị cay kích thích vị giác' },
    en: { name: 'Spicy', desc: 'Spicy dishes stimulating appetite' },
    ko: { name: '매운맛', desc: '입맛을 돋우는 매콤한 요리' },
    ru: { name: 'Острое', desc: 'Острые блюда с ярким пикантным вкусом' }
  },
  tag_monchay: {
    vi: { name: 'Món chay', desc: 'Phù hợp khách ăn chay hoặc ăn thanh đạm' },
    en: { name: 'Vegetarian', desc: 'Suitable for vegetarians or light dining' },
    ko: { name: '채식 (비건)', desc: '채식주의자 또는 담백한 식사를 위한 메뉴' },
    ru: { name: 'Вегетарианское', desc: 'Для вегетарианцев и любителей легких блюд' }
  },
  tag_uongnong: {
    vi: { name: 'Uống nóng', desc: 'Trà nóng & đồ uống phục vụ ấm' },
    en: { name: 'Hot Drink', desc: 'Hot tea & warm served drinks' },
    ko: { name: '따뜻한 음료', desc: '따뜻하게 제공되는 차 및 음료' },
    ru: { name: 'Горячие напитки', desc: 'Горячий чай и согревающие напитки' }
  },
  tag_giainhiet: {
    vi: { name: 'Giải nhiệt', desc: 'Trà lạnh mát, sinh tố & nước ép' },
    en: { name: 'Refreshing', desc: 'Cold refreshing tea, smoothies & fresh juices' },
    ko: { name: '청량 음료', desc: '시원한 아이스티, 스무디 및 생과일 주스' },
    ru: { name: 'Освежающие напитки', desc: 'Холодный чай, смузи и свежевыжатые соки' }
  },
  tag_thitcuu: {
    vi: { name: 'Thịt cừu nướng', desc: 'Các món kebab cừu nướng xiên than hoa' },
    en: { name: 'Grilled Lamb', desc: 'Skewered charcoal-grilled lamb kebabs' },
    ko: { name: '양고기 꼬치구이', desc: '숯불에 직접 구운 양고기 케밥 꼬치' },
    ru: { name: 'Шашлык из баранины', desc: 'Кебабы из сочной баранины на углях' }
  },
  tag_thitbo: {
    vi: { name: 'Thịt bò cao cấp', desc: 'Bò hầm Goulash, bò xào cay' },
    en: { name: 'Premium Beef', desc: 'Goulash beef stew, spicy stir-fried beef' },
    ko: { name: '고급 소고기', desc: '굴라시 소고기 스튜, 매콤 소고기 볶음' },
    ru: { name: 'Премиальная говядина', desc: 'Гуляш из говядины, острая говядина' }
  },
  tag_haisan: {
    vi: { name: 'Hải sản tươi', desc: 'Tôm, sushi hải sản tươi sống' },
    en: { name: 'Fresh Seafood', desc: 'Fresh shrimp, raw seafood sushi' },
    ko: { name: '신선한 해산물', desc: '신선한 새우, 활어 모둠 초밥' },
    ru: { name: 'Свежие морепродукты', desc: 'Свежие креветки, суши с морепродуктами' }
  },
  tag_tradao: {
    vi: { name: 'Trà đạo thượng hạng', desc: 'Trà Thiết Quan Âm, Ô Long, Trà đen cao cấp' },
    en: { name: 'Premium Tea Art', desc: 'Tie Guan Yin, Oolong, premium black tea' },
    ko: { name: '명품 다도 차', desc: '철관음, 우롱차, 고급 홍차' },
    ru: { name: 'Элитный чай', desc: 'Те Гуань Инь, Улун, отборный черный чай' }
  },
  tag_banhtruyenthong: {
    vi: { name: 'Bánh truyền thống', desc: 'Bánh Manti, bánh Samusa nướng lò' },
    en: { name: 'Traditional Pastry', desc: 'Steamed Manti, tandoor-baked Samusa' },
    ko: { name: '전통 페이스트리', desc: '만티 덤플링, 화덕 구이 사무사' },
    ru: { name: 'Традиционная выпечка', desc: 'Манты на пару, самса из тандыра' }
  },
  tag_ankem: {
    vi: { name: 'Món ăn kèm', desc: 'Salad, khoai tây chiên, kim chi' },
    en: { name: 'Side Dish', desc: 'Salad, French fries, kimchi' },
    ko: { name: '사이드 메뉴', desc: '샐러드, 감자튀김, 김치' },
    ru: { name: 'Закуски', desc: 'Салаты, картофель фри, кимчи' }
  },
  tag_khongduong: {
    vi: { name: 'Không đường', desc: 'Đồ uống thuần vị tự nhiên' },
    en: { name: 'Sugar-Free', desc: 'Natural pure flavor drinks' },
    ko: { name: '무설탕', desc: '자연 본연의 맛을 살린 음료' },
    ru: { name: 'Без сахара', desc: 'Напитки с чистым природным вкусом' }
  },
  tag_itngot: {
    vi: { name: 'Ít ngọt', desc: 'Công thức giảm ngọt nhẹ dịu' },
    en: { name: 'Less Sweet', desc: 'Reduced sweetness recipe' },
    ko: { name: '덜 달게', desc: '당도를 낮춘 부드러운 레시피' },
    ru: { name: 'Менее сладкий', desc: 'Рецепт с пониженным содержанием сахара' }
  }
};

// Map lookup by Vietnamese name
export const TAG_NAME_I18N_MAP = {
  'bán chạy': TAG_I18N_MAP.tag_banchay,
  'nên thử': TAG_I18N_MAP.tag_nenthu,
  'món mới': TAG_I18N_MAP.tag_monmoi,
  'đặc sản quán trà': TAG_I18N_MAP.tag_dacsan,
  'cay': TAG_I18N_MAP.tag_cay,
  'món chay': TAG_I18N_MAP.tag_monchay,
  'uống nóng': TAG_I18N_MAP.tag_uongnong,
  'giải nhiệt': TAG_I18N_MAP.tag_giainhiet,
  'thịt cừu nướng': TAG_I18N_MAP.tag_thitcuu,
  'thịt bò cao cấp': TAG_I18N_MAP.tag_thitbo,
  'hải sản tươi': TAG_I18N_MAP.tag_haisan,
  'trà đạo thượng hạng': TAG_I18N_MAP.tag_tradao,
  'bánh truyền thống': TAG_I18N_MAP.tag_banhtruyenthong,
  'món ăn kèm': TAG_I18N_MAP.tag_ankem,
  'không đường': TAG_I18N_MAP.tag_khongduong,
  'ít ngọt': TAG_I18N_MAP.tag_itngot
};

export const UNIT_I18N_MAP = {
  unit_phan: {
    vi: { name: 'phần', desc: 'Khẩu phần ăn cơm pilaf, bò hầm, bánh manti' },
    en: { name: 'portion', desc: 'Serving portion for pilaf rice, beef stew, manti' },
    ko: { name: '인분', desc: '필라프 볶음밥, 소고기 스튜, 만티 1인분' },
    ru: { name: 'порция', desc: 'Порция плова, гуляша или мантов' }
  },
  unit_dia: {
    vi: { name: 'dĩa', desc: 'Salad Caesar, mì Lagman chiên, đồ nguội' },
    en: { name: 'plate', desc: 'Caesar salad, fried Lagman noodles, cold cuts' },
    ko: { name: '접시', desc: '시저 샐러드, 볶음 라그만 국수, 차가운 요리' },
    ru: { name: 'тарелка', desc: 'Салат Цезарь, жареный лагман, холодные закуски' }
  },
  unit_to: {
    vi: { name: 'tô', desc: 'Súp Shurpa, súp Lagman, súp Borscht củ dền' },
    en: { name: 'bowl', desc: 'Shurpa soup, Lagman soup, Borscht soup' },
    ko: { name: '그릇', desc: '슈르파 수프, 라그만 국물 수프, 보르시 수프' },
    ru: { name: 'миска', desc: 'Суп Шурпа, лагман с бульоном, борщ' }
  },
  unit_xien: {
    vi: { name: 'xiên', desc: 'Kebab cừu nướng xiên, bò nướng xiên, gà nướng' },
    en: { name: 'skewer', desc: 'Skewered lamb kebab, beef skewer, grilled chicken' },
    ko: { name: '꼬치', desc: '양고기 꼬치 케밥, 소고기 꼬치, 구운 닭꼬치' },
    ru: { name: 'шампур', desc: 'Шашлык из баранины, говядины, курицы на углях' }
  },
  unit_am: {
    vi: { name: 'ấm', desc: 'Ấm trà thảo mộc, trà Ô Long, Thiết Quan Âm' },
    en: { name: 'pot', desc: 'Herbal tea pot, Oolong tea, Tie Guan Yin' },
    ko: { name: '주전자', desc: '허브티 포트, 우롱차, 철관음 따뜻한 차' },
    ru: { name: 'чайник', desc: 'Чайник травяного чая, Улуна или Те Гуань Инь' }
  },
  unit_ly: {
    vi: { name: 'ly', desc: 'Nước ép cam tươi, sinh tố, trà đào, trà đá' },
    en: { name: 'glass', desc: 'Fresh orange juice, smoothie, peach tea, iced tea' },
    ko: { name: '잔', desc: '생오렌지 주스, 스무디, 복숭아 아이스티' },
    ru: { name: 'стакан', desc: 'Свежевыжатый сок, смузи, персиковый чай' }
  },
  unit_lon: {
    vi: { name: 'lon', desc: 'Coca-Cola, 7Up, Pepsi, nước ngọt có ga' },
    en: { name: 'can', desc: 'Coca-Cola, 7Up, Pepsi, carbonated soft drinks' },
    ko: { name: '캔', desc: '코카콜라, 칠성사이다, 펩시, 탄산음료' },
    ru: { name: 'банка', desc: 'Кока-кола, Спрайт, Пепси, газировка' }
  },
  unit_chai: {
    vi: { name: 'chai', desc: 'Nước suối khoáng, bia chai, nước trái cây' },
    en: { name: 'bottle', desc: 'Mineral water, bottled beer, fruit juice' },
    ko: { name: '병', desc: '생수, 병맥주, 과일 주스 병' },
    ru: { name: 'бутылка', desc: 'Минеральная вода, бутылочное пиво, соки' }
  },
  unit_cai: {
    vi: { name: 'cái', desc: 'Bánh mì nướng naan, bánh pastry, bánh Samusa' },
    en: { name: 'piece', desc: 'Tandoor naan bread, pastry, baked Samusa' },
    ko: { name: '개', desc: '난 빵, 페이스트리 디저트, 화덕 사무사' },
    ru: { name: 'штука', desc: 'Лепешка тандырная наан, выпечка, самса' }
  },
  unit_set: {
    vi: { name: 'set', desc: 'Set sushi tổng hợp, combo tiệc nướng gia đình' },
    en: { name: 'set', desc: 'Assorted sushi set, family BBQ combo set' },
    ko: { name: '세트', desc: '모둠 스시 세트, 패밀리 바비큐 콤보 세트' },
    ru: { name: 'набор', desc: 'Сет суши ассорти, семейный комбо-набор' }
  },
  unit_cuon: {
    vi: { name: 'cuộn', desc: 'Sushi cuộn maki, roll' },
    en: { name: 'roll', desc: 'Maki sushi roll, California roll' },
    ko: { name: '줄 (롤)', desc: '마키 롤 초밥, 캘리포니아 롤' },
    ru: { name: 'ролл', desc: 'Роллы маки, калифорния' }
  },
  unit_chen: {
    vi: { name: 'chén', desc: 'Chén sốt chấm, gia vị ăn kèm, súp nhỏ' },
    en: { name: 'small bowl', desc: 'Dipping sauce bowl, extra condiments, side soup' },
    ko: { name: '종지', desc: '디핑 소스 볼, 추가 양념, 작은 국물' },
    ru: { name: 'соусник', desc: 'Пиала для соуса, приправы, маленький суп' }
  },
  unit_met: {
    vi: { name: 'mẹt', desc: 'Mẹt nướng thịt thập cẩm' },
    en: { name: 'platter', desc: 'Assorted grilled meat platter' },
    ko: { name: '플래터', desc: '모둠 숯불 고기 플래터 (바구니)' },
    ru: { name: 'поднос', desc: 'Большой поднос с мясным ассорти' }
  },
  unit_hop: {
    vi: { name: 'hộp', desc: 'Hộp đóng gói mang về' },
    en: { name: 'box', desc: 'Takeout takeaway packaging box' },
    ko: { name: '박스 (포장)', desc: '테이크아웃 포장 전용 박스' },
    ru: { name: 'коробка', desc: 'Упаковочный контейнер на вынос' }
  },
  unit_suat: {
    vi: { name: 'suất', desc: 'Suất ăn đặc biệt theo thực đơn' },
    en: { name: 'meal', desc: 'Special menu set meal' },
    ko: { name: '정식', desc: '메뉴 스페셜 정식 식사' },
    ru: { name: 'комплекс', desc: 'Специальный комплексный обед' }
  }
};

export const UNIT_NAME_I18N_MAP = {
  'phần': UNIT_I18N_MAP.unit_phan,
  'dĩa': UNIT_I18N_MAP.unit_dia,
  'đĩa': UNIT_I18N_MAP.unit_dia,
  'tô': UNIT_I18N_MAP.unit_to,
  'bát': UNIT_I18N_MAP.unit_to,
  'xiên': UNIT_I18N_MAP.unit_xien,
  'ấm': UNIT_I18N_MAP.unit_am,
  'ly': UNIT_I18N_MAP.unit_ly,
  'cốc': UNIT_I18N_MAP.unit_ly,
  'lon': UNIT_I18N_MAP.unit_lon,
  'chai': UNIT_I18N_MAP.unit_chai,
  'cái': UNIT_I18N_MAP.unit_cai,
  'set': UNIT_I18N_MAP.unit_set,
  'cuộn': UNIT_I18N_MAP.unit_cuon,
  'chén': UNIT_I18N_MAP.unit_chen,
  'mẹt': UNIT_I18N_MAP.unit_met,
  'hộp': UNIT_I18N_MAP.unit_hop,
  'suất': UNIT_I18N_MAP.unit_suat
};

export const ATTR_I18N_MAP = {
  attr_size: {
    vi: {
      name: 'Kích cỡ (Size)',
      desc: 'Kích cỡ ly đồ uống hoặc phần ăn',
      values: ['Size S (Nhỏ)', 'Size M (Vừa)', 'Size L (Lớn)']
    },
    en: {
      name: 'Size',
      desc: 'Drink cup or dish portion size',
      values: ['Size S (Small)', 'Size M (Medium)', 'Size L (Large)']
    },
    ko: {
      name: '사이즈 (크기)',
      desc: '음료 컵 또는 식사 분량 크기',
      values: ['Size S (소)', 'Size M (중)', 'Size L (대)']
    },
    ru: {
      name: 'Размер (Size)',
      desc: 'Размер порции или напитка',
      values: ['Размер S (Маленький)', 'Размер M (Средний)', 'Размер L (Большой)']
    }
  },
  attr_sugar: {
    vi: {
      name: 'Mức đường',
      desc: 'Mức độ ngọt cho các loại trà và nước ép',
      values: ['0% (Không đường)', '30%', '50%', '70%', '100% (Chuẩn)']
    },
    en: {
      name: 'Sugar Level',
      desc: 'Sweetness level for teas and fresh juices',
      values: ['0% (No Sugar)', '30%', '50%', '70%', '100% (Standard)']
    },
    ko: {
      name: '당도 선택',
      desc: '차 및 주스 음료의 당도 수준',
      values: ['0% (무설탕)', '30%', '50%', '70%', '100% (기본)']
    },
    ru: {
      name: 'Уровень сахара',
      desc: 'Уровень сладости для чая и соков',
      values: ['0% (Без сахара)', '30%', '50%', '70%', '100% (Стандарт)']
    }
  },
  attr_ice: {
    vi: {
      name: 'Mức đá',
      desc: 'Lượng đá làm mát đồ uống',
      values: ['Không đá', 'Ít đá (30%)', 'Đá vừa (50%)', 'Bình thường (100%)']
    },
    en: {
      name: 'Ice Level',
      desc: 'Ice quantity for chilled beverages',
      values: ['No Ice', 'Less Ice (30%)', 'Medium Ice (50%)', 'Regular Ice (100%)']
    },
    ko: {
      name: '얼음량 선택',
      desc: '시원한 음료의 얼음 양 조절',
      values: ['얼음 없음', '얼음 적게 (30%)', '보통 얼음 (50%)', '기본 얼음 (100%)']
    },
    ru: {
      name: 'Уровень льда',
      desc: 'Количество льда в прохладительных напитках',
      values: ['Без льда', 'Мало льда (30%)', 'Средне (50%)', 'Обычный лед (100%)']
    }
  }
};

export const ATTR_NAME_I18N_MAP = {
  'kích cỡ (size)': ATTR_I18N_MAP.attr_size,
  'kích cỡ': ATTR_I18N_MAP.attr_size,
  'size': ATTR_I18N_MAP.attr_size,
  'mức đường': ATTR_I18N_MAP.attr_sugar,
  'đường': ATTR_I18N_MAP.attr_sugar,
  'mức đá': ATTR_I18N_MAP.attr_ice,
  'đá': ATTR_I18N_MAP.attr_ice
};

export const ATTR_VALUE_I18N_MAP = {
  // Size values
  'size s (nhỏ)': { vi: 'Size S (Nhỏ)', en: 'Size S (Small)', ko: 'Size S (소)', ru: 'Размер S (Маленький)' },
  'size m (vừa)': { vi: 'Size M (Vừa)', en: 'Size M (Medium)', ko: 'Size M (중)', ru: 'Размер M (Средний)' },
  'size l (lớn)': { vi: 'Size L (Lớn)', en: 'Size L (Large)', ko: 'Size L (대)', ru: 'Размер L (Большой)' },
  // Sugar values
  '0% (không đường)': { vi: '0% (Không đường)', en: '0% (No Sugar)', ko: '0% (무설탕)', ru: '0% (Без сахара)' },
  '30%': { vi: '30%', en: '30%', ko: '30%', ru: '30%' },
  '50%': { vi: '50%', en: '50%', ko: '50%', ru: '50%' },
  '70%': { vi: '70%', en: '70%', ko: '70%', ru: '70%' },
  '100% (chuẩn)': { vi: '100% (Chuẩn)', en: '100% (Standard)', ko: '100% (기본)', ru: '100% (Стандарт)' },
  // Ice values
  'không đá': { vi: 'Không đá', en: 'No Ice', ko: '얼음 없음', ru: 'Без льда' },
  'ít đá (30%)': { vi: 'Ít đá (30%)', en: 'Less Ice (30%)', ko: '얼음 적게 (30%)', ru: 'Мало льда (30%)' },
  'đá vừa (50%)': { vi: 'Đá vừa (50%)', en: 'Medium Ice (50%)', ko: '보통 얼음 (50%)', ru: 'Средне (50%)' },
  'bình thường (100%)': { vi: 'Bình thường (100%)', en: 'Regular Ice (100%)', ko: '기본 얼음 (100%)', ru: 'Обычный лед (100%)' }
};

export const COLOR_I18N_MAP = {
  '#1b5e20': { vi: 'Xanh lá rừng', en: 'Forest Green', ko: '포레스트 그린', ru: 'Лесной зеленый' },
  '#e65100': { vi: 'Cam tươi', en: 'Fresh Orange', ko: '오렌지', ru: 'Оранжевый' },
  '#dc2626': { vi: 'Đỏ ớt', en: 'Chili Red', ko: '칠리 레드', ru: 'Красный чили' },
  '#0284c7': { vi: 'Xanh dương', en: 'Sky Blue', ko: '스카이 블루', ru: 'Синий' },
  '#b45309': { vi: 'Vàng hổ phách', en: 'Amber Gold', ko: '앰버 골드', ru: 'Янтарный' },
  '#7e22ce': { vi: 'Tím hoàng gia', en: 'Royal Purple', ko: '로열 퍼플', ru: 'Королевский пурпур' },
  '#059669': { vi: 'Lục bảo ngọc', en: 'Emerald Green', ko: '에메랄드', ru: 'Изумрудный' },
  '#4b5563': { vi: 'Xám đá slate', en: 'Slate Gray', ko: '슬레이트 그레이', ru: 'Грифельный серый' },
  '#7c2d12': { vi: 'Nâu đất', en: 'Earthy Brown', ko: '어스 브라운', ru: 'Землисто-коричневый' }
};

// ════════════════════════════════════════════════════════════════
//  HELPER FUNCTIONS (ĐỒNG BỘ HIỂN THỊ ĐA NGÔN NGỮ)
// ════════════════════════════════════════════════════════════════

/**
 * Localize tag name & description based on current language
 */
export function localizeMenuTag(tag, lang = 'vi') {
  if (!tag) return { name: '', desc: '' };
  const tagId = tag.id || '';
  const rawName = tag.name || '';
  const rawDesc = tag.desc || '';

  const def = TAG_I18N_MAP[tagId] || TAG_NAME_I18N_MAP[rawName.toLowerCase().trim()];
  if (def && def[lang]) {
    return {
      name: def[lang].name || rawName,
      desc: def[lang].desc || rawDesc
    };
  }
  return { name: rawName, desc: rawDesc };
}

/**
 * Localize unit name & description based on current language
 */
export function localizeMenuUnit(unit, lang = 'vi') {
  if (!unit) return { name: '', desc: '' };
  const unitId = unit.id || '';
  const rawName = unit.name || '';
  const rawDesc = unit.desc || '';

  const def = UNIT_I18N_MAP[unitId] || UNIT_NAME_I18N_MAP[rawName.toLowerCase().trim()];
  if (def && def[lang]) {
    return {
      name: def[lang].name || rawName,
      desc: def[lang].desc || rawDesc
    };
  }
  return { name: rawName, desc: rawDesc };
}

/**
 * Localize attribute value string
 */
export function localizeAttrValue(val, lang = 'vi') {
  if (!val || typeof val !== 'string') return val || '';
  const lower = val.toLowerCase().trim();
  const found = ATTR_VALUE_I18N_MAP[lower];
  if (found && found[lang]) return found[lang];
  return val;
}

/**
 * Localize attribute object (name, description, values list)
 */
export function localizeMenuAttribute(attr, lang = 'vi') {
  if (!attr) return { name: '', desc: '', values: [] };
  const attrId = attr.id || '';
  const rawName = attr.name || '';
  const rawDesc = attr.desc || '';
  const rawValues = Array.isArray(attr.values) ? attr.values : [];

  const def = ATTR_I18N_MAP[attrId] || ATTR_NAME_I18N_MAP[rawName.toLowerCase().trim()];
  if (def && def[lang]) {
    return {
      name: def[lang].name || rawName,
      desc: def[lang].desc || rawDesc,
      values: (def[lang].values || rawValues).map(v => localizeAttrValue(v, lang))
    };
  }

  return {
    name: rawName,
    desc: rawDesc,
    values: rawValues.map(v => localizeAttrValue(v, lang))
  };
}

/**
 * Localize color palette name
 */
export function localizeColorName(colorHexOrName, lang = 'vi') {
  if (!colorHexOrName) return '';
  const lower = colorHexOrName.toLowerCase().trim();
  const byHex = COLOR_I18N_MAP[lower];
  if (byHex && byHex[lang]) return byHex[lang];

  // Try finding by name
  for (const item of Object.values(COLOR_I18N_MAP)) {
    for (const l of ['vi', 'en', 'ko', 'ru']) {
      if (item[l] && item[l].toLowerCase() === lower) {
        return item[lang] || colorHexOrName;
      }
    }
  }
  return colorHexOrName;
}

// ════════════════════════════════════════════════════════════════
//  STORAGE ACCESSORS (LOCALSTORAGE CRUD)
// ════════════════════════════════════════════════════════════════

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
