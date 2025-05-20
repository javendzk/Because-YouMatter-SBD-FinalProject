import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
    }
    return config;
  },
  (error) => {
    console.error('Error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    if (response.data.payload && !response.data.data) {
      response.data.data = response.data.payload;
    }
    
    return response;
  },
  (error) => {
    console.error('Error object:', error);
    
    if (error.response) {
      console.error('Response Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
      
      if (error.response.status === 401) {
        console.error('401 Unauthorized error detected - clearing token');
        localStorage.removeItem('token');
        
        error.isAuthError = true;
        error.authErrorMessage = error.response.data?.message || 'Your session has expired. Please log in again.';
      }
    } else if (error.request) {
      console.error('Request Error: No response received', error.request);
    } else {
      console.error('Error Message:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
