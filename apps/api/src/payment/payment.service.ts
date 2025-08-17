import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomUUID } from 'crypto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { UpdateDepositSelectionDto } from './dto/update-payment-selection.dto';
import { TokenService } from 'src/currency/token.service';
import { NetworksService } from 'src/networks/networks.service';
import { WalletService } from 'src/wallet/services/wallet.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly db: PrismaService,
    private readonly tokenService: TokenService,
    private readonly networksService: NetworksService,
    private readonly walletService: WalletService,
  ) {}
  async createPayment(
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    const { amount, currency } = createPaymentDto;
    const payment = await this.db.payment.create({
      data: {
        amount,
        currency,
        notifyUrl: 'https://example.com/notify',
        orderId: randomUUID(),
        expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });
    return PaymentResponseDto.fromPrisma({
      ...payment,
      depositWalletAddress: null,
    });
  }

  async getPaymentOrThrow(id: string): Promise<PaymentResponseDto> {
    const payment = await this.getPayment(id);
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async getPayment(id: string): Promise<PaymentResponseDto | null> {
    const payment = await this.db.payment.findUnique({
      where: { id },
      include: {
        depositWallet: true,
      },
    });
    if (!payment) {
      return null;
    }
    return PaymentResponseDto.fromPrisma({
      ...payment,
      depositWalletAddress: payment.depositWallet?.address ?? null,
    });
  }

  async updatePaymentDepositSelection(
    paymentId: string,
    dto: UpdateDepositSelectionDto,
  ): Promise<PaymentResponseDto> {
    const { tokenId: newTokenId, networkId: newNetworkId } = dto;

    const [newToken, newNetwork, currentDepositDetails] = await Promise.all([
      this.tokenService.getTokenOrThrow(newTokenId),
      this.networksService.getNetworkOrThrow(newNetworkId),
      this.db.payment.findUnique({
        where: { id: paymentId },
        include: { depositWallet: true },
      }),
    ]);

    if (!currentDepositDetails)
      throw new NotFoundException('Payment not found');

    const sameChain = currentDepositDetails.networkId === newNetwork.id;

    let depositWalletId = currentDepositDetails.depositWalletId ?? null;

    if (!depositWalletId || !sameChain) {
      const wallet = await this.walletService.createDepositWallet({
        networkId: newNetwork.id,
        label: `deposit-${paymentId}`,
      });
      depositWalletId = wallet.id;
    }

    const updated = await this.db.payment.update({
      where: { id: paymentId },
      data: {
        tokenId: newToken.id,
        networkId: newNetwork.id,
        depositWalletId,
      },
      include: { depositWallet: true },
    });

    return PaymentResponseDto.fromPrisma({
      ...updated,
      depositWalletAddress: updated.depositWallet?.address ?? null,
    });
  }
}
