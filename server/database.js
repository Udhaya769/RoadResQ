const Database = require('better-sqlite3')

const dbPath =
  process.env.DB_PATH || 'roadresq.db'

const db = new Database(dbPath)

db.pragma('foreign_keys = ON')

module.exports = db
