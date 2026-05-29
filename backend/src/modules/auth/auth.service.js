'use strict';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../../config/database');
const redis = require('../../config/redis');
const config = require('../../config');
const {
  AuthenticationError,
  ConflictError,
  ValidationError,
} = require('../../shared/errors');

const VALID_ROLES = ['admin', 'operator', 'driver'];

const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  isActive: user.is_active,
});

const register = async (email, password, role) => {
  if (!VALID_ROLES.includes(role)) {
    throw new ValidationError(`Role must be one of: ${VALID_ROLES.join(', ')}`);
  }

  // Check for existing email
  const existing = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  if (existing.rows[0]) {
    throw new ConflictError('Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await pool.query(
    `INSERT INTO users (email, password_hash, role)
     VALUES ($1, $2, $3)
     RETURNING id, email, role`,
    [email.toLowerCase(), passwordHash, role]
  );

  return result.rows[0];
};

const login = async ({ email, password }) => {
  const result = await pool.query(
    'SELECT id, email, password_hash, role, is_active FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  const user = result.rows[0];

  // Same error message for both cases — never reveal which field is wrong
  if (!user || !user.is_active) {
    throw new AuthenticationError('Invalid credentials');
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    throw new AuthenticationError('Invalid credentials');
  }

  await pool.query(
    'UPDATE users SET last_login = NOW() WHERE id = $1',
    [user.id]
  );

  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.accessExpiresIn }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );

  // Store refresh token in Redis — key per user, 7 day TTL
  await redis.set(`refresh:${user.id}`, refreshToken, 'EX', 604800);

  return { user: sanitizeUser(user), accessToken, refreshToken };
};

const refreshAccessToken = async (refreshToken) => {
  let payload;
  try {
    payload = jwt.verify(refreshToken, config.jwt.refreshSecret);
  } catch {
    throw new AuthenticationError('Invalid or expired refresh token');
  }

  const stored = await redis.get(`refresh:${payload.id}`);
  if (!stored || stored !== refreshToken) {
    throw new AuthenticationError('Session expired');
  }

  const userResult = await pool.query(
    'SELECT id, email, role FROM users WHERE id = $1',
    [payload.id]
  );
  const user = userResult.rows[0];
  if (!user) throw new AuthenticationError('User no longer exists');

  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.accessExpiresIn }
  );

  return { accessToken };
};

const logout = async (userId) => {
  await redis.del(`refresh:${userId}`);
};

const getCurrentUser = async (userId) => {
  const result = await pool.query(
    'SELECT id, email, role, is_active FROM users WHERE id = $1',
    [userId]
  );
  if (!result.rows[0]) throw new AuthenticationError('User session is no longer valid');
  return sanitizeUser(result.rows[0]);
};

module.exports = { register, login, refreshAccessToken, logout, getCurrentUser };