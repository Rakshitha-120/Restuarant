const express = require('express');
const pool = require('../config/db');
const { requireCustomer } = require('../middleware/auth');

const router = express.Router();
const SLOT_SECONDS = 7200;

// Book a table
router.post('/', requireCustomer, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { table_id, reservation_date, reservation_time, guests } = req.body;
    if (!table_id || !reservation_date || !reservation_time || !guests) {
      return res.status(400).json({ error: 'All booking fields are required.' });
    }

    // No past dates
    const requested = new Date(`${reservation_date}T${reservation_time}`);
    if (isNaN(requested) || requested < new Date()) {
      return res.status(400).json({ error: 'Please choose a future date and time.' });
    }

    await conn.beginTransaction();

    // Lock the table row so two people cannot book the same table together
    const [tbl] = await conn.query(
      'SELECT * FROM tables WHERE table_id = ? AND status = "Available" FOR UPDATE',
      [table_id]
    );
    if (!tbl.length) {
      await conn.rollback();
      return res.status(404).json({ error: 'Table not available.' });
    }
    if (tbl[0].seating_capacity < guests) {
      await conn.rollback();
      return res.status(400).json({ error: `This table seats only ${tbl[0].seating_capacity} guests.` });
    }

    const [clash] = await conn.query(
      `SELECT reservation_id FROM reservations
        WHERE table_id = ? AND reservation_date = ?
          AND status IN ('Pending', 'Confirmed')
          AND ABS(TIME_TO_SEC(reservation_time) - TIME_TO_SEC(?)) < ?`,
      [table_id, reservation_date, reservation_time, SLOT_SECONDS]
    );
    if (clash.length) {
      await conn.rollback();
      return res.status(409).json({ error: 'Sorry, this table was just booked. Choose another.' });
    }

    const [result] = await conn.query(
      `INSERT INTO reservations (customers_id, table_id, reservation_date, reservation_time, guests, status)
       VALUES (?, ?, ?, ?, ?, 'Pending')`,
      [req.session.customer.id, table_id, reservation_date, reservation_time, guests]
    );
    await conn.commit();
    res.json({ message: 'Reservation created! Waiting for staff confirmation.', reservation_id: result.insertId });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  } finally {
    conn.release();
  }
});

// My reservations
router.get('/mine', requireCustomer, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.reservation_id, r.reservation_date, r.reservation_time, r.guests, r.status,
              t.table_number, t.location
         FROM reservations r
         JOIN tables t ON t.table_id = r.table_id
        WHERE r.customers_id = ?
        ORDER BY r.reservation_date DESC, r.reservation_time DESC`,
      [req.session.customer.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Cancel my reservation
router.patch('/:id/cancel', requireCustomer, async (req, res) => {
  try {
    const [result] = await pool.query(
      `UPDATE reservations SET status = 'Cancelled'
        WHERE reservation_id = ? AND customers_id = ? AND status IN ('Pending', 'Confirmed')`,
      [req.params.id, req.session.customer.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Cannot cancel this reservation.' });
    res.json({ message: 'Reservation cancelled.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
