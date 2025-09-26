import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { Env } from 'src/lib/utils/env';
import { getEnv } from 'src/lib/utils/env';
import { Alchemy } from 'alchemy-sdk';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @UseGuards(AuthGuard)
  @Get('pr')
  async protectedDemoEndpoint(@Req() req: Request) {
    return {
      message: 'Hello World',
    };
  }

  @Post('')
  async registerEvmWallet(@Body() dto: CreateWalletDto) {
    const alchemy = new Alchemy({
      authToken: getEnv(Env.ALCHEMY_AUTH_TOKEN),
    });
    const webhooks = await alchemy.notify.getAllWebhooks();
    return this.walletService.registerEvmWallet(dto.address);
  }
}
