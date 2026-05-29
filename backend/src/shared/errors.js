'use strict';

class AppError extends Error {
  constructor(message = 'An error occurred', httpStatus = 500, code = 'APP_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.httpStatus = httpStatus;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class AuthError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTH_ERROR');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  AuthError,
  ConflictError,
};
