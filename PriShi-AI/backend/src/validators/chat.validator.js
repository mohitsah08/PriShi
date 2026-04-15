import { body, param } from '../config/expressValidator.js';

export const streamMessageValidator = [
  param('threadId').isMongoId(),
  body('message').isString().trim().isLength({ min: 1, max: 50000 }),
  body('provider')
    .optional()
    .isIn(['auto', 'openai', 'gemini', 'claude', 'grok', 'deepseek'])
];
