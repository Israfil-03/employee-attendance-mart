/**
 * Environment configuration
 * Loads environment variables from .env file in development
 * In production (Render), set these via the dashboard
 */
require('dotenv').config();

module.exports = {
  // Database URL - provided by Render's managed PostgreSQL
  DATABASE_URL: process.env.DATABASE_URL,
  
  // JWT Secret for signing tokens - set this in Render environment variables
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-dev-secret',
  
  // Server port - Render provides PORT automatically
  PORT: process.env.PORT || 5000,
  
  // Frontend URL for CORS configuration
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Node environment
  NODE_ENV: process.env.NODE_ENV || 'development'
};
