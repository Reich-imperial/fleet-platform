'use strict';

const pool = require('../../config/database');
const { NotFoundError } = require('../../shared/errors');
const { hashPassword } = require('../../shared/password');

const mapDriver = (row) => ({
  id: row.id,
  userId: row.user_id,
  name: `${row.first_name} ${row.last_name}`,
  firstName: row.first_name,
  lastName: row.last_name,
  license: row.license_number,
  licenseNumber: row.license_number,
  licenseExpiry: row.license_expiry,
  phone: row.phone,
  status: row.status,
  email: row.email,
});

const listDrivers = async () => {
  const result = await pool.query(`
    SELECT d.*, u.email
    FROM drivers d
    JOIN users u ON u.id = d.user_id
    WHERE d.deleted_at IS NULL
    ORDER BY d.first_name ASC, d.last_name ASC
  `);
  return result.rows.map(mapDriver);
};

const getDriver = async (id) => {
  const result = await pool.query(
    `
      SELECT d.*, u.email
      FROM drivers d
      JOIN users u ON u.id = d.user_id
      WHERE d.id = $1 AND d.deleted_at IS NULL
    `,
    [id]
  );
  if (!result.rows[0]) throw new NotFoundError('Driver');
  return mapDriver(result.rows[0]);
};

const createDriver = async (data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const email = data.email || `${data.licenseNumber.toLowerCase()}@drivers.fleetops.local`;
    const user = await client.query(
      `
        INSERT INTO users (email, password_hash, role)
        VALUES ($1, $2, 'driver')
        RETURNING id
      `,
      [email, hashPassword(data.password || 'Password123!')]
    );
    const driver = await client.query(
      `
        INSERT INTO drivers (user_id, first_name, last_name, license_number, license_expiry, phone, status)
        VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'available'))
        RETURNING *
      `,
      [
        user.rows[0].id,
        data.firstName,
        data.lastName,
        data.licenseNumber,
        data.licenseExpiry,
        data.phone || null,
        data.status,
      ]
    );
    await client.query('COMMIT');
    return mapDriver({ ...driver.rows[0], email });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const updateDriver = async (id, data) => {
  await getDriver(id);
  const result = await pool.query(
    `
      UPDATE drivers
      SET
        first_name = COALESCE($2, first_name),
        last_name = COALESCE($3, last_name),
        license_number = COALESCE($4, license_number),
        license_expiry = COALESCE($5, license_expiry),
        phone = COALESCE($6, phone),
        status = COALESCE($7, status)
      WHERE id = $1
      RETURNING *
    `,
    [id, data.firstName, data.lastName, data.licenseNumber, data.licenseExpiry, data.phone, data.status]
  );
  return mapDriver(result.rows[0]);
};

module.exports = { listDrivers, getDriver, createDriver, updateDriver };
