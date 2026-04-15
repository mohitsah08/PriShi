import mongoose from '../config/mongoose.js';

const usageRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatThread',
      required: true,
      index: true
    },
    requestId: {
      type: String,
      required: true,
      index: true
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
    plan: {
      type: String,
      enum: ['free', 'pro'],
      required: true
    },
    inputTokens: {
      type: Number,
      default: 0
    },
    outputTokens: {
      type: Number,
      default: 0
    },
    totalTokens: {
      type: Number,
      default: 0
    },
    estimated: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

usageRecordSchema.index({ userId: 1, createdAt: -1 });
usageRecordSchema.index({ provider: 1, createdAt: -1 });

export const UsageRecord = mongoose.model('UsageRecord', usageRecordSchema);
