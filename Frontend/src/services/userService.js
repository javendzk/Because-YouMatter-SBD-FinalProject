// User related API services
import apiClient from './api';

// User authentication and profile services
const userService = {
  // Register a new user
  register: async (userData) => {
    try {
      console.log('USER SERVICE: Sending registration request with data:', {
        ...userData,
        password: '******' // Mask password for security
      });
      
      const response = await apiClient.post('/users/register', userData);
      console.log('USER SERVICE: Registration response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('USER SERVICE: Registration error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },
  // Login user
  login: async (credentials) => {
    try {
      console.log('=== USER SERVICE: Sending login request ===');
      console.log('Credentials:', { email: credentials.email, password: '******' });
      
      const response = await apiClient.post('/users/login', credentials);
      
      console.log('USER SERVICE: Login response received');
      console.log('Status:', response.status);
      console.log('Response data:', response.data);
      console.log('Success:', response.data.success);
      console.log('Data structure:', {
        hasData: !!response.data.data,
        hasPayload: !!response.data.payload,
        hasToken: !!(response.data.data?.token || response.data.payload?.token)
      });
      
      // Store token immediately on successful login
      // Check both data and payload fields for backward compatibility
      const token = response.data.data?.token || response.data.payload?.token;
      
      if (response.data.success && token) {
        console.log('USER SERVICE: Storing token in localStorage');
        localStorage.setItem('token', token);
      } else {
        console.log('USER SERVICE: No token to store or login unsuccessful');
      }
      
      return response.data;
    } catch (error) {
      console.error('USER SERVICE: Login error occurred');
      console.error('Error details:', error);
      console.error('Response:', error.response?.data);
      console.error('Status:', error.response?.status);
      
      // Return structured error response
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to connect to server'
      };
    }
  },

  // Get user profile
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/users/profile', profileData);
    return response.data;
  },

  // Upload profile image
  uploadProfileImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await apiClient.post('/users/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  // Logout user (client-side only)
  logout: () => {
    localStorage.removeItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  // Check if user is a first-time user (registered within last 5 minutes)
  isFirstTimeUser: async () => {
    try {
      console.log('USER SERVICE: Checking if user is a first-time user');
      const response = await apiClient.get('/users/profile');
      
      if (response.data.success) {
        const userData = response.data.data;
        console.log('USER SERVICE: User data received:', {
          username: userData.username,
          hasLastLogin: !!userData.last_login,
          lastLogin: userData.last_login
        });
        
        // If there's no last_login data, check if the user has logs
        if (!userData?.last_login) {
          console.log('USER SERVICE: No last_login data, checking logs');
          
          try {
            const logsResponse = await apiClient.get('/logs');
            if (logsResponse.data.success) {
              const hasLogs = logsResponse.data.data.length > 0;
              console.log('USER SERVICE: User has logs?', hasLogs);
              
              // If user has logs but no last login, they are not a new user
              if (hasLogs) {
                console.log('USER SERVICE: User has logs but no last_login, considering as existing user');
                return false;
              }
            }
          } catch (error) {
            console.error('Error checking logs for first time user:', error);
          }
          
          console.log('USER SERVICE: No logs or last_login, considering as first-time user');
          return true;
        }
        
        // Check if last login was within the last 5 minutes
        const lastLogin = new Date(userData.last_login);
        const currentTime = new Date();
        const timeDiff = (currentTime - lastLogin) / (1000 * 60); // Difference in minutes
        
        console.log('USER SERVICE: First-time user check - last login:', lastLogin.toISOString());
        console.log('USER SERVICE: First-time user check - current time:', currentTime.toISOString());
        console.log('USER SERVICE: First-time user check - time difference in minutes:', timeDiff);
        
        // Also check if user has any logs
        try {
          const logsResponse = await apiClient.get('/logs');
          if (logsResponse.data.success) {
            const hasLogs = logsResponse.data.data.length > 0;
            console.log('USER SERVICE: User has logs?', hasLogs);
            
            // If user has logs, they are not a new user, regardless of login time
            if (hasLogs) {
              console.log('USER SERVICE: User has logs, considering as existing user');
              return false;
            }
          }
        } catch (error) {
          console.error('Error checking logs for first time user:', error);
        }
        
        const isFirstTime = timeDiff < 5; // Consider as first-time user if within 5 minutes and no logs
        console.log('USER SERVICE: Final determination - is first-time user?', isFirstTime);
        return isFirstTime;
      }
      
      console.log('USER SERVICE: Failed to get user profile data');
      return false;
    } catch (error) {
      console.error('Error checking if first time user:', error);
      return false;
    }
  },

  // Update profile with image
  updateProfileWithImage: async (profileData, imageFile) => {
    try {
      const formData = new FormData();
      
      // Add image if provided
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      // Add all profile data to form
      Object.keys(profileData).forEach(key => {
        if (profileData[key] !== undefined && profileData[key] !== null) {
          formData.append(key, profileData[key]);
        }
      });
      
      const response = await apiClient.put('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating profile with image:', error);
      throw error;
    }
  },
};

export default userService;
