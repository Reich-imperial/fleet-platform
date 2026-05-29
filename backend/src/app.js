'use strict';

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const config = require('./config');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const { NotFoundError } = require('./shared/errors');

const authRoutes = require('./modules/auth/auth.routes');
const vehicleRoutes = require('./modules/vehicles/vehicles.routes');
const driverRoutes = require('./modules/drivers/drivers.routes');
const tripRoutes = require('./modules/trips/trips.routes');
const fuelRoutes = require('./modules/fuel/fuel.routes');
const maintenanceRoutes = require('./modules/maintenance/maintenance.routes');


const app = express();

app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json());
app.use(requestLogger);
app.use(cookieParser());
app.use(requestLogger);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vehicles', vehicleRoutes);
app.use('/api/v1/drivers', driverRoutes);
app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/fuel', fuelRoutes);
app.use('/api/v1/maintenance', maintenanceRoutes);

// Converts unmatched routes into the same response shape as application errors.
app.use((_req, _res, next) => next(new NotFoundError('Route')));

app.use(errorHandler);

module.exports = app;
