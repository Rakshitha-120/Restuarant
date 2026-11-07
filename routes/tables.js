const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Each booking blocks a table for 2 hours (7200 seconds)
const SLOT_SECONDS = 7200;

// GET /api/tables/available?date=2026-11-10&time=19:00&guests=4
router.get('/available', async (req, res) => {
  try {
    const { date, time, guests } = req.query;
    if (!date || !time) return res.status(400).json({ error: 'date and time are required.' });

    const guestCount = parseInt(guests, 10) || 1;

    const [rows] = await pool.query(
      `SELECT t.table_id, t.table_number, t.seating_capacity, t.location
         FROM tables t
        WHERE t.status = 'Available'
          AND t.seating_capacity >= ?
          AND t.table_id NOT IN (
                SELECT r.table_id FROM reservations r
                 WHERE r.reservation_date = ?
                   AND r.status IN ('Pending', 'Confirmed')
                   AND ABS(TIME_TO_SEC(r.reservation_time) - TIME_TO_SEC(?)) < ?
          )
        ORDER BY t.seating_capacity, t.table_number`,
      [guestCount, date, time, SLOT_SECONDS]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
