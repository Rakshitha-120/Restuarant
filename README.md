# 🍽️ Restaurant Table Reservation Management System

Customers can view available tables, choose date & time, and book a table.
Restaurant staff can manage reservations (Confirm / Complete / Cancel) and tables.

**Tech stack:** HTML, CSS, JavaScript · Node.js + Express · MySQL (Workbench)

## Project Structure

```
restaurant-reservation-system/
├── config/db.js              # MySQL connection
├── middleware/auth.js        # login checks
├── routes/                   # auth, tables, reservations, admin APIs
├── database/
│   ├── schema.sql            # creates database + 3 tables
│   ├── seed.sql              # sample tables data
│   └── queries.sql           # useful queries
├── scripts/seed-demo.js      # sample customers + reservations
├── public/                   # website pages (html, css, js)
├── server.js
├── package.json
├── .env.example
└── README.md
```

## Database Tables

| Table | Columns |
|---|---|
| customers | customer_id (PK), name, email, phone, password |
| tables | table_id (PK), table_number, seating_capacity, location, status |
| reservations | reservation_id (PK), customers_id (FK), table_id (FK), reservation_date, reservation_time, guests, status |

## Setup (Step by Step)

1. Install **Node.js** (LTS) and **MySQL Server + Workbench**.
2. Open MySQL Workbench → connect → open `database/schema.sql` → click ⚡ Run.
3. Open `database/seed.sql` → Run.
4. Copy `.env.example` to `.env` and set `DB_PASSWORD` (your MySQL password).
5. In terminal inside the project folder:
   ```bash
   npm install
   npm run seed:demo     # optional: sample customers & bookings
   npm start
   ```
6. Open http://localhost:3000

## Logins

- Customer demo (after `seed:demo`): `ravi@example.com` / `password123` — or register a new account.
- Staff: open `/admin.html` → username/password from `.env` (default `admin` / `admin123`).

## Features

- Customer register / login (passwords hashed with bcrypt)
- Search available tables by date, time, guests
- Book table (double-booking prevented; each booking blocks table for 2 hours)
- My Reservations + cancel
- Staff panel: filter reservations, change status, add tables, set table maintenance

## Status values

- Reservation: `Pending`, `Confirmed`, `Cancelled`, `Completed`
- Table: `Available`, `Maintenance`
