'use strict';

const pool = require('../src/config/database');
const { hashPassword } = require('../src/shared/password');

const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@fleetops.local';
const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Password123!';

const upsertUser = async (client, { email, password, role }) => {
  const passwordHash = await hashPassword(password);
  const result = await client.query(
    `
      INSERT INTO users (email, password_hash, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (email)
      DO UPDATE SET role = EXCLUDED.role, password_hash = EXCLUDED.password_hash, is_active = TRUE
      RETURNING id, email, role
    `,
    [email, passwordHash, role]
  );
  return result.rows[0];
};

const run = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const admin = await upsertUser(client, {
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });

    const driverUser = await upsertUser(client, {
      email: 'driver@fleetops.local',
      password: 'Password123!',
      role: 'driver',
    });

    const vehicle = await client.query(
      `
        INSERT INTO vehicles (registration_number, make, model, year, type, capacity_litres, status, last_service_date)
        VALUES
          ('TKR-482-LA', 'Volvo', 'FMX Tanker', 2022, 'tanker', 45000, 'available', CURRENT_DATE - INTERVAL '45 days'),
          ('TKR-231-RV', 'MAN', 'TGS Tanker', 2021, 'tanker', 38000, 'in_transit', CURRENT_DATE - INTERVAL '75 days'),
          ('TRL-904-KD', 'Schmitz', 'Fuel Trailer', 2020, 'trailer', 50000, 'maintenance', CURRENT_DATE - INTERVAL '120 days')
        ON CONFLICT (registration_number)
        DO UPDATE SET make = EXCLUDED.make
        RETURNING id, registration_number
      `
    );

    const driver = await client.query(
      `
        INSERT INTO drivers (user_id, first_name, last_name, license_number, license_expiry, phone, status)
        VALUES ($1, 'Kelechi', 'Okafor', 'DRV-88421', CURRENT_DATE + INTERVAL '2 years', '+234 800 111 2901', 'available')
        ON CONFLICT (license_number)
        DO UPDATE SET phone = EXCLUDED.phone
        RETURNING id
      `,
      [driverUser.id]
    );

    const vehicleId = vehicle.rows[0].id;
    const driverId = driver.rows[0].id;

    const trip = await client.query(
      `
        INSERT INTO trips (
          vehicle_id, driver_id, origin, destination, cargo_type, cargo_volume_litres,
          status, scheduled_departure, estimated_arrival, notes, created_by
        )
        SELECT $1, $2, 'Warri Depot', 'Abuja North Terminal', 'crude_oil', 38000,
          'scheduled', NOW() + INTERVAL '4 hours', NOW() + INTERVAL '18 hours',
          'Seed dispatch record', $3
        WHERE NOT EXISTS (SELECT 1 FROM trips WHERE notes = 'Seed dispatch record')
        RETURNING id
      `,
      [vehicleId, driverId, admin.id]
    );

    await client.query(
      `
        INSERT INTO fuel_logs (vehicle_id, trip_id, litres_purchased, cost_per_litre, total_cost, odometer_reading, location, logged_by)
        SELECT $1, $2, 1200, 820, 984000, 184220, 'Apapa depot', $3
        WHERE NOT EXISTS (SELECT 1 FROM fuel_logs WHERE vehicle_id = $1 AND odometer_reading = 184220)
      `,
      [vehicleId, trip.rows[0]?.id || null, admin.id]
    );

    await client.query(
      `
        INSERT INTO maintenance_logs (vehicle_id, type, description, cost, performed_by, performed_at, next_service_date, logged_by)
        SELECT $1, 'inspection', 'Brake and valve inspection', 180000, 'Depot workshop', NOW(), CURRENT_DATE + INTERVAL '30 days', $2
        WHERE NOT EXISTS (SELECT 1 FROM maintenance_logs WHERE vehicle_id = $1 AND description = 'Brake and valve inspection')
      `,
      [vehicleId, admin.id]
    );

    await client.query('COMMIT');
    console.log(`Seed complete. Login with ${adminEmail} / ${adminPassword}`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
