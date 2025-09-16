// src/auth/api-key.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

function readApiKey(req: Request): string | null {
  const h = req.header('x-api-key') ?? req.header('authorization');
  if (!h) return null;
  return h.startsWith('ApiKey ') ? h.slice(7).trim() : h.trim();
}

export const ApiKey = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | null => {
    const req = ctx.switchToHttp().getRequest<Request>();
    return readApiKey(req);
  },
);
