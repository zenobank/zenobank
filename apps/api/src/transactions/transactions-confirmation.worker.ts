import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import {
  NETWORK_CONFIRMATION_POLICIES,
  TX_CONFIRMATION_QUEUE_NAME,
} from './transactions.constants';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionStatus } from '@prisma/client';
import {
  hasExceededMaxWaitTime,
  hasReachedMinBlockConfirmations,
} from './transactions.utils';
import { BlockchainAdapterFactory } from 'src/blockchain/adapters/blockchain-adapter.factory';
import { TransactionConfirmationJobData } from './transactions.interface';

@Processor(TX_CONFIRMATION_QUEUE_NAME)
@Injectable()
export class TransactionsProcessor extends WorkerHost {
  private readonly logger = new Logger(TransactionsProcessor.name);
  constructor(
    private readonly db: PrismaService,
    private readonly blockchainAdapterFactory: BlockchainAdapterFactory,
    @InjectQueue(TX_CONFIRMATION_QUEUE_NAME)
    private readonly txQueue: Queue<TransactionConfirmationJobData>,
  ) {
    super();
  }

  async process(job: Job<TransactionConfirmationJobData>) {
    const { txHash, network, walletAddress } = job.data;

    try {
      const txInDb = await this.db.transaction.findUniqueOrThrow({
        where: { txHash },
      });
      if (txInDb.status !== TransactionStatus.PENDING) {
        this.logger.warn(
          `Transaction ${txHash} is not pending, skipping...`,
          job.data,
        );
        return;
      }

      const confirmationPolicy = NETWORK_CONFIRMATION_POLICIES[network];

      const blockchainAdapter =
        this.blockchainAdapterFactory.getAdapter(network);

      const txStatus = await blockchainAdapter.getTransactionStatus(txHash);

      if (!txStatus)
        return this.requeueJobWithDelay(job, confirmationPolicy.retryDelay);

      const isConfirmed = hasReachedMinBlockConfirmations({
        currentBlockConfirmations: txStatus.confirmations,
        minBlockConfirmations: confirmationPolicy.minBlockConfirmations,
      });
      await this.db.transaction.update({
        where: { txHash },
        data: {
          confirmations: txStatus.confirmations,
          confirmationRetryCount: txInDb.confirmationRetryCount + 1,
        },
      });

      if (isConfirmed) {
        await this.db.transaction.update({
          where: { txHash },
          data: {
            status: TransactionStatus.CONFIRMED,
          },
        });
        return;
      }

      const isExpired = hasExceededMaxWaitTime({
        createdAt: txInDb.createdAt,
        maxWaitTimeMs: confirmationPolicy.maxWaitTime,
      });

      if (isExpired) {
        await this.db.transaction.update({
          where: { txHash },
          data: {
            status: TransactionStatus.FAILED,
            errorMessage: 'Max wait time exceeded',
          },
        });
        return;
      }

      return this.requeueJobWithDelay(job, confirmationPolicy.retryDelay);
    } catch (error) {
      this.logger.error(error);
      await this.db.transaction.update({
        where: { txHash },
        data: {
          status: TransactionStatus.FAILED,
          errorMessage: error.message,
        },
      });
      throw error;
    }
  }

  private async requeueJobWithDelay(
    job: Job<TransactionConfirmationJobData>,
    delay: number,
  ) {
    await this.txQueue.add(TX_CONFIRMATION_QUEUE_NAME, job.data, {
      jobId: job.id,
      delay,
      removeOnComplete: true,
      removeOnFail: true,
    });
    await job.remove();
  }
}
