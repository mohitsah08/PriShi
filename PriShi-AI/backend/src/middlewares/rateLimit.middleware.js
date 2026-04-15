import rateLimit from 'express-rate-limit';

function createLimiter({ windowMs, max, prefix }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests, please slow down'
    }
  });
}

export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  prefix: 'rate:auth:'
});

export const apiLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 120,
  prefix: 'rate:api:'
});

export const streamLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 30,
  prefix: 'rate:stream:'
});
