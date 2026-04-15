import { getRedis } from '../config/redis.js';

const keyFor = (requestId) => `stream:${requestId}`;
const memoryStore = new Map();

async function setState(key, value) {
  try {
    const redis = getRedis();
    await redis.set(key, JSON.stringify(value), 'EX', 3600);
  } catch {
    memoryStore.set(key, value);
  }
}

async function readState(key) {
  try {
    const redis = getRedis();
    const raw = await redis.get(key);
    return raw ? JSON.parse(raw) : memoryStore.get(key) || null;
  } catch {
    return memoryStore.get(key) || null;
  }
}

export async function startStreamState(requestId, payload) {
  await setState(keyFor(requestId), payload);
}

export async function updateStreamState(requestId, payload) {
  const previous = await getStreamState(requestId);

  await setState(keyFor(requestId), {
    ...(previous || {}),
    ...payload
  });
}

export async function completeStreamState(requestId, payload = {}) {
  await updateStreamState(requestId, {
    ...payload,
    completed: true,
    completedAt: new Date().toISOString()
  });
}

export async function getStreamState(requestId) {
  return readState(keyFor(requestId));
}
