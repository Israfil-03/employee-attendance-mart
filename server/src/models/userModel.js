/**
 * User Model
 * Handles all database operations for users table
 */
const db = require('../config/db');

/**
 * Create the users table if it doesn't exist
 */
const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      employee_id VARCHAR(50) UNIQUE,
      name VARCHAR(100) NOT NULL,
      mobile_number VARCHAR(15) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'employee',
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    );
    
    -- Create indexes for faster lookups
    CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile_number);
    CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
  `;
  
  await db.query(query);
};

/**
 * Find user by mobile number
 * @param {string} mobileNumber 
 * @returns {Object|null} User object or null
 */
const findByMobileNumber = async (mobileNumber) => {
  const result = await db.query(
    'SELECT * FROM users WHERE mobile_number = $1',
    [mobileNumber]
  );
  return result.rows[0] || null;
};

/**
 * Find user by employee ID
 * @param {string} employeeId 
 * @returns {Object|null} User object or null
 */
const findByEmployeeId = async (employeeId) => {
  const result = await db.query(
    'SELECT * FROM users WHERE employee_id = $1',
    [employeeId]
  );
  return result.rows[0] || null;
};

/**
 * Find user by ID
 * @param {number} id 
 * @returns {Object|null} User object or null
 */
const findById = async (id) => {
  const result = await db.query(
    'SELECT id, employee_id, name, mobile_number, role, is_active, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

/**
 * Find user by mobile number OR employee ID (for login)
 * @param {string} identifier - Can be mobile number or employee ID
 * @returns {Object|null} User object or null
 */
const findByIdentifier = async (identifier) => {
  const result = await db.query(
    'SELECT * FROM users WHERE mobile_number = $1 OR employee_id = $1',
    [identifier]
  );
  return result.rows[0] || null;
};

/**
 * Create a new user
 * @param {Object} userData 
 * @returns {Object} Created user (without password)
 */
const create = async ({ name, mobileNumber, employeeId, passwordHash, role = 'employee' }) => {
  const result = await db.query(
    `INSERT INTO users (name, mobile_number, employee_id, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, employee_id, name, mobile_number, role, is_active, created_at`,
    [name, mobileNumber, employeeId, passwordHash, role]
  );
  return result.rows[0];
};

/**
 * Get all users (for admin)
 * @param {boolean} includeInactive - Whether to include inactive users
 * @returns {Array} List of users
 */
const findAll = async (includeInactive = false) => {
  let query = `
    SELECT id, employee_id, name, mobile_number, role, is_active, created_at 
    FROM users
  `;
  
  if (!includeInactive) {
    query += ' WHERE is_active = true';
  }
  
  query += ' ORDER BY created_at DESC';
  
  const result = await db.query(query);
  return result.rows;
};

/**
 * Get all employees (non-admin users)
 * @returns {Array} List of employees
 */
const findAllEmployees = async () => {
  const result = await db.query(
    `SELECT id, employee_id, name, mobile_number, role, is_active, created_at 
     FROM users 
     WHERE role = 'employee'
     ORDER BY name ASC`
  );
  return result.rows;
};

/**
 * Update user's active status (soft delete)
 * @param {number} id 
 * @param {boolean} isActive 
 * @returns {Object} Updated user
 */
const updateActiveStatus = async (id, isActive) => {
  const result = await db.query(
    `UPDATE users SET is_active = $1 WHERE id = $2
     RETURNING id, employee_id, name, mobile_number, role, is_active, created_at`,
    [isActive, id]
  );
  return result.rows[0] || null;
};

/**
 * Hard delete user (use with caution)
 * @param {number} id 
 * @returns {boolean} Success
 */
const deleteUser = async (id) => {
  const result = await db.query('DELETE FROM users WHERE id = $1', [id]);
  return result.rowCount > 0;
};

/**
 * Update user details
 * @param {number} id 
 * @param {Object} updates 
 * @returns {Object} Updated user
 */
const update = async (id, { name, mobileNumber, employeeId }) => {
  const result = await db.query(
    `UPDATE users 
     SET name = COALESCE($1, name),
         mobile_number = COALESCE($2, mobile_number),
         employee_id = COALESCE($3, employee_id)
     WHERE id = $4
     RETURNING id, employee_id, name, mobile_number, role, is_active, created_at`,
    [name, mobileNumber, employeeId, id]
  );
  return result.rows[0] || null;
};

module.exports = {
  createTable,
  findByMobileNumber,
  findByEmployeeId,
  findById,
  findByIdentifier,
  create,
  findAll,
  findAllEmployees,
  updateActiveStatus,
  deleteUser,
  update
};
