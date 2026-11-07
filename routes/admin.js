const express = require('express');
const pool = require('../config/db');
const { requireStaff } = require('../middleware/auth');

const router = express.Router();
router.use(requireStaff);

const RESERVATION_STATUSES = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];
const TABLE_STATUSES = ['Available', 'Maintenance'];

// All reservations (optional filters: ?date=YYYY-MM-DD&status=Pending)
router.get('/reservations', async (req, res) => {
  try {
    const { date, status } = req.query;
    let sql = `SELECT r.reservation_id, r.reservation_date, r.reservation_time, r.guests, r.status,
                      c.name AS customer_name, c.phone AS customer_phone,
                      t.table_number, t.location
                 FROM reservations r
                 JOIN customers c ON c.customer_id = r.customers_id
                 JOIN tables t ON t.table_id = r.table_id
                WHERE 1=1`;
    const params = [];
    if (date) { sql += ' AND r.reservation_date = ?'; params.push(date); }
    if (status) { sql += ' AND r.status = ?'; params.push(status); }
    sql += ' ORDER BY r.reservation_date DESC, r.reservation_time DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Change booking status
router.patch('/reservations/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!RESERVATION_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }
    const [result] = await pool.query(
      'UPDATE reservations SET status = ? WHERE reservation_id = ?',
      [status, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Reservation not found.' });
    res.json({ message: `Status changed to ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// All tables
router.get('/tables', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tables ORDER BY table_number');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Add a table
router.post('/tables', async (req, res) => {
  try {
    const { table_number, seating_capacity, location } = req.body;
    if (!table_number || !seating_capacity || !location) {
      return res.status(400).json({ error: 'All table fields are required.' });
    }
    await pool.query(
      'INSERT INTO tables (table_number, seating_capacity, location, status) VALUES (?, ?, ?, "Available")',
      [table_number.trim(), seating_capacity, location.trim()]
    );
    res.json({ message: 'Table added.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Table number already exists.' });
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Change table status (Available / Maintenance)
router.patch('/tables/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!TABLE_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status.' });
    const [result] = await pool.query('UPDATE tables SET status = ? WHERE table_id = ?', [status, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Table not found.' });
    res.json({ message: 'Table status updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
