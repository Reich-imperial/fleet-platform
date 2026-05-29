'use strict';

// Keeps controllers focused on HTTP behavior while Express receives rejected promises.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
