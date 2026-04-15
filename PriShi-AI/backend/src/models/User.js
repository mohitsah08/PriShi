import mongoose from '../config/mongoose.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    plan: {
      type: String,
      enum: ['free', 'pro'],
      default: 'free'
    },
    lastLoginAt: Date
  },
  {
    timestamps: true
  }
);

export const User = mongoose.model('User', userSchema);
