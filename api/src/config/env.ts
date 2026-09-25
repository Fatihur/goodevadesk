import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().min(1).default('postgresql://goodevadesk:goodevadesk@localhost:5432/goodevadesk?schema=public'),
  REDIS_HOST: z.string().min(1).default('localhost'),
  REDIS_PORT: z.coerce.number().int().min(1).max(65535).default(6379),
  REDIS_PASSWORD: z.string().default(''),
  AI_PROVIDER: z.string().min(1).default('custom'),
  AI_BASE_URL: z.string().default(''),
  AI_API_KEY: z.string().default(''),
  AI_MODEL: z.string().default(''),
  LLM_TIMEOUT_MS: z.coerce.number().int().min(100).max(120000).default(10000),
  CACHE_TTL_SECONDS: z.coerce.number().int().min(1).default(2592000),
  CACHE_VERSION: z.string().min(1).default('v1'),
  SESSION_SECRET: z.string().min(1).default('change-me-in-development'),
  SESSION_TTL_SECONDS: z.coerce.number().int().min(300).default(604800),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:5173'),
  BODY_LIMIT: z.string().min(1).default('100kb'),
  RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(60),
}).passthrough();

export function validateEnv(input: Record<string, unknown>) {
  const env = envSchema.parse(input);
  if (env.NODE_ENV === 'production') {
    if (env.SESSION_SECRET === 'change-me-in-development' || env.SESSION_SECRET.length < 32) {
      throw new Error('SESSION_SECRET must be a unique value with at least 32 characters in production');
    }
    if (!env.REDIS_PASSWORD) throw new Error('REDIS_PASSWORD is required in production');
  }
  return env;
}
