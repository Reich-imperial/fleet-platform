'use strict';

const { Router } = require('express');
const asyncHandler = require('../../shared/asyncHandler');
const { authenticate } = require('../../middleware/auth');
const rateLimiter = require('../../middleware/rateLimiter');
const controller = require('./auth.controller');

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, module: 'auth' });
});

router.post('/register', asyncHandler(controller.register));
router.post('/login', rateLimiter({ max: 10, windowSec: 60 }), asyncHandler(controller.login));
router.post('/refresh', asyncHandler(controller.refresh));
router.post('/logout', authenticate, asyncHandler(controller.logout));
router.get('/me', authenticate, asyncHandler(controller.me));

module.exports = router;