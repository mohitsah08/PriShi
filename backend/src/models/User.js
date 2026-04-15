import mongoose from '../config/mongoose.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    username: {
      type: String,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 40,
      default: undefined
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: undefined,
      index: true
    },
    phone: {
      type: String,
      trim: true,
      default: undefined,
      index: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    otp: {
      type: String,
      default: null
    },
    otpExpiry: {
      type: Date,
      default: null
    },
    otpPurpose: {
      type: String,
      enum: ['signup', 'password-reset', 'change-password', null],
      default: null
    },
    otpLastSentAt: {
      type: Date,
      default: null
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

userSchema.pre('validate', function normalizeOptionalUniqueFields(next) {
  for (const field of ['username', 'email', 'phone']) {
    const value = this[field];

    if (value === null || value === '') {
      this[field] = undefined;
    }
  }

  next();
});

userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: 'string' } } }
);
userSchema.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $type: 'string' } } }
);
userSchema.index(
  { username: 1 },
  { unique: true, partialFilterExpression: { username: { $type: 'string' } } }
);

export const User = mongoose.model('User', userSchema);
