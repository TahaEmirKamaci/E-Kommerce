import api from './api';

export const login = async ({ email, password }) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const register = async (payload) => {
  const { data } = await api.post('/auth/register', payload);
  return data;
};

const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token bulunamadı');
    }
    
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

const logout = () => {
  localStorage.removeItem('token');
  delete api.defaults.headers.common['Authorization'];
};

export default {
  login,
  register,
  getCurrentUser,
  logout
};