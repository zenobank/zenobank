import { Injectable, Logger } from '@nestjs/common';
import {
  TransactionConfirmationJob,
  TxIdentifier,
} from './lib/transactions.interface';
import { TX_CONFIRMATION_QUEUE_NAME } from './lib/transactions.constants';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from 'src/prisma/prisma.service';
import { ms } from 'src/lib/utils/ms';
import { buildTxSchedulerId } from './lib/transactions.utils';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);
  constructor(
    private readonly db: PrismaService,
    @InjectQueue(TX_CONFIRMATION_QUEUE_NAME)
    private readonly txConfirmationQueue: Queue<TransactionConfirmationJob>,
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
