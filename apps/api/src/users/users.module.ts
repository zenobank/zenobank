import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { WalletModule } from 'src/wallet/wallet.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  imports: [WalletModule, PrismaModule],
})
export class UsersModule {}
