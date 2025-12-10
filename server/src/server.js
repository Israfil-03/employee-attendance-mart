/**
 * Server Entry Point
 * Initializes database and starts the Express server
 */
const app = require('./app');
const { PORT, NODE_ENV } = require('./config/env');
const userModel = require('./models/userModel');
const attendanceModel = require('./models/attendanceModel');

/**
 * Initialize database tables
 */
const initializeDatabase = async () => {
  try {
    console.log('Initializing database tables...');
    
    // Create tables in order (users first due to foreign key)
    await userModel.createTable();
    console.log('✓ Users table ready');
    
    await attendanceModel.createTable();
    console.log('✓ Attendance records table ready');
    
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Database initialization failed:', error);
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
