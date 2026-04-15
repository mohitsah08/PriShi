import { createRequire } from 'node:module';

import { normalizeResponse } from './normalizeResponse.service.js';

const require = createRequire(import.meta.url);
const OpenAI = require('openai');

function buildMessageContent(message) {
  const parts = [];

  if (message.content) {
    parts.push({ type: 'text', text: message.content });
  }

  for (const attachment of message.attachments || []) {
    if (attachment.textContent) {
      parts.push({
        type: 'text',
        text: `Attachment "${attachment.originalName}" extracted text:\n${attachment.textContent}`
      });
    }

    if (attachment.dataUrl?.startsWith('data:image/')) {
      parts.push({
        type: 'image_url',
        image_url: {
          url: attachment.dataUrl
        }
      });
    }
  }

  return parts.length === 1 && parts[0].type === 'text' ? parts[0].text : parts;
}

export function createOpenAiCompatibleService({
  provider,
  apiKey,
  defaultModel,
  baseURL
}) {
  const client = new OpenAI({
    apiKey,
    baseURL
  });

  return {
    provider,
    isConfigured() {
      return Boolean(apiKey);
    },
    async streamChat({ messages, systemPrompt, model, signal, onDelta }) {
      const response = await client.chat.completions.create(
        {
          model: model || defaultModel,
          messages: [
            ...(systemPrompt
              ? [{ role: 'system', content: systemPrompt }]
              : []),
            ...messages.map((message) => ({
              role: message.role,
              content: buildMessageContent(message)
            }))
          ],
          stream: true
        },
        {
          signal
        }
      );

      let content = '';
      let usage = null;
      let finishReason = 'stop';

      for await (const chunk of response) {
        const delta = chunk.choices?.[0]?.delta?.content || '';

        if (delta) {
          content += delta;
          onDelta?.(delta);
        }

        if (chunk.usage) {
          usage = {
            promptTokens: chunk.usage.prompt_tokens || 0,
            completionTokens: chunk.usage.completion_tokens || 0,
            totalTokens: chunk.usage.total_tokens || 0
          };
        }

        if (chunk.choices?.[0]?.finish_reason) {
          finishReason = chunk.choices[0].finish_reason;
        }
      }

      return normalizeResponse({
        provider,
        model: model || defaultModel,
        content,
        usage,
        finishReason,
        raw: null
      });
    }
  };
}
