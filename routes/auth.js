const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const router = express.Router();

// Customer register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    if (!/^[0-9+\-\s]{7,15}$/.test(phone)) {
      return res.status(400).json({ error: 'Enter a valid phone number.' });
    }

    const [exists] = await pool.query('SELECT customer_id FROM customers WHERE email = ?', [email]);
    if (exists.length) return res.status(409).json({ error: 'Email already registered.' });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO customers (name, email, phone, password) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), phone.trim(), hash]
    );
    req.session.customer = { id: result.insertId, name: name.trim(), email: email.trim().toLowerCase() };
    res.json({ message: 'Registered successfully', customer: req.session.customer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Customer login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

    const [rows] = await pool.query('SELECT * FROM customers WHERE email = ?', [email.trim().toLowerCase()]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid email or password.' });

    const ok = await bcrypt.compare(password, rows[0].password);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password.' });

    req.session.customer = { id: rows[0].customer_id, name: rows[0].name, email: rows[0].email };
    res.json({ message: 'Login successful', customer: req.session.customer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Staff login (username/password from .env)
router.post('/staff-login', (req, res) => {
  const { username, password } = req.body;
  if (username === (process.env.STAFF_USERNAME || 'admin') &&
      password === (process.env.STAFF_PASSWORD || 'admin123')) {
    req.session.isStaff = true;
    return res.json({ message: 'Staff login successful' });
  }
  res.status(401).json({ error: 'Invalid staff credentials.' });
});

// Who is logged in?
router.get('/me', (req, res) => {
  res.json({
    customer: req.session.customer || null,
    isStaff: !!req.session.isStaff
  });
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ message: 'Logged out' }));
});

module.exports = router;
