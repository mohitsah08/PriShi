import { ApiLog } from '../models/ApiLog.js';
import { UsageRecord } from '../models/UsageRecord.js';
import { User } from '../models/User.js';

export async function getOverview(req, res) {
  const [users, usage, logs, errors] = await Promise.all([
    User.countDocuments(),
    UsageRecord.aggregate([
      {
        $group: {
          _id: null,
          totalTokens: { $sum: '$totalTokens' },
          totalRequests: { $sum: 1 }
        }
      }
    ]),
    ApiLog.countDocuments(),
    ApiLog.countDocuments({ status: 'error' })
  ]);

  res.json({
    success: true,
    data: {
      totalUsers: users,
      totalTokens: usage[0]?.totalTokens || 0,
      totalRequests: usage[0]?.totalRequests || 0,
      totalLogs: logs,
      totalErrors: errors
    }
  });
}

export async function listUsers(req, res) {
  const users = await User.find()
    .sort({ createdAt: -1 })
    .limit(200)
    .select('name email plan role createdAt lastLoginAt')
    .lean();

  res.json({
    success: true,
    data: users
  });
}

export async function listUsage(req, res) {
  const usage = await UsageRecord.find()
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  res.json({
    success: true,
    data: usage
  });
}

export async function listLogs(req, res) {
  const logs = await ApiLog.find()
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  res.json({
    success: true,
    data: logs
  });
}

export async function listErrors(req, res) {
  const errors = await ApiLog.find({ status: 'error' })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  res.json({
    success: true,
    data: errors
  });
}
