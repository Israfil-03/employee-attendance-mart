/**
 * Attendance API Service
 * Handles check-in, check-out, and attendance history requests
 */
import axiosClient from './axiosClient';

/**
 * Check in with location
 * @param {Object} data - { latitude, longitude }
 * @returns {Promise} Check-in record
 */
export const checkIn = async (data) => {
  const response = await axiosClient.post('/api/attendance/check-in', data);
  return response.data;
};

/**
 * Check out with location
 * @param {Object} data - { latitude, longitude }
 * @returns {Promise} Updated attendance record
 */
export const checkOut = async (data) => {
  const response = await axiosClient.post('/api/attendance/check-out', data);
  return response.data;
};

/**
 * Get current check-in status
 * @returns {Promise} Status with isCheckedIn and currentRecord
 */
export const getStatus = async () => {
  const response = await axiosClient.get('/api/attendance/status');
  return response.data;
};

/**
 * Get own attendance records
 * @param {Object} params - { from, to } date filters
 * @returns {Promise} Attendance records and summary
 */
export const getMyAttendance = async (params = {}) => {
  const response = await axiosClient.get('/api/attendance/me', { params });
  return response.data;
};

export default {
  checkIn,
  checkOut,
  getStatus,
  getMyAttendance
};
