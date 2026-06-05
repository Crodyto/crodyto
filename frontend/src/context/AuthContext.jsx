import React, { createContext, useContext, useEffect, useState } from 'react';
import api, { setAuthToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async (token) => {
    if (!token) return setLoading(false);
    try {
      setAuthToken(token);
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch (err) {
      console.error('Auth load failed', err);
      localStorage.removeItem('token');
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) loadUser(token);
    else setLoading(false);
  }, []);

  const login = (token, userObj) => {
    localStorage.setItem('token', token);
    setAuthToken(token);
    setUser(userObj || null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
