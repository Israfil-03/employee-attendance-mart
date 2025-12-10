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
 * Login user
 * Body: { identifier (mobile or employeeId), password }
 */
router.post('/login', authController.login);

/**
 * GET /api/auth/me
 * Get current user profile (requires auth)
 */
router.get('/me', authRequired, authController.getProfile);

module.exports = router;
