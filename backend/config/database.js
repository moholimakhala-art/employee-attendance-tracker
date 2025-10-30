const mysql = require('mysql2');

// Create MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Change this if you have different MySQL username
  password: '123456', // Add your MySQL password here
  database: 'employee_attendance' // We'll create this database
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    return;
  }
  console.log('Connected to MySQL database');
  initializeDatabase();
});

function initializeDatabase() {
  // Create database if it doesn't exist
  const createDBSQL = `CREATE DATABASE IF NOT EXISTS employee_attendance`;
  
  connection.query(createDBSQL, (err) => {
    if (err) {
      console.error('Error creating database:', err);
      return;
    }
    
    console.log('Database "employee_attendance" ready');
    
    // Use the database
    connection.changeUser({ database: 'employee_attendance' }, (err) => {
      if (err) {
        console.error('Error switching database:', err);
        return;
      }
      
      // Create table
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS Attendance (
          id INT AUTO_INCREMENT PRIMARY KEY,
          employeeName VARCHAR(255) NOT NULL,
          employeeID VARCHAR(255) NOT NULL,
          date DATE NOT NULL,
          status ENUM('Present', 'Absent') NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      connection.query(createTableSQL, (err) => {
        if (err) {
          console.error('Error creating table:', err);
          return;
        }
        console.log('Attendance table ready');
      });
    });
  });
}

module.exports = connection;