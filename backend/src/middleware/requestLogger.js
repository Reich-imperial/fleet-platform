'use strict';

const logger = require('../shared/logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    logger.info('HTTP request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTimeMs: Date.now() - start,
      userId: req.user?.id || null,
    });
  });

  next();
};

module.exports = requestLogger;
