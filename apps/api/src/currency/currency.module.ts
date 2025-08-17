import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenGasService } from './tokens-gas.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [TokenService, TokenGasService],
  exports: [TokenService, TokenGasService],
  imports: [PrismaModule],
})
export class CurrencyModule {}
