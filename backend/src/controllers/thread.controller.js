import mongoose from '../config/mongoose.js';
import { ChatThread } from '../models/ChatThread.js';
import { Message } from '../models/Message.js';
import {
  createGuestThread,
  getGuestThread,
  listGuestMessages,
  listGuestThreads,
  updateGuestThread
} from '../services/guestChat.service.js';
import { ApiError } from '../utils/ApiError.js';
import { buildThreadTitle, sanitizePlainText } from '../utils/sanitize.js';

function isMongoObjectId(value) {
  return mongoose.Types.ObjectId.isValid(String(value || ''));
}

export async function listThreads(req, res) {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const skip = (page - 1) * limit;

  if (req.authMode === 'guest') {
    const { threads, total } = await listGuestThreads(req.guestSessionId, { page, limit });

    res.json({
      success: true,
      data: threads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
    return;
  }

  const [threads, total] = await Promise.all([
    ChatThread.find({
      userId: req.user._id,
      archivedAt: null
    })
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ChatThread.countDocuments({
      userId: req.user._id,
      archivedAt: null
    })
  ]);

  res.json({
    success: true,
    data: threads,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
}

export async function createThread(req, res) {
  if (req.authMode === 'guest') {
    const thread = await createGuestThread(req.guestSessionId, {
      title: buildThreadTitle(req.body.title || ''),
      provider: req.body.provider || 'auto'
    });

    res.status(201).json({
      success: true,
      data: thread
    });
    return;
  }

  const thread = await ChatThread.create({
    userId: req.user._id,
    title: buildThreadTitle(req.body.title || ''),
    provider: req.body.provider || 'auto'
  });

  res.status(201).json({
    success: true,
    data: thread
  });
}

export async function getThreadMessages(req, res) {
  if (req.authMode === 'guest') {
    const thread = await getGuestThread(req.guestSessionId, req.params.threadId);

    if (!thread) {
      throw new ApiError(404, 'Thread not found');
    }

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 50);
    const { messages, total } = await listGuestMessages(req.guestSessionId, req.params.threadId, {
      page,
      limit
    });

    res.json({
      success: true,
      data: messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
    return;
  }

  if (!isMongoObjectId(req.params.threadId)) {
    throw new ApiError(404, 'Thread not found');
  }

  const thread = await ChatThread.findOne({
    _id: req.params.threadId,
    userId: req.user._id
  });

  if (!thread) {
    throw new ApiError(404, 'Thread not found');
  }

  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 50);
  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    Message.find({ threadId: thread._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Message.countDocuments({ threadId: thread._id })
  ]);

  res.json({
    success: true,
    data: messages.reverse(),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
}

export async function updateThread(req, res) {
  if (req.authMode === 'guest') {
    const thread = await getGuestThread(req.guestSessionId, req.params.threadId);

    if (!thread) {
      throw new ApiError(404, 'Thread not found');
    }

    const updated = await updateGuestThread(req.guestSessionId, req.params.threadId, {
      ...(typeof req.body.title === 'string'
        ? {
            title: sanitizePlainText(req.body.title).slice(0, 120) || thread.title
          }
        : {}),
      ...(req.body.provider ? { provider: req.body.provider } : {}),
      ...(typeof req.body.archived === 'boolean'
        ? { archivedAt: req.body.archived ? new Date().toISOString() : null }
        : {})
    });

    res.json({
      success: true,
      data: updated
    });
    return;
  }

  if (!isMongoObjectId(req.params.threadId)) {
    throw new ApiError(404, 'Thread not found');
  }

  const thread = await ChatThread.findOne({
    _id: req.params.threadId,
    userId: req.user._id
  });

  if (!thread) {
    throw new ApiError(404, 'Thread not found');
  }

  if (typeof req.body.title === 'string') {
    thread.title = sanitizePlainText(req.body.title).slice(0, 120) || thread.title;
  }

  if (req.body.provider) {
    thread.provider = req.body.provider;
  }

  if (typeof req.body.archived === 'boolean') {
    thread.archivedAt = req.body.archived ? new Date() : null;
  }

  await thread.save();

  res.json({
    success: true,
    data: thread
  });
}
