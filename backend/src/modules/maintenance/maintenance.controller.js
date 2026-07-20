'use strict';

const { z } = require('zod');
const service = require('./maintenance.service');
const { sendData } = require('../../shared/response');
const validate = require('../../shared/validate');

const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

const isValidDateTime = (value) => (
  /^\d{4}-\d{2}-\d{2}T/.test(value)
  && isValidDate(value.slice(0, 10))
  && !Number.isNaN(Date.parse(value))
);

const maintenanceSchema = z.object({
  vehicleId:       z.string().uuid(),
  type:            z.enum(['routine', 'repair', 'inspection']),
  description:     z.string().min(1),
  cost:            z.coerce.number().nonnegative(),
  performedBy:     z.string().min(1),
  performedAt:     z.string().refine(isValidDateTime, 'Performed at must be a valid date and time'),
  nextServiceDate: z.string().refine(isValidDate, 'Next service date must be a valid date (YYYY-MM-DD)').optional().nullable(),
});

const list = async (req, res) => {
  const { vehicleId } = validate(z.object({ vehicleId: z.string().uuid().optional() }), req.query);
  sendData(res, await service.listMaintenanceLogs(vehicleId));
};
const create = async (req, res)  => sendData(res, await service.createMaintenanceLog(validate(maintenanceSchema, req.body), req.user.id), 201);

module.exports = { list, create };
