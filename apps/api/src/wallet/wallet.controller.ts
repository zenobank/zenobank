import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { RegisterExternalWalletDto } from './dto/register-external-wallet-request.dto';
import { ApiKeyGuard } from 'src/auth/api-key.guard';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @UseGuards(ApiKeyGuard)
  @ApiSecurity('api-key')
  @Post('external')
  @ApiOperation({ summary: 'Register an external wallet for a store' })
  async registerExternalWallet(
    @Body() registerExternalWalletDto: RegisterExternalWalletDto,
  ) {
    return this.walletService.registerExternalEvmWallet({
      _address: registerExternalWalletDto.address,
      storeId: registerExternalWalletDto.storeId,
    });
  }
}
