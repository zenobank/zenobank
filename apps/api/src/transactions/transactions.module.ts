import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { BullModule } from '@nestjs/bullmq';
import { TX_CONFIRMATION_QUEUE_NAME } from './lib/transactions.constants';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TokensModule } from 'src/currencies/tokens.module';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { TransactionsController } from './transactions.controller';

@Module({
  imports: [TokensModule, BlockchainModule, PrismaModule],
  providers: [TransactionsService],
  controllers: [TransactionsController],
})
export class TransactionsModule {}
