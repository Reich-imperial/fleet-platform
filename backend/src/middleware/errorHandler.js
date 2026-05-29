'use strict';

const { AppError } = require('../shared/errors');
const logger = require('../shared/logger');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const isValidationError = err.name === 'ZodError';
  const isConflict = err.code === '23505';
  const isForeignKeyError = err.code === '23503';
  const isAppError = err instanceof AppError;
  const statusCode = isValidationError ? 400 : isConflict ? 409 : isForeignKeyError ? 400 : isAppError ? err.httpStatus : 500;
  const code = isValidationError
    ? 'VALIDATION_ERROR'
    : isConflict
      ? 'CONFLICT'
      : isForeignKeyError
        ? 'INVALID_REFERENCE'
        : isAppError
          ? err.code
          : 'INTERNAL_ERROR';
  const message = isValidationError
    ? 'Validation failed'
    : isConflict
      ? 'Resource already exists'
      : isForeignKeyError
        ? 'Referenced record does not exist'
        : isAppError
          ? err.message
          : 'An unexpected error occurred';

  logger.error('Request failed', {
    code,
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
  });

  res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
};

module.exports = errorHandler;
