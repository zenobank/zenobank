import { Controller, Get } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { zeroAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { NetworkId } from 'src/networks/network.interface';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}
  @Get('abc')
  async test() {
    const depositAccount = privateKeyToAccount(
      '0x055af4739ccdef2a04da69d03ea5c681361ddd734c45979ab90339a8c54fd1ae',
    ); // address 0xC5E65E7F0D344125E11f7AE1597B39f97d7a7Fee

    await this.transactionsService.enqueueSweepWalletFundsJob({
      sourceWalletAddress: depositAccount.address,
      networkId: NetworkId.ETHEREUM_HOLESKY,
    });
  }
}
