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
    const url = import.meta.env.VITE_API_URL;
    // Remove trailing slash if present
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }
  
  // Fallback: If we're on Render, construct the API URL
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // If on Render static site, convert to API URL
    if (hostname.includes('onrender.com')) {
      // Handle specific naming patterns for this app
      if (hostname.includes('employee-attendance-mart-1')) {
        return 'https://employee-attendance-mart.onrender.com';
      }
      // Generic pattern: replace -1 suffix with base name (frontend-1 -> frontend for API)
      if (hostname.match(/-\d+\.onrender\.com$/)) {
        return `https://${hostname.replace(/-\d+(\.onrender\.com)$/, '$1')}`;
      }
    }
  }
  
  // Development: use empty string (Vite proxy handles it)
  return '';
};

const API_URL = getApiUrl();

console.log('🔗 API URL configured:', API_URL || '(using local proxy)');
console.log('🌐 Current hostname:', typeof window !== 'undefined' ? window.location.hostname : 'N/A');
console.log('📦 Environment Mode:', import.meta.env.MODE);

// Create axios instance with base configuration
const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000, // 30 seconds
  withCredentials: true // Send cookies for same-origin, credentials for cross-origin
});

// Request interceptor - add auth token to requests
axiosClient.interceptors.request.use(
  (config) => {
    console.log('📤 API Request:', config.method?.toUpperCase(), config.baseURL + config.url);
    console.log('📤 Request Data:', JSON.stringify(config.data));
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API Error:', error);
    
    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;
      console.error('📛 Response error:', status, data);
      
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
    
    // Network error (no response received)
    if (error.request) {
      console.error('📛 Network error - no response received');
      console.error('📛 Request URL:', error.config?.url);
      console.error('📛 Request baseURL:', error.config?.baseURL);
      
      // Check if it's a CORS error or server unreachable
      const apiUrl = API_URL || 'the server';
      return Promise.reject({
        status: 0,
        message: `Cannot connect to ${apiUrl}. The server might be starting up (takes ~30s on free tier) or there's a network issue. Please try again.`
      });
    }
    
    // Request setup error
    console.error('📛 Request setup error:', error.message);
    return Promise.reject({
      status: 0,
      message: error.message || 'Failed to make request'
    });
  }
);

export default axiosClient;
