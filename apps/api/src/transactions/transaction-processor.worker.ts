import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { TX_CONFIRMATION_QUEUE_NAME } from './lib/constants';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  hasExceededMaxWaitTime,
  hasReachedMinBlockConfirmations,
} from './lib/utils';
import { BlockchainAdapterFactory } from 'src/blockchain/adapters/blockchain-adapter.factory';
import { TxIdentifier } from './lib/types';
import { TransactionStatus } from '@prisma/client';
import ms from 'src/lib/utils/ms';
import { now } from 'src/lib/utils/now';

@Processor(TX_CONFIRMATION_QUEUE_NAME)
@Injectable()
export class TransactionsProcessor extends WorkerHost {
  private readonly logger = new Logger(TransactionsProcessor.name);
  constructor(
    private readonly db: PrismaService,
    private readonly blockchainAdapterFactory: BlockchainAdapterFactory,
    @InjectQueue(TX_CONFIRMATION_QUEUE_NAME)
    private readonly txConfirmationQueue: Queue<TxIdentifier>,
  ) {
    super();
  }

  async process(job: Job<TxIdentifier>) {
    const { hash, networkId } = job.data;

    const network = await this.db.network.findUniqueOrThrow({
      where: { id: networkId },
    });

    const blockchainAdapter =
      this.blockchainAdapterFactory.getAdapter(networkId);

    const txStatus = await blockchainAdapter.getTransactionStatus(hash);

    if (txStatus.status === 'reverted') {
      await this.db.transaction.update({
        where: { networkId_hash: { hash, networkId } },
        data: {
          status: TransactionStatus.FAILED,
        },
      });
      return;
    }

    if (txStatus.confirmations >= network.depositConfirmations) {
      await this.db.transaction.update({
        where: { networkId_hash: { hash, networkId } },
        data: {
          confirmations: txStatus.confirmations,
          confirmedAt: now(),
          status: TransactionStatus.CONFIRMED,
        },
      });
    } else {
      await this.db.transaction.update({
        where: { networkId_hash: { hash, networkId } },
        data: {
          confirmations: txStatus.confirmations,
          status: TransactionStatus.PENDING,
        },
      });

      // ver esto del delay, como funciona
      return this.txConfirmationQueue.add(
        TX_CONFIRMATION_QUEUE_NAME,
        job.data,
        {
          jobId: job.id,
          delay: ms('10s'),
        },
      );
    }
  }
}
