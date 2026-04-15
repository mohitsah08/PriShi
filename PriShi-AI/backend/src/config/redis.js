import { createRequire } from 'node:module';

import { env } from './env.js';
import { logger } from './logger.js';

const require = createRequire(import.meta.url);
const Redis = require('ioredis');

let redis;

export function getRedis() {
  if (!redis) {
    redis = new Redis(env.redisUrl, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      lazyConnect: true,
      enableOfflineQueue: false
    });

    redis.on('connect', () => logger.info('Redis connected'));
    redis.on('error', (error) => logger.error({ error }, 'Redis error'));
  }

  return redis;
}
