'use strict';

const { Pool } = require('pg');
const config = require('./index');

const pool = new Pool({
  connectionString: config.db.url,
  max: config.db.poolMax,
});

pool.on('error', (err) => {
  // Surface pool-level failures early; request-level query handling comes later.
  console.error('Unexpected PostgreSQL client error', err);
});

module.exports = pool;
