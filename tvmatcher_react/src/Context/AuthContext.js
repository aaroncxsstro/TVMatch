import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
      setIsAuthenticated(true);
      scheduleTokenRefresh(token);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const login = (token, refreshToken) => {
    setAuthToken(token);
    setIsAuthenticated(true);
    localStorage.setItem('authToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    scheduleTokenRefresh(token);
  };

  const logout = () => {
    setAuthToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  };

  const scheduleTokenRefresh = (token) => {
    const expiresIn = 60 * 60 * 1000; 
    setTimeout(() => {
      refreshToken();
    }, expiresIn - 60 * 1000); 
  };

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      logout();
      return;
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: '414799009091-1mji935if8jl343cdnk64hvv4jd8pro0.apps.googleusercontent.com',
          client_secret: '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',
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });
      const data = await response.json();
      if (data.access_token) {
        login(data.access_token, refreshToken);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
