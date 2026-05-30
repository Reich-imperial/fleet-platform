'use strict';

const { z } = require('zod');
const service = require('./fuel.service');
const { sendData } = require('../../shared/response');
const validate = require('../../shared/validate');

const fuelSchema = z.object({
  vehicleId:       z.string().uuid(),
  tripId:          z.string().uuid().optional().nullable(),
  litresPurchased: z.coerce.number().positive(),
  costPerLitre:    z.coerce.number().positive(),
  odometerReading: z.coerce.number().int().nonnegative().optional().nullable(),
  location:        z.string().min(1),
});

const list   = async (_req, res) => sendData(res, await service.listFuelLogs());
const create = async (req, res)  => sendData(res, await service.createFuelLog(validate(fuelSchema, req.body), req.user.id), 201);

module.exports = { list, create };
