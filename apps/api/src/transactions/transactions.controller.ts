import { Controller, Get } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { zeroAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { SupportedNetworksId } from '@repo/networks/types';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}
}
