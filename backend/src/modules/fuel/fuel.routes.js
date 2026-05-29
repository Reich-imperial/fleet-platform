'use strict';

const { Router } = require('express');
const asyncHandler = require('../../shared/asyncHandler');
const { authenticate, requireRole } = require('../../middleware/auth');
const controller = require('./fuel.controller');

const router = Router();

router.get('/health', (_req, res) => res.json({ success: true, module: 'fuel' }));
router.use(authenticate);
router.get('/', asyncHandler(controller.list));
router.post('/', requireRole('admin', 'operator'), asyncHandler(controller.create));

module.exports = router;
