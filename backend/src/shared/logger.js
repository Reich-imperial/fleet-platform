'use strict';

const { createLogger, format, transports } = require('winston');
const config = require('../config');

const logger = createLogger({
  level: config.env === 'production' ? 'info' : 'debug',
  format: format.combine(format.timestamp(), format.errors({ stack: true }), format.json()),
  transports: [new transports.Console()],
});

module.exports = logger;
