'use strict';

const { Router } = require('express');
const asyncHandler = require('../../shared/asyncHandler');
const { authenticate, requireRole } = require('../../middleware/auth');
const controller = require('./drivers.controller');

const router = Router();

router.get('/health', (_req, res) => res.json({ success: true, module: 'drivers' }));
router.use(authenticate);
router.get('/',      asyncHandler(controller.list));
router.post('/',     requireRole('admin', 'operator'), asyncHandler(controller.create));
router.get('/:id',   asyncHandler(controller.get));
router.patch('/:id', requireRole('admin', 'operator'), asyncHandler(controller.update));
router.delete('/:id',requireRole('admin'),             asyncHandler(controller.remove));

module.exports = router;
