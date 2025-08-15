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
    return this.walletService.registerWalletInWebhooks({
      address: '0x1234567890123456789012345678901234567890',
      networkId: NetworkId.ARBITRUM_MAINNET,
      privateKey: '0x1234567890123456789012345678901234567890',
      label: 'test',
      createdAt: new Date(),
      updatedAt: new Date(),
      paymentRequestId: null,
      id: '123',
    });
  }
}
