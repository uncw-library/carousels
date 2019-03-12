const pg = require('pg');

/* create a connection pool to our Sierra database
 The .query method will connect and release connections to the pool
 so that we don't have to keep constant open connections */
const client = new pg.Pool({
  user: process.env.SIERRA_USER,
  password: process.env.SIERRA_PASS,
  database: 'iii',
  port: 1032,
  host: 'sierra-db.uncw.edu',
  ssl: true,
  max: 2,
});

module.exports = client;
