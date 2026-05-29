'use strict';

const pool = require('../../config/database');

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

const listMaintenanceLogs = async () => {
  const result = await pool.query(`
    SELECT m.*, v.registration_number, v.status AS vehicle_status
    FROM maintenance_logs m
    JOIN vehicles v ON v.id = m.vehicle_id
    ORDER BY m.performed_at DESC
  `);
  return result.rows.map(mapMaintenance);
};

const createMaintenanceLog = async (data, userId) => {
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
