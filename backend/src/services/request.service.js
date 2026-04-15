import { setTimeout as delay } from 'node:timers/promises';

import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export async function withRetryAndTimeout(task, { retries = 1, signal }) {
  let attempt = 0;
  let lastError;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.requestTimeoutMs);
    const abortBridge = () => controller.abort();

    try {
      if (signal) {
        signal.addEventListener('abort', abortBridge, { once: true });
      }

      const result = await task(controller.signal);
      clearTimeout(timeout);
      return result;
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;

      if (attempt === retries) {
        break;
      }

      await delay(500 * (attempt + 1));
      attempt += 1;
    } finally {
      if (signal) {
        signal.removeEventListener('abort', abortBridge);
      }
    }
  }

  throw new ApiError(502, lastError?.message || 'Upstream provider request failed');
}
