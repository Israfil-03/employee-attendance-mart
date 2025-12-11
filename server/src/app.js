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

// CORS configuration - Allow all origins for simplicity
// In a real production app, you'd want to restrict this
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

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
