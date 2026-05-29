'use strict';

const { z } = require('zod');
const service = require('./fuel.service');
const { sendData } = require('../../shared/response');

const fuelSchema = z.object({
  vehicleId: z.string().uuid(),
  tripId: z.string().uuid().optional().or(z.literal('')),
  litresPurchased: z.coerce.number().positive(),
  costPerLitre: z.coerce.number().positive(),
  totalCost: z.coerce.number().positive().optional(),
  odometerReading: z.coerce.number().int().nonnegative(),
  location: z.string().min(1),
});

const list = async (_req, res) => sendData(res, await service.listFuelLogs());
const create = async (req, res) => sendData(res, await service.createFuelLog(fuelSchema.parse(req.body), req.user.id), 201);

module.exports = { list, create };
