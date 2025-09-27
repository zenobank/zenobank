import { Request } from 'express';
import type { User as PrismaUser } from '@prisma/client';
import type { User as ClerkUser } from '@clerk/backend';

export interface AuthenticatedRequest extends Request {
  user: PrismaUser;
  clerkUser: ClerkUser;
}
