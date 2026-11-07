-- =====================================================
-- Sample data (run AFTER schema.sql)
-- Sample customers are added by:  npm run seed:demo
-- (because passwords need bcrypt hashing)
-- =====================================================
USE restaurant_reservation;

INSERT INTO tables (table_number, seating_capacity, location, status) VALUES
('T01', 2, 'Indoor',  'Available'),
('T02', 2, 'Indoor',  'Available'),
('T03', 4, 'Indoor',  'Available'),
('T04', 4, 'Indoor',  'Available'),
('T05', 4, 'Window',  'Available'),
('T06', 6, 'Window',  'Available'),
('T07', 2, 'Outdoor', 'Available'),
('T08', 4, 'Outdoor', 'Available'),
('T09', 6, 'Outdoor', 'Available'),
('T10', 8, 'Private', 'Available'),
('T11', 10,'Private', 'Maintenance');
