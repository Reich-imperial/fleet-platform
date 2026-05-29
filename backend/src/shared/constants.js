'use strict';

const VEHICLE_STATUS = Object.freeze({
  AVAILABLE: 'available',
  IN_TRANSIT: 'in_transit',
  MAINTENANCE: 'maintenance',
  DECOMMISSIONED: 'decommissioned',
});

const TRIP_STATUS = Object.freeze({
  SCHEDULED: 'scheduled',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
});

const USER_ROLES = Object.freeze({
  ADMIN: 'admin',
  OPERATOR: 'operator',
  DRIVER: 'driver',
});

const CARGO_TYPE = Object.freeze({
  CRUDE_OIL: 'crude_oil',
  REFINED_FUEL: 'refined_fuel',
  LPG: 'lpg',
  CHEMICALS: 'chemicals',
});

module.exports = {
  VEHICLE_STATUS,
  TRIP_STATUS,
  USER_ROLES,
  CARGO_TYPE,
};
