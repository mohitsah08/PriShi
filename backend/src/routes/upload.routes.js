import { Router } from 'express';

import { uploadFiles } from '../controllers/upload.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { uploadMiddleware } from '../middlewares/upload.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(requireAuth);
router.post('/', uploadMiddleware.array('files', 5), asyncHandler(uploadFiles));

export default router;
