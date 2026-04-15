import { body, param } from '../config/expressValidator.js';

const threadIdPattern = /^(?:[a-f\d]{24}|guest-[a-z0-9-]+)$/i;

export const streamMessageValidator = [
  param('threadId').custom((value) => threadIdPattern.test(String(value || ''))),
  body('message').isString().trim().isLength({ min: 1, max: 50000 }),
  body('provider')
    .optional()
    .isIn(['auto', 'openai', 'gemini', 'claude', 'grok', 'deepseek'])
];
