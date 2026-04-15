import { Message } from '../models/Message.js';
import { estimateTokenCount } from '../utils/token.js';

import { PROVIDERS } from './providerCatalog.service.js';

export async function buildContextWindow({ threadId, provider, nextMessage }) {
  const tokenBudget = PROVIDERS[provider]?.contextBudget || 24000;
  const messages = await Message.find({ threadId })
    .sort({ createdAt: -1 })
    .limit(60)
    .lean();

  const selected = [];
  let runningTokens = estimateTokenCount(nextMessage.content);

  for (const message of messages) {
    const estimated = message.tokenCount || estimateTokenCount(message.content);

    if (runningTokens + estimated > tokenBudget) {
      break;
    }

    selected.unshift(message);
    runningTokens += estimated;
  }

  return [...selected, nextMessage];
}
