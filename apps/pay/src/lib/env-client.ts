import { z } from 'zod';

const envClientSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
  NEXT_PUBLIC_MAIN_DOMAIN_URL: z.string().url(),
});

export const envClient = envClientSchema.parse(process.env);
