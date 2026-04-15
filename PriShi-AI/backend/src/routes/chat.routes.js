import { Router } from 'express';

import { getStreamStatus, streamMessage } from '../controllers/chat.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { streamLimiter } from '../middlewares/rateLimit.middleware.js';
import { uploadMiddleware } from '../middlewares/upload.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { streamMessageValidator } from '../validators/chat.validator.js';

const router = Router();

router.use(requireAuth);

router.post(
  '/threads/:threadId/messages/stream',
  streamLimiter,
  uploadMiddleware.array('files', 5),
  streamMessageValidator,
  validateRequest,
  streamMessage
);

router.get('/streams/:requestId', getStreamStatus);

export default router;
