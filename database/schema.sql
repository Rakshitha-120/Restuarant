-- =====================================================
-- Restaurant Table Reservation Management System
-- Run this file in MySQL Workbench (File > Open SQL Script > Run)
-- =====================================================

DROP DATABASE IF EXISTS restaurant_reservation;
CREATE DATABASE restaurant_reservation;
USE restaurant_reservation;

-- Table 1: customers
CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(100) NOT NULL UNIQUE,
    phone       VARCHAR(15)  NOT NULL,
    password    VARCHAR(255) NOT NULL   -- stored as bcrypt hash
);

-- Table 2: tables  (Status: Available / Maintenance)
CREATE TABLE tables (
    table_id         INT AUTO_INCREMENT PRIMARY KEY,
    table_number     VARCHAR(20) NOT NULL UNIQUE,
    seating_capacity INT         NOT NULL CHECK (seating_capacity > 0),
    location         VARCHAR(50) NOT NULL,
    status           VARCHAR(20) NOT NULL DEFAULT 'Available'
);

-- Table 3: reservations  (Status: Pending / Confirmed / Cancelled / Completed)
CREATE TABLE reservations (
    reservation_id   INT AUTO_INCREMENT PRIMARY KEY,
    customers_id     INT         NOT NULL,
    table_id         INT         NOT NULL,
    reservation_date DATE        NOT NULL,
    reservation_time TIME        NOT NULL,
    guests           INT         NOT NULL CHECK (guests > 0),
    status           VARCHAR(30) NOT NULL DEFAULT 'Pending',
    CONSTRAINT fk_res_customer FOREIGN KEY (customers_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    CONSTRAINT fk_res_table    FOREIGN KEY (table_id)     REFERENCES tables(table_id)       ON DELETE CASCADE
);

-- Faster searching for availability
CREATE INDEX idx_res_date_time ON reservations (reservation_date, reservation_time);
