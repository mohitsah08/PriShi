import { logger } from '../config/logger.js';

export function errorMiddleware(error, req, res, _next) {
  logger.error(
    {
      requestId: req.requestId,
      error: {
        message: error.message,
        stack: error.stack,
        details: error.details
      }
    },
    'Request failed'
  );

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    details: error.details || null,
    requestId: req.requestId
  });
}
