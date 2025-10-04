import { Module } from '@nestjs/common';
import { TokensService } from './token/tokens.service';
import { TokenGasService } from './token/tokens-gas.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TokensController } from './tokens.controller';

@Module({
  providers: [TokensService, TokenGasService],
  exports: [TokensService, TokenGasService],
  imports: [PrismaModule],
  controllers: [TokensController],
})
export class TokensModule {}
