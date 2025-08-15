import { Module } from '@nestjs/common';
import { WalletService } from './services/wallet.service';
import { WalletFactory } from './wallet.factory';
import { QuickNodeService } from 'src/providers/quicknode/quicknode.service';
import { QuicknodeModule } from 'src/providers/quicknode/quicknode.module';
import { WalletController } from './wallet.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [QuicknodeModule, PrismaModule],
  controllers: [WalletController],
  providers: [WalletService, WalletFactory],
  exports: [WalletService],
})
export class WalletModule {}
