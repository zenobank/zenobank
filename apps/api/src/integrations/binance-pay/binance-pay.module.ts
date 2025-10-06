import { Module } from '@nestjs/common';
import { BinancePayService } from './binance-pay.service';
import { BinanceCron } from './binance-pay.cron';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BinancePayService, BinanceCron],
})
export class BinancePayModule {}
