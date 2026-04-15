import dotenv from 'dotenv';

dotenv.config();

const requiredInProduction = ['MONGODB_URI', 'REDIS_URL', 'JWT_SECRET'];

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
  jwtSecret: process.env.JWT_SECRET || 'development-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieName: process.env.COOKIE_NAME || 'prishi_ai_token',
  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS || 90000),
  uploadMaxMb: Number(process.env.UPLOAD_MAX_MB || 12),
  streamHeartbeatMs: Number(process.env.STREAM_HEARTBEAT_MS || 15000),
  providers: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini'
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
