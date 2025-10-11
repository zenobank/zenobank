import { Module } from '@nestjs/common';
import { CheckoutsService } from './checkouts.service';
import { CheckoutsController } from './checkouts.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StoresModule } from 'src/stores/stores.module';
import { TokensModule } from 'src/tokens/tokens.module';
import { AttemptsModule } from './attempts/attempts.module';
import { CheckoutCron } from './checkout.cron';
import { WalletModule } from 'src/wallets/wallet.module';

@Module({
  imports: [
    PrismaModule,
    StoresModule,
    TokensModule,
    AttemptsModule,
    WalletModule,
  ],
  providers: [CheckoutsService, CheckoutCron],
  controllers: [CheckoutsController],
  exports: [CheckoutsService],
})
export class CheckoutsModule {}
