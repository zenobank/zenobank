import { plainToInstance } from 'class-transformer';
import { IsString, validateSync } from 'class-validator';
import 'dotenv/config';

export class Env {
  static readonly API_BASE_URL = 'API_BASE_URL';
  @IsString()
  API_BASE_URL: string;

  static readonly QUICKNODE_API_KEY = 'QUICKNODE_API_KEY';
  @IsString()
  QUICKNODE_API_KEY: string;

  static readonly QUICKNODE_WEBHOOK_SECURITY_TOKEN =
    'QUICKNODE_WEBHOOK_SECURITY_TOKEN';
  @IsString()
  QUICKNODE_WEBHOOK_SECURITY_TOKEN: string;

  static readonly DATABASE_URL = 'DATABASE_URL';
  @IsString()
  DATABASE_URL: string;

  static readonly REDIS_QUEUE_URL = 'REDIS_QUEUE_URL';
  @IsString()
  REDIS_QUEUE_URL: string;

  static readonly GAS_TANKER_TESTING_PRIVATE_KEY =
    'GAS_TANKER_TESTING_PRIVATE_KEY';
  @IsString()
  GAS_TANKER_TESTING_PRIVATE_KEY: string;

  static readonly ALCHEMY_AUTH_TOKEN = 'ALCHEMY_AUTH_TOKEN';
  @IsString()
  ALCHEMY_AUTH_TOKEN: string;
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
