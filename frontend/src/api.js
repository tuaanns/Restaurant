import axios from 'axios';

// Tự động nhận diện IP máy chủ trong mạng LAN khi truy cập từ thiết bị khác (iPad, điện thoại, máy tính khác)
const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
const API_ROOT = import.meta.env.VITE_API_URL || `http://${host}:8000/api`;
const API_BASE = `${API_ROOT}/pos`;

// Tự động gắn token vào header nếu có
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('pos_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // === XÁC THỰC & TÀI KHOẢN (AUTH) ===
  login: async (username, password) => {
    try {
      const res = await axios.post(`${API_ROOT}/auth/login`, { username, password });
      if (res.data.token) {
        localStorage.setItem('pos_token', res.data.token);
        localStorage.setItem('pos_user', JSON.stringify(res.data.user));
      }
      return res.data;
    } catch (err) {
      if (err.response && err.response.data) {
        throw new Error(err.response.data.message || 'Đăng nhập không thành công');
      }
      throw err;
    }
  },

  logout: async () => {
    try {
      await axios.post(`${API_ROOT}/auth/logout`);
    } catch (e) {}
    localStorage.removeItem('pos_token');
    localStorage.removeItem('pos_user');
  },

  getMe: async () => {
    const res = await axios.get(`${API_ROOT}/auth/me`);
    return res.data;
  },

  getUsers: async () => {
    const res = await axios.get(`${API_ROOT}/auth/users`);
    return res.data;
  },

  createUser: async (userData) => {
    const res = await axios.post(`${API_ROOT}/auth/users`, userData);
    return res.data;
  },

  importUsers: async (users) => {
    const res = await axios.post(`${API_ROOT}/auth/users/import`, { users });
    return res.data;
  },

  updateUser: async (id, userData) => {
    const res = await axios.patch(`${API_ROOT}/auth/users/${id}`, userData);
    return res.data;
  },

  deleteUser: async (id) => {
    const res = await axios.delete(`${API_ROOT}/auth/users/${id}`);
    return res.data;
  },

  // === QUẢN TRỊ ADMIN (STATS & MENU) ===
  getAdminStats: async () => {
    const res = await axios.get(`${API_ROOT}/admin/stats`);
    return res.data;
  },

  addProduct: async (productData) => {
    const res = await axios.post(`${API_ROOT}/admin/products`, productData);
    return res.data;
  },

  importProducts: async (products) => {
    const res = await axios.post(`${API_ROOT}/admin/products/import`, { products });
    return res.data;
  },

  updateProduct: async (productId, productData) => {
    const res = await axios.patch(`${API_ROOT}/admin/products/${productId}`, productData);
    return res.data;
  },

  deleteProduct: async (productId) => {
    const res = await axios.delete(`${API_ROOT}/admin/products/${productId}`);
    return res.data;
  },

  // Quản lý Nhóm Thực Đơn (Categories)
  getCategories: async () => {
    const res = await axios.get(`${API_ROOT}/admin/categories`);
    return res.data;
  },

  addCategory: async (data) => {
    const res = await axios.post(`${API_ROOT}/admin/categories`, data);
    return res.data;
  },

  updateCategory: async (id, data) => {
    const res = await axios.patch(`${API_ROOT}/admin/categories/${id}`, data);
    return res.data;
  },

  deleteCategory: async (id) => {
    const res = await axios.delete(`${API_ROOT}/admin/categories/${id}`);
    return res.data;
  },

  // Quản lý Khách Hàng (Admin)
  getAdminCustomers: async () => {
    const res = await axios.get(`${API_ROOT}/admin/customers`);
    return res.data;
  },

  addCustomer: async (data) => {
    const res = await axios.post(`${API_ROOT}/admin/customers`, data);
    return res.data;
  },

  importAdminCustomers: async (customers) => {
    const res = await axios.post(`${API_ROOT}/admin/customers/import`, { customers });
    return res.data;
  },

  updateCustomerInfo: async (id, data) => {
    const res = await axios.patch(`${API_ROOT}/admin/customers/${id}`, data);
    return res.data;
  },

  deleteCustomer: async (id) => {
    const res = await axios.delete(`${API_ROOT}/admin/customers/${id}`);
    return res.data;
  },

  // Quản lý Phòng/Bàn (Admin Tables)
  getAdminTables: async () => {
    const res = await axios.get(`${API_ROOT}/admin/tables`);
    return res.data;
  },

  addAdminTable: async (data) => {
    const res = await axios.post(`${API_ROOT}/admin/tables`, data);
    return res.data;
  },

  updateAdminTable: async (id, data) => {
    const res = await axios.patch(`${API_ROOT}/admin/tables/${id}`, data);
    return res.data;
  },

  deleteAdminTable: async (id) => {
    const res = await axios.delete(`${API_ROOT}/admin/tables/${id}`);
    return res.data;
  },

  importAdminTables: async (tables) => {
    const res = await axios.post(`${API_ROOT}/admin/tables/import`, { tables });
    return res.data;
  },

  // Quản lý Khu Vực (Admin Areas)
  getAdminAreas: async () => {
    const res = await axios.get(`${API_ROOT}/admin/areas`);
    return res.data;
  },

  addAdminArea: async (data) => {
    const res = await axios.post(`${API_ROOT}/admin/areas`, data);
    return res.data;
  },

  updateAdminArea: async (id, data) => {
    const res = await axios.patch(`${API_ROOT}/admin/areas/${id}`, data);
    return res.data;
  },

  deleteAdminArea: async (id) => {
    const res = await axios.delete(`${API_ROOT}/admin/areas/${id}`);
    return res.data;
  },

  // === POS THU NGÂN ===
  // Lấy danh sách bàn, khu vực và thống kê
  getTables: async () => {
    try {
      const res = await axios.get(`${API_BASE}/tables`, { timeout: 4000 });
      return res.data;
    } catch (err) {
      console.warn('API error, returning local fallback data if necessary', err);
      throw err;
    }
  },

  // Lấy thực đơn món ăn
  getMenu: async () => {
    const res = await axios.get(`${API_BASE}/menu`);
    return res.data;
  },

  // Lấy danh sách khách hàng
  getCustomers: async () => {
    const res = await axios.get(`${API_BASE}/customers`);
    return res.data;
  },

  // Lấy chi tiết order của bàn
  getTableOrder: async (tableId) => {
    const res = await axios.get(`${API_BASE}/tables/${tableId}/order`);
    return res.data;
  },

  // Thêm món vào order
  addItem: async (orderId, data) => {
    const res = await axios.post(`${API_BASE}/orders/${orderId}/items`, data);
    return res.data;
  },

  // Cập nhật số lượng / ghi chú của món
  updateItem: async (itemId, data) => {
    const res = await axios.patch(`${API_BASE}/items/${itemId}`, data);
    return res.data;
  },

  // Xóa món
  deleteItem: async (itemId) => {
    const res = await axios.delete(`${API_BASE}/items/${itemId}`);
    return res.data;
  },

  // Cập nhật khách hàng của order
  updateCustomer: async (orderId, customerId) => {
    const res = await axios.post(`${API_BASE}/orders/${orderId}/customer`, { customer_id: customerId });
    return res.data;
  },

  // Báo bếp (F10)
  sendToKitchen: async (orderId) => {
    const res = await axios.post(`${API_BASE}/orders/${orderId}/send-kitchen`);
    return res.data;
  },

  // In tạm tính
  printPreBill: async (orderId) => {
    const res = await axios.post(`${API_BASE}/orders/${orderId}/print-prebill`);
    return res.data;
  },

  // Thanh toán (F9)
  checkout: async (orderId, data) => {
    const res = await axios.post(`${API_BASE}/orders/${orderId}/checkout`, data);
    return res.data;
  },

  // Chuyển bàn
  transferTable: async (fromTableId, toTableId) => {
    const res = await axios.post(`${API_BASE}/tables/transfer`, {
      from_table_id: fromTableId,
      to_table_id: toTableId,
    });
    return res.data;
  },

  // Khôi phục dữ liệu mẫu
  resetDemo: async () => {
    const res = await axios.post(`${API_BASE}/reset-demo`);
    return res.data;
  },

  // Huỷ toàn bộ order (xoá sạch món, reset bàn về empty)
  clearOrder: async (orderId) => {
    const res = await axios.post(`${API_BASE}/orders/${orderId}/clear`);
    return res.data;
  }
};
