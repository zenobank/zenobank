import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiHeader, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { RegisterExternalWalletDto } from './dto/register-external-wallet-request.dto';
import { ApiKeyGuard } from 'src/auth/api-key.guard';
import { API_KEY_HEADER } from 'src/auth/auth.constants';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

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
