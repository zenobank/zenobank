import { Cron, CronExpression } from '@nestjs/schedule';
import { CheckoutsService } from './checkouts.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AttemptStatus, CheckoutStatus, PaymentStatus } from '@prisma/client';

export class CheckoutCron {
  constructor(
    private readonly checkoutsService: CheckoutsService,
    private readonly db: PrismaService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    const checkouts = await this.db.checkout.findMany({
      where: {
        status: CheckoutStatus.OPEN,
        expiresAt: { lt: new Date() },
      },
    });
    for (const checkout of checkouts) {
      await this.db.checkout.update({
        where: { id: checkout.id },
        data: {
          status: CheckoutStatus.EXPIRED,
        },
      });
    }
  }
}
