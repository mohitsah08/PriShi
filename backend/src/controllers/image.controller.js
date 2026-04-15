import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';

import mongoose from '../config/mongoose.js';
import { env } from '../config/env.js';
import { ChatThread } from '../models/ChatThread.js';
import { Message } from '../models/Message.js';
import {
  appendGuestMessage,
  getGuestThread,
  updateGuestThread
} from '../services/guestChat.service.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { buildThreadTitle } from '../utils/sanitize.js';

const require = createRequire(import.meta.url);
const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: env.providers.openai.apiKey
});

function isMongoObjectId(value) {
  return mongoose.Types.ObjectId.isValid(String(value || ''));
}

export const generateImage = asyncHandler(async (req, res) => {
  if (!env.providers.openai.apiKey) {
    throw new ApiError(503, 'OpenAI API key is not configured');
  }

  const prompt = String(req.body.prompt || '').trim();

  if (!prompt) {
    throw new ApiError(400, 'Image prompt is required');
  }

  if (req.authMode !== 'guest' && !isMongoObjectId(req.params.threadId)) {
    throw new ApiError(404, 'Thread not found');
  }

  const thread =
    req.authMode === 'guest'
      ? await getGuestThread(req.guestSessionId, req.params.threadId)
      : await ChatThread.findOne({
          _id: req.params.threadId,
          userId: req.user._id
        });

  if (!thread) {
    throw new ApiError(404, 'Thread not found');
  }

  const requestId = randomUUID();

  const imageResponse = await client.images.generate({
    model: env.providers.openai.imageModel,
    prompt,
    size: '1024x1024'
  });

  const imagePayload = imageResponse.data?.[0];
  const b64 = imagePayload?.b64_json;

  if (!b64) {
    throw new ApiError(502, 'Image generation did not return image data');
  }

  const imageDataUrl = `data:image/png;base64,${b64}`;

  const userMessage =
    req.authMode === 'guest'
      ? await appendGuestMessage(req.guestSessionId, thread._id, {
          requestId,
          role: 'user',
          provider: 'openai',
          model: env.providers.openai.imageModel,
          content: prompt,
          status: 'complete'
        })
      : await Message.create({
          threadId: thread._id,
          userId: req.user._id,
          requestId,
          role: 'user',
          provider: 'openai',
          model: env.providers.openai.imageModel,
          content: prompt,
          status: 'complete'
        });

  const assistantMessage =
    req.authMode === 'guest'
      ? await appendGuestMessage(req.guestSessionId, thread._id, {
          requestId,
          role: 'assistant',
          provider: 'openai',
          model: env.providers.openai.imageModel,
          content: `![Generated image](${imageDataUrl})`,
          attachments: [
            {
              originalName: 'generated-image.png',
              mimeType: 'image/png',
              size: Math.ceil((b64.length * 3) / 4),
              dataUrl: imageDataUrl
            }
          ],
          status: 'complete'
        })
      : await Message.create({
          threadId: thread._id,
          userId: req.user._id,
          requestId,
          role: 'assistant',
          provider: 'openai',
          model: env.providers.openai.imageModel,
          content: `![Generated image](${imageDataUrl})`,
          attachments: [
            {
              originalName: 'generated-image.png',
              mimeType: 'image/png',
              size: Math.ceil((b64.length * 3) / 4),
              dataUrl: imageDataUrl
            }
          ],
          status: 'complete'
        });

  if (req.authMode === 'guest') {
    await updateGuestThread(req.guestSessionId, thread._id, {
      title: !thread.title || thread.title === 'New chat' ? buildThreadTitle(prompt) : thread.title,
      provider: 'openai',
      resolvedProvider: 'openai',
      lastMessageAt: new Date().toISOString(),
      lastAssistantPreview: 'Generated image'
    });
  } else {
    if (!thread.title || thread.title === 'New chat') {
      thread.title = buildThreadTitle(prompt);
    }

    thread.provider = 'openai';
    thread.resolvedProvider = 'openai';
    thread.lastMessageAt = new Date();
    thread.lastAssistantPreview = 'Generated image';
    await thread.save();
  }

  res.json({
    success: true,
    data: {
      userMessage,
      assistantMessage
    }
  });
});
