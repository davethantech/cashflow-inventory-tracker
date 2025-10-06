import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUser = await AsyncStorage.getItem('userData');
      const storedLanguage = await AsyncStorage.getItem('userLanguage');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }

      if (storedLanguage) {
        setLanguage(storedLanguage);
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

      // Store auth data
      await AsyncStorage.setItem('userToken', userToken);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
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
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      setToken(null);
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      const updatedUser = response.data.user;
      
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      setUser(updatedUser);

      if (profileData.language) {
        setLanguage(profileData.language);
        await AsyncStorage.setItem('userLanguage', profileData.language);
      }

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Profile update failed');
    }
  };

  const formatPhoneNumber = (phone) => {
    // Ensure Nigerian phone number format
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
        updateProfile,
        setLanguage
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
