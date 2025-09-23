import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { BullModule } from '@nestjs/bullmq';
import { TX_CONFIRMATION_QUEUE_NAME } from './lib/transactions.constants';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TransactionsProcessor } from './transaction-processor.worker';
import { AssetModule } from 'src/currencies/currency.module';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { TransactionsController } from './transactions.controller';

@Module({
  imports: [
    AssetModule,
    BlockchainModule,
    BullModule.registerQueue({
      name: TX_CONFIRMATION_QUEUE_NAME,
    }),

    PrismaModule,
  ],
  providers: [TransactionsService, TransactionsProcessor],
  controllers: [TransactionsController],
})
export class TransactionsModule {}
