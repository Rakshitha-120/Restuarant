-- Handy queries to show in viva / test in Workbench
USE restaurant_reservation;

-- 1. All reservations with customer and table details
SELECT r.reservation_id, c.name, t.table_number, r.reservation_date, r.reservation_time, r.guests, r.status
FROM reservations r
JOIN customers c ON c.customer_id = r.customers_id
JOIN tables t    ON t.table_id = r.table_id
ORDER BY r.reservation_date, r.reservation_time;

-- 2. Available tables for a date/time for 4 guests (2-hour slot)
SELECT t.table_number, t.seating_capacity, t.location
FROM tables t
WHERE t.status = 'Available'
  AND t.seating_capacity >= 4
  AND t.table_id NOT IN (
      SELECT table_id FROM reservations
      WHERE reservation_date = '2026-11-20'
        AND status IN ('Pending','Confirmed')
        AND ABS(TIME_TO_SEC(reservation_time) - TIME_TO_SEC('19:00:00')) < 7200
  );

-- 3. Count of reservations by status
SELECT status, COUNT(*) AS total FROM reservations GROUP BY status;

-- 4. Today's confirmed bookings
SELECT * FROM reservations WHERE reservation_date = CURDATE() AND status = 'Confirmed';

-- 5. Confirm a booking
-- UPDATE reservations SET status = 'Confirmed' WHERE reservation_id = 1;
