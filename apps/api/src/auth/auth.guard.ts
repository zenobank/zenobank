import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { verifyToken } from '@clerk/backend';
import { Env, getEnv } from 'src/lib/utils/env';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Check for session cookie
    const sessionToken = request.cookies?.__session;
    console.log('requestcookies', request.cookies);

    // Check for bearer token
    const authHeader = request.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    if (!sessionToken && !bearerToken) {
      this.logger.error('No authentication token provided');
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

      (request as any).userId = tokenPayload.sub;
      return true;
    } catch (err) {
      this.logger.error('Token verification error:', err);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
