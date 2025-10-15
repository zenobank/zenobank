import { Injectable, Logger } from '@nestjs/common';
import { AttemptStatus, OnChainPaymentAttempt } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CheckoutsService } from './checkouts.service';

@Injectable()
export class CheckoutOnchainService {
  private readonly logger = new Logger(CheckoutOnchainService.name);

  constructor(
    private readonly db: PrismaService,
    private readonly checkoutsService: CheckoutsService,
  ) {}

  /**
   * Confirm onchain payment success. Also mark checkout as completed
   * @param onChainPaymentAttemptId - The ID of the onchain payment attempt to confirm
   */
  async confirmOnchainPaymentSuccess({
    onChainPaymentAttemptId,
  }: {
    onChainPaymentAttemptId: string;
  }) {
    const onChainPaymentAttempt = await this.db.onChainPaymentAttempt.update({
      where: { id: onChainPaymentAttemptId },
      data: { status: AttemptStatus.SUCCEEDED },
    });
    await this.checkoutsService.completeCheckout(
      onChainPaymentAttempt.checkoutId,
    );
  }

  async findOnChainPaymentAttempt({
    tokenId,
    networkId,
    depositWalletAddress,
    tokenPayAmount,
  }: {
    tokenId: string;
    networkId: string;
    depositWalletAddress: string;
    tokenPayAmount: string;
  }): Promise<OnChainPaymentAttempt | null> {
    const onChainPaymentAttempt = await this.db.onChainPaymentAttempt.findFirst(
      {
        where: {
          status: AttemptStatus.PENDING,
          networkId: networkId,
          tokenPayAmount: tokenPayAmount,
          tokenId: tokenId,
          depositWallet: {
            address: depositWalletAddress.toLowerCase(),
            networkId: networkId,
          },
        },
      },
    );

    return onChainPaymentAttempt || null;
  }
}
