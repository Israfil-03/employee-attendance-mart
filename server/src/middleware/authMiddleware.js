/**
 * Authentication Middleware
 * Handles JWT verification and role-based access control
 */
const { verifyToken } = require('../utils/jwt');
const userModel = require('../models/userModel');

/**
 * Middleware to require authentication
 * Validates JWT token from Authorization header
 */
const authRequired = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ 
        message: 'Invalid or expired token.' 
      });
    }
    
    // Check if user still exists and is active
    const user = await userModel.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        message: 'User not found.' 
      });
    }
    
    if (!user.is_active) {
      return res.status(401).json({ 
        message: 'Account has been deactivated.' 
      });
    }
    
    // Attach user to request
    req.user = {
      id: user.id,
      name: user.name,
      role: user.role,
      employeeId: user.employee_id,
      mobileNumber: user.mobile_number
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      message: 'Authentication error.' 
    });
  }
};

/**
 * Middleware factory to require specific role(s)
 * @param  {...string} roles - Allowed roles
 * @returns {Function} Middleware function
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required.' 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.' 
      });
    }
    
    next();
  };
};

/**
 * Shorthand middleware for admin-only routes
 */
const adminOnly = requireRole('admin');

/**
 * Shorthand middleware for employee-only routes
 */
const employeeOnly = requireRole('employee');

module.exports = {
  authRequired,
  requireRole,
  adminOnly,
  employeeOnly
};
