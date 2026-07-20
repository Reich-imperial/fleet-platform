'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const databasePath = require.resolve('../src/config/database');
const vehicleServicePath = require.resolve('../src/modules/vehicles/vehicles.service');
const driverServicePath = require.resolve('../src/modules/drivers/drivers.service');

const vehicleRow = {
  id: 'vehicle-1', registration_number: 'TKR-100-AA', make: 'MAN', model: 'TGS',
  year: 2024, type: 'tanker', capacity_litres: 40000, status: 'available', last_service_date: null,
};

const loadWithDatabase = (servicePath, database) => {
  const previousDatabase = require.cache[databasePath];
  delete require.cache[servicePath];
  require.cache[databasePath] = { id: databasePath, filename: databasePath, loaded: true, exports: database };
  const service = require(servicePath);
  return {
    service,
    restore() {
      delete require.cache[servicePath];
      if (previousDatabase) require.cache[databasePath] = previousDatabase;
      else delete require.cache[databasePath];
    },
  };
};

test('vehicle status edits are blocked while an in-transit trip exists', async () => {
  const calls = [];
  const database = {
    query: async (sql) => {
      calls.push(sql);
      if (sql.includes('FROM vehicles WHERE id')) return { rows: [vehicleRow] };
      if (sql.includes("status = 'in_transit'")) return { rows: [{ id: 'trip-1' }] };
      throw new Error(`Unexpected query: ${sql}`);
    },
  };
  const { service, restore } = loadWithDatabase(vehicleServicePath, database);
  try {
    await assert.rejects(
      () => service.updateVehicle('vehicle-1', { status: 'maintenance' }),
      { code: 'VALIDATION_ERROR', message: 'Vehicle status cannot be changed while it has an in-transit trip. Resolve the trip first.' }
    );
    assert.equal(calls.some((sql) => sql.includes('UPDATE vehicles')), false);
  } finally {
    restore();
  }
});

test('vehicle status edits are persisted when no in-transit trip exists', async () => {
  const database = {
    query: async (sql) => {
      if (sql.includes('FROM vehicles WHERE id')) return { rows: [vehicleRow] };
      if (sql.includes("status = 'in_transit'")) return { rows: [] };
      if (sql.includes('UPDATE vehicles')) return { rows: [{ ...vehicleRow, status: 'maintenance' }] };
      throw new Error(`Unexpected query: ${sql}`);
    },
  };
  const { service, restore } = loadWithDatabase(vehicleServicePath, database);
  try {
    const vehicle = await service.updateVehicle('vehicle-1', { status: 'maintenance' });
    assert.equal(vehicle.status, 'maintenance');
  } finally {
    restore();
  }
});

test('deleting a driver soft-deletes the driver and deactivates its linked user atomically', async () => {
  const statements = [];
  const client = {
    query: async (sql, values) => { statements.push({ sql, values }); return { rows: [] }; },
    release: () => { statements.push({ sql: 'RELEASE' }); },
  };
  const database = {
    query: async (sql) => {
      if (sql.includes('FROM drivers d')) {
        return { rows: [{ id: 'driver-1', user_id: 'user-1', first_name: 'Ada', last_name: 'Okafor', license_number: 'DRV-1', license_expiry: '2030-01-01', phone: null, status: 'available', email: 'ada@example.com' }] };
      }
      throw new Error(`Unexpected query: ${sql}`);
    },
    connect: async () => client,
  };
  const { service, restore } = loadWithDatabase(driverServicePath, database);
  try {
    assert.deepEqual(await service.deleteDriver('driver-1'), { id: 'driver-1' });
    assert.equal(statements[0].sql, 'BEGIN');
    assert.deepEqual(statements[1], { sql: 'UPDATE drivers SET deleted_at = NOW() WHERE id = $1', values: ['driver-1'] });
    assert.deepEqual(statements[2], { sql: 'UPDATE users SET is_active = FALSE WHERE id = $1', values: ['user-1'] });
    assert.equal(statements[3].sql, 'COMMIT');
  } finally {
    restore();
  }
});
