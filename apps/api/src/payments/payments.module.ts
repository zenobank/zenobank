import { Module } from '@nestjs/common';
import { PaymentsService as PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CurrencyModule } from 'src/currencies/currency.module';
import { NetworksModule } from 'src/networks/networks.module';

@Module({
  imports: [PrismaModule, CurrencyModule, NetworksModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
