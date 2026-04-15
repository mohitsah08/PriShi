import { Router } from 'express';

import {
  getOverview,
  listErrors,
  listLogs,
  listUsage,
  listUsers
} from '../controllers/admin.controller.js';
import { requireAdmin } from '../middlewares/admin.middleware.js';
import { requireVerifiedUser } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(requireVerifiedUser, requireAdmin);
router.get('/overview', asyncHandler(getOverview));
router.get('/users', asyncHandler(listUsers));
router.get('/usage', asyncHandler(listUsage));
router.get('/logs', asyncHandler(listLogs));
router.get('/errors', asyncHandler(listErrors));

export default router;
