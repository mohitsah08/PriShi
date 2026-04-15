import { ApiError } from '../utils/ApiError.js';

import { claudeService } from './claude.service.js';
import { deepSeekService } from './deepseek.service.js';
import { geminiService } from './gemini.service.js';
import { grokService } from './grok.service.js';
import { openAiService } from './openai.service.js';

const services = {
  openai: openAiService,
  gemini: geminiService,
  claude: claudeService,
  grok: grokService,
  deepseek: deepSeekService
};

export function getProviderService(provider) {
  const service = services[provider];

  if (!service) {
    throw new ApiError(400, `Unsupported provider: ${provider}`);
  }

  if (!service.isConfigured()) {
    throw new ApiError(503, `${provider} API key is not configured`);
  }

  return service;
}
