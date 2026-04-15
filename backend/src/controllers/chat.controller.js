import { randomUUID } from 'node:crypto';

import mongoose from '../config/mongoose.js';
import { ChatThread } from '../models/ChatThread.js';
import { env } from '../config/env.js';
import { Message } from '../models/Message.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { buildThreadTitle } from '../utils/sanitize.js';
import { estimateTokenCount } from '../utils/token.js';
import { initSse, sendSseComment, sendSseEvent } from '../utils/sse.js';

import { writeApiLog } from '../services/apiLog.service.js';
import { streamUnifiedResponse } from '../services/aiOrchestrator.service.js';
import {
  appendGuestMessage,
  getGuestThread,
  getGuestThreadHistory,
  updateGuestMessage,
  updateGuestThread
} from '../services/guestChat.service.js';
import {
  completeStreamState,
  getStreamState,
  startStreamState,
  updateStreamState
} from '../services/streamState.service.js';
import { processUploadedFiles } from '../services/upload.service.js';
import {
  assertPlanAccess,
  assertUsageWithinPlan,
  recordUsage
} from '../services/usage.service.js';

function isMongoObjectId(value) {
  return mongoose.Types.ObjectId.isValid(String(value || ''));
}

async function streamGuestMessage(req, res) {
  const startedAt = Date.now();
  const requestId = randomUUID();
  const requestedProvider = req.body.provider || 'auto';
  const thread = await getGuestThread(req.guestSessionId, req.params.threadId);

  if (!thread) {
    throw new ApiError(404, 'Thread not found');
  }

  if (requestedProvider !== 'auto') {
    assertPlanAccess(req.user, requestedProvider);
  }

  const attachments = await processUploadedFiles(req.files || []);
  const userMessageContent = req.body.message.trim();

  initSse(res);
  sendSseEvent(res, 'ready', {
    requestId,
    threadId: thread._id
  });

  const heartbeat = setInterval(() => sendSseComment(res), env.streamHeartbeatMs);
  const controller = new AbortController();
  let connectionClosed = false;
  let activeProvider = thread.resolvedProvider || 'openai';
  let activeModel = 'pending';
  let assistantContent = '';

  const userMessage = await appendGuestMessage(req.guestSessionId, thread._id, {
    requestId,
    role: 'user',
    provider: requestedProvider === 'auto' ? thread.resolvedProvider || 'openai' : requestedProvider,
    model: requestedProvider === 'auto' ? thread.resolvedProvider || 'pending' : requestedProvider,
    content: userMessageContent,
    attachments,
    tokenCount: estimateTokenCount(userMessageContent)
  });

  let assistantMessage = await appendGuestMessage(req.guestSessionId, thread._id, {
    requestId,
    role: 'assistant',
    provider: activeProvider,
    model: activeModel,
    content: '',
    status: 'streaming'
  });

  req.on('close', async () => {
    if (res.writableEnded) {
      return;
    }

    connectionClosed = true;
    controller.abort();
    clearInterval(heartbeat);

    assistantMessage = await updateGuestMessage(req.guestSessionId, thread._id, assistantMessage._id, {
      content: assistantContent,
      status: 'interrupted'
    });

    await updateStreamState(requestId, {
      completed: false,
      interrupted: true,
      content: assistantContent
    });
  });

  await startStreamState(requestId, {
    threadId: thread._id,
    userId: String(req.user._id),
    content: '',
    completed: false
  });

  sendSseEvent(res, 'message-created', {
    userMessageId: userMessage._id,
    assistantMessageId: assistantMessage._id
  });

  try {
    const result = await streamUnifiedResponse({
      user: req.user,
      thread: {
        ...thread,
        historyMessages: (await getGuestThreadHistory(req.guestSessionId, thread._id)).filter(
          (message) => message._id !== assistantMessage._id
        )
      },
      requestedProvider,
      attachments,
      userMessage: {
        content: userMessageContent
      },
      signal: controller.signal,
      onProviderAttempt: async ({ provider, model, fallbackFrom }) => {
        activeProvider = provider;
        activeModel = model;

        sendSseEvent(res, 'provider', {
          provider,
          model,
          fallbackFrom
        });

        await updateStreamState(requestId, {
          provider,
          model,
          fallbackFrom
        });
      },
      onDelta: async (delta) => {
        assistantContent += delta;

        await updateGuestMessage(req.guestSessionId, thread._id, assistantMessage._id, {
          content: assistantContent,
          status: 'streaming',
          provider: activeProvider,
          model: activeModel
        });

        sendSseEvent(res, 'delta', {
          messageId: assistantMessage._id,
          delta,
          content: assistantContent
        });

        await updateStreamState(requestId, {
          provider: activeProvider,
          model: activeModel,
          content: assistantContent
        });
      }
    });

    if (connectionClosed) {
      return;
    }

    assistantMessage = await updateGuestMessage(req.guestSessionId, thread._id, assistantMessage._id, {
      provider: result.provider,
      model: result.model,
      content: result.content,
      status: 'complete',
      finishReason: result.finishReason,
      fallbackFrom: result.fallbackFrom,
      tokenCount: result.usage.totalTokens,
      responseTimeMs: Date.now() - startedAt
    });

    await updateGuestMessage(req.guestSessionId, thread._id, userMessage._id, {
      provider: result.provider,
      model: result.model
    });

    await updateGuestThread(req.guestSessionId, thread._id, {
      title: !thread.title || thread.title === 'New chat' ? buildThreadTitle(userMessageContent) : thread.title,
      provider: requestedProvider,
      resolvedProvider: result.provider,
      lastMessageAt: new Date().toISOString(),
      lastAssistantPreview: result.content.slice(0, 240)
    });

    await completeStreamState(requestId, {
      provider: result.provider,
      model: result.model,
      content: result.content
    });

    await writeApiLog({
      requestId,
      route: req.originalUrl,
      provider: result.provider,
      status: 'success',
      statusCode: 200,
      latencyMs: Date.now() - startedAt,
      metadata: {
        model: result.model,
        totalTokens: result.usage.totalTokens,
        guestSessionId: req.guestSessionId
      }
    });

    sendSseEvent(res, 'usage', result.usage);
    sendSseEvent(res, 'complete', {
      message: {
        id: assistantMessage._id,
        role: 'assistant',
        provider: assistantMessage.provider,
        model: assistantMessage.model,
        content: assistantMessage.content,
        createdAt: assistantMessage.createdAt
      }
    });

    clearInterval(heartbeat);
    res.end();
  } catch (error) {
    clearInterval(heartbeat);

    await updateGuestMessage(req.guestSessionId, thread._id, assistantMessage._id, {
      status: controller.signal.aborted ? 'interrupted' : 'failed',
      content: assistantContent,
      errorMessage: error.message,
      provider: activeProvider,
      model: activeModel
    });

    await updateStreamState(requestId, {
      completed: false,
      error: error.message,
      content: assistantContent
    });

    await writeApiLog({
      requestId,
      route: req.originalUrl,
      provider: activeProvider,
      status: 'error',
      statusCode: error.statusCode || 500,
      latencyMs: Date.now() - startedAt,
      errorMessage: error.message,
      metadata: {
        guestSessionId: req.guestSessionId
      }
    });

    if (!connectionClosed) {
      sendSseEvent(res, 'error', {
        message: error.message
      });
      res.end();
    }
  }
}

