import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestModule } from './test/test.module';
import { QuicknodeModule } from './providers/quicknode/quicknode.module';
import { WalletModule } from './wallet/wallet.module';
import { ConfigModule } from '@nestjs/config';
import { Env, getEnv, validateEnvConfig } from './lib/utils/env';
import { PrismaModule } from './prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { TransactionsModule } from './transactions/transactions.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { PaymentsController } from './payments/payments.controller';
import { PaymentsModule } from './payments/payments.module';
import { AlchemyController } from './providers/alchemy/alchemy.controller';
import { AlchemyModule } from './providers/alchemy/alchemy.module';

@Module({
  imports: [
    TestModule,
    QuicknodeModule,
    WalletModule,
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validate: validateEnvConfig,
    }),
    PrismaModule,
    BullModule.forRootAsync({
      imports: [],
      inject: [],
      useFactory: () => {
        return {
          connection: { url: getEnv(Env.REDIS_QUEUE_URL) },
        };
      },
    }),
    TransactionsModule,
    BlockchainModule,
    PaymentsModule,
    AlchemyModule,
  ],
  controllers: [AppController, PaymentsController, AlchemyController],
  providers: [AppService],
})
export class AppModule {}
