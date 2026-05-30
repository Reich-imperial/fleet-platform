'use strict';

// Base error class — all application errors extend this.
// The global error handler checks instanceof AppError to distinguish
// known errors from unexpected runtime crashes.
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

// AuthenticationError — who are you? (401)
class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHENTICATED');
  }
}

// AuthorizationError — I know who you are, but you can't do this (403)
class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
  }
}

// Keep AuthError as an alias so existing middleware doesn't break
const AuthError = AuthenticationError;

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
  AuthError,
  ConflictError,
};
