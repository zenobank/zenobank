import { Injectable } from '@nestjs/common';
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
    const startTime = Date.now();
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

      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks,
      };
    }
  }

  async ready(): Promise<HealthCheckResult> {
    // Readiness check - verify that the service can accept traffic
    // This could include checking database connections, external services, etc.
    return this.check();
  }

  async live(): Promise<HealthCheckResult> {
    // Liveness check - verify that the service is running
    // This is a basic check that doesn't depend on external services
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
