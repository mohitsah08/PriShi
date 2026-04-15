import { body, param, query } from '../config/expressValidator.js';

export const createThreadValidator = [
  body('title').optional().isString().trim().isLength({ min: 1, max: 120 }),
  body('provider')
    .optional()
    .isIn(['auto', 'openai', 'gemini', 'claude', 'grok', 'deepseek'])
];

export const messageQueryValidator = [
  param('threadId').isMongoId(),
  query('page').optional().isInt({ min: 1, max: 100000 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
];

export const updateThreadValidator = [
  param('threadId').isMongoId(),
  body('title').optional().isString().trim().isLength({ min: 1, max: 120 }),
  body('provider')
    .optional()
    .isIn(['auto', 'openai', 'gemini', 'claude', 'grok', 'deepseek']),
  body('archived').optional().isBoolean()
];
