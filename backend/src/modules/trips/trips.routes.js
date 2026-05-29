'use strict';

const { Router } = require('express');
const asyncHandler = require('../../shared/asyncHandler');
const { authenticate, requireRole } = require('../../middleware/auth');
const controller = require('./trips.controller');

const router = Router();

router.get('/health', (_req, res) => res.json({ success: true, module: 'trips' }));
router.use(authenticate);
router.get('/', asyncHandler(controller.list));
router.post('/', requireRole('admin', 'operator'), asyncHandler(controller.create));
router.get('/:id', asyncHandler(controller.get));
router.post('/:id/dispatch', requireRole('admin', 'operator'), asyncHandler(controller.dispatchTrip));
router.post('/:id/complete', requireRole('admin', 'operator'), asyncHandler(controller.completeTrip));
router.post('/:id/cancel', requireRole('admin', 'operator'), asyncHandler(controller.cancelTrip));

module.exports = router;
