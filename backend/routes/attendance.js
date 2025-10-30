const express = require('express');
const router = express.Router();
const db = require('../models/database');

// POST - Add new attendance record with detailed error logging
router.post('/', (req, res) => {
  console.log('📥 Received POST request:', req.body);
  
  const { employeeName, employeeID, date, status } = req.body;
  
  // Input validation
  if (!employeeName || !employeeID || !date || !status) {
    console.log('❌ Validation failed: Missing fields');
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  if (!['Present', 'Absent'].includes(status)) {
    console.log('❌ Validation failed: Invalid status');
    return res.status(400).json({ error: 'Status must be Present or Absent' });
  }

  console.log('🗄️ Attempting to save to database...');
  console.log('Database config:', {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME
  });

  const sql = `INSERT INTO Attendance (employeeName, employeeID, date, status) 
               VALUES (?, ?, ?, ?)`;
  
  db.query(sql, [employeeName, employeeID, date, status], (err, results) => {
    if (err) {
      console.error('❌ DATABASE ERROR:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      console.error('SQL:', sql);
      console.error('Parameters:', [employeeName, employeeID, date, status]);
      
      let errorMessage = 'Failed to save attendance record';
      
      // Specific error handling
      if (err.code === 'ECONNREFUSED') {
        errorMessage = 'Database connection refused. Check if database is running.';
      } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
        errorMessage = 'Database access denied. Check username and password.';
      } else if (err.code === 'ER_BAD_DB_ERROR') {
        errorMessage = 'Database does not exist.';
      } else if (err.code === 'ETIMEDOUT') {
        errorMessage = 'Database connection timeout.';
      }
      
      return res.status(500).json({ 
        error: errorMessage,
        details: err.message,
        code: err.code
      });
    }
    
    console.log('✅ Record saved with ID:', results.insertId);
    res.status(201).json({ 
      message: 'Attendance recorded successfully', 
      id: results.insertId 
    });
  });
});

// GET - Retrieve all attendance records
router.get('/', (req, res) => {
  console.log('📥 Received GET request for all records');
  
  const sql = `SELECT * FROM Attendance ORDER BY date DESC, created_at DESC`;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Database error:', err);
      return res.status(500).json({ 
        error: 'Failed to fetch attendance records',
        details: err.message 
      });
    }
    console.log(`✅ Returning ${results.length} records`);
    res.json(results);
  });
});

// ... keep your other routes (DELETE, SEARCH, FILTER) the same ...

module.exports = router;