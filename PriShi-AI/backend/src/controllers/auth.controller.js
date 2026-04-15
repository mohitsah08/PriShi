import { createRequire } from 'node:module';

import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { signToken } from '../utils/jwt.js';
import { sanitizePlainText } from '../utils/sanitize.js';

const require = createRequire(import.meta.url);
const bcrypt = require('bcrypt');

function respondWithSession(res, user) {
  const token = signToken({
    sub: user._id.toString(),
    role: user.role
  });

  res.cookie(env.cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      role: user.role
    }
  });
}

export async function signup(req, res) {
  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, 'Email is already registered');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name: sanitizePlainText(name),
    email,
    passwordHash
  });

  return respondWithSession(res, user);
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  user.lastLoginAt = new Date();
  await user.save();

  return respondWithSession(res, user);
}

export async function me(req, res) {
  return res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      plan: req.user.plan
    }
  });
}
