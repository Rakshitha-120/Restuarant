require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const pool = require('./config/db');

const app = express();

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 4 } // 4 hours
}));

// Frontend files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tables', require('./routes/tables'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/admin', require('./routes/admin'));

// Unknown API route
app.use('/api', (req, res) => res.status(404).json({ error: 'API route not found' }));

const PORT = process.env.PORT || 3000;

// Test DB connection first, then start server
pool.getConnection()
  .then(conn => {
    conn.release();
    console.log('MySQL connected');
    app.listen(PORT, () => console.log(`Server running -> http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('MySQL connection failed:', err.message);
    console.error('Check your .env file (DB_USER, DB_PASSWORD, DB_NAME) and that MySQL is running.');
    process.exit(1);
  });
