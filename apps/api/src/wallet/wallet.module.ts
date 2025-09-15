import { forwardRef, Module } from '@nestjs/common';
import { WalletService } from './services/wallet.service';
import { WalletFactory } from './wallet.factory';

import { WalletController } from './wallet.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AlchemyModule } from 'src/alchemy/alchemy.module';

@Module({
  imports: [PrismaModule, forwardRef(() => AlchemyModule)],
  controllers: [WalletController],
  providers: [WalletService, WalletFactory],
  exports: [WalletService],
})
export class WalletModule {}
