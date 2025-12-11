/**
 * Axios Client Configuration
 * Centralized HTTP client with interceptors for auth and error handling
 */
import axios from 'axios';

// Get API URL from environment or default to empty (for development proxy)
const API_URL = import.meta.env.VITE_API_URL || '';

console.log('API URL configured:', API_URL || '(using proxy)');

// Create axios instance with base configuration
// In production, set VITE_API_URL to your Render backend URL
const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000, // 30 seconds
  withCredentials: false // Set to false for cross-origin requests
});

// Request interceptor - add auth token to requests
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;
      
      // Unauthorized - token expired or invalid
      if (status === 401) {
        // Clear stored auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      // Return error with message from server
      return Promise.reject({
        status,
        message: data.message || 'An error occurred',
        ...data
      });
    }
    
    // Network error
    if (error.request) {
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your connection.'
      });
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;
