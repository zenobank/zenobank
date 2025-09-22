import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomUUID } from 'crypto';
import {
  DepositDetailsDto,
  PaymentResponseDto,
} from './dto/payment-response.dto';
import { UpdateDepositSelectionDto } from './dto/update-payment-selection.dto';
import { TokenService } from 'src/currencies/token/token.service';
import { NetworksService } from 'src/networks/networks.service';
import { WalletService } from 'src/wallet/services/wallet.service';
import { ms } from 'src/lib/utils/ms';
import { AlchemyService } from 'src/alchemy/alchemy.service';
import { Payment, PaymentStatus } from '@prisma/client';
import { NetworkId } from 'src/networks/network.interface';
import { Convert } from 'easy-currencies';
import { toBN } from 'src/lib/utils/numbers';
import { isISO4217CurrencyCode, IsISO4217CurrencyCode } from 'class-validator';
import { toDto } from 'src/lib/utils/to-dto';
import { getPaymentUrl } from './lib/utils';
import { plainToInstance } from 'class-transformer';
import axios from 'axios';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  constructor(
    private readonly db: PrismaService,
    private readonly tokenService: TokenService,
    private readonly networksService: NetworksService,

    @Inject(forwardRef(() => AlchemyService))
    private readonly alchemyService: AlchemyService,
  ) {}

  async createPayment(
    createPaymentDto: CreatePaymentDto,
    apiKey: string,
  ): Promise<PaymentResponseDto> {
    const { priceAmount, priceCurrency } = createPaymentDto;
    const store = await this.db.store.findUniqueOrThrow({
      where: { apiKey },
    });
    const payment = await this.db.payment.create({
      data: {
        priceAmount,
        priceCurrency,
        webhookUrl: createPaymentDto.webhookUrl,
        successUrl: createPaymentDto.successUrl,
        orderId: createPaymentDto.orderId ?? randomUUID(),
        verificationToken: createPaymentDto.verificationToken ?? randomUUID(),
        expiredAt: new Date(Date.now() + ms('1h')),
        storeId: store.id,
      },
    });
    this.logger.log(`Created payment ${payment.id}`);
    return toDto(PaymentResponseDto, {
      ...payment,
      paymentUrl: getPaymentUrl(payment.id),
      depositDetails: null,
    });
  }

  async getPaymentOrThrow(id: string): Promise<PaymentResponseDto> {
    const payment = await this.getPayment(id);
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }
  async markPaymentAsCompleted(id: string): Promise<PaymentResponseDto> {
    await this.db.payment.update({
      where: { id },
      data: { status: PaymentStatus.COMPLETED, paidAt: new Date() },
    });
    this.logger.log(`Marked payment ${id} as completed`);

    const completedPayment = await this.getPayment(id);
    if (!completedPayment) {
      throw new NotFoundException('Payment not found');
    }
    if (completedPayment?.webhookUrl) {
      axios.post(completedPayment.webhookUrl, {
        eventType: 'payment.completed',
        payload: completedPayment,
      });
    }
    return completedPayment;
  }
  async markPaymentAsProcessing(id: string): Promise<PaymentResponseDto> {
    await this.db.payment.update({
      where: { id },
      data: { status: PaymentStatus.PROCESSING },
    });
    return (await this.getPayment(id))!;
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
    return toDto(PaymentResponseDto, {
      ...payment,
      paymentUrl: getPaymentUrl(payment.id),
      depositDetails:
        payment.depositWallet?.address &&
        payment.payAmount &&
        payment.payCurrencyId &&
        payment.networkId &&
        Object.values(NetworkId).includes(payment.networkId as NetworkId)
          ? toDto(DepositDetailsDto, {
              address: payment.depositWallet.address,
              amount: payment.payAmount,
              currencyId: payment.payCurrencyId,
              networkId: payment.networkId as NetworkId,
            })
          : null,
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
      currentDepositDetails.payCurrencyId !== null
    ) {
      throw new BadRequestException(
        'Can not change deposit details, please create a new payment',
      );
    }
    if (token.networkId !== network.id) {
      throw new BadRequestException('Token and network do not match');
    }
    if (currentDepositDetails.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(
        'Can not change deposit details, payment is not pending',
      );
    }

    const wallets = await this.db.wallet.findMany({
      where: {
        storeId: currentDepositDetails.storeId,
      },
    });

    const depositWallet = wallets.find((w) => w.networkId === network.id);
    if (!depositWallet) {
      this.logger.error(
        `Deposit wallet not found. store ${currentDepositDetails.storeId} network ${network.id}`,
      );
      throw new NotFoundException('Deposit wallet not found');
    }
    await this.alchemyService.suscribeAddressToWebhook({
      address: depositWallet.address,
      network: network.id,
    });

    // we only support usd stablecoins. So we convert the amount to usd and we always assume that 1 USD = 1 stable coin (USDT, USDC, etc.)
    let tokenAmount = currentDepositDetails.priceAmount;

    if (!isISO4217CurrencyCode(currentDepositDetails.priceCurrency)) {
      throw new BadRequestException('Invalid currency');
    }
    if (currentDepositDetails.priceCurrency !== 'USD') {
      const convertedAmount = await Convert(+currentDepositDetails.priceAmount)
        .from(currentDepositDetails.priceCurrency)
        .to('USD');
      tokenAmount = convertedAmount.toString();
    }
    if (toBN(tokenAmount).lte(0)) {
      throw new InternalServerErrorException('Conversion failed');
    }

    const updated = await this.db.payment.update({
      where: { id: paymentId },
      data: {
        payCurrencyId: token.id,
        networkId: network.id,
        payAmount: await this.generateUniqueTokenAmount(
          tokenAmount,
          token.id,
          network.id,
        ),
        depositWalletId: depositWallet.id,
      },
      include: { depositWallet: true },
    });

    return toDto(PaymentResponseDto, {
      ...updated,
      paymentUrl: getPaymentUrl(updated.id),
      depositDetails: toDto(DepositDetailsDto, {
        address: depositWallet.address,
        amount: updated.payAmount!,
        currencyId: updated.payCurrencyId!,
        networkId: updated.networkId as NetworkId,
      }),
    });
  }

  private async generateUniqueTokenAmount(
    baseAmount: string,
    payCurrencyId: string,
    networkId: NetworkId,
    maxRetries = 20,
  ): Promise<string> {
    const MIN_SUFFIX = 0.000001;
    const MAX_SUFFIX = 0.000999;

    const MAX_DECIMALS = 6;

    for (let i = 0; i < maxRetries; i++) {
      const randomSuffix =
        MIN_SUFFIX + Math.random() * (MAX_SUFFIX - MIN_SUFFIX);

      // sumamos base + sufijo
      const candidate = toBN(baseAmount).plus(
        toBN(randomSuffix.toFixed(MAX_DECIMALS)), // sufijo con 6 decimales
      );

      // 🔑 forzamos a 6 decimales como string
      const candidateStr = candidate.decimalPlaces(MAX_DECIMALS).toString();

      const exists = await this.db.payment.findFirst({
        where: {
          payCurrencyId,
          networkId,
          payAmount: candidateStr,
          status: { in: [PaymentStatus.PENDING, PaymentStatus.UNDER_PAYMENT] },
        },
        select: { id: true },
      });

      if (!exists) {
        return candidateStr;
      }
    }

    throw new Error(
      'Could not generate a unique token amount (max retries reached)',
    );
  }
}
