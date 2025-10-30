const express = require('express');
const router = express.Router();
const db = require('../models/database');

// POST - Add new attendance record with promises
router.post('/', async (req, res) => {
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

  try {
    console.log('🗄️ Attempting to save to database...');
    
    const sql = `INSERT INTO Attendance (employeeName, employeeID, date, status) 
                 VALUES (?, ?, ?, ?)`;
    
    const [results] = await db.execute(sql, [employeeName, employeeID, date, status]);
    
    console.log('✅ Record saved with ID:', results.insertId);
    res.status(201).json({ 
      message: 'Attendance recorded successfully', 
      id: results.insertId 
    });
    
  } catch (err) {
    console.error('❌ DATABASE ERROR:', err);
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    
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
    
    res.status(500).json({ 
      error: errorMessage,
      details: err.message,
      code: err.code
    });
  }
});

// GET - Retrieve all attendance records with promises
router.get('/', async (req, res) => {
  try {
    console.log('📥 Received GET request for all records');
    
    const [results] = await db.execute('SELECT * FROM Attendance ORDER BY date DESC, created_at DESC');
    
    console.log(`✅ Returning ${results.length} records`);
    res.json(results);
    
  } catch (err) {
    console.error('❌ Database error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch attendance records',
      details: err.message 
    });
  }
});

// DELETE - Remove an attendance record with promises
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📥 Received DELETE request for ID:', id);
    
    const [results] = await db.execute('DELETE FROM Attendance WHERE id = ?', [id]);
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    console.log('✅ Record deleted, affected rows:', results.affectedRows);
    res.json({ message: 'Record deleted successfully' });
    
  } catch (err) {
    console.error('❌ Database error:', err);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

// GET - Search attendance records with promises
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    console.log('📥 Received SEARCH request for:', query);
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const [results] = await db.execute(
      `SELECT * FROM Attendance 
       WHERE employeeName LIKE ? OR employeeID LIKE ? 
       ORDER BY date DESC`,
      [`%${query}%`, `%${query}%`]
    );
    
    console.log(`✅ Search returned ${results.length} records`);
    res.json(results);
    
  } catch (err) {
    console.error('❌ Database error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET - Filter by date with promises
router.get('/filter', async (req, res) => {
  try {
    const { date } = req.query;
    console.log('📥 Received FILTER request for date:', date);
    
    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }
    
    const [results] = await db.execute(
      'SELECT * FROM Attendance WHERE date = ? ORDER BY employeeName',
      [date]
    );
    
    console.log(`✅ Filter returned ${results.length} records`);
    res.json(results);
    
  } catch (err) {
    console.error('❌ Database error:', err);
    res.status(500).json({ error: 'Filter failed' });
  }
});

module.exports = router;