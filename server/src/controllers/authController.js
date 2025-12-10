/**
 * Authentication Controller
 * Handles user registration and login
 */
const userModel = require('../models/userModel');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const { asyncHandler, ApiError } = require('../middleware/errorMiddleware');

/**
 * Register a new user
 * POST /api/auth/signup
 */
const signup = asyncHandler(async (req, res) => {
  const { name, mobileNumber, employeeId, password, role } = req.body;
  
  // Validate required fields
  if (!name || !mobileNumber || !password) {
    throw new ApiError(400, 'Name, mobile number, and password are required');
  }
  
  // Validate mobile number format (basic validation)
  if (!/^\d{10,15}$/.test(mobileNumber.replace(/[^\d]/g, ''))) {
    throw new ApiError(400, 'Invalid mobile number format');
  }
  
  // Validate password length
  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }
  
  // Check if mobile number already exists
  const existingUser = await userModel.findByMobileNumber(mobileNumber);
  if (existingUser) {
    throw new ApiError(400, 'Mobile number already registered');
  }
  
  // Check if employee ID already exists (if provided)
  if (employeeId) {
    const existingEmployee = await userModel.findByEmployeeId(employeeId);
    if (existingEmployee) {
      throw new ApiError(400, 'Employee ID already exists');
    }
  }
  
  // Hash password
  const passwordHash = await hashPassword(password);
  
  // Create user (SECURITY: Only allow 'employee' role through public signup)
  // Admin users must be created through the admin panel or database
  const userRole = 'employee';
  
  const user = await userModel.create({
    name,
    mobileNumber,
    employeeId: employeeId || null,
    passwordHash,
    role: userRole
  });
  
  // Generate token
  const token = generateToken(user);
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: {
      id: user.id,
      name: user.name,
      employeeId: user.employee_id,
      mobileNumber: user.mobile_number,
      role: user.role
    }
  });
});

/**
 * Login user
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  
  // Validate required fields
  if (!identifier || !password) {
    throw new ApiError(400, 'Identifier and password are required');
  }
  
  // Find user by mobile number OR employee ID
  const user = await userModel.findByIdentifier(identifier);
  
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }
  
  // Check if user is active
  if (!user.is_active) {
    throw new ApiError(401, 'Account has been deactivated. Contact administrator.');
  }
  
  // Verify password
  const isValidPassword = await comparePassword(password, user.password_hash);
  
  if (!isValidPassword) {
    throw new ApiError(401, 'Invalid credentials');
  }
  
  // Generate token
  const token = generateToken(user);
  
  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      employeeId: user.employee_id,
      mobileNumber: user.mobile_number,
      role: user.role
    }
  });
});

/**
 * Get current user profile
 * GET /api/auth/me
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user.id);
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      employeeId: user.employee_id,
      mobileNumber: user.mobile_number,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at
    }
  });
});

module.exports = {
  signup,
  login,
  getProfile
};
