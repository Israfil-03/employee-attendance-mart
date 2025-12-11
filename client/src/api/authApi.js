/**
 * Authentication API Service
 * Handles login, signup, and user profile requests
 */
import axiosClient from './axiosClient';

/**
 * Register a new user
 * @param {Object} data - { name, mobileNumber, employeeId, password }
 * @returns {Promise} Response with token and user data
 */
export const signup = async (data) => {
  const response = await axiosClient.post('/api/auth/signup', data);
  return response.data;
};

/**
 * Login user (Admin with password)
 * @param {Object} data - { identifier, password }
 * @returns {Promise} Response with token and user data
 */
export const login = async (data) => {
  const response = await axiosClient.post('/api/auth/login', data);
  return response.data;
};

/**
 * Login employee with ID only (no password)
 * @param {Object} data - { employeeId }
 * @returns {Promise} Response with token and user data
 */
export const loginEmployee = async (data) => {
  const response = await axiosClient.post('/api/auth/login-employee', data);
  return response.data;
};

/**
 * Get current user profile
 * @returns {Promise} User profile data
 */
export const getProfile = async () => {
  const response = await axiosClient.get('/api/auth/me');
  return response.data;
};

export default {
  signup,
  login,
  loginEmployee,
  getProfile
};
