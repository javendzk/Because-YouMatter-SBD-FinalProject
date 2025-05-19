import React, { createContext, useState, useEffect, useContext } from 'react';
import userService from '../services/userService';

// Create the authentication context
const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  const updateAuthStatus = () => {
    const status = userService.isAuthenticated() && user !== null;
    setIsAuthenticated(status);
    console.log('Auth status updated:', status, 'User:', user ? 'exists' : 'null');
    return status;
  };

  // Update auth status when user changes
  useEffect(() => {
    updateAuthStatus();
  }, [user]);

  // Load user data on initial mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (userService.isAuthenticated()) {
        try {
          setLoading(true);          const response = await userService.getProfile();
          if (response.success) {
            setUser(response.data);
            // Update auth status after loading user
            updateAuthStatus();
          } else {
            // Handle unsuccessful but not error responses
            userService.logout();
          }
        } catch (err) {
          setError('Failed to load user profile');
          userService.logout();
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadUser();
  }, []);
  // Login function
  const login = async (credentials) => {
    try {
      console.log('=== AUTH CONTEXT: LOGIN ATTEMPT ===');
      console.log('Credentials:', { email: credentials.email, password: '******' });
      
      setLoading(true);
      setError(null);
      const response = await userService.login(credentials);
      
      console.log('AUTH CONTEXT: Login response received:', response);
      console.log('Response structure:', {
        success: response.success,
        message: response.message,
        hasData: !!response.data,
        hasPayload: !!response.payload
      });
      
      if (response.success) {
        console.log('AUTH CONTEXT: Login successful, setting user data');
        console.log('User data location:', response.data ? 'data field' : (response.payload ? 'payload field' : 'unknown'));
        
        // Check both payload and data for backward compatibility
        const userData = response.data?.user || response.payload?.user || response.data || response.payload;
        console.log('Extracted user data:', userData ? 'Present' : 'Missing');        
        setUser(userData);
        updateAuthStatus(); // Update auth status after user set
        return { success: true };
      } else {
        console.log('AUTH CONTEXT: Login failed:', response.message);
        setError(response.message || 'Login failed');
        return { success: false, message: response.message };
      }
    } catch (err) {
      console.error('AUTH CONTEXT: Login error details:', err);
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.register(userData);
      if (response.success) {
        return { success: true };
      } else {
        setError(response.message || 'Registration failed');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  // Logout function
  const logout = () => {
    userService.logout();
    setUser(null);
    updateAuthStatus(); // Update auth status after logout
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);      const response = await userService.updateProfile(profileData);
      if (response.success) {
        setUser(response.data);
        updateAuthStatus(); // Update auth status after profile update
        return { success: true };
      } else {
        setError(response.message || 'Failed to update profile');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated // Using the state variable for consistent behavior
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
