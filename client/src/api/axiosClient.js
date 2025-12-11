/**
 * Axios Client Configuration
 * Centralized HTTP client with interceptors for auth and error handling
 */
import axios from 'axios';

// Get API URL from environment
// IMPORTANT: For production, VITE_API_URL must be set at BUILD time
const getApiUrl = () => {
  // Check for Vite environment variable (set at build time)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Fallback: If we're on a .onrender.com domain, construct the API URL
  if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    // Replace 'web' with 'api' in the hostname
    const apiHost = window.location.hostname.replace('-web.onrender.com', '-api.onrender.com');
    return `https://${apiHost}`;
  }
  
  // Development: use empty string (Vite proxy handles it)
  return '';
};

const API_URL = getApiUrl();

console.log('API URL configured:', API_URL || '(using local proxy)');

// Create axios instance with base configuration
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
