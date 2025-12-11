/**
 * Express Application Configuration
 * Sets up middleware, routes, and error handling
 */
const express = require('express');
const cors = require('cors');
const { NODE_ENV } = require('./config/env');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Create Express app
const app = express();

// ============= Middleware =============

// Handle preflight requests FIRST
app.options('*', cors());

// CORS configuration - Allow all origins
app.use(cors({
  origin: '*', // Allow all origins explicitly
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: false // Set to false when using origin: '*'
}));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Request logging (always enabled for debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin || 'N/A'}`);
  next();
});

// ============= Root Route =============

app.get('/', (req, res) => {
  res.json({
    name: 'Employee Attendance API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      attendance: '/api/attendance',
      admin: '/api/admin'
    }
  });
});

// ============= Health Check =============

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// ============= API Routes =============

app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);

// ============= Error Handling =============

// 404 handler for unknown routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

module.exports = app;
