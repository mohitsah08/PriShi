import { env } from '../config/env.js';
import { UsageRecord } from '../models/UsageRecord.js';
import { ApiError } from '../utils/ApiError.js';

import { PROVIDERS } from './providerCatalog.service.js';

export function assertPlanAccess(user, provider) {
  const providerConfig = PROVIDERS[provider];

  if (providerConfig?.premium && user.plan !== 'pro') {
    throw new ApiError(403, `${providerConfig.label} is available on the Pro plan`);
  }
}

export async function assertUsageWithinPlan(user) {
  const planLimits = env.plans[user.plan];
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [summary] = await UsageRecord.aggregate([
    {
      $match: {
        userId: user._id,
        createdAt: { $gte: since }
      }
    },
    {
      $group: {
        _id: null,
        totalTokens: { $sum: '$totalTokens' },
        totalMessages: { $sum: 1 }
      }
    }
  ]);

  if ((summary?.totalMessages || 0) >= planLimits.dailyMessageLimit) {
    throw new ApiError(429, 'Daily message limit reached for your plan');
  }

  if ((summary?.totalTokens || 0) >= planLimits.dailyTokenLimit) {
    throw new ApiError(429, 'Daily token limit reached for your plan');
  }
}

export async function recordUsage({
  userId,
  threadId,
  requestId,
  provider,
  model,
  plan,
  usage
}) {
  return UsageRecord.create({
    userId,
    threadId,
    requestId,
    provider,
    model,
    plan,
    inputTokens: usage.promptTokens,
    outputTokens: usage.completionTokens,
    totalTokens: usage.totalTokens,
    estimated: usage.estimated
  });
}
