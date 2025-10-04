import { Module } from '@nestjs/common';
import { PaymentService as PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TokensModule } from 'src/currencies/tokens.module';
import { NetworksModule } from 'src/networks/networks.module';

@Module({
  imports: [PrismaModule, TokensModule, NetworksModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentsModule {}
