const mysql = require('mysql2');

// Create MySQL connection using environment variables
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'employee_attendance',
  port: process.env.DB_PORT || 3306
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    return;
  }
  console.log('Connected to MySQL database on Railway');
  initializeDatabase();
});

function initializeDatabase() {
  // Create table if it doesn't exist
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
}

module.exports = connection;