import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { notFoundMiddleware } from './middlewares/notFound.middleware.js';
import { apiLimiter } from './middlewares/rateLimit.middleware.js';
import { requestIdMiddleware } from './middlewares/requestId.middleware.js';
import adminRoutes from './routes/admin.routes.js';
import authRoutes from './routes/auth.routes.js';
import chatRoutes from './routes/chat.routes.js';
import healthRoutes from './routes/health.routes.js';
import imageRoutes from './routes/image.routes.js';
import threadRoutes from './routes/thread.routes.js';
import uploadRoutes from './routes/upload.routes.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(requestIdMiddleware);
  app.use(
    helmet({
      crossOriginResourcePolicy: false
    })
  );
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }

        const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/;
        const lanPattern =
          /^https?:\/\/((10\.\d+\.\d+\.\d+)|(192\.168\.\d+\.\d+)|(172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)):\d+$/;

        if (
          origin === env.clientUrl ||
          localhostPattern.test(origin) ||
          lanPattern.test(origin)
        ) {
          callback(null, true);
          return;
        }

        callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true
    })
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
  app.use('/api', apiLimiter);

  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/threads', threadRoutes);
  app.use('/api/chats', chatRoutes);
  app.use('/api/images', imageRoutes);
  app.use('/api/uploads', uploadRoutes);
  app.use('/api/admin', adminRoutes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
