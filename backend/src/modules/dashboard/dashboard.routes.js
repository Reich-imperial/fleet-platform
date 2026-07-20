'use strict';

const { Router } = require('express');
const asyncHandler = require('../../shared/asyncHandler');
const { authenticate } = require('../../middleware/auth');
const { getSummary, getMaintenanceAlerts, getNavigationCounts } = require('./dashboard.service');

const router = Router();

router.get('/summary', authenticate, asyncHandler(async (_req, res) => {
  const data = await getSummary();
  res.json({ success: true, data });
}));

router.get('/navigation-counts', authenticate, asyncHandler(async (_req, res) => {
  const data = await getNavigationCounts();
  res.json({ success: true, data });
}));

router.get('/alerts', authenticate, asyncHandler(async (_req, res) => {
  const data = await getMaintenanceAlerts();
  res.json({ success: true, data });
}));

module.exports = router;
