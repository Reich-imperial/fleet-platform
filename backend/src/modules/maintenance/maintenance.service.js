'use strict';

const pool = require('../../config/database');
const { NotFoundError } = require('../../shared/errors');

const mapMaintenance = (row) => ({
  id: row.id,
  vehicleId: row.vehicle_id,
  vehicle: row.registration_number,
  type: row.type,
  description: row.description,
  cost: Number(row.cost),
  provider: row.performed_by,
  performedBy: row.performed_by,
  performedAt: row.performed_at,
  due: row.next_service_date,
  nextServiceDate: row.next_service_date,
  status: row.vehicle_status,
  loggedBy: row.logged_by,
});

const listMaintenanceLogs = async (vehicleId) => {
  const values = [];
  const filter = vehicleId ? 'WHERE m.vehicle_id = $1' : '';
  if (vehicleId) values.push(vehicleId);
  const result = await pool.query(`
    SELECT m.*, v.registration_number, v.status AS vehicle_status
    FROM maintenance_logs m
    JOIN vehicles v ON v.id = m.vehicle_id
    ${filter}
    ORDER BY m.performed_at DESC
  `, values);
  return result.rows.map(mapMaintenance);
};

const createMaintenanceLog = async (data, userId) => {
  const vehicle = await pool.query(
    'SELECT id FROM vehicles WHERE id = $1 AND deleted_at IS NULL',
    [data.vehicleId]
  );
  if (!vehicle.rows[0]) throw new NotFoundError('Vehicle');

  const result = await pool.query(
    `
      INSERT INTO maintenance_logs (
        vehicle_id, type, description, cost, performed_by, performed_at,
        next_service_date, logged_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `,
    [
      data.vehicleId,
      data.type,
      data.description,
      data.cost,
      data.performedBy,
      data.performedAt,
      data.nextServiceDate || null,
      userId,
    ]
  );
  const rows = await pool.query(
    `
      SELECT m.*, v.registration_number, v.status AS vehicle_status
      FROM maintenance_logs m
      JOIN vehicles v ON v.id = m.vehicle_id
      WHERE m.id = $1
    `,
    [result.rows[0].id]
  );
  return mapMaintenance(rows.rows[0]);
};

module.exports = { listMaintenanceLogs, createMaintenanceLog };
