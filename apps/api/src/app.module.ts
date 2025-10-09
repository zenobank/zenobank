import { Module } from '@nestjs/common';
import { WalletModule } from './wallets/wallet.module';
import { ConfigModule } from '@nestjs/config';
import { Env, getEnv, validateEnvConfig } from './lib/utils/env';
import { PrismaModule } from './prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { TransactionsModule } from './transactions/transactions.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { AlchemyModule } from './integrations/alchemy/alchemy.module';
import { NetworksModule } from './networks/networks.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { SvixModule } from './webhooks/svix.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StoresModule } from './stores/stores.module';
import { CheckoutsModule } from './checkouts/checkouts.module';
import { BinancePayModule } from './integrations/binance-pay/binance-pay.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConversionsModule } from './conversions/conversions.module';
import { HealthModule } from './health/health.module';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { APP_FILTER } from '@nestjs/core';
@Module({
  imports: [
    SentryModule.forRoot(),
    AlchemyModule,
    WalletModule,
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validate: validateEnvConfig,
    }),
    PrismaModule,
    // BullModule.forRootAsync({
    //   imports: [],
    //   inject: [],
    //   useFactory: () => {
    //     return {
    //       connection: { url: getEnv(Env.REDIS_QUEUE_URL) },
    //     };
    //   },
    // }),
    TransactionsModule,
    BlockchainModule,
    AlchemyModule,
    NetworksModule,
    WebhooksModule,
    SvixModule,
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    StoresModule,
    CheckoutsModule,
    BinancePayModule,
    ConversionsModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER, // sentry provider needs to be the first provider
      useClass: SentryGlobalFilter,
    },
  ],
})
export class AppModule {}
