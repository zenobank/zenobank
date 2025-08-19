import { Module } from '@nestjs/common';
import { TokenService } from './token/token.service';
import { TokenGasService } from './token/tokens-gas.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AssetController } from './asset.controller';

@Module({
  providers: [TokenService, TokenGasService],
  exports: [TokenService, TokenGasService],
  imports: [PrismaModule],
  controllers: [AssetController],
})
export class AssetModule {}
