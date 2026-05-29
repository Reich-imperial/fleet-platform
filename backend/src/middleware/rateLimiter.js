'use strict';

const redis = require('../config/redis');
const { AppError } = require('../shared/errors');

const rateLimiter = ({ max = 100, windowSec = 60 } = {}) => async (req, _res, next) => {
  const key = `rl:${req.ip}:${req.path}`;

  try {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSec);
    if (count > max) return next(new AppError('Too many requests', 429, 'RATE_LIMITED'));

    return next();
  } catch (err) {
    // Fails open so Redis availability does not become total API availability.
    return next();
  }
};

module.exports = rateLimiter;
