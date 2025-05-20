import React, { createContext, useState, useEffect, useContext } from 'react';
import userService from '../services/userService';

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const updateAuthStatus = () => {
    const status = userService.isAuthenticated() && user !== null;
    setIsAuthenticated(status);
    return status;
  };

  useEffect(() => {
    updateAuthStatus();
  }, [user]);

  useEffect(() => {
    const loadUser = async () => {
      if (userService.isAuthenticated()) {
        try {
          setLoading(true);
          const response = await userService.getProfile();
          if (response.success) {
            const userData = response.data;
          
            userData.profilePicture = userData.user_image_url || 
                                      userData.profile_image_url || 
                                      '/src/assets/placeholder.jpg';
                        
            setUser(userData);
            updateAuthStatus();
          } else {
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

  const login = async (credentials) => {
    try {

      
      setLoading(true);
      setError(null);
      const response = await userService.login(credentials);
      
      if (response.success) {

        const userData = response.data?.user || response.payload?.user || response.data || response.payload;
        
        if (userData) {
          userData.profilePicture = userData.user_image_url || '/src/assets/placeholder.jpg';
        }
        
        setUser(userData);
        updateAuthStatus();
        return { success: true };
      } else {
        setError(response.message || 'Login failed');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      
      const response = await userService.register(userData);
      
      if (response.success) {
        const loginCredentials = {
          email: userData.email,
          password: userData.password
        };
        
        try {
          const loginResponse = await login(loginCredentials);
          if (loginResponse.success) {
            return { success: true, autoLoginSuccess: true };
          } else {
            return { success: true, autoLoginSuccess: false };
          }
        } catch (loginErr) {
          console.error('AuthContext: Auto-login error after registration:', loginErr);
          return { success: true, autoLoginSuccess: false };
        }
      } else {
        setError(response.message || 'Registration failed');
        return { success: false, message: response.message };
      }
    } catch (err) {
      console.error('AuthContext: Registration error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data
      });
      
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    userService.logout();
    setUser(null);
    updateAuthStatus(); 
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await userService.updateProfile(profileData);
      if (response.success) {
        const userData = response.data;
        userData.profilePicture = userData.user_image_url || '/src/assets/placeholder.jpg';
        
        setUser(userData);
        updateAuthStatus(); 
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
  
  const updateProfileWithImage = async (profileData, imageFile) => {
    try {
      setLoading(true);
      const response = await userService.updateProfileWithImage(profileData, imageFile);
      if (response.success) {
        const userData = response.data;
        userData.profilePicture = userData.user_image_url || '/src/assets/placeholder.jpg';
        
        setUser(userData);
        updateAuthStatus(); 
        return { success: true, data: userData };
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
  
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updateProfileWithImage,
    isAuthenticated 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };
export default AuthProvider;
