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

// Health check with database test
app.get('/health', async (req, res) => {
  try {
    const db = require('./models/database');
    
    // Test database connection
    const [results] = await db.promise().query('SELECT 1 + 1 AS solution');
    
    res.status(200).json({ 
      status: 'OK', 
      message: 'Backend and Database are running',
      database: {
        connected: true,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

// Detailed database test
app.get('/api/db-details', async (req, res) => {
  try {
    const db = require('./models/database');
    
    // Test connection
    const [testResult] = await db.promise().query('SELECT 1 + 1 AS solution');
    
    // Check if table exists and get count
    const [tableInfo] = await db.promise().query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'Attendance'
    `, [process.env.DB_NAME]);
    
    let recordCount = 0;
    if (tableInfo.length > 0) {
      const [countResult] = await db.promise().query('SELECT COUNT(*) as count FROM Attendance');
      recordCount = countResult[0].count;
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
        testResult: testResult[0].solution
      },
      tables: {
        attendanceExists: tableInfo.length > 0,
        totalRecords: recordCount
      }
    });
  } catch (error) {
    console.error('Database details error:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      details: error.message,
      config: {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME
      }
    });
  }
});

// Routes
app.use('/api/attendance', attendanceRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Database: ${process.env.DB_HOST}`);
  console.log(`Database Name: ${process.env.DB_NAME}`);
});