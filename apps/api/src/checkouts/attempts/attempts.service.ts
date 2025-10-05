import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateCheckoutAttemptDto } from './dtos/create-checkout-attempt.dto';
import { TokensService } from 'src/tokens/tokens.service';
import { Rail } from '@prisma/client';
import { PaymentAttemptResponseDto } from './dtos/payment-attempt-response.dto';
import { toDto } from 'src/lib/utils/to-dto';

@Injectable()
export class AttemptsService {
  constructor(
    private readonly db: PrismaService,
    private readonly tokensService: TokensService,
  ) {}

  async createCheckoutAttempt(
    { checkoutId, apiKey }: { checkoutId: string; apiKey: string },
    createCheckoutAttemptDto: CreateCheckoutAttemptDto,
  ): Promise<PaymentAttemptResponseDto> {
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
        credentials: true,
      },
    });
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    const token = await this.tokensService.getToken(
      createCheckoutAttemptDto.tokenId,
    );
    if (!token) {
      throw new NotFoundException('Token not found');
    }
    if (token.rail === Rail.ONCHAIN) {
      if (store.wallets.length <= 0 || !store.wallets[0]) {
        throw new UnprocessableEntityException('Wallet not found');
      }
      const paymentAttempt = await this.db.paymentAttempt.create({
        data: {
          rail: Rail.ONCHAIN,
          checkoutId,
          tokenId: token.id,
          tokenPayAmount: checkout.priceAmount,
          depositWalletId: store.wallets[0].id,
          networkId: token.networkId,
        },
      });
      return toDto(PaymentAttemptResponseDto, {
        ...paymentAttempt,
      });
    } else if (token.rail === Rail.CUSTODIAL) {
      const storeCredentials = store.credentials.find(
        (credential) => credential.provider === token.provider,
      );
      if (!storeCredentials) {
        throw new UnprocessableEntityException('Store credential not found');
      }
      const paymentAttempt = await this.db.paymentAttempt.create({
        data: {
          rail: Rail.CUSTODIAL,
          checkoutId,
          tokenId: token.id,
          tokenPayAmount: checkout.priceAmount,
        },
      });
      return toDto(PaymentAttemptResponseDto, {
        ...paymentAttempt,
      });
    } else {
      throw new InternalServerErrorException('Invalid rail');
    }
  }
}
