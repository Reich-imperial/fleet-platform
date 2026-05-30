'use strict';

const { z } = require('zod');
const service = require('./maintenance.service');
const { sendData } = require('../../shared/response');
const validate = require('../../shared/validate');

const maintenanceSchema = z.object({
  vehicleId:       z.string().uuid(),
  type:            z.enum(['routine', 'repair', 'inspection']),
  description:     z.string().min(1),
  cost:            z.coerce.number().nonnegative(),
  performedBy:     z.string().min(1),
  performedAt:     z.string().min(1),
  nextServiceDate: z.string().optional().nullable(),
});

const list   = async (_req, res) => sendData(res, await service.listMaintenanceLogs());
const create = async (req, res)  => sendData(res, await service.createMaintenanceLog(validate(maintenanceSchema, req.body), req.user.id), 201);

module.exports = { list, create };
