'use strict';

// Zod validation helper — converts Zod errors into your typed ValidationError
// so controllers never return raw 500s on bad input.
// Usage: const data = validate(mySchema, req.body);
const { ValidationError } = require('./errors');

const validate = (schema, data) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.errors[0]?.message || 'Validation failed';
    throw new ValidationError(message);
  }
  return result.data;
};

module.exports = validate;
