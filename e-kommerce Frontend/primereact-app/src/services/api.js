import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Request interceptor: JWT ekle, Content-Type yönet
api.interceptors.request.use(
  (config) => {
    // /auth/login ve /auth/register harici isteklerde token gönder (özellikle /auth/me için gerekir)
    const url = typeof config.url === 'string' ? config.url : '';
    const skipAuth = url.startsWith('/auth/login') || url.startsWith('/auth/register') || url.startsWith('/auth/forgot');
    if (!skipAuth) {
      const token =
        localStorage.getItem('token') ||
        localStorage.getItem('accessToken') ||
        localStorage.getItem('jwt') ||
        localStorage.getItem('jwtToken') ||
        localStorage.getItem('authToken') ||
        sessionStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // FormData ise Content-Type'ı axios'a bırak (boundary için)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
      config.headers['Accept'] = 'application/json';
    }

    // Basit log
    try {
      const method = (config.method || 'get').toUpperCase();
      console.log('API Request:', method, `${config.baseURL}${config.url}`);
    } catch {}
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: log + 401 yönlendirme
api.interceptors.response.use(
  (response) => {
    // console.log('API Response Success:', response.status, response.config.url);
    return response;
  },
  (error) => {
    const resp = error?.response;
    console.error('API Response Error:', {
      status: resp?.status,
      statusText: resp?.statusText ?? '',
      url: resp?.config?.url?.replace(API_BASE_URL, '') ?? '',
      data: resp?.data ?? '',
      message: error?.message,
    });

    if (resp?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;