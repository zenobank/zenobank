import { Injectable, Logger } from '@nestjs/common';
import {
  SweepWalletFundsJobData,
  TransactionRecordInput,
  TxIdentifier,
} from './lib/transactions.interface';
import { TokenService } from 'src/currencies/token/token.service';
import { TokenGasService } from 'src/currencies/token/tokens-gas.service';
import { isNativeToken, nativeTokenAddress } from 'src/currencies/lib/utils';
import { privateKeyToAccount } from 'viem/accounts';
import { client, walletClient } from 'src/lib/utils/client';
import { erc20Abi } from 'viem';
import { Env, getEnv } from 'src/lib/utils/env';
import { TX_CONFIRMATION_QUEUE_NAME } from './lib/transactions.constants';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { plainToInstance } from 'class-transformer';
import { ms } from 'src/lib/utils/ms';
import { buildTxSchedulerId } from './lib/transactions.utils';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);
  constructor(
    private tokensService: TokenService,
    private tokenGasService: TokenGasService,
    private readonly db: PrismaService,
    @InjectQueue(TX_CONFIRMATION_QUEUE_NAME)
    private readonly txConfirmationQueue: Queue<TxIdentifier>,
  ) {}

  /**
   * Requires the transaction to already exist in DB.
   */
  async enqueueTransactionForConfirmation({ hash, networkId }: TxIdentifier) {
    const tx = await this.db.transaction.findUniqueOrThrow({
      where: {
        networkId_hash: {
          networkId: networkId,
          hash,
        },
      },
    });
    await this.txConfirmationQueue.upsertJobScheduler(
      buildTxSchedulerId({ networkId, hash }),
      {
        every: ms('5s'),
        // max limit = 1h (720 tries)
        limit: ms('1h') / ms('5s'),
      },
      {
        data: {
          hash,
          networkId,
        },
      },
    );
  }
}
