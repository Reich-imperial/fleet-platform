'use strict';

const { z } = require('zod');
const authService = require('./auth.service');
const { ValidationError } = require('../../shared/errors');

// ── Validation schemas ─────────────────────────────────────────
const registerSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role:     z.enum(['admin', 'operator', 'driver']),
});

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

// Helper — converts Zod errors into your typed ValidationError
const parseBody = (schema, body) => {
  const result = schema.safeParse(body);
  if (!result.success) {
    const message = result.error.errors[0]?.message || 'Validation failed';
    throw new ValidationError(message);
  }
  return result.data;
};

// ── Controllers ────────────────────────────────────────────────
const register = async (req, res) => {
  const { email, password, role } = parseBody(registerSchema, req.body);
  const user = await authService.register(email, password, role);
  res.status(201).json({ success: true, data: { user } });
};

const login = async (req, res) => {
  const credentials = parseBody(loginSchema, req.body);
  const { user, accessToken, refreshToken } = await authService.login(credentials);

  // Refresh token goes in httpOnly cookie — never exposed to JS
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure:   false,       // set to true when behind HTTPS in production
    sameSite: 'lax',
    maxAge:   7 * 24 * 60 * 60 * 1000,
  });

  res.json({ success: true, data: { accessToken, user } });
};

const refresh = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    const { AuthenticationError } = require('../../shared/errors');
    throw new AuthenticationError('No refresh token provided');
  }
  const { accessToken } = await authService.refreshAccessToken(token);
  res.json({ success: true, data: { accessToken } });
};

const logout = async (req, res) => {
  // Delete refresh token from Redis so it can't be reused
  await authService.logout(req.user.id);

  // Clear the cookie on the client
  res.clearCookie('refreshToken');
  res.json({ success: true });
};

const me = async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  res.json({ success: true, data: { user } });
};

module.exports = { register, login, refresh, logout, me };