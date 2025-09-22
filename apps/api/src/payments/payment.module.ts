import { forwardRef, Module } from '@nestjs/common';
import { PaymentService as PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AssetModule } from 'src/currencies/currency.module';
import { NetworksModule } from 'src/networks/networks.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { AlchemyModule } from 'src/alchemy/alchemy.module';

@Module({
  imports: [
    PrismaModule,
    AssetModule,
    NetworksModule,
    forwardRef(() => WalletModule),
    AlchemyModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentsModule {}
