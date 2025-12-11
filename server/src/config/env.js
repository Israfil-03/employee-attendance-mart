/**
 * Environment configuration
 * Loads environment variables from .env file in development
 * In production (Render), set these via the dashboard
 */
require('dotenv').config();

// Resolve NODE_ENV first so we can use it for fallbacks
const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
  // Database URL - provided by Render's managed PostgreSQL
  DATABASE_URL: process.env.DATABASE_URL,
  
  // JWT Secret for signing tokens - set this in Render environment variables
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-dev-secret',
  
  // Server port - Render provides PORT automatically
  PORT: process.env.PORT || 5000,
  
  // Frontend URL for CORS configuration
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Default admin bootstrap values (used to seed the first admin account)
  DEFAULT_ADMIN_NAME: process.env.DEFAULT_ADMIN_NAME || 'Admin',
  DEFAULT_ADMIN_MOBILE: process.env.DEFAULT_ADMIN_MOBILE || '9999999999',
  DEFAULT_ADMIN_EMPLOYEE_ID: process.env.DEFAULT_ADMIN_EMPLOYEE_ID || 'ADMIN001',
  DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD || (NODE_ENV === 'development' ? 'admin123' : ''),
  
  // Node environment
  NODE_ENV
};
