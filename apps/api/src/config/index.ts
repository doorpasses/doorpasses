import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface Config {
  app: {
    env: string;
    port: number;
    host: string;
    apiVersion: string;
  };
  cors: {
    origin: string;
  };
  database: {
    url: string;
  };
  redis: {
    host: string;
    port: number;
    password: string;
  };
  auth: {
    jwtSecret: string;
    jwtExpiration: string;
    accountIdSalt: string;
    sharedSecretSalt: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  webhook: {
    retryAttempts: number;
    retryTimeoutHours: number;
  };
  apple: {
    teamId: string;
    passTypeId: string;
    certificatePath: string;
    certificatePassword: string;
  };
  google: {
    applicationCredentials: string;
    issuerId: string;
  };
  regional: {
    defaultTimezone: string;
    defaultLanguage: string;
    supportedLanguages: string[];
  };
  logging: {
    level: string;
    format: string;
  };
  twilio: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  };
  sendgrid: {
    apiKey: string;
    fromEmail: string;
  };
  features: {
    prayerTimeIntegration: boolean;
    arabicRtl: boolean;
    uaePassIntegration: boolean;
    absherIntegration: boolean;
  };
}

const config: Config = {
  app: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3007', 10),
    host: process.env.HOST || 'localhost',
    apiVersion: process.env.API_VERSION || 'v1',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiration: process.env.JWT_EXPIRATION || '24h',
    accountIdSalt: process.env.ACCOUNT_ID_SALT || '',
    sharedSecretSalt: process.env.SHARED_SECRET_SALT || '',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  webhook: {
    retryAttempts: parseInt(process.env.WEBHOOK_RETRY_ATTEMPTS || '10', 10),
    retryTimeoutHours: parseInt(process.env.WEBHOOK_RETRY_TIMEOUT_HOURS || '6', 10),
  },
  apple: {
    teamId: process.env.APPLE_TEAM_ID || '',
    passTypeId: process.env.APPLE_PASS_TYPE_ID || '',
    certificatePath: process.env.APPLE_CERTIFICATE_PATH || '',
    certificatePassword: process.env.APPLE_CERTIFICATE_PASSWORD || '',
  },
  google: {
    applicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
    issuerId: process.env.GOOGLE_ISSUER_ID || '',
  },
  regional: {
    defaultTimezone: process.env.DEFAULT_TIMEZONE || 'Asia/Dubai',
    defaultLanguage: process.env.DEFAULT_LANGUAGE || 'ar',
    supportedLanguages: (process.env.SUPPORTED_LANGUAGES || 'ar,en').split(','),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
    fromEmail: process.env.SENDGRID_FROM_EMAIL || '',
  },
  features: {
    prayerTimeIntegration: process.env.ENABLE_PRAYER_TIME_INTEGRATION === 'true',
    arabicRtl: process.env.ENABLE_ARABIC_RTL === 'true',
    uaePassIntegration: process.env.ENABLE_UAE_PASS_INTEGRATION === 'true',
    absherIntegration: process.env.ENABLE_ABSHER_INTEGRATION === 'true',
  },
};

export default config;
