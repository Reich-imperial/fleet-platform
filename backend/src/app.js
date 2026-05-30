'use strict';

const express    = require('express');
const cors       = require('cors');
const cookieParser = require('cookie-parser');
const config     = require('./config');
const requestLogger = require('./middleware/requestLogger');
const errorHandler  = require('./middleware/errorHandler');
const { NotFoundError } = require('./shared/errors');

const authRoutes        = require('./modules/auth/auth.routes');
const vehicleRoutes     = require('./modules/vehicles/vehicles.routes');
const driverRoutes      = require('./modules/drivers/drivers.routes');
const tripRoutes        = require('./modules/trips/trips.routes');
const fuelRoutes        = require('./modules/fuel/fuel.routes');
const maintenanceRoutes = require('./modules/maintenance/maintenance.routes');
const dashboardRoutes   = require('./modules/dashboard/dashboard.routes');

const app = express();

// Middleware — order matters, do not rearrange
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

// Routes
app.use('/api/v1/auth',        authRoutes);
app.use('/api/v1/vehicles',    vehicleRoutes);
app.use('/api/v1/drivers',     driverRoutes);
app.use('/api/v1/trips',       tripRoutes);
app.use('/api/v1/fuel',        fuelRoutes);
app.use('/api/v1/maintenance', maintenanceRoutes);
app.use('/api/v1/dashboard',   dashboardRoutes);

// 404 for unmatched routes
app.use((_req, _res, next) => next(new NotFoundError('Route')));

// Global error handler — must be last
app.use(errorHandler);

module.exports = app;
