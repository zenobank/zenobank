import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface HealthCheckResult {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  checks?: {
    database?: {
      status: 'ok' | 'error';
      responseTime?: number;
    };
  };
}

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthCheckResult> {
    const checks: HealthCheckResult['checks'] = {};

    try {
      // Check database connectivity
      const dbStartTime = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const dbResponseTime = Date.now() - dbStartTime;

      checks.database = {
        status: 'ok',
        responseTime: dbResponseTime,
      };

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks,
      };
    } catch (error) {
      checks.database = {
        status: 'error',
      };
      throw new InternalServerErrorException('Database connection failed');
    }
  }
}
