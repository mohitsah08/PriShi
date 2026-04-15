import { ApiError } from '../utils/ApiError.js';
import { estimateTokenCount } from '../utils/token.js';

import { buildContextWindow } from './context.service.js';
import { getFallbackChain, PROVIDERS } from './providerCatalog.service.js';
import { getProviderService } from './providerRegistry.service.js';
import { withRetryAndTimeout } from './request.service.js';
import { resolveProviderSelection } from './modelRouter.service.js';

const SYSTEM_PROMPT = [
  'You are PriShi-AI, a careful, production-grade assistant.',
  'Provide direct, accurate answers.',
  'Use Markdown when it helps.',
  'When code is requested, return complete working code.'
].join(' ');

export async function streamUnifiedResponse({
  user,
  thread,
  userMessage,
  requestedProvider,
  attachments,
  onDelta,
  onProviderAttempt,
  signal
}) {
  const selection = resolveProviderSelection({
    requestedProvider,
    message: userMessage.content,
    attachments,
    userPlan: user.plan
  });

  const contextMessages = await buildContextWindow({
    threadId: thread._id,
    provider: selection.provider,
    nextMessage: {
      role: 'user',
      content: userMessage.content,
      attachments
    }
  });

  const chain = getFallbackChain(selection.provider, user.plan);
  let lastError = null;

  for (const provider of chain) {
    const service = getProviderService(provider);
    const fallbackFrom =
      provider === selection.provider ? null : selection.provider;

    onProviderAttempt?.({
      provider,
      model: PROVIDERS[provider].model,
      fallbackFrom
    });

    try {
      const response = await withRetryAndTimeout(
        (requestSignal) =>
          service.streamChat({
            model: PROVIDERS[provider].model,
            systemPrompt: SYSTEM_PROMPT,
            messages: contextMessages,
            signal: requestSignal,
            onDelta
          }),
        { retries: 1, signal }
      );

      return {
        ...response,
        provider,
        fallbackFrom,
        usage: response.usage?.totalTokens
          ? response.usage
          : {
              promptTokens: estimateTokenCount(contextMessages),
              completionTokens: estimateTokenCount(response.content),
              totalTokens:
                estimateTokenCount(contextMessages) +
                estimateTokenCount(response.content),
              estimated: true
            }
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw new ApiError(502, lastError?.message || 'All providers failed');
}
