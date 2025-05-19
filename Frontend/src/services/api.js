// API Services Configuration
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

console.log('=== API CLIENT CONFIGURATION ===');
console.log('Base URL:', API_BASE_URL);

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    console.log('=== API REQUEST ===');
    console.log('URL:', config.url);
    console.log('Method:', config.method.toUpperCase());
    console.log('Headers:', config.headers);
    console.log('Data:', config.data);
    
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Token found, adding to Authorization header');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('=== API REQUEST ERROR ===');
    console.error('Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(  (response) => {
    console.log('=== API RESPONSE ===');
    console.log('URL:', response.config.url);
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Response data structure:', response);
    // Transform payload to data if necessary for consistency
    if (response.data.payload && !response.data.data) {
      console.log('Transforming payload to data for consistency');
      response.data.data = response.data.payload;
    }
    
    return response;
  },
  (error) => {
    console.error('=== API RESPONSE ERROR ===');
    console.error('Error object:', error);
    
    if (error.response) {
      // Request was made and server responded with error status
      console.error('Response Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('Request Error: No response received');
      console.error('Request details:', error.request);
    } else {
      // Error in setting up the request
      console.error('Setup Error:', error.message);
    }
    
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      console.log('Authentication error (401), clearing token');
      localStorage.removeItem('token');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
