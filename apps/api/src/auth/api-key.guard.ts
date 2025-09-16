// src/auth/api-key.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private db: PrismaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const apiKey = req.header('x-api-key');
    if (!apiKey) throw new UnauthorizedException('API key missing');

    const store = await this.db.store.findUnique({
      where: { apiKey },
    });
    if (!store) throw new UnauthorizedException('Invalid API key');

    return true;
  }
}
