import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsString, IsUrl, validateSync } from 'class-validator';
import 'dotenv/config';

export class Env {
  static readonly API_URL = 'API_URL';
  @IsString()
  API_URL: string;

  static readonly PAYMENT_FRONTEND_BASE_URL = 'PAYMENT_FRONTEND_BASE_URL';
  @IsString()
  PAYMENT_FRONTEND_BASE_URL: string;

  static readonly DATABASE_URL = 'DATABASE_URL';
  @IsString()
  DATABASE_URL: string;

  // static readonly REDIS_QUEUE_URL = 'REDIS_QUEUE_URL';
  // @IsString()
  // REDIS_QUEUE_URL: string;

  static readonly ALCHEMY_AUTH_TOKEN = 'ALCHEMY_AUTH_TOKEN';
  @IsString()
  ALCHEMY_AUTH_TOKEN: string;

  static readonly CLERK_PUBLISHABLE_KEY = 'CLERK_PUBLISHABLE_KEY';
  @IsString()
  CLERK_PUBLISHABLE_KEY: string;

  static readonly CLERK_SECRET_KEY = 'CLERK_SECRET_KEY';
  @IsString()
  CLERK_SECRET_KEY: string;

  static readonly SENTRY_DSN = 'SENTRY_DSN';
  @IsString()
  SENTRY_DSN: string;

  static readonly SENTRY_AUTH_TOKEN = 'SENTRY_AUTH_TOKEN';
  @IsString()
  SENTRY_AUTH_TOKEN: string;
}

export function validateEnvConfig(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(Env, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}

export function isEnvSet(key: keyof typeof Env): boolean {
  return process.env[key] !== undefined;
}

export function getEnv(key: keyof typeof Env): string {
  const value = process.env[key];
  if (value === undefined) {
    throw new Error(`Missing env variable: ${Env[key]}`);
  }
  return value;
}
