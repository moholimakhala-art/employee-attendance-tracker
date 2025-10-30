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
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.options('*', cors());

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Test database connection route (using promises)
app.get('/api/test-db', async (req, res) => {
  try {
    const db = require('./models/database');
    
    const [results] = await db.execute('SELECT 1 + 1 AS solution');
    
    res.json({ 
      message: 'Database connection successful!',
      solution: results[0].solution,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST
    });
  } catch (err) {
    console.error('Database test failed:', err);
    res.status(500).json({ 
      error: 'Database connection failed', 
      details: err.message 
    });
  }
});

// Database details endpoint (using promises)
app.get('/api/db-details', async (req, res) => {
  try {
    const db = require('./models/database');
    
    // Test basic connection
    const [testResults] = await db.execute('SELECT 1 + 1 AS solution');
    
    // Check if Attendance table exists
    const [tableResults] = await db.execute(
      `SELECT TABLE_NAME 
       FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'Attendance'`,
      [process.env.DB_NAME]
    );
    
    const attendanceExists = tableResults.length > 0;
    let recordCount = 0;
    
    if (attendanceExists) {
      const [countResults] = await db.execute('SELECT COUNT(*) as count FROM Attendance');
      recordCount = countResults[0].count;
    }
    
    res.json({
      database: {
        host: process.env.DB_HOST,
        name: process.env.DB_NAME,
        port: process.env.DB_PORT,
        user: process.env.DB_USER
      },
      connection: {
        successful: true,
        testResult: testResults[0].solution
      },
      tables: {
        attendanceExists: attendanceExists,
        totalRecords: recordCount
      },
      status: attendanceExists ? 'Fully connected and operational' : 'Database connected but Attendance table not found'
    });
    
  } catch (err) {
    console.error('Database details error:', err);
    res.status(500).json({ 
      error: 'Database connection failed',
      details: err.message,
      config: {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
      }
    });
  }
});

// Routes
app.use('/api/attendance', attendanceRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Employee Attendance Tracker API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      health: '/health',
      testDb: '/api/test-db',
      dbDetails: '/api/db-details',
      attendance: '/api/attendance'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
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

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Database Host: ${process.env.DB_HOST}`);
  console.log(` Database Name: ${process.env.DB_NAME}`);
  console.log(` CORS enabled for: ${allowedOrigins.join(', ')}`);
  console.log(` Health check: http://0.0.0.0:${PORT}/health`);
});