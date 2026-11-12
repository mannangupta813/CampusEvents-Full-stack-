import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthSession, clearAuthSession, getCurrentUser, getToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());
  const [token, setToken] = useState(() => getToken());
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // If token exists, sync latest profile
    if (token) {
      api.getProfile().then(profile => {
        if (profile) {
          setUser(prev => ({ ...prev, ...profile }));
        }
      }).catch(err => {
        console.log('Session sync note:', err.message);
      });
    }
  }, [token]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const login = async (email, password) => {
    try {
      const data = await api.login(email, password);
      setAuthSession(data);
      setUser({
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        rollNo: data.rollNo,
        department: data.department
      });
      setToken(data.token);
      addToast(`Welcome back, ${data.fullName}!`, 'success');
      return data;
    } catch (err) {
      addToast(err.message || 'Login failed', 'error');
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const data = await api.register(userData);
      setAuthSession(data);
      setUser({
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        rollNo: data.rollNo,
        department: data.department
      });
      setToken(data.token);
      addToast('Registration successful! Welcome to Campus Events.', 'success');
      return data;
    } catch (err) {
      addToast(err.message || 'Registration failed', 'error');
      throw err;
    }
  };

  const logout = () => {
    clearAuthSession();
    setUser(null);
    setToken(null);
    addToast('You have been logged out safely.', 'info');
  };

  const hasRole = (role) => {
    if (!user) return false;
    if (user.role === 'ROLE_ADMIN') return true; // Admin has super-access
    return user.role === role || user.role === `ROLE_${role.toUpperCase()}`;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token && !!user,
      role: user?.role,
      login,
      register,
      logout,
      hasRole,
      toasts,
      addToast,
      removeToast
    }}>
      {children}
      {/* Global Toast Alerts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}</span>
            <div style={{ flex: 1, fontSize: '0.9rem' }}>{t.message}</div>
            <button onClick={() => removeToast(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
          </div>
        ))}
      </div>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
