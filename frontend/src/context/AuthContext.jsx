import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('synaps_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('synaps_token');
    if (savedToken) {
      setToken(savedToken);
      const currentUser = AuthService.getCurrentUser();
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await AuthService.login(username, password);
    setToken(res.access_token);
    setUser(AuthService.getCurrentUser());
    return res;
  };

  const signup = async (username, email, password) => {
    const res = await AuthService.signup(username, email, password);
    setToken(res.access_token);
    setUser(AuthService.getCurrentUser());
    return res;
  };

  const logout = () => {
    AuthService.logout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
