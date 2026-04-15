import { env } from '../config/env.js';

import { createOpenAiCompatibleService } from './openaiCompatible.service.js';

export const grokService = createOpenAiCompatibleService({
  provider: 'grok',
  apiKey: env.providers.grok.apiKey,
  defaultModel: env.providers.grok.model,
  baseURL: 'https://api.x.ai/v1'
});
