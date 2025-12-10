/**
 * Database Initialization Script
 * Run this to set up the database tables and create an initial admin user
 * Usage: npm run db:init
 */
require('dotenv').config();

const userModel = require('../models/userModel');
const attendanceModel = require('../models/attendanceModel');
const { hashPassword } = require('../utils/password');
const {
  DEFAULT_ADMIN_NAME,
  DEFAULT_ADMIN_MOBILE,
  DEFAULT_ADMIN_EMPLOYEE_ID,
  DEFAULT_ADMIN_PASSWORD
} = require('../config/env');

const initializeDatabase = async () => {
  try {
    console.log('Starting database initialization...\n');
    
    // Create tables
    console.log('Creating users table...');
    await userModel.createTable();
    console.log('✓ Users table created\n');
    
    console.log('Creating attendance_records table...');
    await attendanceModel.createTable();
    console.log('✓ Attendance records table created\n');
    
    // Check if admin exists
    const existingAdmin = await userModel.findByMobileNumber(DEFAULT_ADMIN_MOBILE);
    
    if (!existingAdmin) {
      console.log('Creating default admin user...');
      
      if (!DEFAULT_ADMIN_PASSWORD) {
        throw new Error('DEFAULT_ADMIN_PASSWORD is required to create the default admin');
      }

      const passwordHash = await hashPassword(DEFAULT_ADMIN_PASSWORD);
      
      const admin = await userModel.create({
        name: DEFAULT_ADMIN_NAME,
        mobileNumber: DEFAULT_ADMIN_MOBILE,
        employeeId: DEFAULT_ADMIN_EMPLOYEE_ID || null,
        passwordHash,
        role: 'admin'
      });
      
      console.log('✓ Default admin created:');
      console.log(`  Mobile: ${admin.mobile_number}`);
      if (admin.employee_id) {
        console.log(`  Employee ID: ${admin.employee_id}`);
      }
      console.log('  ⚠️  Update DEFAULT_ADMIN_PASSWORD after first login!\n');
    } else {
      console.log('Admin user already exists\n');
    }
    
    console.log('='.repeat(50));
    console.log('Database initialization complete!');
    console.log('='.repeat(50));
    
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

initializeDatabase();
