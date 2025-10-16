import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { ApiHeader, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { RegisterExternalWalletDto } from './dto/register-external-wallet-request.dto';
import { ApiKeyGuard } from 'src/auth/api-key.guard';
import { API_KEY_HEADER } from 'src/auth/auth.constants';
import { Pay as BinancePay } from '@binance/pay';
import { ConfigService } from '@nestjs/config';
import { ms } from 'src/lib/utils/ms';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('wallets')
export class WalletsController {
  constructor(
    private readonly walletService: WalletsService,
    private readonly configService: ConfigService,
    private readonly db: PrismaService,
  ) {}

  @Get('test')
  async test() {
    const allTokens = await this.db.onchainToken.findFirst({
      where: {
        address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
      },
    });
    console.log(allTokens);
    return allTokens;
  }

  @UseGuards(ApiKeyGuard)
  @ApiSecurity(API_KEY_HEADER)
  @ApiHeader({
    name: API_KEY_HEADER,
    description: 'External API Key',
    required: true,
  })
  @Post('external')
  @ApiOperation({
    summary: 'Register an external wallet for a store.',
    description:
      'An Externall wallet is an non-custodial wallet. Address must be an EVM address.',
  })
  async registerExternalWallet(
    @Body() registerExternalWalletDto: RegisterExternalWalletDto,
    @Headers(API_KEY_HEADER) apiKey: string,
  ) {
    return this.walletService.registerExternalEvmWallet({
      apiKey,
      _address: registerExternalWalletDto.address,
    });
  }
}
