'use strict';

const { z } = require('zod');
const service = require('./vehicles.service');
const { sendData } = require('../../shared/response');
const validate = require('../../shared/validate');

const vehicleSchema = z.object({
  registrationNumber: z.string().min(1),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().int().min(1970).max(2100),
  type: z.enum(['tanker', 'truck', 'trailer']),
  capacityLitres: z.coerce.number().positive().optional().nullable(),
  status: z.enum(['available', 'in_transit', 'maintenance', 'decommissioned']).optional(),
  lastServiceDate: z.string().optional().nullable(),
});

const list   = async (_req, res) => sendData(res, await service.listVehicles());
const get    = async (req, res)  => sendData(res, await service.getVehicle(req.params.id));
const create = async (req, res)  => sendData(res, await service.createVehicle(validate(vehicleSchema, req.body)), 201);
const update = async (req, res)  => sendData(res, await service.updateVehicle(req.params.id, validate(vehicleSchema.partial(), req.body)));
const remove = async (req, res)  => sendData(res, await service.deleteVehicle(req.params.id));

module.exports = { list, get, create, update, remove };
