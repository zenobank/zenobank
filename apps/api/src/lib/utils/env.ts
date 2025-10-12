import 'dotenv/config';

import { z } from 'zod';

const envSchema = z.object({
  API_BASE_URL: z.url(),
  FRONTEND_CHECKOUT_BASE_URL: z.url(),
  DATABASE_URL: z.url(),
  ALCHEMY_AUTH_TOKEN: z.string(),
  CLERK_PUBLISHABLE_KEY: z.string(),
  CLERK_SECRET_KEY: z.string(),
  SENTRY_DSN: z.string(),
  SENTRY_AUTH_TOKEN: z.string(),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

export const env = envSchema.parse(process.env);
