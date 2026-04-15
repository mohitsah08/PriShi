import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../../.env') });
dotenv.config({ path: resolve(__dirname, '../../.env') });

const requiredAlways = ['JWT_SECRET'];
const requiredInProduction = ['MONGODB_URI', 'REDIS_URL'];

for (const key of requiredAlways) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

for (const key of requiredInProduction) {
  if (!process.env[key] && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 8081),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/prishi_ai',
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieName: process.env.COOKIE_NAME || 'prishi_ai_token',
  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS || 90000),
  uploadMaxMb: Number(process.env.UPLOAD_MAX_MB || 12),
  streamHeartbeatMs: Number(process.env.STREAM_HEARTBEAT_MS || 15000),
  guestSessionTtlMs: Number(process.env.GUEST_SESSION_TTL_MS || 60 * 60 * 1000),
  otp: {
    expiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES || 5),
    resetTokenMinutes: Number(process.env.RESET_TOKEN_EXPIRY_MINUTES || 10)
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    service: process.env.SMTP_SERVICE || 'gmail',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.EMAIL_USER || process.env.SMTP_USER || '',
    pass: process.env.EMAIL_PASS || process.env.SMTP_PASS || '',
    from:
      process.env.SMTP_FROM ||
      process.env.EMAIL_FROM ||
      (process.env.EMAIL_USER ? `PriShi <${process.env.EMAIL_USER}>` : 'PriShi <no-reply@prishi.ai>')
  },
  providers: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      imageModel: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1'
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash'
    },
    claude: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514'
    },
    grok: {
      apiKey: process.env.XAI_API_KEY || '',
      model: process.env.GROK_MODEL || 'grok-4-1-fast-reasoning'
    },
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat'
    }
  },
  plans: {
    free: {
      dailyMessageLimit: Number(process.env.FREE_DAILY_MESSAGE_LIMIT || 25),
      dailyTokenLimit: Number(process.env.FREE_DAILY_TOKEN_LIMIT || 120000)
    },
    pro: {
      dailyMessageLimit: Number(process.env.PRO_DAILY_MESSAGE_LIMIT || 500),
      dailyTokenLimit: Number(process.env.PRO_DAILY_TOKEN_LIMIT || 4000000)
    }
  }
};
