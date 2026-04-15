import { Router } from 'express';

import {
  changePassword,
  guest,
  login,
  logout,
  me,
  requestChangePasswordOtp,
  requestPasswordReset,
  resendSignupOtp,
  resetPassword,
  signup,
  verifyPasswordResetOtp,
  verifySignupOtp
} from '../controllers/auth.controller.js';
import { optionalAuth, requireAuth, requireVerifiedUser } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rateLimit.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  changePasswordValidator,
  loginValidator,
  passwordResetRequestValidator,
  passwordResetVerifyValidator,
  resetPasswordValidator,
  resendSignupOtpValidator,
  signupValidator,
  verifyOtpValidator
} from '../validators/auth.validator.js';

const router = Router();

router.post('/signup', authLimiter, signupValidator, validateRequest, asyncHandler(signup));
router.post(
  '/signup/resend-otp',
  authLimiter,
  resendSignupOtpValidator,
  validateRequest,
  asyncHandler(resendSignupOtp)
);
router.post(
  '/signup/verify-otp',
  authLimiter,
  verifyOtpValidator,
  validateRequest,
  asyncHandler(verifySignupOtp)
);
router.post('/login', authLimiter, loginValidator, validateRequest, asyncHandler(login));
router.post('/guest', authLimiter, asyncHandler(guest));
router.get('/me', requireAuth, asyncHandler(me));
router.post('/logout', optionalAuth, asyncHandler(logout));
router.post(
  '/password-reset/request',
  authLimiter,
  passwordResetRequestValidator,
  validateRequest,
  asyncHandler(requestPasswordReset)
);
router.post(
  '/password-reset/verify',
  authLimiter,
  passwordResetVerifyValidator,
  validateRequest,
  asyncHandler(verifyPasswordResetOtp)
);
router.post(
  '/password-reset/reset',
  authLimiter,
  resetPasswordValidator,
  validateRequest,
  asyncHandler(resetPassword)
);
router.post(
  '/change-password/request-otp',
  requireVerifiedUser,
  authLimiter,
  asyncHandler(requestChangePasswordOtp)
);
router.post(
  '/change-password',
  requireVerifiedUser,
  authLimiter,
  changePasswordValidator,
  validateRequest,
  asyncHandler(changePassword)
);

export default router;
