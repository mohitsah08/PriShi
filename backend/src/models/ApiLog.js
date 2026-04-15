import mongoose from '../config/mongoose.js';

const apiLogSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    route: String,
    provider: String,
    status: String,
    statusCode: Number,
    latencyMs: Number,
    errorMessage: String,
    metadata: mongoose.Schema.Types.Mixed
  },
  {
    timestamps: true
  }
);

apiLogSchema.index({ createdAt: -1 });

export const ApiLog = mongoose.model('ApiLog', apiLogSchema);
