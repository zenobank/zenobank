import { Module } from '@nestjs/common';
import { WalletModule } from './wallets/wallet.module';
import { ConfigModule } from '@nestjs/config';
import { Env, getEnv, validateEnvConfig } from './lib/utils/env';
import { PrismaModule } from './prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { TransactionsModule } from './transactions/transactions.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { PaymentsModule } from './payments/payment.module';
import { AlchemyModule } from './providers/alchemy/alchemy.module';
import { NetworksModule } from './networks/networks.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { SvixModule } from './webhooks/svix.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StoresModule } from './stores/stores.module';
import { CheckoutsModule } from './checkouts/checkouts.module';

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
    AuthModule,
    StoresModule,
    CheckoutsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
