import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Switch to sessionStorage: clears automatically when the tab is closed
  const [token, setToken] = useState(() => sessionStorage.getItem('vv_token') || null);
  const [user, setUser]   = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('vv_user')); } catch { return null; }
  });

  const login = (tokenValue, userObj) => {
    sessionStorage.setItem('vv_token', tokenValue);
    sessionStorage.setItem('vv_user', JSON.stringify(userObj));
    setToken(tokenValue);
    setUser(userObj);
  };

  const logout = () => {
    sessionStorage.removeItem('vv_token');
    sessionStorage.removeItem('vv_user');
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