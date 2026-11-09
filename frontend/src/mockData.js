export const initialMockData = {
  summary: {
    total: 24,
    empty: 24,
    occupied: 0,
    billing: 0,
  },
  areas: [
    { id: 1, name: 'Tầng 1', code: 'floor_1' },
    { id: 2, name: 'Tầng 2', code: 'floor_2' },
    { id: 3, name: 'Phòng VIP', code: 'vip' },
    { id: 4, name: 'Sân vườn', code: 'garden' },
  ],
  area_stats: {
    floor_1: { id: 1, name: 'Tầng 1', code: 'floor_1', total: 8 },
    floor_2: { id: 2, name: 'Tầng 2', code: 'floor_2', total: 8 },
    vip: { id: 3, name: 'Phòng VIP', code: 'vip', total: 4 },
    garden: { id: 4, name: 'Sân vườn', code: 'garden', total: 4 },
  },
  tables: [
    // Bàn MANG VỀ - luôn đứng đầu danh sách
    { id: 4, area_id: 1, area_code: 'floor_1', name: 'MANG VỀ', capacity: 1, status: 'empty', guest_count: 0, duration: null, notes: null, is_takeaway: true, is_vip: false, order: null },
    // Tầng 1: 8 bàn trống
    {
      id: 1,
      area_id: 1,
      area_code: 'floor_1',
      name: 'BÀN 01',
      capacity: 4,
      status: 'empty',
      guest_count: 0,
      duration: null,
      notes: null,
      is_takeaway: false,
      is_vip: false,
      order: {
        id: 101,
        table_id: 1,
        order_code: 'ORD-BAN01',
        customer: { id: 1, name: 'Tuấn', phone: '0949085842', customer_group: 'Khách VIP' },
        subtotal: 0,
        discount_percent: 0,
        discount_amount: 0,
        vat_percent: 8,
        vat_amount: 0,
        total_amount: 0,
        sales_channel: 'direct',
        items: []
      }
    },
    { id: 2, area_id: 1, area_code: 'floor_1', name: 'BÀN 02', capacity: 2, status: 'empty', guest_count: 0, duration: null, notes: null, is_takeaway: false, is_vip: false, order: null },
    { id: 3, area_id: 1, area_code: 'floor_1', name: 'BÀN 03', capacity: 4, status: 'empty', guest_count: 0, duration: null, notes: null, is_takeaway: false, is_vip: false, order: null },
    { id: 5, area_id: 1, area_code: 'floor_1', name: 'BÀN 04', capacity: 4, status: 'empty', guest_count: 0, duration: null, notes: null, is_takeaway: false, is_vip: false, order: null },
    { id: 6, area_id: 1, area_code: 'floor_1', name: 'BÀN 05', capacity: 6, status: 'empty', guest_count: 0, duration: null, notes: null, is_takeaway: false, is_vip: false, order: null },
    { id: 7, area_id: 1, area_code: 'floor_1', name: 'BÀN 06', capacity: 2, status: 'empty', guest_count: 0, duration: null, notes: null, is_takeaway: false, is_vip: false, order: null },
    { id: 8, area_id: 1, area_code: 'floor_1', name: 'BÀN 07', capacity: 4, status: 'empty', guest_count: 0, duration: null, notes: null, is_takeaway: false, is_vip: false, order: null },

    // Tầng 2: 8 bàn trống
    { id: 13, area_id: 2, area_code: 'floor_2', name: 'BÀN 08', capacity: 4, status: 'empty', guest_count: 0, duration: null, notes: null, is_takeaway: false, is_vip: false, order: null },
    { id: 14, area_id: 2, area_code: 'floor_2', name: 'BÀN 09', capacity: 4, status: 'empty', guest_count: 0, duration: null, notes: null, is_takeaway: false, is_vip: false, order: null },
    { id: 15, area_id: 2, area_code: 'floor_2', name: 'BÀN 10', capacity: 4, status: 'empty', guest_count: 0, duration: null, notes: null, is_takeaway: false, is_vip: false, order: null },
    { id: 16, area_id: 2, area_code: 'floor_2', name: 'BÀN 11', capacity: 6, status: 'empty', guest_count: 0, duration: null, notes: null, is_takeaway: false, is_vip: false, order: null },
    { id: 17, area_id: 2, area_code: 'floor_2', name: 'BÀN 12', capacity: 4, status: 'empty', guest_count: 0, duration: null, notes: null, is_takeaway: false, is_vip: false, order: null },
    { id: 18, area_id: 2, area_code: 'floor_2', name: 'BÀN 13', capacity: 6, status: 'empty', guest_count: 0, duration: null, notes: null, is_takeaway: false, is_vip: false, order: null },
    { id: 19, area_id: 2, area_code: 'floor_2', name: 'BÀN 14', capacity: 4, status: 'empty', guest_count: 0, duration: null, notes: null, is_takeaway: false, is_vip: false, order: null },
    { id: 20, area_id: 2, area_code: 'floor_2', name: 'BÀN 15', capacity: 6, status: 'empty', guest_count: 0, duration: null, notes: null, is_takeaway: false, is_vip: false, order: null },

    // Phòng VIP: 4 phòng trống
    { id: 9, area_id: 3, area_code: 'vip', name: 'VIP 01', capacity: 8, status: 'empty', guest_count: 0, duration: null, notes: null, is_takeaway: false, is_vip: true, order: null },
    { id: 10, area_id: 3, area_code: 'vip', name: 'VIP 02', capacity: 10, status: 'empty', guest_count: 0, duration: null, notes: null, is_takeaway: false, is_vip: true, order: null },
    { id: 11, area_id: 3, area_code: 'vip', name: 'VIP 03', capacity: 12, status: 'empty', guest_count: 0, duration: null, notes: null, is_takeaway: false, is_vip: true, order: null },
    { id: 12, area_id: 3, area_code: 'vip', name: 'VIP 04', capacity: 8, status: 'empty', guest_count: 0, duration: null, notes: null, is_takeaway: false, is_vip: true, order: null },

    // Sân vườn: 4 bàn trống
    { id: 21, area_id: 4, area_code: 'garden', name: 'VƯỜN 1', capacity: 6, status: 'empty', guest_count: 0, duration: null, notes: null, is_takeaway: false, is_vip: false, order: null },
    { id: 22, area_id: 4, area_code: 'garden', name: 'VƯỜN 2', capacity: 6, status: 'empty', guest_count: 0, duration: null, notes: null, is_takeaway: false, is_vip: false, order: null },
    { id: 23, area_id: 4, area_code: 'garden', name: 'VƯỜN 3', capacity: 6, status: 'empty', guest_count: 0, duration: null, notes: null, is_takeaway: false, is_vip: false, order: null },
    { id: 24, area_id: 4, area_code: 'garden', name: 'VƯỜN 4', capacity: 6, status: 'empty', guest_count: 0, duration: null, notes: null, is_takeaway: false, is_vip: false, order: null },
  ],
  defaultOrderTable3: null,
  customers: [
    { id: 1, name: 'Tuấn', phone: '0949085842', customer_group: 'Khách VIP', code: 'KH00001' },
    { id: 2, name: 'Anh Hoàng', phone: '0912.888.666', customer_group: 'VIP', code: 'KH00002' },
    { id: 3, name: 'Chị Phương Linh', phone: '0988.666.888', customer_group: 'VIP', code: 'KH00003' },
    { id: 4, name: 'Khách vãng lai', phone: '-', customer_group: 'Khách lẻ', code: 'KH00004' },
  ],
  menuList: [
  {
    "id": 1,
    "name": "Món chính",
    "code": "CAT_MAIN",
    "products": [
      {
        "id": 1,
        "name": "Cơm pilaf truyền thống",
        "name_en": "Traditional Plov",
        "code": "MC01",
        "price": 190000,
        "unit": "phần",
        "description": "Cơm, thịt bò, cà rốt, hành tây",
        "category_id": 1
      },
      {
        "id": 2,
        "name": "Kazan kebab",
        "name_en": "Kazan Kebab",
        "code": "MC02",
        "price": 280000,
        "unit": "phần",
        "description": "Thịt, khoai tây, hành tây",
        "category_id": 1
      },
      {
        "id": 3,
        "name": "Bò hầm Goulash",
        "name_en": "Beef Goulash",
        "code": "MC03",
        "price": 190000,
        "unit": "phần",
        "description": "Thịt bò, hành tây, cà rốt, sốt",
        "category_id": 1
      },
      {
        "id": 4,
        "name": "Bánh Manti hấp nhân thịt bò",
        "name_en": "Steamed Beef Manti",
        "code": "MC04",
        "price": 190000,
        "unit": "phần",
        "description": "Bột, thịt bò, hành tây",
        "category_id": 1
      },
      {
        "id": 5,
        "name": "Thịt bò xào cay",
        "name_en": "Spicy Beef",
        "code": "MC05",
        "price": 250000,
        "unit": "phần",
        "description": "Thịt bò, ớt, hành tây, rau củ",
        "category_id": 1
      },
      {
        "id": 6,
        "name": "Lagman Uyghur",
        "name_en": "Uyghur Lagman",
        "code": "MC06",
        "price": 190000,
        "unit": "tô",
        "description": "Mì kéo tay, thịt bò, rau củ",
        "category_id": 1
      },
      {
        "id": 7,
        "name": "Đùi gà ăn kèm khoai tây chiên",
        "name_en": "Chicken Leg with French Fries",
        "code": "MC07",
        "price": 180000,
        "unit": "phần",
        "description": "Đùi gà, khoai tây chiên, rau củ",
        "category_id": 1
      },
      {
        "id": 8,
        "name": "Mì Lagman chiên",
        "name_en": "Fried Lagman",
        "code": "MC08",
        "price": 200000,
        "unit": "dĩa",
        "description": "Mì, thịt bò, rau củ",
        "category_id": 1
      },
      {
        "id": 9,
        "name": "Kurdak (thịt hầm kiểu Trung Á)",
        "name_en": "Kurdak",
        "code": "MC09",
        "price": 280000,
        "unit": "phần",
        "description": "Thịt, khoai tây, hành tây, cà rốt",
        "category_id": 1
      },
      {
        "id": 10,
        "name": "Cánh gà chiên giòn",
        "name_en": "Crispy Chicken Wings",
        "code": "MC10",
        "price": 220000,
        "unit": "phần",
        "description": "Cánh gà, gia vị",
        "category_id": 1
      }
    ]
  },
  {
    "id": 2,
    "name": "Thịt nướng",
    "code": "CAT_BBQ",
    "products": [
      {
        "id": 101,
        "name": "Kebab cừu xay nướng xiên",
        "name_en": "Grilled Lamb Lyulya Kebab",
        "code": "BBQ11",
        "price": 140000,
        "unit": "xiên",
        "description": "Thịt cừu xay, hành tây",
        "category_id": 2
      },
      {
        "id": 102,
        "name": "Kebab bò xay nướng xiên",
        "name_en": "Grilled Beef Lyulya Kebab",
        "code": "BBQ12",
        "price": 140000,
        "unit": "xiên",
        "description": "Thịt bò xay, hành tây",
        "category_id": 2
      },
      {
        "id": 103,
        "name": "Phi lê gà nướng xiên",
        "name_en": "Grilled Chicken Fillet Shashlik",
        "code": "BBQ13",
        "price": 130000,
        "unit": "xiên",
        "description": "Phi lê gà",
        "category_id": 2
      },
      {
        "id": 104,
        "name": "Cánh gà nướng xiên",
        "name_en": "Chicken Wing Shashlik",
        "code": "BBQ14",
        "price": 130000,
        "unit": "xiên",
        "description": "Cánh gà",
        "category_id": 2
      },
      {
        "id": 105,
        "name": "Thịt nướng xiên thập cẩm",
        "name_en": "Mixed Shashlik Platter",
        "code": "BBQ15",
        "price": 1800000,
        "unit": "mẹt",
        "description": "Cừu, bò, gà, rau củ",
        "category_id": 2
      },
      {
        "id": 106,
        "name": "Thịt cừu nướng xiên miếng",
        "name_en": "Lamb Shashlik (Chunks)",
        "code": "BBQ16",
        "price": 160000,
        "unit": "xiên",
        "description": "Thịt cừu, hành tây; khẩu phần 120 g",
        "category_id": 2
      },
      {
        "id": 107,
        "name": "Thịt bò nướng xiên miếng",
        "name_en": "Beef Shashlik (Chunks)",
        "code": "BBQ17",
        "price": 160000,
        "unit": "xiên",
        "description": "Thịt bò, hành tây; khẩu phần 120 g",
        "category_id": 2
      }
    ]
  },
  {
    "id": 3,
    "name": "Súp",
    "code": "CAT_SOUPS",
    "products": [
      {
        "id": 201,
        "name": "Súp Lagman",
        "name_en": "Lagman Soup",
        "code": "SUP18",
        "price": 160000,
        "unit": "tô",
        "description": "Mì, thịt bò, rau củ",
        "category_id": 3
      },
      {
        "id": 202,
        "name": "Súp Shurpa thịt cừu",
        "name_en": "Lamb Shurpa",
        "code": "SUP19",
        "price": 190000,
        "unit": "tô",
        "description": "Thịt cừu, khoai tây, cà rốt, hành tây",
        "category_id": 3
      },
      {
        "id": 203,
        "name": "Súp Shurpa thịt bò",
        "name_en": "Beef Shurpa",
        "code": "SUP20",
        "price": 170000,
        "unit": "tô",
        "description": "Thịt bò, khoai tây, cà rốt, hành tây",
        "category_id": 3
      },
      {
        "id": 204,
        "name": "Súp Manpar",
        "name_en": "Manpar Soup",
        "code": "SUP21",
        "price": 160000,
        "unit": "tô",
        "description": "Mì nhà làm, thịt, rau củ",
        "category_id": 3
      },
      {
        "id": 205,
        "name": "Súp Borscht củ dền",
        "name_en": "Beef Borscht",
        "code": "SUP22",
        "price": 160000,
        "unit": "tô",
        "description": "Thịt bò, củ dền, bắp cải, khoai tây",
        "category_id": 3
      },
      {
        "id": 206,
        "name": "Súp Mastava",
        "name_en": "Mastava Soup",
        "code": "SUP23",
        "price": 150000,
        "unit": "tô",
        "description": "Cơm, thịt bò, khoai tây, cà rốt",
        "category_id": 3
      },
      {
        "id": 207,
        "name": "Súp Chuchvara nhân thịt bò",
        "name_en": "Chuchvara Dumpling Soup",
        "code": "SUP24",
        "price": 160000,
        "unit": "tô",
        "description": "Bánh bột nhân thịt bò, hành tây, nước dùng",
        "category_id": 3
      }
    ]
  },
  {
    "id": 4,
    "name": "Salad",
    "code": "CAT_SALAD",
    "products": [
      {
        "id": 301,
        "name": "Salad Caesar tôm",
        "name_en": "Shrimp Caesar Salad",
        "code": "SL25",
        "price": 150000,
        "unit": "dĩa",
        "description": "Tôm, xà lách, phô mai, bánh mì giòn, sốt Caesar",
        "category_id": 4
      },
      {
        "id": 302,
        "name": "Salad Caesar gà",
        "name_en": "Chicken Caesar Salad",
        "code": "SL26",
        "price": 150000,
        "unit": "dĩa",
        "description": "Gà, xà lách, phô mai, bánh mì giòn, sốt Caesar",
        "category_id": 4
      },
      {
        "id": 303,
        "name": "Salad Achuchuk",
        "name_en": "Achuchuk Salad",
        "code": "SL27",
        "price": 80000,
        "unit": "dĩa",
        "description": "Cà chua, hành tây, ớt cay, rau thơm",
        "category_id": 4
      },
      {
        "id": 304,
        "name": "Salad Night Zhor",
        "name_en": "Night Zhor Salad",
        "code": "SL28",
        "price": 150000,
        "unit": "dĩa",
        "description": "Thịt, rau củ, hành tây, rau thơm, sốt",
        "category_id": 4
      }
    ]
  },
  {
    "id": 5,
    "name": "Món ăn kèm",
    "code": "CAT_SIDES",
    "products": [
      {
        "id": 401,
        "name": "Cơm trắng",
        "name_en": "Steamed Rice",
        "code": "AK29",
        "price": 50000,
        "unit": "chén",
        "description": "Cơm trắng dẻo thơm",
        "category_id": 5
      },
      {
        "id": 402,
        "name": "Mì sợi",
        "name_en": "Noodles",
        "code": "AK30",
        "price": 50000,
        "unit": "chén",
        "description": "Mì sợi tươi luộc chín",
        "category_id": 5
      },
      {
        "id": 403,
        "name": "Khoai tây nghiền",
        "name_en": "Mashed Potatoes",
        "code": "AK31",
        "price": 60000,
        "unit": "phần",
        "description": "Khoai tây, bơ, sữa, muối",
        "category_id": 5
      },
      {
        "id": 404,
        "name": "Khoai tây kiểu đồng quê",
        "name_en": "Country-Style Potatoes",
        "code": "AK32",
        "price": 90000,
        "unit": "dĩa",
        "description": "Khoai tây, gia vị",
        "category_id": 5
      },
      {
        "id": 405,
        "name": "Khoai tây chiên",
        "name_en": "French Fries",
        "code": "AK33",
        "price": 90000,
        "unit": "dĩa",
        "description": "Khoai tây chiên giòn rụm",
        "category_id": 5
      }
    ]
  },
  {
    "id": 6,
    "name": "Bánh",
    "code": "CAT_PASTRIES",
    "products": [
      {
        "id": 501,
        "name": "Samsa nhân gà",
        "name_en": "Chicken Samsa",
        "code": "BH34",
        "price": 90000,
        "unit": "cái",
        "description": "Bột, thịt gà, hành tây, gia vị",
        "category_id": 6
      },
      {
        "id": 502,
        "name": "Samsa nhân bò",
        "name_en": "Beef Samsa",
        "code": "BH35",
        "price": 100000,
        "unit": "cái",
        "description": "Bột, thịt bò, hành tây, gia vị",
        "category_id": 6
      },
      {
        "id": 503,
        "name": "Cheburek nhân bò",
        "name_en": "Beef Cheburek",
        "code": "BH36",
        "price": 80000,
        "unit": "cái",
        "description": "Bột, thịt bò, hành tây, gia vị",
        "category_id": 6
      },
      {
        "id": 504,
        "name": "Bánh mì dẹt truyền thống",
        "name_en": "Flatbread",
        "code": "BH37",
        "price": 70000,
        "unit": "cái",
        "description": "Bột mì, nước, muối",
        "category_id": 6
      }
    ]
  },
  {
    "id": 7,
    "name": "Trà",
    "code": "CAT_TEA",
    "products": [
      {
        "id": 601,
        "name": "Trà chanh dây",
        "name_en": "Passion Fruit Tea",
        "code": "TR38",
        "price": 70000,
        "unit": "ấm",
        "description": "Trà, chanh dây, đường",
        "category_id": 7
      },
      {
        "id": 602,
        "name": "Trà Tashkent",
        "name_en": "Tashkent Tea",
        "code": "TR39",
        "price": 80000,
        "unit": "ấm",
        "description": "Trà, chanh, bạc hà, gia vị",
        "category_id": 7
      },
      {
        "id": 603,
        "name": "Trà sữa",
        "name_en": "Milk Tea",
        "code": "TR40",
        "price": 70000,
        "unit": "ly",
        "description": "Trà, sữa",
        "category_id": 7
      },
      {
        "id": 604,
        "name": "Trà chanh",
        "name_en": "Lemon Tea",
        "code": "TR41",
        "price": 70000,
        "unit": "ly",
        "description": "Trà, chanh, đường",
        "category_id": 7
      },
      {
        "id": 605,
        "name": "Trà đen",
        "name_en": "Black Tea",
        "code": "TR42",
        "price": 50000,
        "unit": "ấm",
        "description": "Trà đen truyền thống",
        "category_id": 7
      },
      {
        "id": 606,
        "name": "Trà xanh",
        "name_en": "Green Tea",
        "code": "TR43",
        "price": 50000,
        "unit": "ấm",
        "description": "Trà xanh thanh mát",
        "category_id": 7
      }
    ]
  },
  {
    "id": 8,
    "name": "Pizza",
    "code": "CAT_PIZZA",
    "products": [
      {
        "id": 701,
        "name": "Pizza Pepperoni",
        "name_en": "Pepperoni Pizza",
        "code": "PZ44",
        "price": 340000,
        "unit": "cái",
        "description": "Sốt cà chua, phô mai mozzarella, xúc xích pepperoni; 30 cm",
        "category_id": 8
      },
      {
        "id": 702,
        "name": "Pizza thập cẩm thịt",
        "name_en": "Meat Lovers Pizza",
        "code": "PZ45",
        "price": 320000,
        "unit": "cái",
        "description": "Sốt cà chua, mozzarella, bò, gà, xúc xích, thịt xông khói; 30 cm",
        "category_id": 8
      },
      {
        "id": 703,
        "name": "Pizza gà nấm",
        "name_en": "Chicken & Mushroom Pizza",
        "code": "PZ46",
        "price": 320000,
        "unit": "cái",
        "description": "Sốt cà chua, mozzarella, gà, nấm; 30 cm",
        "category_id": 8
      },
      {
        "id": 704,
        "name": "Pizza Margherita",
        "name_en": "Margherita Pizza",
        "code": "PZ47",
        "price": 280000,
        "unit": "cái",
        "description": "Sốt cà chua, mozzarella, húng quế; 30 cm",
        "category_id": 8
      }
    ]
  },
  {
    "id": 9,
    "name": "Sushi cuộn",
    "code": "CAT_SUSHI_ROLL",
    "products": [
      {
        "id": 801,
        "name": "Sushi cuộn cá hồi nướng",
        "name_en": "Baked Salmon Roll",
        "code": "SR48",
        "price": 290000,
        "unit": "cuộn",
        "description": "Cơm sushi, rong biển, cá hồi, dưa chuột, sốt unagi, mè",
        "category_id": 9
      },
      {
        "id": 802,
        "name": "Sushi cuộn Philadelphia bơ",
        "name_en": "Philadelphia Avocado Roll",
        "code": "SR49",
        "price": 290000,
        "unit": "cuộn",
        "description": "Cơm sushi, rong biển, phô mai kem, bơ, cá hồi, sốt đặc biệt",
        "category_id": 9
      },
      {
        "id": 803,
        "name": "Sushi cuộn nướng",
        "name_en": "Baked Roll",
        "code": "SR50",
        "price": 280000,
        "unit": "cuộn",
        "description": "Cơm sushi, rong biển, gà luộc, dưa chuột, phô mai kem, gừng, mè, sốt đặc biệt",
        "category_id": 9
      },
      {
        "id": 804,
        "name": "Sushi cuộn lươn phô mai kem",
        "name_en": "Cream Cheese Eel Roll",
        "code": "SR51",
        "price": 300000,
        "unit": "cuộn",
        "description": "Cơm sushi, rong biển, phô mai kem, dưa chuột, lươn nướng, mè trắng",
        "category_id": 9
      },
      {
        "id": 805,
        "name": "Sushi cuộn Kanada",
        "name_en": "Kanada Roll",
        "code": "SR52",
        "price": 320000,
        "unit": "cuộn",
        "description": "Cơm sushi, tôm, phô mai kem, dưa chuột, trứng cá chuồn, sốt đặc biệt",
        "category_id": 9
      },
      {
        "id": 806,
        "name": "Sushi cuộn California nướng",
        "name_en": "Baked California Roll",
        "code": "SR53",
        "price": 290000,
        "unit": "cuộn",
        "description": "Cơm sushi, rong biển, dưa chuột, bơ, thanh cua, tobiko, sốt unagi, mè",
        "category_id": 9
      },
      {
        "id": 807,
        "name": "Sushi cuộn California cá hồi",
        "name_en": "California Salmon Roll",
        "code": "SR53B",
        "price": 320000,
        "unit": "cuộn",
        "description": "Cơm sushi, rong biển, bơ, dưa chuột, cá hồi, trứng cá chuồn",
        "category_id": 9
      },
      {
        "id": 808,
        "name": "Sushi cuộn Dragon",
        "name_en": "Dragon Roll",
        "code": "SR54",
        "price": 360000,
        "unit": "cuộn",
        "description": "Cơm sushi, rong biển, phô mai kem, dưa chuột, sốt unagi, trứng cá chuồn, mè",
        "category_id": 9
      },
      {
        "id": 809,
        "name": "Sushi cuộn Philadelphia",
        "name_en": "Philadelphia Roll",
        "code": "SR55",
        "price": 280000,
        "unit": "cuộn",
        "description": "Cơm sushi, rong biển, phô mai kem, dưa chuột, cá hồi, sốt đặc biệt",
        "category_id": 9
      },
      {
        "id": 810,
        "name": "Sushi cuộn gà Star",
        "name_en": "Star Chicken Roll",
        "code": "SR56",
        "price": 280000,
        "unit": "cuộn",
        "description": "Cơm sushi, rong biển, gà luộc, dưa chuột, hạt hướng dương, sốt mayonnaise, sốt đặc biệt",
        "category_id": 9
      },
      {
        "id": 811,
        "name": "Sushi cuộn Mummy",
        "name_en": "Mummy Roll",
        "code": "SR57",
        "price": 270000,
        "unit": "cuộn",
        "description": "Cơm sushi, rong biển, phô mai kem, dưa chuột, cá hồi chiên giòn, sốt đặc biệt",
        "category_id": 9
      },
      {
        "id": 812,
        "name": "Sushi cuộn cá hồi dưa chuột không rong biển",
        "name_en": "Salmon Cucumber Seamless Roll",
        "code": "SR58",
        "price": 280000,
        "unit": "cuộn",
        "description": "Cơm sushi, cá hồi, dưa chuột, phô mai kem, mè trắng",
        "category_id": 9
      },
      {
        "id": 813,
        "name": "Sushi cuộn California tôm",
        "name_en": "California Shrimp Roll",
        "code": "SR59",
        "price": 320000,
        "unit": "cuộn",
        "description": "Cơm sushi, rong biển, tôm chiên, bơ, dưa chuột, trứng cá chuồn, tobiko",
        "category_id": 9
      },
      {
        "id": 814,
        "name": "Sushi cuộn California thanh cua",
        "name_en": "California Crab Roll",
        "code": "SR68",
        "price": 320000,
        "unit": "cuộn",
        "description": "Cơm sushi, rong biển, bơ, dưa chuột, thanh cua, trứng cá chuồn",
        "category_id": 9
      }
    ]
  },
  {
    "id": 10,
    "name": "Set sushi",
    "code": "CAT_SUSHI_SET",
    "products": [
      {
        "id": 901,
        "name": "Set sushi 1",
        "name_en": "Sushi Set 1",
        "code": "SS60",
        "price": 990000,
        "unit": "set",
        "description": "California, cá hồi, thanh cua, dưa chuột, sốt mayonnaise, sốt đặc biệt",
        "category_id": 10
      },
      {
        "id": 902,
        "name": "Set sushi 2",
        "name_en": "Sushi Set 2",
        "code": "SS61",
        "price": 990000,
        "unit": "set",
        "description": "California nướng; California cá hồi; California tôm; California thanh cua",
        "category_id": 10
      },
      {
        "id": 903,
        "name": "Set sushi 3",
        "name_en": "Sushi Set 3",
        "code": "SS62",
        "price": 750000,
        "unit": "set",
        "description": "California nướng, California Dragon",
        "category_id": 10
      },
      {
        "id": 904,
        "name": "Set sushi 4",
        "name_en": "Sushi Set 4",
        "code": "SS63",
        "price": 1250000,
        "unit": "set",
        "description": "California, Kanada, Philadelphia, unagi, chicken roll; mỗi loại 8 miếng",
        "category_id": 10
      },
      {
        "id": 905,
        "name": "Set sushi 5",
        "name_en": "Sushi Set 5",
        "code": "SS64",
        "price": 800000,
        "unit": "set",
        "description": "California, Philadelphia, Kanada",
        "category_id": 10
      },
      {
        "id": 906,
        "name": "Set sushi 6",
        "name_en": "Sushi Set 6",
        "code": "SS65",
        "price": 1090000,
        "unit": "set",
        "description": "Philadelphia, Philadelphia nướng, chicken roll nướng, California; mỗi loại 8 miếng",
        "category_id": 10
      }
    ]
  },
  {
    "id": 11,
    "name": "Sushi & Nigiri",
    "code": "CAT_NIGIRI",
    "products": [
      {
        "id": 1001,
        "name": "Set sushi mini",
        "name_en": "Mini Sushi Set",
        "code": "SN66",
        "price": 390000,
        "unit": "set",
        "description": "Cơm sushi, rong biển, cá ngừ, tôm, cá hồi, lươn; mỗi loại một miếng",
        "category_id": 11
      },
      {
        "id": 1002,
        "name": "Set sushi nigiri cao cấp",
        "name_en": "Premium Nigiri Sushi Set",
        "code": "SN67",
        "price": 1200000,
        "unit": "set",
        "description": "Cá ngừ, lươn, tôm, cá hồi, mực",
        "category_id": 11
      }
    ]
  },
  {
    "id": 12,
    "name": "Nước ép & Sinh tố",
    "code": "CAT_JUICES",
    "products": [
      {
        "id": 1101,
        "name": "Nước cam",
        "name_en": "Orange Juice",
        "code": "NS69",
        "price": 60000,
        "unit": "ly",
        "description": "Cam tươi vắt nguyên chất",
        "category_id": 12
      },
      {
        "id": 1102,
        "name": "Sinh tố xoài",
        "name_en": "Mango Smoothie",
        "code": "NS70",
        "price": 60000,
        "unit": "ly",
        "description": "Xoài, sữa hoặc nền sinh tố",
        "category_id": 12
      },
      {
        "id": 1103,
        "name": "Sinh tố xoài chanh dây",
        "name_en": "Mango & Passion Fruit Smoothie",
        "code": "NS71",
        "price": 60000,
        "unit": "ly",
        "description": "Xoài, chanh dây, đá xay",
        "category_id": 12
      },
      {
        "id": 1104,
        "name": "Nước ép dứa",
        "name_en": "Pineapple Juice",
        "code": "NS72",
        "price": 60000,
        "unit": "ly",
        "description": "Dứa tươi ép nguyên chất",
        "category_id": 12
      },
      {
        "id": 1105,
        "name": "Nước ép dưa hấu",
        "name_en": "Watermelon Juice",
        "code": "NS73",
        "price": 60000,
        "unit": "ly",
        "description": "Dưa hấu tươi mát",
        "category_id": 12
      },
      {
        "id": 1106,
        "name": "Sinh tố chuối",
        "name_en": "Banana Smoothie",
        "code": "NS74",
        "price": 60000,
        "unit": "ly",
        "description": "Chuối, sữa hoặc nền sinh tố",
        "category_id": 12
      },
      {
        "id": 1107,
        "name": "Nước compote trái cây nhà làm",
        "name_en": "Homemade Fruit Compote",
        "code": "NS75",
        "price": 70000,
        "unit": "ly",
        "description": "Trái cây/trái cây sấy, nước, đường",
        "category_id": 12
      }
    ]
  },
  {
    "id": 13,
    "name": "Nước ngọt & Nước suối",
    "code": "CAT_DRINKS",
    "products": [
      {
        "id": 1201,
        "name": "Coca-Cola",
        "name_en": "Coca-Cola",
        "code": "NN74",
        "price": 30000,
        "unit": "lon",
        "description": "Nước ngọt có gas Coca-Cola lon",
        "category_id": 13
      },
      {
        "id": 1202,
        "name": "Fanta",
        "name_en": "Fanta",
        "code": "NN75",
        "price": 30000,
        "unit": "lon",
        "description": "Nước ngọt hương cam Fanta lon",
        "category_id": 13
      },
      {
        "id": 1203,
        "name": "7UP",
        "name_en": "7UP",
        "code": "NN76",
        "price": 30000,
        "unit": "lon",
        "description": "Nước ngọt chanh 7UP thanh mát lon",
        "category_id": 13
      },
      {
        "id": 1204,
        "name": "Mirinda",
        "name_en": "Mirinda",
        "code": "NN77",
        "price": 30000,
        "unit": "lon",
        "description": "Nước ngọt Mirinda hương vị trái cây",
        "category_id": 13
      },
      {
        "id": 1205,
        "name": "Pepsi",
        "name_en": "Pepsi",
        "code": "NN78",
        "price": 30000,
        "unit": "lon",
        "description": "Nước ngọt có gas Pepsi lon",
        "category_id": 13
      },
      {
        "id": 1206,
        "name": "Nước suối Aquafina",
        "name_en": "Aquafina Drinking Water",
        "code": "NN79",
        "price": 20000,
        "unit": "chai",
        "description": "Nước uống tinh khiết đóng chai (500 ml)",
        "category_id": 13
      },
      {
        "id": 1207,
        "name": "Nước suối Aquafina (1.5L)",
        "name_en": "Aquafina Drinking Water (1.5L)",
        "code": "NN79B",
        "price": 30000,
        "unit": "chai",
        "description": "Nước uống tinh khiết chai lớn 1.5 L",
        "category_id": 13
      }
    ]
  }
]
};
