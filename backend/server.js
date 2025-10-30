require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const attendanceRoutes = require('./routes/attendance');

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://employee-attendance-tracker-1-ocde.onrender.com',
  'https://employee-attendance-tracker-8814.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, postman, or server-side requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      return callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests for all routes
app.options('*', cors());

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check route - important for Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Employee Attendance Tracker API',
    version: '1.0.0',
    status: 'active',
    endpoints: [
      '/health',
      '/api/test-db',
      '/api/attendance'
    ]
  });
});

// Test route to check database connection
app.get('/api/test-db', (req, res) => {
  const db = require('./models/database');
  
  db.query('SELECT 1 + 1 AS solution', (err, results) => {
    if (err) {
      console.error('Database test failed:', err);
      return res.status(500).json({ 
        error: 'Database connection failed', 
        details: err.message 
      });
    }
    res.json({ 
      message: 'Database connection successful!',
      solution: results[0].solution,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT
    });
  });
});

// Routes
app.use('/api/attendance', attendanceRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  // Handle CORS errors specifically
  if (err.message.includes('CORS')) {
    return res.status(403).json({ 
      error: 'CORS Error', 
      message: 'Access denied due to CORS policy' 
    });
  }
  
  res.status(500).json({ 
    error: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// 404 handler - must be last
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Important: Render requires binding to 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Database Host: ${process.env.DB_HOST}`);
  console.log(` Database Name: ${process.env.DB_NAME}`);
  console.log(` CORS enabled for: ${allowedOrigins.join(', ')}`);
  console.log(` Health check: http://0.0.0.0:${PORT}/health`);
});