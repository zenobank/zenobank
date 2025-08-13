import { Controller, Get } from '@nestjs/common';
import { WalletService } from './services/wallet.service';
import { AddressType } from 'src/lib/contants/address-type.enum';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  async getWallets() {
    return this.walletService.createWallet({
      addressType: AddressType.EVM,
      label: 'test',
      meta: {
        id: '1',
      },
    });
  }
}
