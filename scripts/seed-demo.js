// Adds sample customers + sample reservations (for demo/testing)
// Run:  npm run seed:demo
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

function futureDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

(async () => {
  try {
    const hash = await bcrypt.hash('password123', 10);
    const customers = [
      ['Ravi Kumar', 'ravi@example.com', '9876543210'],
      ['Sneha Reddy', 'sneha@example.com', '9123456780'],
      ['Arjun Varma', 'arjun@example.com', '9988776655']
    ];
    for (const [name, email, phone] of customers) {
      await pool.query(
        'INSERT IGNORE INTO customers (name, email, phone, password) VALUES (?, ?, ?, ?)',
        [name, email, phone, hash]
      );
    }

    const [c] = await pool.query('SELECT customer_id FROM customers ORDER BY customer_id LIMIT 3');
    const [t] = await pool.query("SELECT table_id FROM tables WHERE status='Available' ORDER BY table_id LIMIT 3");
    if (c.length < 3 || t.length < 3) throw new Error('Run database/schema.sql and seed.sql first.');

    const rows = [
      [c[0].customer_id, t[0].table_id, futureDate(1), '19:00:00', 2, 'Confirmed'],
      [c[1].customer_id, t[1].table_id, futureDate(1), '20:30:00', 2, 'Pending'],
      [c[2].customer_id, t[2].table_id, futureDate(2), '13:00:00', 4, 'Pending']
    ];
    for (const r of rows) {
      await pool.query(
        `INSERT INTO reservations (customers_id, table_id, reservation_date, reservation_time, guests, status)
         VALUES (?, ?, ?, ?, ?, ?)`, r
      );
    }
    console.log('Demo data added. Customer login -> ravi@example.com / password123');
  } catch (e) {
    console.error('Seed failed:', e.message);
  } finally {
    await pool.end();
  }
})();
