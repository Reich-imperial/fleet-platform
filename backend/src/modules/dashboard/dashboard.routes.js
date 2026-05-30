'use strict';

const { Router } = require('express');
const asyncHandler = require('../../shared/asyncHandler');
const { authenticate } = require('../../middleware/auth');
const { getSummary } = require('./dashboard.service');

const router = Router();

router.get('/summary', authenticate, asyncHandler(async (_req, res) => {
  const data = await getSummary();
  res.json({ success: true, data });
}));

module.exports = router;
