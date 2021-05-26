const { Pool } = require('pg')

// sierra db server does not accept ssl, for other db servers ssl: false will be different
const pool = new Pool({
  user: process.env.SIERRA_USER,
  password: process.env.SIERRA_PASS,
  database: 'iii',
  port: 1032,
  host: 'sierra-db.uncw.edu',
  ssl: {
    rejectUnauthorized: false
  },
  max: 3,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 36000,
  application_name: 'carousels',
})

module.exports = {
  query: (text, params, next) => {
    return pool.query(text, params, next)
  }
}
