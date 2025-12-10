/**
 * PostgreSQL Database Connection Configuration
 * Uses the pg library to connect to PostgreSQL
 * 
 * For Render deployment:
 * - Create a PostgreSQL database in Render
 * - Copy the Internal Database URL 
 * - Set it as DATABASE_URL environment variable in your Web Service
 */
const { Pool } = require('pg');
const { DATABASE_URL, NODE_ENV } = require('./env');

// Create connection pool
const pool = new Pool({
  connectionString: DATABASE_URL,
  // SSL is required for Render's managed PostgreSQL
  ssl: NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection on startup
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Execute a query with parameters
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  
  if (NODE_ENV === 'development') {
    console.log('Executed query', { text, duration, rows: res.rowCount });
  }
  
  return res;
};

/**
 * Get a client from the pool for transactions
 * @returns {Promise} Pool client
 */
const getClient = () => pool.connect();

module.exports = {
  query,
  getClient,
  pool
};
