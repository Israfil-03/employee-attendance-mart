/**
 * Authentication Routes
 * Handles user registration, login, and profile
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authRequired } = require('../middleware/authMiddleware');

/**
 * POST /api/auth/signup
 * Register a new user
 * Body: { name, mobileNumber, employeeId?, password }
 */
router.post('/signup', authController.signup);

/**
 * POST /api/auth/login
 * Login user (Admin with password)
 * Body: { identifier (mobile or employeeId), password }
 */
router.post('/login', authController.login);

/**
 * POST /api/auth/login-employee
 * Login employee with ID only (no password)
 * Body: { employeeId }
 */
router.post('/login-employee', authController.loginEmployee);

/**
 * GET /api/auth/me
 * Get current user profile (requires auth)
 */
router.get('/me', authRequired, authController.getProfile);

module.exports = router;
