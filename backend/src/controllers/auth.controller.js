import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';

import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { clearOtp, sendOtpChallenge, verifyOtpOrThrow } from '../services/otp.service.js';
import { destroyGuestSession } from '../services/guestChat.service.js';
import { ApiError } from '../utils/ApiError.js';
import { signToken, verifyToken } from '../utils/jwt.js';
import { sanitizePlainText } from '../utils/sanitize.js';

const require = createRequire(import.meta.url);
const bcrypt = require('bcrypt');

function normalizeEmail(value) {
  const next = String(value || '').trim().toLowerCase();
  return next || null;
}

function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits || null;
}

function normalizeUsername(value) {
  const next = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
  return next || null;
}

function buildUserPayload(user) {
  return {
    id: user._id,
    name: user.name,
    username: user.username || null,
    email: user.email || null,
    phone: user.phone || null,
    plan: user.plan,
    role: user.role,
    isVerified: user.isVerified,
    isGuest: false
  };
}

function buildGuestPayload(sessionId) {
  return {
    id: `guest:${sessionId}`,
    name: 'Guest',
    username: null,
    email: null,
    phone: null,
    plan: 'free',
    role: 'user',
    isVerified: false,
    isGuest: true,
    guestSessionId: sessionId
  };
}

function attachSessionCookie(res, token) {
  res.cookie(env.cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

function clearSessionCookie(res) {
  res.clearCookie(env.cookieName, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production'
  });
}

function respondWithUserSession(res, user) {
  const token = signToken({
    sub: user._id.toString(),
    role: user.role,
    mode: 'user'
  });

  attachSessionCookie(res, token);

  return res.json({
    success: true,
    token,
    user: buildUserPayload(user)
  });
}

function respondWithGuestSession(res) {
  const guestSessionId = randomUUID();
  const token = signToken({
    sub: `guest:${guestSessionId}`,
    role: 'user',
    plan: 'free',
    mode: 'guest',
    guestSessionId
  });

  return res.json({
    success: true,
    token,
    user: buildGuestPayload(guestSessionId)
  });
}

async function ensureUniqueFields({ email, phone, username, excludeUserId = null }) {
  const checks = [
    email ? { email } : null,
    phone ? { phone } : null,
    username ? { username } : null
  ].filter(Boolean);

  for (const query of checks) {
    const existingUser = await User.findOne({
      ...query,
      ...(excludeUserId ? { _id: { $ne: excludeUserId } } : {})
    });

    if (existingUser) {
      const field = Object.keys(query)[0];
      throw new ApiError(409, `${field} is already registered`);
    }
  }
}

async function findUserByIdentifier(identifier) {
  const raw = String(identifier || '').trim();
  const email = normalizeEmail(raw);
  const username = normalizeUsername(raw);
  const phone = normalizePhone(raw);

  return User.findOne({
    $or: [
      ...(email ? [{ email }] : []),
      ...(username ? [{ username }] : []),
      ...(phone ? [{ phone }] : [])
    ]
  });
}

export async function guest(req, res) {
  return respondWithGuestSession(res);
}

export async function signup(req, res) {
  const name = sanitizePlainText(req.body.name);
  const username = normalizeUsername(req.body.username);
  const email = normalizeEmail(req.body.email);
  const phone = normalizePhone(req.body.phone);
  const password = String(req.body.password || '');

  if (!email && !phone) {
    throw new ApiError(400, 'Email or phone is required');
  }

  await ensureUniqueFields({ email, phone, username });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    ...(username ? { username } : {}),
    ...(email ? { email } : {}),
    ...(phone ? { phone } : {}),
    passwordHash,
    isVerified: true,
    lastLoginAt: new Date()
  });

  return respondWithUserSession(res.status(201), user);
}

export async function resendSignupOtp(req, res) {
  throw new ApiError(410, 'Signup OTP verification is no longer required');
}

export async function verifySignupOtp(req, res) {
  throw new ApiError(410, 'Signup OTP verification is no longer required');
}

export async function login(req, res) {
  const user = await findUserByIdentifier(req.body.identifier);

  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isMatch = await bcrypt.compare(String(req.body.password || ''), user.passwordHash);

  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  if (!user.isVerified) {
    user.isVerified = true;
  }
  user.lastLoginAt = new Date();
  await user.save();

  return respondWithUserSession(res, user);
}

export async function me(req, res) {
  if (req.authMode === 'guest') {
    return res.json({
      success: true,
      user: buildGuestPayload(req.guestSessionId)
    });
  }

  return res.json({
    success: true,
    user: buildUserPayload(req.user)
  });
}

export async function logout(req, res) {
  if (req.authMode === 'guest' && req.guestSessionId) {
    await destroyGuestSession(req.guestSessionId);
  }

  clearSessionCookie(res);

  return res.json({
    success: true
  });
}

export async function requestPasswordReset(req, res) {
  const user = await findUserByIdentifier(req.body.identifier);

  if (!user) {
    return res.json({
      success: true,
      message: 'If the account exists, an OTP has been sent'
    });
  }

  const otpResult = await sendOtpChallenge(user, 'password-reset');

  return res.json({
    success: true,
    message: 'If the account exists, an OTP has been sent',
    delivery: otpResult.delivery,
    expiresAt: otpResult.expiresAt,
    ...(otpResult.devOtp ? { devOtp: otpResult.devOtp } : {})
  });
}

export async function verifyPasswordResetOtp(req, res) {
  const user = await findUserByIdentifier(req.body.identifier);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  verifyOtpOrThrow(user, req.body.otp, 'password-reset');

  const resetToken = signToken(
    {
      sub: user._id.toString(),
      purpose: 'password-reset',
      mode: 'user'
    },
    {
      expiresIn: `${env.otp.resetTokenMinutes}m`
    }
  );

  return res.json({
    success: true,
    resetToken
  });
}

export async function resetPassword(req, res) {
  let payload;

  try {
    payload = verifyToken(req.body.resetToken);
  } catch {
    throw new ApiError(401, 'Reset token is invalid or expired');
  }

  if (payload.purpose !== 'password-reset') {
    throw new ApiError(401, 'Reset token purpose is invalid');
  }

  const user = await User.findById(payload.sub);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.passwordHash = await bcrypt.hash(String(req.body.password || ''), 12);
  clearOtp(user);
  await user.save();

  return res.json({
    success: true,
    message: 'Password has been updated'
  });
}

export async function requestChangePasswordOtp(req, res) {
  const otpResult = await sendOtpChallenge(req.user, 'change-password');

  return res.json({
    success: true,
    delivery: otpResult.delivery,
    expiresAt: otpResult.expiresAt,
    ...(otpResult.devOtp ? { devOtp: otpResult.devOtp } : {})
  });
}

export async function changePassword(req, res) {
  verifyOtpOrThrow(req.user, req.body.otp, 'change-password');
  req.user.passwordHash = await bcrypt.hash(String(req.body.password || ''), 12);
  clearOtp(req.user);
  await req.user.save();

  return res.json({
    success: true,
    message: 'Password has been updated'
  });
}
