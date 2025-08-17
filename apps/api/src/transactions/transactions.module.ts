import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { BullModule } from '@nestjs/bullmq';
import {
  SWEEP_WALLET_FUNDS_QUEUE_NAME,
  TX_CONFIRMATION_QUEUE_NAME,
} from './transactions.constants';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TransactionsProcessor } from './transactions-confirmation.worker';
import { CurrencyModule } from 'src/currency/currency.module';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { TransactionsController } from './transactions.controller';

@Module({
  imports: [
    CurrencyModule,
    BlockchainModule,
    BullModule.registerQueue({
      name: TX_CONFIRMATION_QUEUE_NAME,
    }),
    BullModule.registerQueue({
      name: SWEEP_WALLET_FUNDS_QUEUE_NAME,
    }),

    PrismaModule,
  ],
  providers: [TransactionsService, TransactionsProcessor],
  controllers: [TransactionsController],
})
export class TransactionsModule {}
