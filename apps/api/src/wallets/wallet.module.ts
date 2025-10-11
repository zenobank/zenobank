import { Module } from '@nestjs/common';
import { WalletsService } from './wallet.service';
import { WalletFactory } from './wallet.factory';

import { WalletController } from './wallet.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AlchemyModule } from 'src/integrations/alchemy/alchemy.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, AlchemyModule, AuthModule],
  controllers: [WalletController],
  providers: [WalletsService, WalletFactory],
  exports: [WalletsService, WalletFactory],
})
export class WalletModule {}
