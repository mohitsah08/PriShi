import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { verifyToken } from '../utils/jwt.js';

function buildGuestUser(sessionId) {
  return {
    _id: `guest:${sessionId}`,
    id: `guest:${sessionId}`,
    name: 'Guest',
    username: null,
    email: null,
    phone: null,
    role: 'user',
    plan: 'free',
    isVerified: false,
    isGuest: true
  };
}

function readRequestToken(req) {
  const bearer = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.replace('Bearer ', '')
    : null;

  return bearer || req.cookies?.[env.cookieName] || null;
}

export async function optionalAuth(req, _res, next) {
  try {
    const token = readRequestToken(req);

    req.authMode = 'anonymous';
    req.user = null;
    req.guestSessionId = null;

    if (!token) {
      next();
      return;
    }

    let payload;

    try {
      payload = verifyToken(token);
    } catch {
      next();
      return;
    }

    if (payload.mode === 'guest' && payload.guestSessionId) {
      req.authMode = 'guest';
      req.guestSessionId = payload.guestSessionId;
      req.user = buildGuestUser(payload.guestSessionId);
      next();
      return;
    }

    const user = await User.findById(payload.sub);

    if (user) {
      req.authMode = 'user';
      req.user = user;
    }

    next();
  } catch (error) {
    next(error);
  }
}

export async function requireAuth(req, res, next) {
  await optionalAuth(req, res, async (error) => {
    if (error) {
      next(error);
      return;
    }

    if (!req.user) {
      next(new ApiError(401, 'Authentication is required'));
      return;
    }

    next();
  });
}

export async function requireVerifiedUser(req, res, next) {
  await optionalAuth(req, res, async (error) => {
    if (error) {
      next(error);
      return;
    }

    if (!req.user || req.authMode !== 'user') {
      next(new ApiError(401, 'A verified user session is required'));
      return;
    }

    if (!req.user.isVerified) {
      next(new ApiError(403, 'Your account is not verified'));
      return;
    }

    next();
  });
}
