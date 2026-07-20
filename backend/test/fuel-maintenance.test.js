'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const fuelControllerPath = require.resolve('../src/modules/fuel/fuel.controller');
const fuelServicePath = require.resolve('../src/modules/fuel/fuel.service');
const maintenanceControllerPath = require.resolve('../src/modules/maintenance/maintenance.controller');
const maintenanceServicePath = require.resolve('../src/modules/maintenance/maintenance.service');
const databasePath = require.resolve('../src/config/database');

const response = () => ({
  statusCode: null,
  body: null,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

const loadController = (controllerPath, servicePath, service) => {
  delete require.cache[controllerPath];
  const previousService = require.cache[servicePath];
  require.cache[servicePath] = { id: servicePath, filename: servicePath, loaded: true, exports: service };
  const controller = require(controllerPath);
  delete require.cache[controllerPath];
  if (previousService) require.cache[servicePath] = previousService;
  else delete require.cache[servicePath];
  return controller;
};

test('fuel creation validates, computes input data, and returns a 201 response', async () => {
  let received;
  const controller = loadController(fuelControllerPath, fuelServicePath, {
    createFuelLog: async (data, userId) => { received = { data, userId }; return { id: 'fuel-1' }; },
  });
  const res = response();
  await controller.create({
    user: { id: 'user-1' },
    body: { vehicleId: '11111111-1111-4111-8111-111111111111', fuelledAt: '2026-07-20', litresPurchased: '20', costPerLitre: '800', odometerReading: '123', location: 'Lagos' },
  }, res);

  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body, { success: true, data: { id: 'fuel-1' } });
  assert.equal(received.userId, 'user-1');
  assert.equal(received.data.litresPurchased, 20);
});

test('fuel creation rejects a missing odometer reading and invalid fuel date', async () => {
  const controller = loadController(fuelControllerPath, fuelServicePath, { createFuelLog: async () => ({}) });
  const request = { user: { id: 'user-1' }, body: { vehicleId: '11111111-1111-4111-8111-111111111111', fuelledAt: '2026-02-30', litresPurchased: 20, costPerLitre: 800, location: 'Lagos' } };
  await assert.rejects(() => controller.create(request, response()), { code: 'VALIDATION_ERROR' });
});

test('fuel creation rejects a vehicle that does not exist before inserting', async () => {
  const previousDatabase = require.cache[databasePath];
  delete require.cache[fuelServicePath];
  require.cache[databasePath] = { id: databasePath, filename: databasePath, loaded: true, exports: { query: async () => ({ rows: [] }) } };
  const service = require(fuelServicePath);
  await assert.rejects(
    () => service.createFuelLog({ vehicleId: '11111111-1111-4111-8111-111111111111' }, 'user-1'),
    { code: 'NOT_FOUND', message: 'Vehicle not found' }
  );
  delete require.cache[fuelServicePath];
  if (previousDatabase) require.cache[databasePath] = previousDatabase;
  else delete require.cache[databasePath];
});

test('maintenance creation validates data and returns a 201 response', async () => {
  let received;
  const controller = loadController(maintenanceControllerPath, maintenanceServicePath, {
    createMaintenanceLog: async (data, userId) => { received = { data, userId }; return { id: 'maintenance-1' }; },
  });
  const res = response();
  await controller.create({
    user: { id: 'user-1' },
    body: { vehicleId: '11111111-1111-4111-8111-111111111111', type: 'repair', description: 'Brake repair', cost: '1200', performedBy: 'Workshop', performedAt: '2026-07-20T10:30', nextServiceDate: '2026-08-20' },
  }, res);

  assert.equal(res.statusCode, 201);
  assert.equal(received.data.cost, 1200);
  assert.equal(received.userId, 'user-1');
});

test('maintenance creation rejects an invalid maintenance date', async () => {
  const controller = loadController(maintenanceControllerPath, maintenanceServicePath, { createMaintenanceLog: async () => ({}) });
  const request = { user: { id: 'user-1' }, body: { vehicleId: '11111111-1111-4111-8111-111111111111', type: 'routine', description: 'Service', cost: 0, performedBy: 'Workshop', performedAt: '2026-02-30T09:00' } };
  await assert.rejects(() => controller.create(request, response()), { code: 'VALIDATION_ERROR' });
});
