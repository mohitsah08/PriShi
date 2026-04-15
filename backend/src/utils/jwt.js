import { createRequire } from 'node:module';

import { env } from '../config/env.js';

const require = createRequire(import.meta.url);
const jwt = require('jsonwebtoken');

export function signToken(payload, options = {}) {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: options.expiresIn || env.jwtExpiresIn
  });
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}
