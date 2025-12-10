/**
 * JWT Utility Functions
 * Handles token generation and verification
 */
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object with id, name, role
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  const payload = {
    id: user.id,
    name: user.name,
    role: user.role,
    employeeId: user.employee_id
  };
  
  // Token expires in 24 hours
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

/**
 * Verify a JWT token
 * @param {string} token 
 * @returns {Object|null} Decoded payload or null if invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Decode a token without verification (for debugging)
 * @param {string} token 
 * @returns {Object|null} Decoded payload
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken
};
