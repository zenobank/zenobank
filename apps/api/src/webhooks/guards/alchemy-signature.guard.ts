import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';
import { getEnv, Env } from 'src/lib/utils/env';

@Injectable()
export class AlchemySignatureGuard implements CanActivate {
  private readonly logger = new Logger(AlchemySignatureGuard.name);
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();

    const sig = req.headers['x-alchemy-signature'] as string;
    const signingKey = getEnv(Env.ALCHEMY_AUTH_TOKEN);
    const raw = (req.body as Buffer).toString('utf8'); // ⚡️ porque usaste express.raw

    if (!sig) {
      this.logger.error('Missing signature');
      throw new UnauthorizedException('Missing signature');
    }

    const hmac = crypto.createHmac('sha256', signingKey);
    hmac.update(raw, 'utf8');
    const digest = hmac.digest('hex');

    if (sig !== digest) {
      this.logger.error('Invalid signature');
      throw new UnauthorizedException('Invalid signature');
    }

    return true;
  }
}
