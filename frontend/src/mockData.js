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
    // Tầng 1: 8 bàn trống hoàn toàn
    { id: 1, area_id: 1, area_code: 'floor_1', name: 'BÀN 01', capacity: 4, status: 'empty', guest_count: 0, duration: null, notes: null, is_takeaway: false, is_vip: false, order: null },
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
  menuList: [
    {
      id: 1,
      name: 'Món xào & Cơm',
      products: [
        { id: 1, name: 'Mì xào bò thượng hạng', code: 'MXB01', price: 110000, unit: 'phần', category_id: 1 },
        { id: 2, name: 'Cơm chiên hải sản Hoàng Kim', code: 'CCHS02', price: 125000, unit: 'phần', category_id: 1 },
        { id: 10, name: 'Mì xào giòn hải sản', code: 'MXG03', price: 135000, unit: 'phần', category_id: 1 },
        { id: 11, name: 'Cơm chiên dưa bò Hà Nội', code: 'CCDB04', price: 95000, unit: 'phần', category_id: 1 },
      ]
    },
    {
      id: 2,
      name: 'Món bò & Gà',
      products: [
        { id: 5, name: 'Bò nướng tảng sốt tiêu xanh', code: 'BNT05', price: 220000, unit: 'phần', category_id: 2 },
        { id: 12, name: 'Bò lúc lắc khoai tây', code: 'BLL06', price: 195000, unit: 'phần', category_id: 2 },
        { id: 13, name: 'Gà nướng muối ớt Tây Bắc', code: 'GN07', price: 160000, unit: 'phần', category_id: 2 },
      ]
    },
    {
      id: 3,
      name: 'Hải sản & Khai vị',
      products: [
        { id: 6, name: 'Mực một nắng nướng sa tế', code: 'MNN06', price: 185000, unit: 'dĩa', category_id: 3 },
        { id: 14, name: 'Tôm sú nướng muối ớt', code: 'TSN08', price: 190000, unit: 'dĩa', category_id: 3 },
        { id: 15, name: 'Salad cá hồi sốt mè rang', code: 'SCH09', price: 95000, unit: 'dĩa', category_id: 3 },
        { id: 16, name: 'Nộm củ hũ dừa tôm thịt', code: 'NCHD10', price: 85000, unit: 'dĩa', category_id: 3 },
      ]
    },
    {
      id: 4,
      name: 'Món lẩu đặc biệt',
      products: [
        { id: 7, name: 'Lẩu Thái Tomyum hải sản', code: 'LT07', price: 350000, unit: 'nồi', category_id: 4 },
        { id: 17, name: 'Lẩu riêu cua bắp bò sườn sụn', code: 'LRC11', price: 380000, unit: 'nồi', category_id: 4 },
      ]
    },
    {
      id: 5,
      name: 'Đồ uống & Tráng miệng',
      products: [
        { id: 3, name: 'Nước cam ép tươi', code: 'NC03', price: 45000, unit: 'ly', category_id: 5 },
        { id: 8, name: 'Trà đào cam sả thanh nhiệt', code: 'TD08', price: 40000, unit: 'ly', category_id: 5 },
        { id: 9, name: 'Bia Heineken Silver (Lon)', code: 'BIA09', price: 28000, unit: 'lon', category_id: 5 },
        { id: 18, name: 'Sinh tố bơ sáp dừa non', code: 'STB12', price: 50000, unit: 'ly', category_id: 5 },
        { id: 19, name: 'Chè khúc bạch hạnh nhân', code: 'CKB13', price: 35000, unit: 'chén', category_id: 5 },
      ]
    },
    {
      id: 6,
      name: 'Dịch vụ & Khác',
      products: [
        { id: 4, name: 'Khăn lạnh thơm cao cấp', code: 'KL04', price: 5000, unit: 'cái', category_id: 6 },
      ]
    }
  ]
};
