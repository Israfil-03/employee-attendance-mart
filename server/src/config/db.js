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

// Parse and configure SSL for database connection
const getPoolConfig = () => {
  const config = {
    connectionString: DATABASE_URL,
  };
  
  // SSL is required for Render's managed PostgreSQL
  // Enable SSL if connecting to a remote database (contains 'render.com' or 'postgres')
  // or if explicitly in production mode
  const isRemoteDb = DATABASE_URL && (DATABASE_URL.includes('render.com') || DATABASE_URL.includes('.postgres.'));
  if (NODE_ENV === 'production' || isRemoteDb) {
    config.ssl = {
      rejectUnauthorized: false
    };
  }
  
  return config;
};

// Check if SSL should be enabled
const isRemoteDb = DATABASE_URL && (DATABASE_URL.includes('render.com') || DATABASE_URL.includes('.postgres.'));
const sslEnabled = NODE_ENV === 'production' || isRemoteDb;

// Create connection pool
const pool = new Pool(getPoolConfig());

// Log configuration (without sensitive data)
console.log('📊 Database configuration:');
console.log('   - Environment:', NODE_ENV);
console.log('   - SSL enabled:', sslEnabled);
console.log('   - Connection string:', DATABASE_URL ? 'Configured ✓' : 'MISSING ❌');

// Test connection on startup
pool.on('connect', () => {
  console.log('✓ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Test database connection
 * @returns {Promise<boolean>} True if connection successful
 */
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✓ Database connection test successful:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    throw error;
  }
};

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
  pool,
  testConnection
};
