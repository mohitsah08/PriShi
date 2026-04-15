import { body } from '../config/expressValidator.js';

const phoneRegex = /^[0-9]{10,15}$/;

export const signupValidator = [
  body('name').isString().trim().isLength({ min: 2, max: 120 }),
  body('username')
    .optional({ values: 'falsy' })
    .isString()
    .trim()
    .isLength({ min: 3, max: 40 })
    .matches(/^[a-zA-Z0-9._-]+$/),
  body('email').optional({ values: 'falsy' }).isEmail().normalizeEmail(),
  body('phone')
    .optional({ values: 'falsy' })
    .customSanitizer((value) => String(value || '').replace(/\D/g, ''))
    .matches(phoneRegex),
  body('password').isString().isLength({ min: 8, max: 128 }),
  body().custom((value) => {
    if (!value.email && !value.phone) {
      throw new Error('Email or phone is required');
    }

    return true;
  })
];

export const verifyOtpValidator = [
  body('userId').isMongoId(),
  body('otp').isString().trim().isLength({ min: 6, max: 6 })
];

export const resendSignupOtpValidator = [body('userId').isMongoId()];

export const loginValidator = [
  body('identifier').isString().trim().isLength({ min: 3, max: 120 }),
  body('password').isString().isLength({ min: 8, max: 128 })
];

export const passwordResetRequestValidator = [
  body('identifier').isString().trim().isLength({ min: 3, max: 120 })
];

export const passwordResetVerifyValidator = [
  body('identifier').isString().trim().isLength({ min: 3, max: 120 }),
  body('otp').isString().trim().isLength({ min: 6, max: 6 })
];

export const resetPasswordValidator = [
  body('resetToken').isString().trim().isLength({ min: 20 }),
  body('password').isString().isLength({ min: 8, max: 128 })
];

export const changePasswordValidator = [
  body('otp').isString().trim().isLength({ min: 6, max: 6 }),
  body('password').isString().isLength({ min: 8, max: 128 })
];
