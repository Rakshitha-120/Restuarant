const mysql = require('mysql2/promise');
require('dotenv').config();

// Connection pool -> connects Node.js with MySQL (same DB you see in Workbench)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'restaurant_reservation',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true // return DATE/TIME as plain strings (no timezone confusion)
});

module.exports = pool;
