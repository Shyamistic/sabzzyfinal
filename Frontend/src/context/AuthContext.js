import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import { storage } from '../utils/storage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        storage.getItem('authToken'),
        storage.getItem('user'),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Error loading auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (phoneNumber, password) => {
    try {
      const response = await authAPI.login(phoneNumber, password);
      const { user, token } = response.data;

      await storage.setItem('authToken', token);
      await storage.setItem('user', user);

      setToken(token);
      setUser(user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Login failed',
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { user, token } = response.data;

      await storage.setItem('authToken', token);
      await storage.setItem('user', user);

      setToken(token);
      setUser(user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Registration failed',
      };
    }
  };

  const verifyOTP = async (phoneNumber, otp) => {
    try {
      const response = await authAPI.verifyOTP(phoneNumber, otp);

      if (response.data.user) {
        const { user, token } = response.data;

        await storage.setItem('authToken', token);
        await storage.setItem('user', user);

        setToken(token);
        setUser(user);

        return { success: true, needsRegistration: false };
      } else if (response.needsRegistration) {
        return { success: true, needsRegistration: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'OTP verification failed',
      };
    }
  };

  const logout = async () => {
    try {
      await storage.clear();
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const updateUser = async () => {
    try {
      const response = await authAPI.getProfile();
      const updatedUser = response.data;
      await storage.setItem('user', updatedUser);
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    register,
    verifyOTP,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
