import { ApiError } from '../utils/ApiError.js';
import { estimateTokenCount } from '../utils/token.js';
import { classifyTask } from '../router/taskRouter.js';

import { buildContextWindow } from './context.service.js';
import { getFallbackChain, PROVIDERS } from './providerCatalog.service.js';
import { providerRegistry } from './providerRegistry.service.js';
import { withRetryAndTimeout } from './request.service.js';

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
  console.log('[aiOrchestrator.streamUnifiedResponse] started');
  const input = userMessage.content;
  console.log('[aiOrchestrator.streamUnifiedResponse] input:', input);
  const taskType = classifyTask(input);
  console.log('[aiOrchestrator.streamUnifiedResponse] taskType:', taskType);
  const selectedProvider =
    requestedProvider && requestedProvider !== 'auto'
      ? requestedProvider
      : providerRegistry.getBestProvider(taskType);
  console.log(
    '[aiOrchestrator.streamUnifiedResponse] provider after selection:',
    selectedProvider
  );

  const contextMessages = await buildContextWindow({
    threadId: thread._id,
    provider: selectedProvider,
    historyMessages: thread.historyMessages || null,
    nextMessage: {
      role: 'user',
      content: userMessage.content,
      attachments
    }
  });

  const chain = getFallbackChain(selectedProvider, user.plan);
  let lastError = null;

  for (const provider of chain) {
    console.log(
      '[aiOrchestrator.streamUnifiedResponse] provider before calling API:',
      provider
    );
    const service = providerRegistry.getProviderService(provider);
    const fallbackFrom =
      provider === selectedProvider ? null : selectedProvider;

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
