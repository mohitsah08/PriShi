import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { verifyToken } from '../utils/jwt.js';

async function getOrCreateDemoUser() {
  let user = await User.findOne({ email: 'guest@prishi.ai' });

  if (!user) {
    user = await User.create({
      name: 'Guest User',
      email: 'guest@prishi.ai',
      passwordHash: 'guest-mode-no-password',
      role: 'admin',
      plan: 'pro'
    });
  }

  return user;
}

export async function requireAuth(req, _res, next) {
  try {
    const bearer = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.replace('Bearer ', '')
      : null;
    const token = bearer || req.cookies?.[env.cookieName];

    if (!token) {
      req.user = await getOrCreateDemoUser();
      next();
      return;
    }

    try {
      const payload = verifyToken(token);
      const user = await User.findById(payload.sub);

      if (user) {
        req.user = user;
        next();
        return;
      }
    } catch {
      // invalid token falls back to demo user
    }

    req.user = await getOrCreateDemoUser();
    next();
  } catch (error) {
    next(error);
  }
}
