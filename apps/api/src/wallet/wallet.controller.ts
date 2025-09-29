import { Body, Controller, Get, Post } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiOperation } from '@nestjs/swagger';
import { RegisterExternalWalletDto } from './dto/register-external-wallet-request.dto';
import { AlchemyService } from 'src/alchemy/alchemy.service';
import { SupportedNetworksId } from 'src/networks/network.interface';

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly alchemyService: AlchemyService,
  ) {}

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

  @Get('test')
  async test() {
    const webhook = await this.alchemyService.getWebhook(
      SupportedNetworksId.ARBITRUM_MAINNET,
    );
    return webhook;
  }
}
