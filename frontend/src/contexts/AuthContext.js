import React, { createContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      // In React Native, you would use AsyncStorage here
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('userData');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Set default authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.error('Auth state check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestOTP = async (phoneNumber) => {
    try {
      const response = await api.post('/auth/request-otp', {
        phoneNumber: formatPhoneNumber(phoneNumber)
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'OTP request failed');
    }
  };

  const login = async (phoneNumber, otp) => {
    try {
      const response = await api.post('/auth/verify-otp', {
        phoneNumber: formatPhoneNumber(phoneNumber),
        otp
      });

      const { token: userToken, user: userData } = response.data;

      // Store auth data (in React Native, use AsyncStorage)
      localStorage.setItem('authToken', userToken);
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Set API default header
      api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;

      setToken(userToken);
      setUser(userData);

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      setToken(null);
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const formatPhoneNumber = (phone) => {
    let formatted = phone.replace(/\s/g, '');
    if (formatted.startsWith('0')) {
      formatted = '+234' + formatted.substring(1);
    } else if (!formatted.startsWith('+')) {
      formatted = '+234' + formatted;
    }
    return formatted;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        language,
        requestOTP,
        login,
        logout,
        setLanguage
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
