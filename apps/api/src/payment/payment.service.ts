import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomUUID } from 'crypto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { UpdatePaymentSelectionDto } from './dto/update-payment-selection.dto';
import { TokenService } from 'src/currency/token.service';
import { NetworksService } from 'src/networks/networks.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly db: PrismaService,
    private readonly tokenService: TokenService,
    private readonly networksService: NetworksService,
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

  async updatePaymentSelection(
    paymentId: string,
    dto: UpdatePaymentSelectionDto,
  ): Promise<PaymentResponseDto> {
    const { tokenId, networkId } = dto;

    if (!(await this.getPayment(paymentId))) {
      throw new NotFoundException('Payment not found');
    }

    const [token, network] = await Promise.all([
      this.tokenService.getToken(tokenId),
      this.networksService.getNetwork(networkId),
    ]);

    if (!token) throw new NotFoundException('Token not found');
    if (!network) throw new NotFoundException('Network not found');

    const payment = await this.db.payment.update({
      where: { id: paymentId },
      data: {
        tokenId: token.id,
        networkId: network.id,
      },
      include: {
        depositWallet: true,
      },
    });
    return PaymentResponseDto.fromPrisma({
      ...payment,
      depositWalletAddress: payment.depositWallet?.address ?? null,
    });
  }
}
