import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { BlockchainFactory } from 'src/blockchain/adapters/blockchain-adapter.factory';
import { TX_CONFIRMATION_QUEUE_NAME } from '../lib/transactions.constants';
import { TransactionConfirmationJob } from '../lib/transactions.interface';
import { Job } from 'bullmq';
import { PaymentService } from 'src/payments/payment.service';
import { NetworksService } from 'src/networks/networks.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
@Processor(TX_CONFIRMATION_QUEUE_NAME)
export class TransactionConfirmationWorker extends WorkerHost {
  private readonly logger = new Logger(TransactionConfirmationWorker.name);
  constructor(
    private readonly blockchainAdapterFactory: BlockchainFactory,
    private readonly paymentService: PaymentService,
    private readonly networksService: NetworksService,
  ) {
    super();
  }

  async process(job: Job<TransactionConfirmationJob>) {
    throw new Error('Transaction confirmation worker not implemented');
    // const { paymentId } = job.data;
    // const payment = await this.paymentService.getPayment(paymentId);
    // if (!payment) {
    //   throw new Error('Payment not found. Payment ID: ' + paymentId);
    // }

    // if (!payment.depositDetails?.networkId) {
    //   throw new Error('Payment network ID not found. Payment ID: ' + paymentId);
    // }
    // if (!payment.transactionHash) {
    //   throw new Error(
    //     'Payment transaction hash not found. Payment ID: ' + paymentId,
    //   );
    // }
    // if (payment.status !== PaymentStatus.PROCESSING) {
    //   this.logger.error(
    //     `Payment is not processing but was sent to the worker. Payment ID: ${paymentId}`,
    //     await this.paymentService.markPaymentAsCancelled(paymentId),
    //   );
    //   return;
    // }
    // const blockchain = this.blockchainAdapterFactory.getAdapter(
    //   payment.depositDetails?.networkId,
    // );

    // const txStatus = await blockchain.getTransactionStatus(
    //   payment.transactionHash,
    // );
    // const network = await this.networksService.getNetwork(
    //   payment.depositDetails.networkId,
    // );
    // if (!network) {
    //   throw new Error('network not available');
    // }
    // if (payment.confirmationAttempts >= network.maxConfirmationAttempts) {
    //   this.logger.warn(
    //     `Max confirmation attempts reached for payment ${paymentId}`,
    //   );
    //   await this.paymentService.markPaymentAsCancelled(paymentId);
    //   return;
    // }

    // if (txStatus.status !== 'success') {
    //   await this.paymentService.incrementConfirmationAttempts(paymentId);
    //   await job.moveToDelayed(Date.now() + network.confirmationRetryDelay);
    //   return;
    // }
    // if (txStatus.confirmations < network.minBlockConfirmations) {
    //   await this.paymentService.incrementConfirmationAttempts(paymentId);
    //   await job.moveToDelayed(Date.now() + network.confirmationRetryDelay);
    //   return;
    // }
    // await this.paymentService.markPaymentAsCompleted(paymentId);
  }
}
