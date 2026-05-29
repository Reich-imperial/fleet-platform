'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config');
const { AuthError } = require('../shared/errors');

const authenticate = (req, _res, next) => {
  const authHeader = req.get('authorization');
  const [scheme, token] = authHeader ? authHeader.split(' ') : [];

  if (scheme !== 'Bearer' || !token) {
    return next(new AuthError('Missing bearer token'));
  }

  try {
    // Verifies transport credentials only; login flows belong in later auth work.
    req.user = jwt.verify(token, config.jwt.secret);
    return next();
  } catch (err) {
    return next(new AuthError('Invalid or expired token'));
  }
};

const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user) return next(new AuthError());
  if (!roles.includes(req.user.role)) return next(new AuthError('Insufficient permissions'));
  return next();
};

module.exports = { authenticate, requireRole };
