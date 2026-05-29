'use strict';

const pool = require('../../config/database');

const mapFuelLog = (row) => ({
  id: row.id,
  vehicleId: row.vehicle_id,
  vehicle: row.registration_number,
  tripId: row.trip_id,
  litres: Number(row.litres_purchased).toLocaleString(),
  litresPurchased: Number(row.litres_purchased),
  rate: `NGN ${Number(row.cost_per_litre).toLocaleString()}`,
  costPerLitre: Number(row.cost_per_litre),
  total: `NGN ${Number(row.total_cost).toLocaleString()}`,
  totalCost: Number(row.total_cost),
  odometerReading: row.odometer_reading,
  location: row.location,
  loggedBy: row.logged_by,
});

const listFuelLogs = async () => {
  const result = await pool.query(`
    SELECT f.*, v.registration_number
    FROM fuel_logs f
    JOIN vehicles v ON v.id = f.vehicle_id
    ORDER BY f.created_at DESC
  `);
  return result.rows.map(mapFuelLog);
};

const createFuelLog = async (data, userId) => {
  const totalCost = data.totalCost || data.litresPurchased * data.costPerLitre;
  const result = await pool.query(
    `
      INSERT INTO fuel_logs (
        vehicle_id, trip_id, litres_purchased, cost_per_litre, total_cost,
        odometer_reading, location, logged_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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
