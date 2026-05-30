'use strict';

const { z } = require('zod');
const service = require('./trips.service');
const { sendData } = require('../../shared/response');
const validate = require('../../shared/validate');

const tripSchema = z.object({
  vehicleId:          z.string().uuid(),
  driverId:           z.string().uuid(),
  origin:             z.string().min(1),
  destination:        z.string().min(1),
  cargoType:          z.enum(['crude_oil', 'refined_fuel', 'lpg', 'chemicals']),
  cargoVolumeLitres:  z.coerce.number().positive(),
  scheduledDeparture: z.string().min(1),
  estimatedArrival:   z.string().optional().nullable(),
  notes:              z.string().optional(),
});

const cancelSchema = z.object({
  reason: z.string().optional(),
});

const list        = async (_req, res) => sendData(res, await service.listTrips());
const get         = async (req, res)  => sendData(res, await service.getTrip(req.params.id));
const create      = async (req, res)  => sendData(res, await service.createTrip(validate(tripSchema, req.body), req.user.id), 201);
const dispatchTrip = async (req, res) => sendData(res, await service.dispatchTrip(req.params.id));
const completeTrip = async (req, res) => sendData(res, await service.completeTrip(req.params.id));
const cancelTrip   = async (req, res) => {
  const { reason } = validate(cancelSchema, req.body);
  sendData(res, await service.cancelTrip(req.params.id, reason));
};

module.exports = { list, get, create, dispatchTrip, completeTrip, cancelTrip };
