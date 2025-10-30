require('dotenv').config(); // Add this at the top
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const attendanceRoutes = require('./routes/attendance');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Test route to check database connection
app.get('/api/test-db', (req, res) => {
  const db = require('./models/database');
  
  db.query('SELECT 1 + 1 AS solution', (err, results) => {
    if (err) {
      console.error('Database test failed:', err);
      return res.status(500).json({ error: 'Database connection failed', details: err.message });
    }
    res.json({ 
      message: 'Database connection successful!',
      solution: results[0].solution,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST
    });
  });
});

// Routes
app.use('/api/attendance', attendanceRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Database Host:', process.env.DB_HOST);
  console.log('Database Name:', process.env.DB_NAME);
});