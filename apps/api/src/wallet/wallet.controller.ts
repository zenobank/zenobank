import { Controller, Get, Post } from '@nestjs/common';
import { WalletService } from './services/wallet.service';
import { NetworkId } from '@prisma/client';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  async getWallets() {
    return this.walletService.createWallet({
      networkId: NetworkId.ARBITRUM_MAINNET,
      label: 'test',
    });
  }

  @Post('create-webhook/')
  async createWebhook() {
    const wallet = await this.walletService.createWallet({
      networkId: NetworkId.ARBITRUM_MAINNET,
      label: 'test',
    });
    console.log('wallet created', wallet.address);
    return this.walletService.registerWalletInWebhooks({
      address: wallet.address,
      networkId: NetworkId.ARBITRUM_MAINNET,
    });
  }
}
