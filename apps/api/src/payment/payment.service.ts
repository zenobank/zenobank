import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomUUID } from 'crypto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { UpdateDepositSelectionDto } from './dto/update-payment-selection.dto';
import { TokenService } from 'src/currencies/token/token.service';
import { NetworksService } from 'src/networks/networks.service';
import { WalletService } from 'src/wallet/services/wallet.service';
import ms from 'src/lib/utils/ms';
import { AlchemyService } from 'src/alchemy/alchemy.service';
import { NetworkId, PaymentStatus } from '@prisma/client';
import { Convert } from 'easy-currencies';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PaymentService {
  constructor(
    private readonly db: PrismaService,
    private readonly tokenService: TokenService,
    private readonly networksService: NetworksService,
    private readonly walletService: WalletService,
    private readonly alchemyService: AlchemyService,
  ) {}
  async createPayment(
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    const { amount, currency } = createPaymentDto;
    const payment = await this.db.payment.create({
      data: {
        fiatAmount: new Decimal(amount),
        fiatCurrency: currency,
        notifyUrl: 'https://example.com/notify',
        orderId: randomUUID(),
        expiredAt: new Date(Date.now() + ms('1h')),
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

    const [token, network, currentDepositDetails] = await Promise.all([
      this.tokenService.getToken(newTokenId),
      this.networksService.getNetwork(newNetworkId),
      this.db.payment.findUnique({
        where: { id: paymentId },
      }),
    ]);
    if (!token) {
      throw new NotFoundException('Token not found');
    }
    if (!network) {
      throw new NotFoundException('Network not found');
    }

    if (!currentDepositDetails) {
      throw new NotFoundException('Payment not found');
    }
    if (
      currentDepositDetails.depositWalletId !== null ||
      currentDepositDetails.networkId !== null ||
      currentDepositDetails.tokenId !== null
    ) {
      throw new BadRequestException(
        'Can not change deposit details, please create a new payment',
      );
    }
    if (currentDepositDetails.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(
        'Can not change deposit details, payment is not pending',
      );
    }

    const depositWallet = await this.walletService.createWallet({
      networkId: network.id,
      label: `deposit-${paymentId}`,
    });

    await this.alchemyService.suscribeAddressToWebhook({
      address: depositWallet.address,
      network: network.id,
    });

    // we only support usd stablecoins. So we convert the amount to usd and we always assume that 1 USD = 1 stable coin (USDT, USDC, etc.)
    let tokenAmount = currentDepositDetails.fiatAmount;
    if (currentDepositDetails.fiatCurrency !== 'USD') {
      const convertedAmount = await Convert(+currentDepositDetails.fiatAmount)
        .from(currentDepositDetails.fiatCurrency)
        .to('USD');
      tokenAmount = new Decimal(convertedAmount);
    }
    if (tokenAmount.lte(0)) {
      throw new InternalServerErrorException('Conversion failed');
    }

    const updated = await this.db.payment.update({
      where: { id: paymentId },
      data: {
        tokenId: token.id,
        networkId: network.id,
        tokenAmount: await this.generateUniqueTokenAmount(
          tokenAmount,
          token.id,
          network.id,
        ),
        depositWalletId: depositWallet.id,
      },
      include: { depositWallet: true },
    });

    return PaymentResponseDto.fromPrisma({
      ...updated,
      depositWalletAddress: depositWallet.address,
    });
  }

  private async generateUniqueTokenAmount(
    baseAmount: Decimal,
    tokenId: string,
    networkId: NetworkId,
    maxRetries = 20,
  ): Promise<Decimal> {
    const MIN_SUFFIX = 0.000001;
    const MAX_SUFFIX = 0.000999;

    for (let i = 0; i < maxRetries; i++) {
      const randomSuffix =
        MIN_SUFFIX + Math.random() * (MAX_SUFFIX - MIN_SUFFIX);

      const candidate = baseAmount.add(new Decimal(randomSuffix.toFixed(6)));

      const exists = await this.db.payment.findFirst({
        where: {
          tokenId,
          networkId,
          tokenAmount: candidate,
          status: { in: [PaymentStatus.PENDING, PaymentStatus.UNDER_PAYMENT] },
        },
        select: { id: true },
      });

      if (!exists) {
        return candidate;
      }
    }

    throw new Error(
      'Could not generate a unique token amount (max retries reached)',
    );
  }
}
