import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';
import { verifyToken, type ClerkClient } from '@clerk/backend';
import { Env, getEnv } from 'src/lib/utils/env';
import { CLERK_CLIENT } from './auth.constants';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(CLERK_CLIENT)
    private readonly clerkClient: ClerkClient,
    private readonly db: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Check for session cookie
    const sessionToken = request.cookies?.__session;

    // Check for bearer token
    const authHeader = request.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    if (!sessionToken && !bearerToken) {
      throw new UnauthorizedException('No authentication token provided');
    }

    try {
      // Try to verify the token (either session or bearer)
      const tokenToVerify = bearerToken || sessionToken;
      const tokenPayload = await verifyToken(tokenToVerify, {
        secretKey: getEnv(Env.CLERK_SECRET_KEY),
      });
      if (!tokenPayload) {
        throw new UnauthorizedException('Invalid session');
      }

      const clerkUser = await this.clerkClient.users.getUser(tokenPayload.sub);
      // const user = await this.db.user.findUniqueOrThrow({
      //   where: {
      //     clerkUserId: tokenPayload.sub,
      //   },
      // });
      (request as any).clerkUser = clerkUser;
      // (request as any).user = user;
      return true;
    } catch (err) {
      console.error('Token verification error:', err);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
