/**
 * Admin Routes
 * Handles employee management and attendance administration
 * All routes require admin role
 */
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authRequired, adminOnly } = require('../middleware/authMiddleware');

// All routes require authentication and admin role
router.use(authRequired);
router.use(adminOnly);

// ============= Employee Management =============

/**
 * GET /api/admin/employees
 * Get all employees
 * Query: { includeInactive? }
 */
router.get('/employees', adminController.getEmployees);

/**
 * POST /api/admin/employees
 * Create a new employee
 * Body: { name, mobileNumber, employeeId?, password, role? }
 */
router.post('/employees', adminController.createEmployee);

/**
 * DELETE /api/admin/employees/:id
 * Deactivate an employee (soft delete)
 */
router.delete('/employees/:id', adminController.deactivateEmployee);

/**
 * PATCH /api/admin/employees/:id/activate
 * Reactivate a deactivated employee
 */
router.patch('/employees/:id/activate', adminController.activateEmployee);

// ============= Attendance Management =============

/**
 * GET /api/admin/attendance
 * Get all attendance records with filters
 * Query: { userId?, from?, to? }
 */
router.get('/attendance', adminController.getAttendance);

/**
 * GET /api/admin/attendance/export/excel
 * Export attendance records to Excel
 * Query: { userId?, from?, to? }
 */
router.get('/attendance/export/excel', adminController.exportExcel);

/**
 * GET /api/admin/attendance/export/pdf
 * Export attendance records to PDF
 * Query: { userId?, from?, to? }
 */
router.get('/attendance/export/pdf', adminController.exportPdf);

module.exports = router;
