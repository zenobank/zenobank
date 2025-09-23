import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { BlockchainAdapterFactory } from 'src/blockchain/adapters/blockchain-adapter.factory';
import { PrismaService } from 'src/prisma/prisma.service';
import { TX_CONFIRMATION_QUEUE_NAME } from '../lib/transactions.constants';
import { TxIdentifier } from '../lib/transactions.interface';
import { Job } from 'bullmq';

@Injectable()
@Processor(TX_CONFIRMATION_QUEUE_NAME)
export class TransactionConfirmationProcessor extends WorkerHost {
  constructor(
    private readonly db: PrismaService,
    private readonly blockchainAdapterFactory: BlockchainAdapterFactory,
  ) {
    super();
  }

  async process(job: Job<TxIdentifier>) {
    const { hash, networkId } = job.data;
  }
}
