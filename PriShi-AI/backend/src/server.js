import { createApp } from './app.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { getRedis } from './config/redis.js';

async function bootstrap() {
  await connectDatabase();
  getRedis();

  const app = createApp();
  app.listen(env.port, () => {
    logger.info(`Backend listening on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  logger.error({ error }, 'Failed to start server');
  process.exit(1);
});
