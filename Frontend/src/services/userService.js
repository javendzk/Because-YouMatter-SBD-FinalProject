import apiClient from './api';

const userService = {
  register: async (userData) => {
    try {
 
      
      const response = await apiClient.post('/users/register', userData);
      return response.data;
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },
  login: async (credentials) => {
    try {
      
      const response = await apiClient.post('/users/login', credentials);      
      const token = response.data.data?.token || response.data.payload?.token;
      
      if (response.data.success && token) {
        localStorage.setItem('token', token);
      } else {
      }
      
      return response.data;
    } catch (error) {
      console.error('USER SERVICE: Login error occurred');
      console.error('Error details:', error);
      console.error('Response:', error.response?.data);
      console.error('Status:', error.response?.status);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to connect to server'
      };
    }
  },

  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await apiClient.put('/users/profile', profileData);
    return response.data;
  },

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
  logout: () => {
    localStorage.removeItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  isFirstTimeUser: async () => {
    try {
      const response = await apiClient.get('/users/profile');
      
      if (response.data.success) {
        const userData = response.data.data;
        console.log('', {
          username: userData.username,
          hasLastLogin: !!userData.last_login,
          lastLogin: userData.last_login
        });
        
        if (!userData?.last_login) {
          
          try {
            const logsResponse = await apiClient.get('/logs');
            if (logsResponse.data.success) {
              const hasLogs = logsResponse.data.data.length > 0;
              
              if (hasLogs) {
                return false;
              }
            }
          } catch (error) {
            console.error('Error checking logs for first time user:', error);
          }
          
          console.log('USER SERVICE: No logs or last_login, considering as first-time user');
          return true;
        }
        
        const lastLogin = new Date(userData.last_login);
        const currentTime = new Date();
        const timeDiff = (currentTime - lastLogin) / (1000 * 60); 

        try {
          const logsResponse = await apiClient.get('/logs');
          if (logsResponse.data.success) {
            const hasLogs = logsResponse.data.data.length > 0;
            
            if (hasLogs) {
              return false;
            }
          }
        } catch (error) {
          console.error('Error checking logs for first time user:', error);
        }
        
        const isFirstTime = timeDiff < 5; 
        return isFirstTime;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking if first time user:', error);
      return false;
    }
  },

  updateProfileWithImage: async (profileData, imageFile) => {
    try {
      const formData = new FormData();
      
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
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
