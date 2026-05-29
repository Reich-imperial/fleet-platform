'use strict';

const { z } = require('zod');
const service = require('./trips.service');
const { sendData } = require('../../shared/response');

const tripSchema = z.object({
  vehicleId: z.string().uuid(),
  driverId: z.string().uuid(),
  origin: z.string().min(1),
  destination: z.string().min(1),
  cargoType: z.enum(['crude_oil', 'refined_fuel', 'lpg', 'chemicals']),
  cargoVolumeLitres: z.coerce.number().positive(),
  status: z.enum(['scheduled', 'in_transit', 'delivered', 'cancelled']).optional(),
  scheduledDeparture: z.string().min(1),
  actualDeparture: z.string().optional().nullable(),
  estimatedArrival: z.string().optional().nullable(),
  actualArrival: z.string().optional().nullable(),
  notes: z.string().optional(),
});

const list = async (_req, res) => sendData(res, await service.listTrips());
const get = async (req, res) => sendData(res, await service.getTrip(req.params.id));
const create = async (req, res) => sendData(res, await service.createTrip(tripSchema.parse(req.body), req.user.id), 201);
const dispatchTrip = async (req, res) => sendData(res, await service.updateTripStatus(req.params.id, 'in_transit'));
const completeTrip = async (req, res) => sendData(res, await service.updateTripStatus(req.params.id, 'delivered'));
const cancelTrip = async (req, res) => sendData(res, await service.updateTripStatus(req.params.id, 'cancelled'));

module.exports = { list, get, create, dispatchTrip, completeTrip, cancelTrip };
