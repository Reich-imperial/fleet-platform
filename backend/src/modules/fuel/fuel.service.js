'use strict';

const pool = require('../../config/database');
const { NotFoundError, ValidationError } = require('../../shared/errors');

const mapFuelLog = (row) => ({
  id: row.id,
  vehicleId: row.vehicle_id,
  vehicle: row.registration_number,
  tripId: row.trip_id,
  fuelledAt: row.fuelled_at,
  litres: Number(row.litres_purchased).toLocaleString(),
  litresPurchased: Number(row.litres_purchased),
  rate: `NGN ${Number(row.cost_per_litre).toLocaleString()}`,
  costPerLitre: Number(row.cost_per_litre),
  total: `NGN ${Number(row.total_cost).toLocaleString()}`,
  totalCost: Number(row.total_cost),
  odometerReading: row.odometer_reading,
  location: row.location,
  loggedBy: row.logged_by,
  createdAt: row.created_at,
});

const listFuelLogs = async (vehicleId) => {
  const values = [];
  const filter = vehicleId ? 'WHERE f.vehicle_id = $1' : '';
  if (vehicleId) values.push(vehicleId);
  const result = await pool.query(`
    SELECT f.*, v.registration_number
    FROM fuel_logs f
    JOIN vehicles v ON v.id = f.vehicle_id
    ${filter}
    ORDER BY f.fuelled_at DESC, f.created_at DESC
  `, values);
  return result.rows.map(mapFuelLog);
};

const createFuelLog = async (data, userId) => {
  const vehicle = await pool.query(
    'SELECT id FROM vehicles WHERE id = $1 AND deleted_at IS NULL',
    [data.vehicleId]
  );
  if (!vehicle.rows[0]) throw new NotFoundError('Vehicle');

  if (data.tripId) {
    const trip = await pool.query('SELECT id, vehicle_id FROM trips WHERE id = $1', [data.tripId]);
    if (!trip.rows[0]) throw new NotFoundError('Trip');
    if (trip.rows[0].vehicle_id !== data.vehicleId) {
      throw new ValidationError('Trip does not belong to the selected vehicle');
    }
  }

  const totalCost = data.litresPurchased * data.costPerLitre;
  const result = await pool.query(
    `
      INSERT INTO fuel_logs (
        vehicle_id, trip_id, litres_purchased, cost_per_litre, total_cost,
        odometer_reading, location, fuelled_at, logged_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `,
    [
      data.vehicleId,
      data.tripId || null,
      data.litresPurchased,
      data.costPerLitre,
      totalCost,
      data.odometerReading,
      data.location,
      data.fuelledAt,
      userId,
    ]
  );
  const rows = await pool.query(
    `
      SELECT f.*, v.registration_number
      FROM fuel_logs f
      JOIN vehicles v ON v.id = f.vehicle_id
      WHERE f.id = $1
    `,
    [result.rows[0].id]
  );
  return mapFuelLog(rows.rows[0]);
};

module.exports = { listFuelLogs, createFuelLog };
