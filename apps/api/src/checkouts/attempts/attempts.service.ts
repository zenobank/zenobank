import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreatePaymentAttemptDto } from './dtos/create-payment-attempt.dto';
import { TokensService } from 'src/tokens/tokens.service';

import { MethodType } from '@prisma/client';
import { OnchainAttemptResponseDto } from './dtos/onchain-attempt-response.dto';
import { toDto } from 'src/lib/utils/to-dto';
import { BinancePayAttemptResponseDto } from './dtos/binance-pay-attempt-response.dto';
import { toEnumValue } from 'src/lib/utils/to-enum';
import { SupportedNetworksId } from 'src/networks/network.interface';
import { BinancePayTokenResponseDto } from 'src/tokens/dto/binance-pay-token-response';
import { OnChainTokenResponseDto } from 'src/tokens/dto/onchain-token-response';

@Injectable()
export class AttemptsService {
  constructor(
    private readonly db: PrismaService,
    private readonly tokensService: TokensService,
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
  async createOnChainCheckoutAttempt(
    checkoutId: string,
    createCheckoutAttemptDto: CreatePaymentAttemptDto,
  ): Promise<OnchainAttemptResponseDto> {
    const { checkout, wallet } =
      await this.getCheckoutContextOrThrow(checkoutId);
    const token = await this.getTokenOrThrow(
      MethodType.ONCHAIN,
      createCheckoutAttemptDto.tokenId,
    );
    const onChainPaymentAttempt = await this.db.onChainPaymentAttempt.upsert({
      where: {
        checkoutId_tokenId: { checkoutId, tokenId: token.id },
      },
      update: {},
      create: {
        checkoutId,
        tokenId: token.id,
        tokenPayAmount: checkout.priceAmount,
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
    const token = await this.getTokenOrThrow(
      MethodType.BINANCE_PAY,
      createCheckoutAttemptDto.tokenId,
    );

    if (!store.binancePayCredential) {
      throw new UnprocessableEntityException(
        'Binance Pay credentials not found',
      );
    }

    const binancePayPaymentAttempt =
      await this.db.binancePayPaymentAttempt.upsert({
        where: {
          checkoutId_tokenId: { checkoutId, tokenId: token.id },
        },
        update: {},
        create: {
          checkoutId,
          tokenId: token.id,
          tokenPayAmount: checkout.priceAmount,
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
