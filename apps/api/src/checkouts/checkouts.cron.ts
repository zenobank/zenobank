import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CheckoutsService } from './checkouts.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AttemptStatus, CheckoutStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class CheckoutCron {
  private readonly logger = new Logger(CheckoutCron.name);

  constructor(
    private readonly checkoutsService: CheckoutsService,
    private readonly db: PrismaService,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleCron() {
    const checkouts = await this.db.checkout.findMany({
      where: {
        status: CheckoutStatus.OPEN,
        expiresAt: { lt: new Date() },
      },
    });

    if (checkouts.length > 0) {
      this.logger.log(`Found ${checkouts.length} expired checkouts to process`);
    }

    for (const checkout of checkouts) {
      await this.checkoutsService.markCheckoutAsExpired(checkout.id);
    }
  }
}
