import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const expressValidator = require('express-validator');

export const { body, param, query, validationResult } = expressValidator;
