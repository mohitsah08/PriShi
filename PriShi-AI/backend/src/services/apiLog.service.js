import { ApiLog } from '../models/ApiLog.js';

export async function writeApiLog(payload) {
  try {
    await ApiLog.create(payload);
  } catch {
    // logging should never break the request lifecycle
  }
}
