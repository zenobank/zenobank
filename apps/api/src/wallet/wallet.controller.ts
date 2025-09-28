import { Body, Controller, Post } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiOperation } from '@nestjs/swagger';
import { RegisterExternalWalletDto } from './dto/register-external-wallet-request.dto';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

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
