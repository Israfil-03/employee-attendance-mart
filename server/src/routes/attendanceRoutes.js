/**
 * Attendance Routes
 * Handles employee check-in/check-out and attendance history
 * All routes require authentication
 */
const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authRequired } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authRequired);

/**
 * POST /api/attendance/check-in
 * Check in with current location
 * Body: { latitude?, longitude? }
 */
router.post('/check-in', attendanceController.checkIn);

/**
 * POST /api/attendance/check-out
 * Check out with current location
 * Body: { latitude?, longitude? }
 */
router.post('/check-out', attendanceController.checkOut);

/**
 * GET /api/attendance/status
 * Get current check-in status
 */
router.get('/status', attendanceController.getStatus);

/**
 * GET /api/attendance/me
 * Get own attendance records
 * Query: { from?, to? } - date filters
 */
router.get('/me', attendanceController.getMyAttendance);

module.exports = router;
