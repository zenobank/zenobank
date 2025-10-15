import { Module } from '@nestjs/common';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { WalletsModule } from 'src/wallets/wallets.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [StoresController],
  providers: [StoresService],
  imports: [PrismaModule, WalletsModule, AuthModule],
  exports: [StoresService],
})
export class StoresModule {}
