/**
 * Express Application Configuration
 * Sets up middleware, routes, and error handling
 */
const express = require('express');
const cors = require('cors');
const { NODE_ENV, FRONTEND_URL } = require('./config/env');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Create Express app
const app = express();

// ============= Middleware =============

// Parse allowed origins from FRONTEND_URL (can be comma-separated)
const getAllowedOrigins = () => {
  if (!FRONTEND_URL) return ['http://localhost:5173'];
  
  const origins = FRONTEND_URL.split(',').map(url => url.trim());
  // Also allow localhost for development
  if (NODE_ENV === 'development') {
    origins.push('http://localhost:5173', 'http://127.0.0.1:5173');
  }
  return origins;
};

const allowedOrigins = getAllowedOrigins();
console.log('🔐 Allowed CORS origins:', allowedOrigins);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    // Check if origin is in the allowed list
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.log('⚠️ CORS blocked origin:', origin);
      // In production, still allow but log - to avoid blocking legitimate requests
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Disposition'],
  credentials: true,
  maxAge: 86400 // 24 hours - browsers can cache preflight response
};

// Handle preflight requests FIRST
app.options('*', cors(corsOptions));

// Apply CORS to all routes
app.use(cors(corsOptions));

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
