/**
 * Server Entry Point
 * Initializes database and starts the Express server
 */
const app = require('./app');
const {
  PORT,
  NODE_ENV,
  DEFAULT_ADMIN_NAME,
  DEFAULT_ADMIN_MOBILE,
  DEFAULT_ADMIN_EMPLOYEE_ID,
  DEFAULT_ADMIN_PASSWORD
} = require('./config/env');
const { testConnection } = require('./config/db');
const userModel = require('./models/userModel');
const attendanceModel = require('./models/attendanceModel');
const { hashPassword } = require('./utils/password');

/**
 * Initialize database tables
 */
const initializeDatabase = async () => {
  try {
    console.log('Initializing database...');
    
    // Test connection first
    await testConnection();
    
    console.log('Creating database tables...');
    
    // Create tables in order (users first due to foreign key)
    await userModel.createTable();
    console.log('✓ Users table ready');
    
    await attendanceModel.createTable();
    console.log('✓ Attendance records table ready');

    await ensureDefaultAdmin();
    
    console.log('✓ Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

/**
 * Ensure there is at least one admin user present
 * Uses bootstrap credentials from environment variables
 */
const ensureDefaultAdmin = async () => {
  // Skip creation if required secrets are missing
  if (!DEFAULT_ADMIN_MOBILE || !DEFAULT_ADMIN_PASSWORD) {
    console.warn('Skipping default admin bootstrap: missing DEFAULT_ADMIN_MOBILE or DEFAULT_ADMIN_PASSWORD');
    return;
  }

  try {
    // Check if admin exists by mobile number
    const existingByMobile = await userModel.findByMobileNumber(DEFAULT_ADMIN_MOBILE);
    if (existingByMobile) {
      console.log('✓ Default admin already exists (found by mobile)');
      return;
    }

    // Also check if admin exists by employee ID (to prevent duplicate key error)
    if (DEFAULT_ADMIN_EMPLOYEE_ID) {
      const existingByEmployeeId = await userModel.findByEmployeeId(DEFAULT_ADMIN_EMPLOYEE_ID);
      if (existingByEmployeeId) {
        console.log('✓ Default admin already exists (found by employee ID)');
        return;
      }
    }

    const passwordHash = await hashPassword(DEFAULT_ADMIN_PASSWORD);

    await userModel.create({
      name: DEFAULT_ADMIN_NAME,
      mobileNumber: DEFAULT_ADMIN_MOBILE,
      employeeId: DEFAULT_ADMIN_EMPLOYEE_ID || null,
      passwordHash,
      role: 'admin'
    });

    console.log('✓ Default admin created');
    console.log(`  Mobile: ${DEFAULT_ADMIN_MOBILE}`);
    if (DEFAULT_ADMIN_EMPLOYEE_ID) {
      console.log(`  Employee ID: ${DEFAULT_ADMIN_EMPLOYEE_ID}`);
    }
    console.log('  ⚠️  Update DEFAULT_ADMIN_PASSWORD after first login');
  } catch (error) {
    // If it's a duplicate key error, the admin already exists - that's fine
    if (error.code === '23505') {
      console.log('✓ Admin user already exists in database');
      return;
    }
    // For other errors, rethrow
    throw error;
  }
};

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Start listening
    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer();
