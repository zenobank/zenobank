import { Module } from '@nestjs/common';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [StoresController],
  providers: [StoresService],
  imports: [PrismaModule, WalletModule, AuthModule],
})
export class StoresModule {}
