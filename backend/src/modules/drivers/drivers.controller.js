'use strict';

const { z } = require('zod');
const service = require('./drivers.service');
const { sendData } = require('../../shared/response');
const validate = require('../../shared/validate');

const driverSchema = z.object({
  firstName:     z.string().min(1),
  lastName:      z.string().min(1),
  licenseNumber: z.string().min(1),
  licenseExpiry: z.string().min(1),
  phone:         z.string().optional().nullable(),
  status:        z.enum(['available', 'on_trip', 'inactive']).optional(),
  email:         z.string().email().optional(),
  password:      z.string().min(8).optional(),
});

const list   = async (_req, res) => sendData(res, await service.listDrivers());
const get    = async (req, res)  => sendData(res, await service.getDriver(req.params.id));
const create = async (req, res)  => sendData(res, await service.createDriver(validate(driverSchema, req.body)), 201);
const update = async (req, res)  => sendData(res, await service.updateDriver(req.params.id, validate(driverSchema.partial(), req.body)));
const remove = async (req, res)  => sendData(res, await service.deleteDriver(req.params.id));

module.exports = { list, get, create, update, remove };
