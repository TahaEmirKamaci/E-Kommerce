import api from './api';

export const userService = {
  async getUserById(id) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  async updateUser(id, data) {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
  
};