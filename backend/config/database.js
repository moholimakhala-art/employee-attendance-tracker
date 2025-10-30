const mysql = require('mysql2');

console.log('🔧 Database Configuration:');
console.log('Host:', process.env.DB_HOST);
console.log('User:', process.env.DB_USER);
console.log('Database:', process.env.DB_NAME);
console.log('Port:', process.env.DB_PORT);

// Create a connection pool instead of single connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'railway',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// Test the connection on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error connecting to MySQL:', err.message);
    console.error('Error code:', err.code);
    return;
  }
  
  console.log('✅ Connected to MySQL database on Railway');
  
  // Initialize database tables
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
    connection.release(); // Always release connection back to pool
    
    if (err) {
      console.error('❌ Error creating table:', err);
      return;
    }
    console.log('✅ Attendance table ready');
  });
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('❌ MySQL Pool Error:', err);
});

// Handle acquisition timeout
pool.on('acquire', (connection) => {
  console.log('🔗 Connection %d acquired', connection.threadId);
});

// Handle connection release
pool.on('release', (connection) => {
  console.log('🔗 Connection %d released', connection.threadId);
});

// Export the pool instead of single connection
module.exports = pool.promise(); // Use promise-based API for better async handling