import multer from 'multer';

import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: env.uploadMaxMb * 1024 * 1024,
    files: 5
  },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      callback(null, true);
      return;
    }

    callback(new ApiError(400, `Unsupported file type: ${file.mimetype}`));
  }
});
