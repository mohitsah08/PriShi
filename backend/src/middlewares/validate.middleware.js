import { validationResult } from '../config/expressValidator.js';

import { ApiError } from '../utils/ApiError.js';

export function validateRequest(req, _res, next) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return next(new ApiError(422, 'Validation failed', result.array()));
  }

  next();
}
