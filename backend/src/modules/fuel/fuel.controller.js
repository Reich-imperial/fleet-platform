'use strict';

const { z } = require('zod');
const service = require('./fuel.service');
const { sendData } = require('../../shared/response');
const validate = require('../../shared/validate');

const isIsoDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

const fuelSchema = z.object({
  vehicleId:       z.string().uuid(),
  tripId:          z.string().uuid().optional().nullable(),
  fuelledAt:       z.string().refine(isIsoDate, 'Fuel date must be a valid date (YYYY-MM-DD)'),
  litresPurchased: z.coerce.number().positive(),
  costPerLitre:    z.coerce.number().positive(),
  odometerReading: z.coerce.number().int().nonnegative(),
  location:        z.string().min(1),
});

const list = async (req, res) => {
  const { vehicleId } = validate(z.object({ vehicleId: z.string().uuid().optional() }), req.query);
  sendData(res, await service.listFuelLogs(vehicleId));
};
const create = async (req, res)  => sendData(res, await service.createFuelLog(validate(fuelSchema, req.body), req.user.id), 201);

module.exports = { list, create };
