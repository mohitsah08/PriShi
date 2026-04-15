import mongoose from '../config/mongoose.js';

const attachmentSchema = new mongoose.Schema(
  {
    originalName: String,
    mimeType: String,
    size: Number,
    textContent: String,
    dataUrl: String
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatThread',
      required: true,
      index: true
    },
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
    requestId: {
      type: String,
      index: true
    },
    role: {
      type: String,
      enum: ['system', 'user', 'assistant'],
      required: true
    },
    provider: {
      type: String,
      enum: ['openai', 'gemini', 'claude', 'grok', 'deepseek'],
      required: true
    },
    model: {
      type: String,
      required: true
    },
    content: {
      type: String,
      default: ''
    },
    attachments: {
      type: [attachmentSchema],
      default: []
    },
    tokenCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['complete', 'streaming', 'interrupted', 'failed'],
      default: 'complete'
    },
    finishReason: String,
    errorMessage: String,
    fallbackFrom: String,
    responseTimeMs: Number
  },
  {
    timestamps: true
  }
);

messageSchema.index({ threadId: 1, createdAt: 1 });
messageSchema.index({ guestSessionId: 1, createdAt: 1 });

export const Message = mongoose.model('Message', messageSchema);
