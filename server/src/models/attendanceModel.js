/**
 * Attendance Model
 * Handles all database operations for attendance_records table
 */
const db = require('../config/db');

/**
 * Create the attendance_records table if it doesn't exist
 */
const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS attendance_records (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      check_in_time TIMESTAMP NOT NULL,
      check_in_latitude DOUBLE PRECISION,
      check_in_longitude DOUBLE PRECISION,
      check_out_time TIMESTAMP,
      check_out_latitude DOUBLE PRECISION,
      check_out_longitude DOUBLE PRECISION,
      created_at TIMESTAMP DEFAULT NOW()
    );
    
    -- Create indexes for faster queries
    CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance_records(user_id);
    CREATE INDEX IF NOT EXISTS idx_attendance_check_in ON attendance_records(check_in_time);
    CREATE INDEX IF NOT EXISTS idx_attendance_check_out ON attendance_records(check_out_time);
  `;
  
  await db.query(query);
};

/**
 * Check if user has an open attendance record (checked in but not checked out)
 * @param {number} userId 
 * @returns {Object|null} Open record or null
 */
const findOpenRecord = async (userId) => {
  const result = await db.query(
    `SELECT * FROM attendance_records 
     WHERE user_id = $1 AND check_out_time IS NULL
     ORDER BY check_in_time DESC
     LIMIT 1`,
    [userId]
  );
  return result.rows[0] || null;
};

/**
 * Create a check-in record
 * @param {Object} data 
 * @returns {Object} Created attendance record
 */
const checkIn = async ({ userId, latitude, longitude }) => {
  const result = await db.query(
    `INSERT INTO attendance_records (user_id, check_in_time, check_in_latitude, check_in_longitude)
     VALUES ($1, NOW(), $2, $3)
     RETURNING *`,
    [userId, latitude, longitude]
  );
  return result.rows[0];
};

/**
 * Update a record with check-out data
 * @param {number} recordId 
 * @param {Object} data 
 * @returns {Object} Updated attendance record
 */
const checkOut = async (recordId, { latitude, longitude }) => {
  const result = await db.query(
    `UPDATE attendance_records 
     SET check_out_time = NOW(), 
         check_out_latitude = $1, 
         check_out_longitude = $2
     WHERE id = $3
     RETURNING *`,
    [latitude, longitude, recordId]
  );
  return result.rows[0];
};

/**
 * Get attendance records for a specific user
 * @param {number} userId 
 * @param {Object} filters - Optional date filters
 * @returns {Array} Attendance records
 */
const findByUserId = async (userId, { from, to } = {}) => {
  let query = `
    SELECT * FROM attendance_records 
    WHERE user_id = $1
  `;
  const params = [userId];
  
  if (from) {
    params.push(from);
    query += ` AND check_in_time >= $${params.length}`;
  }
  
  if (to) {
    params.push(to);
    query += ` AND check_in_time <= $${params.length}`;
  }
  
  query += ' ORDER BY check_in_time DESC';
  
  const result = await db.query(query, params);
  return result.rows;
};

/**
 * Get all attendance records with user info (for admin)
 * @param {Object} filters 
 * @returns {Array} Attendance records with user details
 */
const findAllWithUser = async ({ userId, from, to } = {}) => {
  let query = `
    SELECT 
      ar.id,
      ar.user_id,
      ar.check_in_time,
      ar.check_in_latitude,
      ar.check_in_longitude,
      ar.check_out_time,
      ar.check_out_latitude,
      ar.check_out_longitude,
      ar.created_at,
      u.name as user_name,
      u.employee_id,
      u.mobile_number
    FROM attendance_records ar
    JOIN users u ON ar.user_id = u.id
    WHERE 1=1
  `;
  const params = [];
  
  if (userId) {
    params.push(userId);
    query += ` AND ar.user_id = $${params.length}`;
  }
  
  if (from) {
    params.push(from);
    query += ` AND ar.check_in_time >= $${params.length}`;
  }
  
  if (to) {
    params.push(to);
    query += ` AND ar.check_in_time <= $${params.length}`;
  }
  
  query += ' ORDER BY ar.check_in_time DESC';
  
  const result = await db.query(query, params);
  return result.rows;
};

/**
 * Get attendance record by ID
 * @param {number} id 
 * @returns {Object|null} Attendance record or null
 */
const findById = async (id) => {
  const result = await db.query(
    'SELECT * FROM attendance_records WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

/**
 * Get attendance summary for a user (total days, hours worked, etc.)
 * @param {number} userId 
 * @param {Object} filters 
 * @returns {Object} Summary statistics
 */
const getSummary = async (userId, { from, to } = {}) => {
  let query = `
    SELECT 
      COUNT(*) as total_records,
      COUNT(CASE WHEN check_out_time IS NOT NULL THEN 1 END) as completed_records,
      MIN(check_in_time) as first_check_in,
      MAX(check_in_time) as last_check_in
    FROM attendance_records 
    WHERE user_id = $1
  `;
  const params = [userId];
  
  if (from) {
    params.push(from);
    query += ` AND check_in_time >= $${params.length}`;
  }
  
  if (to) {
    params.push(to);
    query += ` AND check_in_time <= $${params.length}`;
  }
  
  const result = await db.query(query, params);
  return result.rows[0];
};

module.exports = {
  createTable,
  findOpenRecord,
  checkIn,
  checkOut,
  findByUserId,
  findAllWithUser,
  findById,
  getSummary
};
