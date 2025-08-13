import { Module } from '@nestjs/common';
import { WalletService } from './services/wallet.service';
import { WalletFactory } from './wallet.factory';
import { QuickNodeService } from 'src/providers/quicknode/quicknode.service';
import { QuicknodeModule } from 'src/providers/quicknode/quicknode.module';
import { WalletController } from './wallet.controller';

@Module({
  imports: [QuicknodeModule],
  controllers: [WalletController],
  providers: [WalletService, WalletFactory],
  exports: [WalletService],
})
export class WalletModule {}
