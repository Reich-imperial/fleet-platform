'use strict';

const pool = require('../../config/database');
const { NotFoundError, ValidationError } = require('../../shared/errors');

const mapVehicle = (row) => ({
  id: row.id,
  registration: row.registration_number,
  registrationNumber: row.registration_number,
  make: row.make,
  model: row.model,
  year: row.year,
  type: row.type,
  // Handle null capacity gracefully
  capacity: row.capacity_litres
    ? `${Number(row.capacity_litres).toLocaleString()} L`
    : '—',
  capacityLitres: row.capacity_litres ? Number(row.capacity_litres) : null,
  status: row.status,
  lastServiceDate: row.last_service_date,
});

const listVehicles = async () => {
  const result = await pool.query(`
    SELECT *
    FROM vehicles
    WHERE deleted_at IS NULL
    ORDER BY registration_number ASC
  `);
  return result.rows.map(mapVehicle);
};

const getVehicle = async (id) => {
  const result = await pool.query('SELECT * FROM vehicles WHERE id = $1 AND deleted_at IS NULL', [id]);
  if (!result.rows[0]) throw new NotFoundError('Vehicle');
  return mapVehicle(result.rows[0]);
};

const createVehicle = async (data) => {
  const result = await pool.query(
    `
      INSERT INTO vehicles (registration_number, make, model, year, type, capacity_litres, status, last_service_date)
      VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7::vehicle_status, 'available'), $8)
      RETURNING *
    `,
    [
      data.registrationNumber,
      data.make,
      data.model,
      data.year,
      data.type,
      data.capacityLitres,
      data.status,
      data.lastServiceDate || null,
    ]
  );
  return mapVehicle(result.rows[0]);
};

const updateVehicle = async (id, data) => {
  await getVehicle(id);

  if (data.status !== undefined) {
    const activeTrip = await pool.query(
      "SELECT id FROM trips WHERE vehicle_id = $1 AND status = 'in_transit' LIMIT 1",
      [id]
    );
    if (activeTrip.rows[0]) {
      throw new ValidationError('Vehicle status cannot be changed while it has an in-transit trip. Resolve the trip first.');
    }
  }

  const result = await pool.query(
    `
      UPDATE vehicles
      SET
        registration_number = COALESCE($2, registration_number),
        make = COALESCE($3, make),
        model = COALESCE($4, model),
        year = COALESCE($5, year),
        type = COALESCE($6, type),
        capacity_litres = COALESCE($7, capacity_litres),
        status = COALESCE($8::vehicle_status, status),
        last_service_date = COALESCE($9, last_service_date)
      WHERE id = $1
      RETURNING *
    `,
    [
      id,
      data.registrationNumber,
      data.make,
      data.model,
      data.year,
      data.type,
      data.capacityLitres,
      data.status,
      data.lastServiceDate,
    ]
  );
  return mapVehicle(result.rows[0]);
};

const deleteVehicle = async (id) => {
  await getVehicle(id);
  await pool.query('UPDATE vehicles SET deleted_at = NOW() WHERE id = $1', [id]);
  return { id };
};

module.exports = { listVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle };
