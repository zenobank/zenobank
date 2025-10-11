import 'dotenv/config';

import { z } from 'zod';

const envSchema = z.object({
  API_URL: z.url(),
  PAYMENT_FRONTEND_BASE_URL: z.url(),
  DATABASE_URL: z.url(),
  ALCHEMY_AUTH_TOKEN: z.string(),
  CLERK_PUBLISHABLE_KEY: z.string(),
  CLERK_SECRET_KEY: z.string(),
  SENTRY_DSN: z.string(),
  SENTRY_AUTH_TOKEN: z.string(),
  NODE_ENV: z.enum(['development', 'production']),
});

export const env = envSchema.parse(process.env);
