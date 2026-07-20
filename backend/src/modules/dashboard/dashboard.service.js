'use strict';

const pool = require('../../config/database');
const redis = require('../../config/redis');

const CACHE_KEY = 'dashboard:summary';
const CACHE_TTL = 60; // seconds

// The dashboard, sidebar badge, and Alerts page all use this query so the
// maintenance-due definition remains consistent everywhere it is displayed.
const getMaintenanceAlerts = async () => {
  const result = await pool.query(`
    SELECT v.id, v.registration_number, m.next_service_date
    FROM vehicles v
    JOIN LATERAL (
      SELECT next_service_date
      FROM maintenance_logs
      WHERE vehicle_id = v.id
      ORDER BY performed_at DESC
      LIMIT 1
    ) m ON TRUE
    WHERE m.next_service_date <= NOW() + INTERVAL '7 days'
      AND v.deleted_at IS NULL
    ORDER BY m.next_service_date ASC
  `);
  return result.rows;
};

const getSummary = async () => {
  // Return cached version if available — avoids hitting DB on every page load
  const cached = await redis.get(CACHE_KEY);
  if (cached) return JSON.parse(cached);

  const [fleetResult, tripsResult, fuelResult, maintenanceAlerts] = await Promise.all([
    // Fleet breakdown by status
    pool.query(`
      SELECT status, COUNT(*) AS count
      FROM vehicles
      WHERE deleted_at IS NULL
      GROUP BY status
    `),

    // Active trip count
    pool.query(`
      SELECT COUNT(*) AS count
      FROM trips
      WHERE status IN ('scheduled', 'in_transit')
    `),

    // Fuel this calendar month
    pool.query(`
      SELECT
        COALESCE(SUM(litres_purchased), 0) AS total_litres,
        COALESCE(SUM(total_cost), 0)       AS total_cost
      FROM fuel_logs
      WHERE created_at >= date_trunc('month', NOW())
    `),

    getMaintenanceAlerts(),
  ]);

  // Shape fleet status into a flat object
  const fleetByStatus = { available: 0, in_transit: 0, maintenance: 0, decommissioned: 0 };
  fleetResult.rows.forEach((r) => { fleetByStatus[r.status] = Number(r.count); });
  const totalVehicles = Object.values(fleetByStatus).reduce((a, b) => a + b, 0);

  const summary = {
    fleet: {
      total: totalVehicles,
      ...fleetByStatus,
    },
    activeTrips: Number(tripsResult.rows[0].count),
    fuelThisMonth: {
      litres: Number(fuelResult.rows[0].total_litres),
      cost:   Number(fuelResult.rows[0].total_cost),
    },
    maintenanceAlerts,
  };

  // Cache for 60 seconds
  await redis.set(CACHE_KEY, JSON.stringify(summary), 'EX', CACHE_TTL);
  return summary;
};

const getNavigationCounts = async () => {
  const [tripsResult, maintenanceResult, maintenanceAlerts] = await Promise.all([
    pool.query('SELECT COUNT(*) AS count FROM trips'),
    pool.query('SELECT COUNT(*) AS count FROM maintenance_logs'),
    getMaintenanceAlerts(),
  ]);

  return {
    trips: Number(tripsResult.rows[0].count),
    maintenance: Number(maintenanceResult.rows[0].count),
    alerts: maintenanceAlerts.length,
  };
};

module.exports = { getSummary, getMaintenanceAlerts, getNavigationCounts };
