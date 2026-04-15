import { Router } from 'express';

import {
  createThread,
  getThreadMessages,
  listThreads,
  updateThread
} from '../controllers/thread.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createThreadValidator,
  messageQueryValidator,
  updateThreadValidator
} from '../validators/thread.validator.js';

const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(listThreads));
router.post('/', createThreadValidator, validateRequest, asyncHandler(createThread));
router.get('/:threadId/messages', messageQueryValidator, validateRequest, asyncHandler(getThreadMessages));
router.patch('/:threadId', updateThreadValidator, validateRequest, asyncHandler(updateThread));

export default router;
