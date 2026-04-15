import { PROVIDERS, getAllowedProvidersForPlan } from './providerCatalog.service.js';

function looksLikeCode(message = '') {
  return /```|function\s+\w+|const\s+\w+|class\s+\w+|<\w+|SELECT\s+.+FROM/i.test(
    message
  );
}

function looksLongContext(message = '', attachments = []) {
  const attachmentTextSize = attachments.reduce(
    (sum, attachment) => sum + (attachment.textContent?.length || 0),
    0
  );

  return message.length + attachmentTextSize > 8000;
}

export function resolveProviderSelection({
  requestedProvider,
  message,
  attachments,
  userPlan
}) {
  const allowedProviders = getAllowedProvidersForPlan(userPlan);

  if (requestedProvider && requestedProvider !== 'auto') {
    return {
      provider: requestedProvider,
      model: PROVIDERS[requestedProvider].model,
      routed: false,
      reason: 'manual'
    };
  }

  let provider = 'gemini';
  let reason = 'fast';

  if (looksLongContext(message, attachments)) {
    provider = 'deepseek';
    reason = 'long_context';
  } else if (looksLikeCode(message)) {
    provider = 'openai';
    reason = 'coding';
  }

  if (!allowedProviders.includes(provider)) {
    provider = 'openai';
    reason = 'plan_fallback';
  }

  return {
    provider,
    model: PROVIDERS[provider].model,
    routed: true,
    reason
  };
}
