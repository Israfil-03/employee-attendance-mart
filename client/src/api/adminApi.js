/**
 * Admin API Service
 * Handles employee management and attendance administration
 */
import axiosClient from './axiosClient';

// ============= Employee Management =============

/**
 * Get all employees
 * @param {boolean} includeInactive - Include deactivated employees
 * @returns {Promise} List of employees
 */
export const getEmployees = async (includeInactive = false) => {
  const response = await axiosClient.get('/api/admin/employees', {
    params: { includeInactive }
  });
  return response.data;
};

/**
 * Create a new employee
 * @param {Object} data - { name, mobileNumber, employeeId, password, role }
 * @returns {Promise} Created employee
 */
export const createEmployee = async (data) => {
  const response = await axiosClient.post('/api/admin/employees', data);
  return response.data;
};

/**
 * Deactivate an employee
 * @param {number} id - Employee ID
 * @returns {Promise} Deactivated employee
 */
export const deactivateEmployee = async (id) => {
  const response = await axiosClient.delete(`/api/admin/employees/${id}`);
  return response.data;
};

/**
 * Reactivate an employee
 * @param {number} id - Employee ID
 * @returns {Promise} Activated employee
 */
export const activateEmployee = async (id) => {
  const response = await axiosClient.patch(`/api/admin/employees/${id}/activate`);
  return response.data;
};

// ============= Attendance Management =============

/**
 * Get attendance records with filters
 * @param {Object} params - { userId, from, to }
 * @returns {Promise} Attendance records
 */
export const getAttendance = async (params = {}) => {
  const response = await axiosClient.get('/api/admin/attendance', { params });
  return response.data;
};

/**
 * Export attendance to Excel
 * @param {Object} params - { userId, from, to }
 * @returns {Promise} Blob with Excel file
 */
export const exportExcel = async (params = {}) => {
  const response = await axiosClient.get('/api/admin/attendance/export/excel', {
    params,
    responseType: 'blob'
  });
  return response.data;
};

/**
 * Export attendance to PDF
 * @param {Object} params - { userId, from, to }
 * @returns {Promise} Blob with PDF file
 */
export const exportPdf = async (params = {}) => {
  const response = await axiosClient.get('/api/admin/attendance/export/pdf', {
    params,
    responseType: 'blob'
  });
  return response.data;
};

/**
 * Download a blob as a file
 * @param {Blob} blob - File blob
 * @param {string} filename - Filename to save as
 */
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export default {
  getEmployees,
  createEmployee,
  deactivateEmployee,
  activateEmployee,
  getAttendance,
  exportExcel,
  exportPdf,
  downloadFile
};
