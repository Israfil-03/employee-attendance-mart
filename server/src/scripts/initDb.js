/**
 * Database Initialization Script
 * Run this to set up the database tables and create an initial admin user
 * Usage: npm run db:init
 */
require('dotenv').config();

const userModel = require('../models/userModel');
const attendanceModel = require('../models/attendanceModel');
const { hashPassword } = require('../utils/password');

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
    const existingAdmin = await userModel.findByMobileNumber('9999999999');
    
    if (!existingAdmin) {
      console.log('Creating default admin user...');
      
      const passwordHash = await hashPassword('admin123');
      
      const admin = await userModel.create({
        name: 'System Admin',
        mobileNumber: '9999999999',
        employeeId: 'ADMIN001',
        passwordHash,
        role: 'admin'
      });
      
      console.log('✓ Default admin created:');
      console.log('  Mobile: 9999999999');
      console.log('  Employee ID: ADMIN001');
      console.log('  Password: admin123');
      console.log('  ⚠️  Please change the password after first login!\n');
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
