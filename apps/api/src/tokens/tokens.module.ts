import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { TokenGasService } from './tokens-gas.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [TokensService, TokenGasService],
  exports: [TokensService, TokenGasService],
  imports: [PrismaModule],
})
export class TokensModule {}
