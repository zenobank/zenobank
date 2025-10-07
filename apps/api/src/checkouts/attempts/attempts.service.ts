import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreatePaymentAttemptDto } from './dtos/create-payment-attempt.dto';
import { TokensService } from 'src/tokens/tokens.service';

import { AttemptStatus, CheckoutStatus, MethodType } from '@prisma/client';
import { OnchainAttemptResponseDto } from './dtos/onchain-attempt-response.dto';
import { toDto } from 'src/lib/utils/to-dto';
import { BinancePayAttemptResponseDto } from './dtos/binance-pay-attempt-response.dto';
import { toEnumValue } from 'src/lib/utils/to-enum';
import { SupportedNetworksId } from 'src/networks/network.interface';
import { BinancePayTokenResponseDto } from 'src/tokens/dto/binance-pay-token-response';
import { OnChainTokenResponseDto } from 'src/tokens/dto/onchain-token-response';
import { ConversionsService } from 'src/conversions/conversions.service';
import { toBN } from 'src/lib/utils/numbers';

@Injectable()
export class AttemptsService {
  constructor(
    private readonly db: PrismaService,
    private readonly tokensService: TokensService,
    private readonly conversionsService: ConversionsService,
  ) {}
  private async getCheckoutContextOrThrow(checkoutId: string) {
    const checkout = await this.db.checkout.findUnique({
      where: { id: checkoutId },
      include: {
        store: { include: { wallets: true, binancePayCredential: true } },
      },
    });
    if (!checkout) throw new NotFoundException('Checkout not found');

    const store = checkout.store;
    if (!store) throw new NotFoundException('Store not found');

    const wallet = store.wallets[0];
    if (!wallet) throw new UnprocessableEntityException('Wallet not found');

    return { checkout, store, wallet };
  }
  private async getTokenOrThrow(
    method: typeof MethodType.ONCHAIN,
    tokenId: string,
  ): Promise<OnChainTokenResponseDto>;
  private async getTokenOrThrow(
    method: typeof MethodType.BINANCE_PAY,
    tokenId: string,
  ): Promise<BinancePayTokenResponseDto>;
  private async getTokenOrThrow(method: MethodType, tokenId: string) {
    if (method === MethodType.ONCHAIN) {
      const token = await this.tokensService.getOnChainToken(tokenId);
      if (!token) throw new NotFoundException('Token not found');
      return token;
    }
    if (method === MethodType.BINANCE_PAY) {
      const token = await this.tokensService.getBinancePayToken(tokenId);
      if (!token) throw new NotFoundException('Token not found');
      return token;
    }
    throw new UnprocessableEntityException('Unsupported payment method');
  }
  private generateRandomizedPayAmount(baseAmount: string): string {
    const MIN_SUFFIX = 0.000001;
    const MAX_SUFFIX = 0.000999;

    const MAX_DECIMALS = 6;
    const randomSuffix = MIN_SUFFIX + Math.random() * (MAX_SUFFIX - MIN_SUFFIX);

    // sumamos base + sufijo
    const candidate = toBN(baseAmount).plus(
      toBN(randomSuffix.toFixed(MAX_DECIMALS)), // sufijo con 6 decimales
    );

    // 🔑 forzamos a 6 decimales como string
    const candidateAmountStr = candidate.decimalPlaces(MAX_DECIMALS).toString();
    return candidateAmountStr;
  }

