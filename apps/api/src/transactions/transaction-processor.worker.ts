import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { TX_CONFIRMATION_QUEUE_NAME } from './lib/transactions.constants';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { BlockchainAdapterFactory } from 'src/blockchain/adapters/blockchain-adapter.factory';
import { TxIdentifier } from './lib/transactions.interface';
import { Prisma, TransactionStatus } from '@prisma/client';
import { now } from 'src/lib/utils/now';
import { OnChainTxStatus } from 'src/blockchain/lib/types';
import { buildTxSchedulerId } from './lib/transactions.utils';

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

    await this.txConfirmationQueue.removeJobScheduler(
      buildTxSchedulerId({ networkId, hash }),
    );

    const network = await this.db.network.findUniqueOrThrow({
      where: { id: networkId },
    });

    const blockchainAdapter =
      this.blockchainAdapterFactory.getAdapter(networkId);

    const txStatus = await blockchainAdapter.getTransactionStatus(hash);

    const { stopJob, data: updateTxData } = this.buildTxUpdate(
      txStatus,
      network.depositConfirmations,
    );

    await this.db.transaction.update({
      where: { networkId_hash: { hash, networkId } },
      data: updateTxData,
    });
    if (stopJob) {
      await this.txConfirmationQueue.removeJobScheduler(
        buildTxSchedulerId({ networkId, hash }),
      );
    }
  }
  private buildTxUpdate(
    txStatus: OnChainTxStatus,
    requiredConfirmations: number,
  ): { stopJob: boolean; data: Prisma.TransactionUpdateInput } {
    if (txStatus.status === 'reverted') {
      return {
        stopJob: true,
        data: {
          status: TransactionStatus.FAILED,
        },
      };
    } else if (txStatus.confirmations >= requiredConfirmations) {
      return {
        stopJob: true,
        data: {
          confirmations: txStatus.confirmations,
          confirmedAt: now(),
          status: TransactionStatus.CONFIRMED,
        },
      };
    }
    return {
      stopJob: false,
      data: {
        confirmations: txStatus.confirmations,
        status: TransactionStatus.PENDING,
      },
    };
  }
}
