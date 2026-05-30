'use strict';

const pool = require('../../config/database');
const { NotFoundError, ValidationError } = require('../../shared/errors');

const mapTrip = (row) => ({
  id: row.id,
  vehicleId: row.vehicle_id,
  driverId: row.driver_id,
  vehicle: row.registration_number,
  driver: row.driver_name,
  origin: row.origin,
  destination: row.destination,
  route: `${row.origin} → ${row.destination}`,
  cargoType: row.cargo_type,
  cargoVolumeLitres: Number(row.cargo_volume_litres),
  status: row.status,
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
  JOIN drivers d  ON d.id = t.driver_id
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
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Validate vehicle is available before booking it
    const vehicle = await client.query(
      'SELECT id, status FROM vehicles WHERE id = $1 AND deleted_at IS NULL',
      [data.vehicleId]
    );
    if (!vehicle.rows[0]) throw new NotFoundError('Vehicle');
    if (vehicle.rows[0].status !== 'available') {
      throw new ValidationError(`Vehicle is not available (current status: ${vehicle.rows[0].status})`);
    }

    // Validate driver is available
    const driver = await client.query(
      'SELECT id, status FROM drivers WHERE id = $1 AND deleted_at IS NULL',
      [data.driverId]
    );
    if (!driver.rows[0]) throw new NotFoundError('Driver');
    if (driver.rows[0].status !== 'available') {
      throw new ValidationError(`Driver is not available (current status: ${driver.rows[0].status})`);
    }

    const result = await client.query(
      `INSERT INTO trips (
        vehicle_id, driver_id, origin, destination, cargo_type, cargo_volume_litres,
        status, scheduled_departure, estimated_arrival, notes, created_by
       )
       VALUES ($1, $2, $3, $4, $5, $6, 'scheduled', $7, $8, $9, $10)
       RETURNING id`,
      [
        data.vehicleId,
        data.driverId,
        data.origin,
        data.destination,
        data.cargoType,
        data.cargoVolumeLitres,
        data.scheduledDeparture,
        data.estimatedArrival || null,
        data.notes || null,
        userId,
      ]
    );

    // Lock vehicle and driver immediately on trip creation
    await client.query("UPDATE vehicles SET status = 'in_transit' WHERE id = $1", [data.vehicleId]);
    await client.query("UPDATE drivers SET status = 'on_trip' WHERE id = $1",  [data.driverId]);

    await client.query('COMMIT');

    // Fetch full trip with joined fields
    const trip = await pool.query(`${baseSelect} WHERE t.id = $1`, [result.rows[0].id]);
    return mapTrip(trip.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const dispatchTrip = async (id) => {
  const trip = await getTrip(id);
  if (trip.status !== 'scheduled') {
    throw new ValidationError(`Cannot dispatch a trip with status: ${trip.status}`);
  }
  await pool.query(
    "UPDATE trips SET status = 'in_transit', actual_departure = NOW() WHERE id = $1",
    [id]
  );
  return getTrip(id);
};

const completeTrip = async (id) => {
  const trip = await getTrip(id);
  if (trip.status !== 'in_transit') {
    throw new ValidationError(`Cannot complete a trip with status: ${trip.status}`);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      "UPDATE trips SET status = 'delivered', actual_arrival = NOW() WHERE id = $1",
      [id]
    );
    // Release vehicle and driver back to available
    await client.query("UPDATE vehicles SET status = 'available' WHERE id = $1", [trip.vehicleId]);
    await client.query("UPDATE drivers  SET status = 'available' WHERE id = $1", [trip.driverId]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return getTrip(id);
};

const cancelTrip = async (id, reason) => {
  const trip = await getTrip(id);
  if (trip.status === 'delivered') {
    throw new ValidationError('Cannot cancel a delivered trip');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const notes = reason
      ? `${trip.notes ? trip.notes + '\n' : ''}Cancelled: ${reason}`
      : trip.notes;
    await client.query(
      "UPDATE trips SET status = 'cancelled', notes = $2 WHERE id = $1",
      [id, notes]
    );
    // Release vehicle and driver if they were locked
    if (['scheduled', 'in_transit'].includes(trip.status)) {
      await client.query("UPDATE vehicles SET status = 'available' WHERE id = $1", [trip.vehicleId]);
      await client.query("UPDATE drivers  SET status = 'available' WHERE id = $1", [trip.driverId]);
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return getTrip(id);
};

module.exports = { listTrips, getTrip, createTrip, dispatchTrip, completeTrip, cancelTrip };
