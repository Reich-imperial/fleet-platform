'use strict';

const Redis = require('ioredis');
const config = require('./index');

const redis = new Redis(config.redis.url, {
  lazyConnect: true,
  retryStrategy: (times) => Math.min(times * 100, 3000),
});

redis.on('error', (err) => {
  // Redis consumers decide whether to fail open or propagate the error.
  console.error('Redis client error', err);
});

module.exports = redis;
