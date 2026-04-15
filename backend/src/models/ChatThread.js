import mongoose from '../config/mongoose.js';

const chatThreadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    guestSessionId: {
      type: String,
      index: true,
      default: undefined
    },
    title: {
      type: String,
      default: 'New chat',
      trim: true,
      maxlength: 120
    },
    provider: {
      type: String,
      enum: ['auto', 'openai', 'gemini', 'claude', 'grok', 'deepseek'],
      default: 'auto'
    },
    resolvedProvider: {
      type: String,
      enum: ['openai', 'gemini', 'claude', 'grok', 'deepseek'],
      default: 'openai'
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    lastAssistantPreview: {
      type: String,
      default: ''
    },
    archivedAt: Date
  },
  {
    timestamps: true
  }
);

chatThreadSchema.index({ userId: 1, lastMessageAt: -1 });
chatThreadSchema.index({ guestSessionId: 1, lastMessageAt: -1 });

export const ChatThread = mongoose.model('ChatThread', chatThreadSchema);
