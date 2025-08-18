import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { getRoleType } from '../utils/helpers';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const setUserWithRole = (u) => {
    if (!u) { setUser(null); return; }
  const roleType = getRoleType(u);
  // store role as a simple string (ADMIN | SELLER | CUSTOMER) to match checks across the app
  const role = roleType;
  setUser({ ...u, role });
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const res = await authService.login(credentials);
      const token = res?.token || res?.accessToken || res?.jwt;
      if (token) localStorage.setItem('token', token);
      if (res?.user) setUserWithRole(res.user);
      return res;
    } catch (e) {
      console.error('Login error:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };
  
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response.token) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
        return response;
      }
      return response;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const value = {
    user,
    roleType: getRoleType(user), // tüketenler direkt buradan da alabilir
    login,
    register,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isSeller: user?.role === 'SELLER',
    isCustomer: user?.role === 'CUSTOMER'
  };

  useEffect(() => {
    // uygulama açılışında me’yi çekiyorsanız burada normalize edin
    (async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const loadedUser = await authService.getCurrentUser();
          if (loadedUser) setUserWithRole(loadedUser);
        } catch (error) {
          console.error('Error loading user:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    })();
  }, []);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}