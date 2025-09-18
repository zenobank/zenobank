import { Module } from '@nestjs/common';

import { WalletModule } from './wallet/wallet.module';
import { ConfigModule } from '@nestjs/config';
import { Env, getEnv, validateEnvConfig } from './lib/utils/env';
import { PrismaModule } from './prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { TransactionsModule } from './transactions/transactions.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { PaymentController } from './payment/payment.controller';
import { PaymentsModule } from './payment/payment.module';
import { AlchemyModule } from './alchemy/alchemy.module';
import { NetworksModule } from './networks/networks.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { SVIX_CLIENT } from './webhooks/webhooks.constants';
import { Svix } from 'svix';
import { SvixModule } from './webhooks/svix.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    AlchemyModule,
    PaymentsModule,
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
    AlchemyModule,
    PaymentsModule,
    NetworksModule,
    WebhooksModule,
    SvixModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