export const streamMessage = asyncHandler(async (req, res) => {
  if (req.authMode === 'guest') {
    await streamGuestMessage(req, res);
    return;
  }

  if (!isMongoObjectId(req.params.threadId)) {
    throw new ApiError(404, 'Thread not found');
  }

  const startedAt = Date.now();
  const requestId = randomUUID();
  const requestedProvider = req.body.provider || 'auto';
  const thread = await ChatThread.findOne({
    _id: req.params.threadId,
    userId: req.user._id
  });

  if (!thread) {
    throw new ApiError(404, 'Thread not found');
  }

  if (requestedProvider !== 'auto') {
    assertPlanAccess(req.user, requestedProvider);
  }

  await assertUsageWithinPlan(req.user);

  const attachments = await processUploadedFiles(req.files || []);
  const userMessageContent = req.body.message.trim();

  initSse(res);
  sendSseEvent(res, 'ready', {
    requestId,
    threadId: thread._id
  });

  const heartbeat = setInterval(() => sendSseComment(res), env.streamHeartbeatMs);
  const controller = new AbortController();
  let connectionClosed = false;
  let activeProvider = thread.resolvedProvider || 'openai';
  let activeModel = 'pending';
  let assistantContent = '';
  let assistantMessage = null;

  req.on('close', async () => {
    if (res.writableEnded) {
      return;
    }

    connectionClosed = true;
    controller.abort();
    clearInterval(heartbeat);

    if (assistantMessage) {
      assistantMessage.content = assistantContent;
      assistantMessage.status = 'interrupted';
      await assistantMessage.save();
    }

    await updateStreamState(requestId, {
      completed: false,
      interrupted: true,
      content: assistantContent
    });
  });

  await startStreamState(requestId, {
    threadId: thread._id.toString(),
    userId: req.user._id.toString(),
    content: '',
    completed: false
  });

  const userMessage = await Message.create({
    threadId: thread._id,
    userId: req.user._id,
    requestId,
    role: 'user',
    provider: requestedProvider === 'auto' ? thread.resolvedProvider || 'openai' : requestedProvider,
    model: requestedProvider === 'auto' ? thread.resolvedProvider || 'pending' : requestedProvider,
    content: userMessageContent,
    attachments,
    tokenCount: estimateTokenCount(userMessageContent)
  });

  assistantMessage = await Message.create({
    threadId: thread._id,
    userId: req.user._id,
    requestId,
    role: 'assistant',
    provider: activeProvider,
    model: activeModel,
    content: '',
    status: 'streaming'
  });

  sendSseEvent(res, 'message-created', {
    userMessageId: userMessage._id,
    assistantMessageId: assistantMessage._id
  });

  try {
    const result = await streamUnifiedResponse({
      user: req.user,
      thread,
      requestedProvider,
      attachments,
      userMessage: {
        content: userMessageContent
      },
      signal: controller.signal,
      onProviderAttempt: async ({ provider, model, fallbackFrom }) => {
        activeProvider = provider;
        activeModel = model;

        sendSseEvent(res, 'provider', {
          provider,
          model,
          fallbackFrom
        });

        await updateStreamState(requestId, {
          provider,
          model,
          fallbackFrom
        });
      },
      onDelta: async (delta) => {
        assistantContent += delta;

        sendSseEvent(res, 'delta', {
          messageId: assistantMessage._id,
          delta,
          content: assistantContent
        });

        await updateStreamState(requestId, {
          provider: activeProvider,
          model: activeModel,
          content: assistantContent
        });
      }
    });

    if (connectionClosed) {
      return;
    }

    assistantMessage.provider = result.provider;
    assistantMessage.model = result.model;
    assistantMessage.content = result.content;
    assistantMessage.status = 'complete';
    assistantMessage.finishReason = result.finishReason;
    assistantMessage.fallbackFrom = result.fallbackFrom;
    assistantMessage.tokenCount = result.usage.totalTokens;
    assistantMessage.responseTimeMs = Date.now() - startedAt;
    await assistantMessage.save();

    userMessage.provider = result.provider;
    userMessage.model = result.model;
    await userMessage.save();

    if (!thread.title || thread.title === 'New chat') {
      thread.title = buildThreadTitle(userMessageContent);
    }

    thread.provider = requestedProvider;
    thread.resolvedProvider = result.provider;
    thread.lastMessageAt = new Date();
    thread.lastAssistantPreview = result.content.slice(0, 240);
    await thread.save();

    await recordUsage({
      userId: req.user._id,
      threadId: thread._id,
      requestId,
      provider: result.provider,
      model: result.model,
      plan: req.user.plan,
      usage: result.usage
    });

    await completeStreamState(requestId, {
      provider: result.provider,
      model: result.model,
      content: result.content
    });

    await writeApiLog({
      requestId,
      userId: req.user._id,
      route: req.originalUrl,
      provider: result.provider,
      status: 'success',
      statusCode: 200,
      latencyMs: Date.now() - startedAt,
      metadata: {
        model: result.model,
        totalTokens: result.usage.totalTokens
      }
    });

    sendSseEvent(res, 'usage', result.usage);
    sendSseEvent(res, 'complete', {
      message: {
        id: assistantMessage._id,
        role: 'assistant',
        provider: assistantMessage.provider,
        model: assistantMessage.model,
        content: assistantMessage.content,
        createdAt: assistantMessage.createdAt
      }
    });

    clearInterval(heartbeat);
    res.end();
  } catch (error) {
    clearInterval(heartbeat);

    if (assistantMessage) {
      assistantMessage.status = controller.signal.aborted ? 'interrupted' : 'failed';
      assistantMessage.content = assistantContent;
      assistantMessage.errorMessage = error.message;
      assistantMessage.provider = activeProvider;
      assistantMessage.model = activeModel;
      await assistantMessage.save();
    }

    await updateStreamState(requestId, {
      completed: false,
      error: error.message,
      content: assistantContent
    });

    await writeApiLog({
      requestId,
      userId: req.user._id,
      route: req.originalUrl,
      provider: activeProvider,
      status: 'error',
      statusCode: error.statusCode || 500,
      latencyMs: Date.now() - startedAt,
      errorMessage: error.message
    });

    if (!connectionClosed) {
      sendSseEvent(res, 'error', {
        message: error.message
      });
      res.end();
    }
  }
});

export const getStreamStatus = asyncHandler(async (req, res) => {
  const state = await getStreamState(req.params.requestId);

  res.json({
    success: true,
    data: state
  });
});
