import { createRequire } from 'node:module';

import { env } from '../config/env.js';

import { normalizeResponse } from './normalizeResponse.service.js';

const require = createRequire(import.meta.url);
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: env.providers.claude.apiKey
});

function toClaudeContent(message) {
  const content = [];

  if (message.content) {
    content.push({
      type: 'text',
      text: message.content
    });
  }

  for (const attachment of message.attachments || []) {
    if (attachment.textContent) {
      content.push({
        type: 'text',
        text: `Attachment "${attachment.originalName}" extracted text:\n${attachment.textContent}`
      });
    }

    if (attachment.dataUrl?.startsWith('data:image/')) {
      const [meta, data] = attachment.dataUrl.split(',');
      const mediaType = meta.match(/data:(.*);base64/)?.[1] || attachment.mimeType;

      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data
        }
      });
    }
  }

  return content;
}

export const claudeService = {
  provider: 'claude',
  isConfigured() {
    return Boolean(env.providers.claude.apiKey);
  },
  async streamChat({ messages, systemPrompt, model, signal, onDelta }) {
    const stream = client.messages.stream({
      model: model || env.providers.claude.model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map((message) => ({
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: toClaudeContent(message)
      }))
    });

    if (signal) {
      signal.addEventListener('abort', () => stream.controller.abort());
    }

    let content = '';

    stream.on('text', (delta) => {
      content += delta;
      onDelta?.(delta);
    });

    const finalMessage = await stream.finalMessage();

    return normalizeResponse({
      provider: 'claude',
      model: model || env.providers.claude.model,
      content,
      usage: finalMessage?.usage
        ? {
            promptTokens: finalMessage.usage.input_tokens || 0,
            completionTokens: finalMessage.usage.output_tokens || 0,
            totalTokens:
              (finalMessage.usage.input_tokens || 0) +
              (finalMessage.usage.output_tokens || 0)
          }
        : null,
      finishReason: finalMessage?.stop_reason || 'stop',
      raw: null
    });
  }
};
