import { env } from '../config/env.js';

import { createOpenAiCompatibleService } from './openaiCompatible.service.js';

export const openAiService = createOpenAiCompatibleService({
  provider: 'openai',
  apiKey: env.providers.openai.apiKey,
  defaultModel: env.providers.openai.model
});
