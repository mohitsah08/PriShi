import { ChatThread } from '../models/ChatThread.js';
import { Message } from '../models/Message.js';
import mongoose from '../config/mongoose.js';

function isMongoObjectId(value) {
  return mongoose.Types.ObjectId.isValid(String(value || ''));
}

function guestThreadQuery(sessionId) {
  return {
    guestSessionId: sessionId
  };
}

function guestMessageQuery(sessionId, threadId) {
  return {
    guestSessionId: sessionId,
    threadId
  };
}

function withGuestFlag(record) {
  if (!record) {
    return null;
  }

  return {
    ...record,
    isGuest: true
  };
}

export async function listGuestThreads(sessionId, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const [threads, total] = await Promise.all([
    ChatThread.find({
      ...guestThreadQuery(sessionId),
      archivedAt: null
    })
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ChatThread.countDocuments({
      ...guestThreadQuery(sessionId),
      archivedAt: null
    })
  ]);

  return {
    threads: threads.map(withGuestFlag),
    total
  };
}

export async function createGuestThread(sessionId, { title = 'New chat', provider = 'auto' } = {}) {
  const thread = await ChatThread.create({
    guestSessionId: sessionId,
    title,
    provider,
    resolvedProvider: 'openai'
  });

  return withGuestFlag(thread.toObject());
}

export async function getGuestThread(sessionId, threadId) {
  if (!isMongoObjectId(threadId)) {
    return null;
  }

  const thread = await ChatThread.findOne({
    _id: threadId,
    ...guestThreadQuery(sessionId)
  }).lean();

  return withGuestFlag(thread);
}

export async function updateGuestThread(sessionId, threadId, patch = {}) {
  if (!isMongoObjectId(threadId)) {
    return null;
  }

  const thread = await ChatThread.findOneAndUpdate(
    {
      _id: threadId,
      ...guestThreadQuery(sessionId)
    },
    {
      $set: patch
    },
    {
      new: true
    }
  ).lean();

  return withGuestFlag(thread);
}

export async function listGuestMessages(sessionId, threadId, { page = 1, limit = 50 } = {}) {
  if (!isMongoObjectId(threadId)) {
    return {
      messages: [],
      total: 0
    };
  }

  const skip = (page - 1) * limit;
  const [messages, total] = await Promise.all([
    Message.find(guestMessageQuery(sessionId, threadId))
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Message.countDocuments(guestMessageQuery(sessionId, threadId))
  ]);

  return {
    messages: messages.reverse().map(withGuestFlag),
    total
  };
}

export async function getGuestThreadHistory(sessionId, threadId) {
  if (!isMongoObjectId(threadId)) {
    return [];
  }

  const messages = await Message.find(guestMessageQuery(sessionId, threadId))
    .sort({ createdAt: 1 })
    .lean();

  return messages.map(withGuestFlag);
}

export async function appendGuestMessage(sessionId, threadId, payload) {
  const message = await Message.create({
    threadId,
    guestSessionId: sessionId,
    requestId: payload.requestId || null,
    role: payload.role,
    provider: payload.provider || 'openai',
    model: payload.model || 'pending',
    content: payload.content || '',
    attachments: payload.attachments || [],
    tokenCount: payload.tokenCount || 0,
    status: payload.status || 'complete',
    finishReason: payload.finishReason || null,
    errorMessage: payload.errorMessage || null,
    fallbackFrom: payload.fallbackFrom || null,
    responseTimeMs: payload.responseTimeMs || null
  });

  return withGuestFlag(message.toObject());
}

export async function updateGuestMessage(sessionId, threadId, messageId, patch = {}) {
  if (!isMongoObjectId(threadId) || !isMongoObjectId(messageId)) {
    return null;
  }

  const message = await Message.findOneAndUpdate(
    {
      _id: messageId,
      ...guestMessageQuery(sessionId, threadId)
    },
    {
      $set: patch
    },
    {
      new: true
    }
  ).lean();

  return withGuestFlag(message);
}

export async function destroyGuestSession(sessionId) {
  if (!sessionId) {
    return false;
  }

  await Promise.all([
    Message.deleteMany({ guestSessionId: sessionId }),
    ChatThread.deleteMany({ guestSessionId: sessionId })
  ]);

  return true;
}
