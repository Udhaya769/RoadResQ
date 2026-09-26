
const express = require('express')
const cors = require('cors')
const db = require('./database')

const app = express()

// Middleware
app.use(
  cors({
  origin:
    process.env.FRONTEND_URL ||
    'http://localhost:5173'
})
)

app.use(express.json())

// Create database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('customer', 'mechanic')),
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    vehicle_number TEXT NOT NULL,
    vehicle_type TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS breakdown_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    vehicle_id INTEGER NOT NULL,

    problem_type TEXT NOT NULL,
    problem_description TEXT,

    location TEXT NOT NULL,
    contact_number TEXT NOT NULL,

    priority TEXT NOT NULL
      CHECK(priority IN ('normal', 'urgent', 'emergency')),

    priority_charge REAL NOT NULL DEFAULT 0,

    status TEXT NOT NULL DEFAULT 'requested'
      CHECK(status IN (
        'requested',
        'assigned',
        'on_the_way',
        'arrived',
        'inspection',
        'repair',
        'completed',
        'cancelled'
      )),

    assigned_mechanic_id INTEGER,
    arrival_target_minutes INTEGER,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (assigned_mechanic_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS service_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL,

    item_type TEXT NOT NULL
      CHECK(item_type IN ('part', 'labour', 'assistance')),

    description TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 0,

    FOREIGN KEY (request_id) REFERENCES breakdown_requests(id)
      ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER UNIQUE NOT NULL,

    priority_charge REAL NOT NULL DEFAULT 0,
    parts_total REAL NOT NULL DEFAULT 0,
    labour_total REAL NOT NULL DEFAULT 0,
    assistance_total REAL NOT NULL DEFAULT 0,

    total_amount REAL NOT NULL DEFAULT 0,

    status TEXT NOT NULL DEFAULT 'generated'
      CHECK(status IN ('generated', 'paid')),

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (request_id) REFERENCES breakdown_requests(id)
      ON DELETE CASCADE
  );
`)

// Add diagnosis column to existing databases
const columns = db
  .prepare(`PRAGMA table_info(breakdown_requests)`)
  .all()

const hasDiagnosis = columns.some(
  column => column.name === 'diagnosis'
)

if (!hasDiagnosis) {
  db.prepare(`
    ALTER TABLE breakdown_requests
    ADD COLUMN diagnosis TEXT
  `).run()

  console.log('Diagnosis column added')
}

// Routes
const authRoutes = require('./routes/auth')
const vehicleRoutes = require('./routes/vehicles')
const requestRoutes = require('./routes/requests')
const mechanicRoutes = require('./routes/mechanics')

app.use('/api/auth', authRoutes)
app.use('/api/vehicles', vehicleRoutes)
app.use('/api/requests', requestRoutes)
app.use('/api/mechanics', mechanicRoutes)

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    message: 'RoadResQ server is running 🚗'
  })
})

// Start server
const PORT = process.env.PORT || 5000

app.listen(PORT, '0.0.0.0', () => {
  console.log(
    `RoadResQ server running on port ${PORT}`
  )
})

