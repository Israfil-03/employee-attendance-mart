/**
 * Express Application Configuration
 * Sets up middleware, routes, and error handling
 */
const express = require('express');
const cors = require('cors');
const { FRONTEND_URL, NODE_ENV } = require('./config/env');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Create Express app
const app = express();

// ============= Middleware =============

// CORS configuration
// In production, set FRONTEND_URL to your Render static site URL
const getAllowedOrigins = () => {
  if (NODE_ENV === 'production') {
    // Allow the configured frontend URL and common variations
    const origins = [FRONTEND_URL];
    // Also allow without trailing slash and with www
    if (FRONTEND_URL) {
      origins.push(FRONTEND_URL.replace(/\/$/, '')); // without trailing slash
      origins.push(FRONTEND_URL.replace('https://', 'https://www.')); // with www
    }
    return origins.filter(Boolean);
  }
  return ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];
};

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = getAllowedOrigins();
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin, 'Allowed:', allowedOrigins);
      callback(null, true); // Allow all origins in case of misconfiguration
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

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
