import { z } from 'zod';

const envServerSchema = z.object({
  // API_URL: z.string().url(),
});

export const envServer = envServerSchema.parse(process.env);
