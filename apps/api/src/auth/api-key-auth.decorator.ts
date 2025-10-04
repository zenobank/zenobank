// decorators/api-key-auth.decorator.ts
import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiSecurity } from '@nestjs/swagger';
import { API_KEY_HEADER } from './auth.constants';
import { ApiKeyGuard } from './api-key.guard';

export function ApiKeyAuth(
  headerName: string = API_KEY_HEADER,
  description = 'External API Key',
): ClassDecorator & MethodDecorator {
  return applyDecorators(
    UseGuards(ApiKeyGuard),
    ApiSecurity(headerName),
    ApiHeader({ name: headerName, description, required: true }),
  );
}
