import { Module } from '@nestjs/common';
import { TokenService } from './token/token.service';
import { TokenGasService } from './token/tokens-gas.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CurrenciesController } from './currency.controller';

@Module({
  providers: [TokenService, TokenGasService],
  exports: [TokenService, TokenGasService],
  imports: [PrismaModule],
  controllers: [CurrenciesController],
})
export class AssetModule {}
