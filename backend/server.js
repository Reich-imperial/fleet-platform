'use strict';

require('dotenv').config();

const app = require('./src/app');
const config = require('./src/config');
const logger = require('./src/shared/logger');

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason });
  process.exit(1);
});

app.listen(config.port, () => {
  logger.info('Server started', { port: config.port, env: config.env });
});
