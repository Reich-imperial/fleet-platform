'use strict';

const pool = require('../../config/database');
const { NotFoundError } = require('../../shared/errors');

const mapTrip = (row) => ({
  id: row.id,
  vehicleId: row.vehicle_id,
  driverId: row.driver_id,
  vehicle: row.registration_number,
  driver: row.driver_name,
  origin: row.origin,
  destination: row.destination,
  route: `${row.origin} -> ${row.destination}`,
  cargoType: row.cargo_type,
  cargoVolumeLitres: Number(row.cargo_volume_litres),
  status: row.status,
  departure: row.scheduled_departure,
  scheduledDeparture: row.scheduled_departure,
  actualDeparture: row.actual_departure,
  estimatedArrival: row.estimated_arrival,
  actualArrival: row.actual_arrival,
  notes: row.notes,
  createdBy: row.created_by,
});

const baseSelect = `
  SELECT
    t.*,
    v.registration_number,
    CONCAT(d.first_name, ' ', d.last_name) AS driver_name
  FROM trips t
  JOIN vehicles v ON v.id = t.vehicle_id
  JOIN drivers d ON d.id = t.driver_id
`;

const listTrips = async () => {
  const result = await pool.query(`${baseSelect} ORDER BY t.scheduled_departure DESC`);
  return result.rows.map(mapTrip);
};

const getTrip = async (id) => {
  const result = await pool.query(`${baseSelect} WHERE t.id = $1`, [id]);
  if (!result.rows[0]) throw new NotFoundError('Trip');
  return mapTrip(result.rows[0]);
};

const createTrip = async (data, userId) => {
  const result = await pool.query(
    `
      INSERT INTO trips (
        vehicle_id, driver_id, origin, destination, cargo_type, cargo_volume_litres,
        status, scheduled_departure, actual_departure, estimated_arrival, actual_arrival,
        notes, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'scheduled'), $8, $9, $10, $11, $12, $13)
      RETURNING id
    `,
    [
      data.vehicleId,
      data.driverId,
      data.origin,
      data.destination,
      data.cargoType,
      data.cargoVolumeLitres,
      data.status,
      data.scheduledDeparture,
      data.actualDeparture || null,
      data.estimatedArrival || null,
      data.actualArrival || null,
      data.notes || null,
      userId,
    ]
  );
  return getTrip(result.rows[0].id);
};

const updateTripStatus = async (id, status) => {
  await getTrip(id);
  await pool.query('UPDATE trips SET status = $2 WHERE id = $1', [id, status]);
  return getTrip(id);
};

module.exports = { listTrips, getTrip, createTrip, updateTripStatus };
