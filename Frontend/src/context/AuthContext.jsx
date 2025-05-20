import React, { createContext, useState, useEffect, useContext } from 'react';
import userService from '../services/userService';

// Create the authentication context
const AuthContext = createContext(null);

// Auth provider component
const AuthProvider = ({ children }) => {
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
          setLoading(true);
          const response = await userService.getProfile();
          if (response.success) {
            // Transform user data to ensure profile picture is properly set
            const userData = response.data;
            
            // Map profile image URL for consistency across the app
            // First try user_image_url, then profile_image_url, then fall back to placeholder
            userData.profilePicture = userData.user_image_url || 
                                      userData.profile_image_url || 
                                      '/src/assets/placeholder.jpg';
            
            console.log('Profile data loaded:', {
              username: userData.username,
              hasProfilePicture: !!userData.profilePicture,
              profilePictureSource: userData.user_image_url ? 'user_image_url' : 
                                   (userData.profile_image_url ? 'profile_image_url' : 'placeholder')
            });
            
            setUser(userData);
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
        
        // Map user_image_url to profilePicture for consistency across the app
        if (userData) {
          userData.profilePicture = userData.user_image_url || '/src/assets/placeholder.jpg';
          console.log('Profile picture set:', userData.profilePicture);
        }
        
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
      console.log('AuthContext: Registering user with data:', {
        ...userData,
        password: '******' // Mask password for security
      });
      
      const response = await userService.register(userData);
      console.log('AuthContext: Registration response:', response);
      
      if (response.success) {
        // Auto-login after successful registration
        console.log('AuthContext: Registration successful, attempting auto-login');
        
        // Prepare login credentials from registration data
        const loginCredentials = {
          email: userData.email,
          password: userData.password
        };
        
        try {
          // Call login function to authenticate the user
          const loginResponse = await login(loginCredentials);
          if (loginResponse.success) {
            console.log('AuthContext: Auto-login successful after registration');
            return { success: true, autoLoginSuccess: true };
          } else {
            console.log('AuthContext: Auto-login failed after registration:', loginResponse.message);
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

  // Logout function
  const logout = () => {
    userService.logout();
    setUser(null);
    updateAuthStatus(); // Update auth status after logout
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await userService.updateProfile(profileData);
      if (response.success) {
        // Ensure profile picture is properly set
        const userData = response.data;
        userData.profilePicture = userData.user_image_url || '/src/assets/placeholder.jpg';
        
        setUser(userData);
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
  
  // Update profile with image function
  const updateProfileWithImage = async (profileData, imageFile) => {
    try {
      setLoading(true);
      const response = await userService.updateProfileWithImage(profileData, imageFile);
      if (response.success) {
        // Ensure profile picture is properly set
        const userData = response.data;
        userData.profilePicture = userData.user_image_url || '/src/assets/placeholder.jpg';
        
        setUser(userData);
        updateAuthStatus(); // Update auth status after profile update
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
  
  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updateProfileWithImage, // Expose the new function in the context
    isAuthenticated // Using the state variable for consistent behavior
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export both the context and hooks
export { AuthProvider, useAuth };
export default AuthProvider;
