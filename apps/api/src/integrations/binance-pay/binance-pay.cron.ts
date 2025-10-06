import { BinancePayService } from './binance-pay.service';
import { CronExpression } from '@nestjs/schedule';
import { Cron } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';
import { AttemptStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Pay as BinancePay } from '@binance/pay';
import { ms } from 'src/lib/utils/ms';
@Injectable()
export class BinanceCron {
  constructor(
    private readonly binanceService: BinancePayService,
    private readonly db: PrismaService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    const attempts = await this.db.binancePayPaymentAttempt.findMany({
      where: {
        status: AttemptStatus.PENDING,
      },
      select: {
        checkout: {
          select: {
            store: {
              include: {
                binancePayCredential: {
                  select: {
                    apiKey: true,
                    apiSecret: true,
                    accountId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // group by binancePayCredential
    // agrupar por api key
    for (const attempt of attempts) {
      const { binancePayCredential } = attempt.checkout.store;
      if (!binancePayCredential) {
        continue;
      }
      const { apiKey, apiSecret, accountId } = binancePayCredential;

      const binancePayClient = new BinancePay({
        configurationRestAPI: {
          apiKey: apiKey,
          apiSecret: apiSecret,
        },
      });
      const tradeHistory = await binancePayClient.restAPI.getPayTradeHistory({
        recvWindow: ms('1m'),
        startTime: new Date(Date.now() - ms('10m')).getTime(),
        limit: 100,
      });
      const { data } = await tradeHistory.data();
      for (const trade of data || []) {
        console.log(trade);
      }
    }
  }
}