  private async generateUniqueBinancePayPaymentAttemptAmount(
    baseAmount: string,
    tokenId: string,
    maxRetries = 20,
  ): Promise<string> {
    for (let i = 0; i < maxRetries; i++) {
      const candidateAmountStr = this.generateRandomizedPayAmount(baseAmount);
      const exists = await this.db.binancePayPaymentAttempt.findFirst({
        where: {
          status: { in: [AttemptStatus.PENDING] },
          tokenId: tokenId,
          tokenPayAmount: candidateAmountStr,
        },
        select: { id: true },
      });

      if (!exists) {
        return candidateAmountStr;
      }
    }
    throw new Error(
      'Could not generate a unique binance pay payment attempt amount (max retries reached)',
    );
  }
  private async generateUniqueOnChainPaymentAttemptAmount(
    baseAmount: string,
    tokenId: string,
    maxRetries = 20,
  ): Promise<string> {
    for (let i = 0; i < maxRetries; i++) {
      const candidateAmountStr = this.generateRandomizedPayAmount(baseAmount);
      const exists = await this.db.onChainPaymentAttempt.findFirst({
        where: {
          status: { in: [AttemptStatus.PENDING] },
          tokenId: tokenId,
          tokenPayAmount: candidateAmountStr,
        },
        select: { id: true },
      });

      if (!exists) {
        return candidateAmountStr;
      }
    }
    throw new Error(
      'Could not generate a unique on chain payment attempt amount (max retries reached)',
    );
  }

  async createOnChainCheckoutAttempt(
    checkoutId: string,
    createCheckoutAttemptDto: CreatePaymentAttemptDto,
  ): Promise<OnchainAttemptResponseDto> {
    const { checkout, wallet } =
      await this.getCheckoutContextOrThrow(checkoutId);

    if (checkout.status !== CheckoutStatus.OPEN) {
      throw new UnprocessableEntityException('Checkout is not open');
    }
    const token = await this.getTokenOrThrow(
      MethodType.ONCHAIN,
      createCheckoutAttemptDto.tokenId,
    );

    const convertedAmount = await this.conversionsService.convert({
      from: checkout.priceCurrency,
      amount: checkout.priceAmount,
      to: token.symbol,
    });

    const tokenPayAmount = await this.generateUniqueOnChainPaymentAttemptAmount(
      convertedAmount.amount,
      token.id,
    );

    const onChainPaymentAttempt = await this.db.onChainPaymentAttempt.upsert({
      where: {
        checkoutId_tokenId: { checkoutId, tokenId: token.id },
      },
      update: {},
      create: {
        checkoutId,
        tokenId: token.id,
        tokenPayAmount: tokenPayAmount,
        depositWalletId: wallet.id,
        networkId: token.networkId,
      },
      include: {
        depositWallet: true,
      },
    });

    const { depositWallet, ...attemptData } = onChainPaymentAttempt;
    return toDto(OnchainAttemptResponseDto, {
      ...attemptData,
      depositWallet: {
        ...depositWallet,
        network: toEnumValue(SupportedNetworksId, depositWallet.networkId),
      },
    });
  }

  async createBinancePayCheckoutAttempt(
    checkoutId: string,
    createCheckoutAttemptDto: CreatePaymentAttemptDto,
  ): Promise<BinancePayAttemptResponseDto> {
    const { checkout, store } =
      await this.getCheckoutContextOrThrow(checkoutId);

    if (checkout.status !== CheckoutStatus.OPEN) {
      throw new UnprocessableEntityException('Checkout is not open');
    }
    const token = await this.getTokenOrThrow(
      MethodType.BINANCE_PAY,
      createCheckoutAttemptDto.tokenId,
    );

    if (!store.binancePayCredential) {
      throw new UnprocessableEntityException(
        'Binance Pay credentials not found',
      );
    }
    const convertedAmount = await this.conversionsService.convert({
      from: checkout.priceCurrency,
      amount: checkout.priceAmount,
      to: token.symbol,
    });

    const tokenPayAmount =
      await this.generateUniqueBinancePayPaymentAttemptAmount(
        convertedAmount.amount,
        token.id,
      );

    const binancePayPaymentAttempt =
      await this.db.binancePayPaymentAttempt.upsert({
        where: {
          checkoutId_tokenId: { checkoutId, tokenId: token.id },
        },
        update: {},
        create: {
          checkoutId,
          tokenId: token.id,
          tokenPayAmount: tokenPayAmount,
        },
        include: {
          token: true,
        },
      });
    return toDto(BinancePayAttemptResponseDto, {
      ...binancePayPaymentAttempt,
      depositAccountId: store.binancePayCredential.accountId,
      binanceTokenId: binancePayPaymentAttempt.token.binanceTokenId,
    });
  }
}
