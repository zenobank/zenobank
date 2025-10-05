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

@Injectable()
export class AttemptsService {
  constructor(
    private readonly db: PrismaService,
    private readonly tokensService: TokensService,
  ) {}

  async createCheckoutAttempt(
    { checkoutId, apiKey }: { checkoutId: string; apiKey: string },
    createCheckoutAttemptDto: CreatePaymentAttemptDto,
  ): Promise<void> {
    const checkout = await this.db.checkout.findUnique({
      where: { id: checkoutId },
    });
    if (!checkout) {
      throw new NotFoundException('Checkout not found');
    }
    const store = await this.db.store.findUnique({
      where: { apiKey },
      include: {
        wallets: true,
        binancePayCredential: true,
      },
    });
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    const { tokenId, methodType } = createCheckoutAttemptDto;
    if (methodType === MethodType.CRYPTO_ONCHAIN) {
      const token = await this.tokensService.getOnChainToken(tokenId);
      if (!token) {
        throw new NotFoundException('Token not found');
      }
      if (store.wallets.length <= 0 || !store.wallets[0]) {
        throw new UnprocessableEntityException('Wallet not found');
      }
      const onChainPaymentAttempt = await this.db.onChainPaymentAttempt.create({
        data: {
          checkoutId,
          tokenId: token.id,
          tokenPayAmount: checkout.priceAmount,
          depositWalletId: store.wallets[0].id,
          networkId: token.networkId,
        },
      });
    } else if (methodType === MethodType.BINANCE_PAY) {
      const token = await this.tokensService.getBinancePayToken(tokenId);
      if (!token) {
        throw new NotFoundException('Token not found');
      }
      if (!store.binancePayCredential) {
        throw new UnprocessableEntityException(
          'Binance pay credential not found',
        );
      }
      const binancePayPaymentAttempt =
        await this.db.binancePayPaymentAttempt.create({
          data: {
            checkoutId,
            tokenPayAmount: checkout.priceAmount,
          },
        });
    } else {
      throw new InternalServerErrorException('Invalid method type');
    }
  }
}
