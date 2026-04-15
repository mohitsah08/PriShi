import { env } from '../config/env.js';

export const PROVIDERS = {
  auto: {
    key: 'auto',
    label: 'Auto Router'
  },
  openai: {
    key: 'openai',
    label: 'OpenAI',
    model: env.providers.openai.model,
    premium: false,
    contextBudget: 24000
  },
  gemini: {
    key: 'gemini',
    label: 'Gemini',
    model: env.providers.gemini.model,
    premium: false,
    contextBudget: 32000
  },
  claude: {
    key: 'claude',
    label: 'Claude',
    model: env.providers.claude.model,
    premium: true,
    contextBudget: 32000
  },
  grok: {
    key: 'grok',
    label: 'Grok',
    model: env.providers.grok.model,
    premium: true,
    contextBudget: 24000
  },
  deepseek: {
    key: 'deepseek',
    label: 'DeepSeek',
    model: env.providers.deepseek.model,
    premium: true,
    contextBudget: 48000
  }
};

export function getAllowedProvidersForPlan(plan) {
  return Object.values(PROVIDERS)
    .filter((provider) => provider.key !== 'auto')
    .filter((provider) => (plan === 'pro' ? true : !provider.premium))
    .map((provider) => provider.key);
}

export function getFallbackChain(provider, plan) {
  const allowedProviders = getAllowedProvidersForPlan(plan);
  const ordered = [
    provider,
    'openai',
    'gemini',
    'deepseek',
    'claude',
    'grok'
  ].filter(Boolean);

  return [...new Set(ordered)].filter((entry) => allowedProviders.includes(entry));
}
