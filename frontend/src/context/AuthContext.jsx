import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('spendwise_token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const res = await authService.getMe();
      setUser(res.data.user);
    } catch {
      localStorage.removeItem('spendwise_token');
      localStorage.removeItem('spendwise_user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    localStorage.setItem('spendwise_token', res.data.token);
    localStorage.setItem('spendwise_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    localStorage.setItem('spendwise_token', res.data.token);
    localStorage.setItem('spendwise_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('spendwise_token');
    localStorage.removeItem('spendwise_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('spendwise_user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
