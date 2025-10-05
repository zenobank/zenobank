import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomUUID } from 'crypto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { UpdateDepositSelectionDto } from './dto/update-payment-selection.dto';
import { TokensService } from 'src/tokens/tokens.service';
import { NetworksService } from 'src/networks/networks.service';
import { ms } from 'src/lib/utils/ms';
import { AttemptStatus, Rail, PaymentStatus } from '@prisma/client';
import { SupportedNetworksId } from 'src/networks/network.interface';
import { Convert } from 'easy-currencies';
import { toBN } from 'src/lib/utils/numbers';
import { isISO4217CurrencyCode } from 'class-validator';
import { toDto } from 'src/lib/utils/to-dto';
import { getCheckoutUrl } from './lib/utils';
import axios from 'axios';
import { DepositDetailsDto } from './dto/payment-deposit-response.dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  constructor(
    private readonly db: PrismaService,
    private readonly tokenService: TokensService,
    private readonly networksService: NetworksService,
  ) {}
  // async getPayments(apiKey: string): Promise<PaymentResponseDto[]> {
  //   const store = await this.db.store.findUnique({
  //     where: { apiKey },
  //   });
  //   if (!store) {
  //     throw new NotFoundException('Store not found');
  //   }
  //   const payments = await this.db.payment.findMany({
  //     where: { storeId: store.id },
  //     orderBy: { createdAt: 'desc' },
  //     take: 100,
  //   });
  //   return payments.map((payment) =>
  //     toDto(PaymentResponseDto, {
  //       ...payment,
  //       paymentUrl: getPaymentUrl(payment.id),
  //       depositDetails: null,
  //     }),
  //   );
  // }

  // async createPayment(
  //   createPaymentDto: CreatePaymentDto,
  //   apiKey: string,
  // ): Promise<PaymentResponseDto> {
  //   const { priceAmount, priceCurrency } = createPaymentDto;
  //   const store = await this.db.store.findUniqueOrThrow({
  //     where: { apiKey },
  //   });
  //   const payment = await this.db.payment.create({
  //     data: {
  //       priceAmount,
  //       priceCurrency,
  //       webhookUrl: createPaymentDto.webhookUrl,
  //       successUrl: createPaymentDto.successUrl,
  //       orderId: createPaymentDto.orderId ?? randomUUID(),
  //       verificationToken: createPaymentDto.verificationToken ?? randomUUID(),
  //       expiredAt: new Date(Date.now() + ms('1h')),
  //       storeId: store.id,
  //     },
  //   });
  //   this.logger.log(`Created payment ${payment.id}`);
  //   return toDto(PaymentResponseDto, {
  //     ...payment,
  //     paymentUrl: getPaymentUrl(payment.id),
  //     depositDetails: null,
  //   });
  // }
  // async incrementConfirmationAttempts(paymentId: string): Promise<number> {
  //   const updated = await this.db.payment.update({
  //     where: { id: paymentId },
  //     data: { confirmationAttempts: { increment: 1 } },
  //     select: { confirmationAttempts: true },
  //   });
  //   return updated.confirmationAttempts;
  // }

  // async getPaymentOrThrow(id: string): Promise<PaymentResponseDto> {
  //   const payment = await this.getPayment(id);
  //   if (!payment) throw new NotFoundException('Payment not found');
  //   return payment;
  // }

  // async markPaymentAsCompleted(id: string): Promise<PaymentResponseDto> {
  //   await this.db.payment.update({
  //     where: { id },
  //     data: { status: PaymentStatus.COMPLETED, paidAt: new Date() },
  //   });
  //   this.logger.log(`Marked payment ${id} as completed`);

  //   const completedPayment = await this.getPayment(id);
  //   if (!completedPayment) {
  //     throw new NotFoundException('Payment not found');
  //   }
  //   if (completedPayment?.webhookUrl) {
  //     axios.post(completedPayment.webhookUrl, {
  //       eventType: 'payment.completed',
  //       payload: completedPayment satisfies PaymentResponseDto,
  //     });
  //   }
  //   return completedPayment;
  // }

  // async getPayment(id: string): Promise<PaymentResponseDto | null> {
  //   const payment = await this.db.payment.findUnique({
  //     where: { id },
  //     include: {
  //       depositWallet: true,
  //     },
  //   });
  //   if (!payment) {
  //     return null;
  //   }
  //   return toDto(PaymentResponseDto, {
  //     ...payment,
  //     paymentUrl: getPaymentUrl(payment.id),
  //     depositDetails:
  //       payment.depositWallet?.address &&
  //       payment.payAmount &&
  //       payment.payCurrencyId &&
  //       payment.networkId &&
  //       Object.values(SupportedNetworksId).includes(
  //         payment.networkId as SupportedNetworksId,
  //       )
  //         ? toDto(DepositDetailsDto, {
  //             address: payment.depositWallet.address,
  //             amount: payment.payAmount,
  //             currencyId: payment.payCurrencyId,
  //             networkId: payment.networkId as SupportedNetworksId,
  //           })
  //         : null,
  //   });
  // }

  // async updatePaymentDepositSelection(
  //   checkoutId: string,
  //   dto: UpdateDepositSelectionDto,
  // ): Promise<AttemptSelectionResponseDto> {
  //   const { rail, tokenId } = dto;

  //   // 1) Cargar checkout + relación necesaria
  //   const checkout = await this.db.checkout.findUnique({
  //     where: { id: checkoutId },
  //     include: {
  //       store: { include: { wallets: true, credentials: true } },
  //       enabledTokens: true,
  //     },
  //   });

  //   if (!checkout) throw new NotFoundException('Checkout not found');
  //   if (checkout.status !== 'OPEN') {
  //     throw new BadRequestException('El checkout no está abierto');
  //   }
  //   if (checkout.expiresAt && new Date(checkout.expiresAt) < new Date()) {
  //     throw new BadRequestException('El checkout está expirado');
  //   }

  //   // 2) Rail permitido
  //   if (!checkout.enabledRails.includes(rail)) {
  //     throw new BadRequestException(
  //       `Rail no habilitado para este checkout: ${rail}`,
  //     );
  //   }

  //   // 3) Validación de moneda y conversión (para ONCHAIN asumimos USD estable)
  //   if (!isISO4217CurrencyCode(checkout.priceCurrency)) {
  //     throw new BadRequestException('Invalid currency');
  //   }
  //   let usdAmount = checkout.priceAmount;
  //   if (rail === Rail.ONCHAIN && checkout.priceCurrency !== 'USD') {
  //     const convertedAmount = await Convert(+checkout.priceAmount)
  //       .from(checkout.priceCurrency)
  //       .to('USD');
  //     usdAmount = convertedAmount.toString();
  //   }
  //   if (rail === Rail.ONCHAIN && toBN(usdAmount).lte(0)) {
  //     throw new InternalServerErrorException('Conversion failed');
  //   }

  //   // 4) Invalidar attempts previos PENDING/PROCESSING
  //   await this.db.paymentAttempt.updateMany({
  //     where: {
  //       checkoutId,
  //       status: { in: [AttemptStatus.PENDING, AttemptStatus.PROCESSING] },
  //     },
  //     data: { status: AttemptStatus.FAILED },
  //   });

  //   // 5) Crear nuevo attempt
  //   const attempt = await this.db.paymentAttempt.create({
  //     data: { checkoutId, rail, status: AttemptStatus.PENDING },
  //   });

  //   // 6) Rail específico
  //   if (rail === Rail.ONCHAIN) {
  //     if (!tokenId) {
  //       throw new BadRequestException(
  //         'tokenId es requerido para pagos ONCHAIN',
  //       );
  //     }

  //     // Debe estar entre los tokens habilitados del checkout
  //     const tokenHabilitado = checkout.enabledTokens.find(
  //       (t) => t.id === tokenId,
  //     );
  //     if (!tokenHabilitado)
  //       throw new BadRequestException('Token no habilitado para este checkout');

  //     const token = await this.tokenService.getToken(tokenId);
  //     if (!token)
  //       throw new BadRequestException(`Token not found. Token ID: ${tokenId}`);

  //     const network = await this.networksService.getNetwork(token.networkId);
  //     if (!network)
  //       throw new NotFoundException(
  //         `Network not found. Network ID: ${token.networkId}`,
  //       );

  //     // Wallet de depósito de la tienda para esa red
  //     const depositWallet = checkout.store.wallets.find(
  //       (w) => w.networkId === network.id,
  //     );
  //     if (!depositWallet)
  //       throw new NotFoundException(
  //         'Deposit wallet not found para la red seleccionada',
  //       );

  //     // Crear detalle on-chain
  //     const onchain = await this.db.onchainAttempt.create({
  //       data: {
  //         attemptId: attempt.id,
  //         networkId: network.id,
  //         depositWalletId: depositWallet.id,
  //         minConfirmations: network.minBlockConfirmations ?? 3,
  //       },
  //       include: { network: true, wallet: true },
  //     });

  //     return toDto(AttemptSelectionResponseDto, {
  //       checkoutId,
  //       attemptId: attempt.id,
  //       rail,
  //       priceAmount: checkout.priceAmount,
  //       priceCurrency: checkout.priceCurrency,
  //       status: attempt.status,
  //       paymentUrl: getCheckoutUrl(checkout.id),
  //       expiresAt: checkout.expiresAt ?? null,
  //       onchain: {
  //         address: onchain.wallet.address,
  //         networkId: onchain.networkId,
  //         networkDisplayName: onchain.network.displayName,
  //         tokenId: token.id,
  //         tokenSymbol: token.symbol,
  //         tokenDecimals: token.decimals,
  //         expectedAmount: usdAmount, // 1 USD = 1 unidad del stable (USDC/USDT)
  //         minConfirmations: onchain.minConfirmations,
  //         confirmations: onchain.confirmations,
  //         transactionHash: onchain.transactionHash ?? null,
  //       },
  //       binancePay: null,
  //     });
  //   }

  //   // BINANCE PAY
  //   const cred = checkout.store.credentials.find(
  //     (c) => c.provider === Provider.BINANCE_PAY,
  //   );
  //   if (!cred) {
  //     throw new NotFoundException(
  //       'Credenciales de Binance Pay no configuradas para esta tienda',
  //     );
  //   }

  //   const merchantTradeNo = attempt.id; // único por attempt
  //   const order = await this.binancePayService.createOrder({
  //     apiKey: cred.apiKey,
  //     apiSecret: cred.apiSecret,
  //     merchantTradeNo,
  //     currency: checkout.priceCurrency,
  //     amount: checkout.priceAmount,
  //   });

  //   const native = await this.db.binancePayPayment.create({
  //     data: {
  //       attemptId: attempt.id,
  //       credentialId: cred.id,
  //       merchantTradeNo,
  //       prepayId: order.prepayId ?? null,
  //       transactionId: order.transactionId ?? null,
  //       nativeStatus: order.nativeStatus ?? 'PENDING',
  //       qrCodeUrl: order.qrCodeUrl ?? null,
  //       expireAt: order.expireAt ?? null,
  //       lastRequest: order.lastRequest ?? {},
  //       lastResponse: order.lastResponse ?? {},
  //     },
  //   });

  //   return toDto(AttemptSelectionResponseDto, {
  //     checkoutId,
  //     attemptId: attempt.id,
  //     rail,
  //     priceAmount: checkout.priceAmount,
  //     priceCurrency: checkout.priceCurrency,
  //     status: attempt.status,
  //     paymentUrl: getCheckoutUrl(checkout.id),
  //     expiresAt: native.expireAt ?? checkout.expiresAt ?? null,
  //     onchain: null,
  //     binancePay: {
  //       merchantTradeNo: native.merchantTradeNo,
  //       qrCodeUrl: native.qrCodeUrl,
  //       prepayId: native.prepayId,
  //       transactionId: native.transactionId,
  //       nativeStatus: native.nativeStatus,
  //       expireAt: native.expireAt,
  //     },
  //   });
  // }

  // async markPaymentAsCancelled(id: string): Promise<void> {
  //   await this.db.payment.update({
  //     where: { id },
  //     data: { status: PaymentStatus.CANCELLED },
  //   });
  // }

  // private async generateUniqueTokenAmount(
  //   baseAmount: string,
  //   payCurrencyId: string,
  //   networkId: string,
  //   maxRetries = 20,
  // ): Promise<string> {
  //   const MIN_SUFFIX = 0.000001;
  //   const MAX_SUFFIX = 0.000999;

  //   const MAX_DECIMALS = 6;

  //   for (let i = 0; i < maxRetries; i++) {
  //     const randomSuffix =
  //       MIN_SUFFIX + Math.random() * (MAX_SUFFIX - MIN_SUFFIX);

  //     // sumamos base + sufijo
  //     const candidate = toBN(baseAmount).plus(
  //       toBN(randomSuffix.toFixed(MAX_DECIMALS)), // sufijo con 6 decimales
  //     );

  //     // 🔑 forzamos a 6 decimales como string
  //     const candidateAmountStr = candidate
  //       .decimalPlaces(MAX_DECIMALS)
  //       .toString();

  //     const exists = await this.db.paymentAttempt.findFirst({
  //       where: {
  //         onchain: {
  //           networkId,
  //         },
  //         status: { in: [AttemptStatus.PENDING] },
  //         rail: Rail.ONCHAIN,
  //         payment: {
  //           priceCurrency: payCurrencyId,
  //           priceAmount: candidateAmountStr,
  //         },
  //       },
  //       select: { id: true },
  //     });

  //     if (!exists) {
  //       return candidateAmountStr;
  //     }
  //   }

  //   throw new Error(
  //     'Could not generate a unique token amount (max retries reached)',
  //   );
  // }
}
