import api from './api';

export const adminService = {
  async getAllUsers() {
    const response = await api.get('/admin/users');
    return response.data;
  },

  async getAllProducts() {
    const response = await api.get('/admin/products');
    return response.data;
  },

  async getAllOrders() {
    const response = await api.get('/admin/orders');
    return response.data;
  },

  async getStats() {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  async deleteUser(userId) {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  async deleteProduct(productId) {
    const response = await api.delete(`/admin/products/${productId}`);
    return response.data;
  },

  async updateProduct(productId, payload) {
    const response = await api.put(`/admin/products/${productId}`, payload);
    return response.data;
  }
};