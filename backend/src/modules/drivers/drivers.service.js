'use strict';

const pool = require('../../config/database');
const { NotFoundError, ConflictError } = require('../../shared/errors');
const { hashPassword } = require('../../shared/password');

const mapDriver = (row) => ({
  id: row.id,
  userId: row.user_id,
  name: `${row.first_name} ${row.last_name}`,
  firstName: row.first_name,
  lastName: row.last_name,
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
    `SELECT d.*, u.email
     FROM drivers d
     JOIN users u ON u.id = d.user_id
     WHERE d.id = $1 AND d.deleted_at IS NULL`,
    [id]
  );
  if (!result.rows[0]) throw new NotFoundError('Driver');
  return mapDriver(result.rows[0]);
};

const createDriver = async (data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Auto-generate a login email if not provided
    const email = data.email || `${data.licenseNumber.toLowerCase()}@drivers.fleetops.local`;

    // Check for duplicate license
    const existing = await client.query(
      'SELECT id FROM drivers WHERE license_number = $1',
      [data.licenseNumber]
    );
    if (existing.rows[0]) throw new ConflictError('License number already registered');

    const passwordHash = await hashPassword(data.password || 'ChangeMe123!');

    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, 'driver')
       RETURNING id`,
      [email, passwordHash]
    );

    const driverResult = await client.query(
      `INSERT INTO drivers (user_id, first_name, last_name, license_number, license_expiry, phone, status)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7::driver_status, 'available'))
       RETURNING *`,
      [
        userResult.rows[0].id,
        data.firstName,
        data.lastName,
        data.licenseNumber,
        data.licenseExpiry,
        data.phone || null,
        data.status,
      ]
    );

    await client.query('COMMIT');
    return mapDriver({ ...driverResult.rows[0], email });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const updateDriver = async (id, data) => {
  await getDriver(id); // throws NotFoundError if missing
  const result = await pool.query(
    `UPDATE drivers
     SET
       first_name     = COALESCE($2, first_name),
       last_name      = COALESCE($3, last_name),
       license_number = COALESCE($4, license_number),
       license_expiry = COALESCE($5, license_expiry),
       phone          = COALESCE($6, phone),
       status = COALESCE($7::driver_status, status)
     WHERE id = $1
     RETURNING *`,
    [id, data.firstName, data.lastName, data.licenseNumber, data.licenseExpiry, data.phone, data.status]
  );
  // Re-fetch to get joined email
  return getDriver(result.rows[0].id);
};

const deleteDriver = async (id) => {
  const driver = await getDriver(id);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE drivers SET deleted_at = NOW() WHERE id = $1', [id]);
    await client.query('UPDATE users SET is_active = FALSE WHERE id = $1', [driver.userId]);
    await client.query('COMMIT');
    return { id };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { listDrivers, getDriver, createDriver, updateDriver, deleteDriver };
