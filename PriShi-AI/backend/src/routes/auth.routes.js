import { Router } from 'express';

import { login, me, signup } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rateLimit.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loginValidator, signupValidator } from '../validators/auth.validator.js';

const router = Router();

router.post('/signup', authLimiter, signupValidator, validateRequest, asyncHandler(signup));
router.post('/login', authLimiter, loginValidator, validateRequest, asyncHandler(login));
router.get('/me', requireAuth, asyncHandler(me));

export default router;
