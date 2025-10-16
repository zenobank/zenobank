import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletFactory } from './wallets.factory';

import { WalletsController } from './wallets.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AlchemyModule } from 'src/integrations/alchemy/alchemy.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, AlchemyModule, AuthModule],
  controllers: [WalletsController],
  providers: [WalletsService, WalletFactory],
  exports: [WalletsService, WalletFactory],
})
export class WalletsModule {}
