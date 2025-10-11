import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';
import { env } from 'src/lib/utils/env';

@Injectable()
export class AlchemySignatureGuard implements CanActivate {
  private readonly logger = new Logger(AlchemySignatureGuard.name);
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const ip = req.ip;
    if (!ip) {
      this.logger.error('IP is required');
      throw new UnauthorizedException('IP is required');
    }
    const ALLOWED_IPS = [
      '127.0.0.1',
      'localhost',
      '::1',
      '0:0:0:0:0:0:0:1',
      '54.236.136.17', // alchemy server 1
      '34.237.24.169', // alchemy server 2
    ];
    if (!ALLOWED_IPS.includes(ip)) {
      this.logger.error(`IP ${ip} is not allowed`);
      throw new UnauthorizedException('IP not allowed');
    }
    const sig = req.headers['x-alchemy-signature'] as string;
    const signingKey = env.ALCHEMY_AUTH_TOKEN;
    return true;
  }
}
