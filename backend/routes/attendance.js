const express = require('express');
const router = express.Router();
const db = require('../models/database');

// Add CORS headers specifically for attendance routes
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://employee-attendance-tracker-1-ocde.onrender.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Handle OPTIONS preflight for attendance routes
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://employee-attendance-tracker-1-ocde.onrender.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).send();
});

// POST - Add new attendance record
router.post('/', (req, res) => {
  console.log('Received POST request:', req.body);
  
  const { employeeName, employeeID, date, status } = req.body;
  
  // Input validation
  if (!employeeName || !employeeID || !date || !status) {
    console.log('Validation failed: Missing fields');
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  if (!['Present', 'Absent'].includes(status)) {
    console.log('Validation failed: Invalid status');
    return res.status(400).json({ error: 'Status must be Present or Absent' });
  }

  const sql = `INSERT INTO Attendance (employeeName, employeeID, date, status) 
               VALUES (?, ?, ?, ?)`;
  
  db.query(sql, [employeeName, employeeID, date, status], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to save attendance record' });
    }
    console.log('Record saved with ID:', results.insertId);
    res.status(201).json({ 
      message: 'Attendance recorded successfully', 
      id: results.insertId 
    });
  });
});

// GET - Retrieve all attendance records
router.get('/', (req, res) => {
  console.log('Received GET request for all records');
  const sql = `SELECT * FROM Attendance ORDER BY date DESC, created_at DESC`;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch attendance records' });
    }
    console.log(`Returning ${results.length} records`);
    res.json(results);
  });
});

// DELETE - Remove an attendance record
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  console.log('Received DELETE request for ID:', id);
  
  const sql = `DELETE FROM Attendance WHERE id = ?`;
  
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to delete record' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    console.log('Record deleted, affected rows:', results.affectedRows);
    res.json({ message: 'Record deleted successfully' });
  });
});

// GET - Search attendance records
router.get('/search', (req, res) => {
  const { query } = req.query;
  console.log('Received SEARCH request for:', query);
  
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }
  
  const sql = `SELECT * FROM Attendance 
               WHERE employeeName LIKE ? OR employeeID LIKE ? 
               ORDER BY date DESC`;
  
  db.query(sql, [`%${query}%`, `%${query}%`], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Search failed' });
    }
    console.log(`Search returned ${results.length} records`);
    res.json(results);
  });
});

// GET - Filter by date
router.get('/filter', (req, res) => {
  const { date } = req.query;
  console.log('Received FILTER request for date:', date);
  
  if (!date) {
    return res.status(400).json({ error: 'Date parameter is required' });
  }
  
  const sql = `SELECT * FROM Attendance WHERE date = ? ORDER BY employeeName`;
  
  db.query(sql, [date], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Filter failed' });
    }
    console.log(`Filter returned ${results.length} records`);
    res.json(results);
  });
});

module.exports = router;