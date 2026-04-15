import { createRequire } from 'node:module';

import { env } from '../config/env.js';

import { normalizeResponse } from './normalizeResponse.service.js';

const require = createRequire(import.meta.url);
const { GoogleGenAI } = require('@google/genai');

const client = new GoogleGenAI({
  apiKey: env.providers.gemini.apiKey
});

function toGeminiParts(message) {
  const parts = [];

  if (message.content) {
    parts.push({ text: message.content });
  }

  for (const attachment of message.attachments || []) {
    if (attachment.textContent) {
      parts.push({
        text: `Attachment "${attachment.originalName}" extracted text:\n${attachment.textContent}`
      });
    }

    if (attachment.dataUrl?.startsWith('data:image/')) {
      const [meta, data] = attachment.dataUrl.split(',');
      const mimeType = meta.match(/data:(.*);base64/)?.[1] || attachment.mimeType;

      parts.push({
        inlineData: {
          mimeType,
          data
        }
      });
    }
  }

  return parts;
}

export const geminiService = {
  provider: 'gemini',
  isConfigured() {
    return Boolean(env.providers.gemini.apiKey);
  },
  async streamChat({ messages, systemPrompt, model, onDelta }) {
    const stream = await client.models.generateContentStream({
      model: model || env.providers.gemini.model,
      contents: messages.map((message) => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: toGeminiParts(message)
      })),
      config: {
        systemInstruction: systemPrompt
      }
    });

    let content = '';

    for await (const chunk of stream) {
      const delta = chunk.text || '';

      if (delta) {
        content += delta;
        onDelta?.(delta);
      }
    }

    const finalResponse = await stream.response;
    const usageMetadata = finalResponse?.usageMetadata;

    return normalizeResponse({
      provider: 'gemini',
      model: model || env.providers.gemini.model,
      content,
      usage: usageMetadata
        ? {
            promptTokens: usageMetadata.promptTokenCount || 0,
            completionTokens: usageMetadata.candidatesTokenCount || 0,
            totalTokens: usageMetadata.totalTokenCount || 0
          }
        : null,
      finishReason:
        finalResponse?.candidates?.[0]?.finishReason?.toLowerCase() || 'stop',
      raw: null
    });
  }
};
