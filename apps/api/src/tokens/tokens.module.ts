import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { TokenGasService } from './tokens-gas.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TokensController } from './tokens.controller';

@Module({
  providers: [TokensService, TokenGasService],
  exports: [TokensService, TokenGasService],
  imports: [PrismaModule],
  controllers: [TokensController],
})
export class TokensModule {}
