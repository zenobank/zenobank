import { z } from 'zod'

const envSchema = z.object({
  VITE_CLERK_PUBLISHABLE_KEY: z.string(),
  VITE_API_BASE_URL: z.url(),
})

export const env = envSchema.parse(process.env)
