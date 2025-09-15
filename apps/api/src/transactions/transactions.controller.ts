import { Controller, Get } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { zeroAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { NetworkId } from 'src/networks/network.interface';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}
}
