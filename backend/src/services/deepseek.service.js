import { env } from '../config/env.js';

import { createOpenAiCompatibleService } from './openaiCompatible.service.js';

export const deepSeekService = createOpenAiCompatibleService({
  provider: 'deepseek',
  apiKey: env.providers.deepseek.apiKey,
  defaultModel: env.providers.deepseek.model,
  baseURL: 'https://api.deepseek.com/v1'
});
