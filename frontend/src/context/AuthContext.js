import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('vv_token') || null);
  const [user, setUser]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('vv_user')); } catch { return null; }
  });

  const login = (tokenValue, userObj) => {
    localStorage.setItem('vv_token', tokenValue);
    localStorage.setItem('vv_user', JSON.stringify(userObj));
    setToken(tokenValue);
    setUser(userObj);
  };

  const logout = () => {
    localStorage.removeItem('vv_token');
    localStorage.removeItem('vv_user');
    setToken(null);
    setUser(null);
  };

  const isCaregiver = user?.is_caregiver === true;
  const isLoggedIn  = !!token;

  return (
    <AuthContext.Provider value={{ token, user, isLoggedIn, isCaregiver, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
