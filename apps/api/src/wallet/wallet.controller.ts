import { Body, Controller, Post } from '@nestjs/common';
import { WalletService } from './services/wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { Env } from 'src/lib/utils/env';
import { getEnv } from 'src/lib/utils/env';
import { Alchemy } from 'alchemy-sdk';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('')
  async registerEvmWallet(@Body() dto: CreateWalletDto) {
    const alchemy = new Alchemy({
      authToken: getEnv(Env.ALCHEMY_AUTH_TOKEN),
    });
    const webhooks = await alchemy.notify.getAllWebhooks();
    return this.walletService.registerEvmWallet(dto.address);
  }
}
