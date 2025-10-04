import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { toDto } from 'src/lib/utils/to-dto';
import { CreateCheckoutAttemptDto } from './dtos/create-checkout-attempt.dto';
import { TokensService } from 'src/tokens/tokens.service';
import { PaymentRail, Provider } from '@prisma/client';
import { OnchainAttemptResponseDto } from './dtos/onchain-attempt-response.dto';
import { SupportedNetworksId } from 'src/networks/network.interface';
import { toEnumValue } from 'src/lib/utils/to-enum';
import { BinancePayAttemptResponseDto } from './dtos/binance-pay-attempt-response.dto';

@Injectable()
export class AttemptsService {
  constructor(
    private readonly db: PrismaService,
    private readonly tokensService: TokensService,
  ) {}

  // async getCheckoutAttempts(id: string): Promise<CheckoutAttemptResponseDto[]> {
  //   const attempts = await this.db.paymentAttempt.findMany({
  //     where: { checkoutId: id },
  //   });
  //   return attempts.map((attempt) =>
  //     toDto(CheckoutAttemptResponseDto, attempt),
  //   );
  // }

  async createCheckoutAttempt(
    { checkoutId, apiKey }: { checkoutId: string; apiKey: string },
    createCheckoutAttemptDto: CreateCheckoutAttemptDto,
  ): Promise<OnchainAttemptResponseDto | BinancePayAttemptResponseDto> {
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
    if (createCheckoutAttemptDto.rail === PaymentRail.ONCHAIN) {
      const token = await this.tokensService.getToken(
        createCheckoutAttemptDto.tokenId,
      );
      if (!token) {
        throw new NotFoundException('Token not found');
      }
      if (store.wallets.length <= 0 || !store.wallets[0]) {
        throw new UnprocessableEntityException('Wallet not found');
      }
      const onChainPaymentAttempt = await this.db.paymentAttempt.create({
        data: {
          rail: createCheckoutAttemptDto.rail,
          checkoutId,
          onchain: {
            create: {
              networkId: token.networkId,
              tokenId: token.id,
              tokenPayAmount: checkout.priceAmount,
              depositWalletId: store.wallets[0].id,
            },
          },
        },
        include: {
          onchain: true,
        },
      });
      if (!onChainPaymentAttempt.onchain) {
        // this should neve happen since we just created the onchain attempt
        throw new InternalServerErrorException('Onchain attempt not created');
      }
      return toDto(OnchainAttemptResponseDto, {
        ...onChainPaymentAttempt.onchain,
        depositWalletAddress: store.wallets[0].address,
        networkId: toEnumValue(
          SupportedNetworksId,
          onChainPaymentAttempt.onchain.networkId,
        ),
      });
    } else if (createCheckoutAttemptDto.rail === PaymentRail.CUSTODIAL) {
      const providerToken = await this.tokensService.getProviderToken(
        createCheckoutAttemptDto.tokenId,
      );
      if (!providerToken) {
        throw new NotFoundException('Provider token not found');
      }
      const storeCredentials = store.credentials.find(
        (credential) => credential.provider === providerToken.provider,
      );
      if (!storeCredentials) {
        throw new UnprocessableEntityException('Store credential not found');
      }
      const paymentAttempt = await this.db.paymentAttempt.create({
        data: {
          rail: createCheckoutAttemptDto.rail,
          checkoutId,
          binancePay: {
            create: {
              tokenPayAmount: checkout.priceAmount,
              credentialId: storeCredentials.id,
            },
          },
        },
        include: {
          binancePay: true,
        },
      });
      if (!paymentAttempt.binancePay) {
        throw new InternalServerErrorException(
          'Binance pay attempt not created',
        );
      }
      return toDto(BinancePayAttemptResponseDto, {
        ...paymentAttempt.binancePay,
        tokenId: providerToken.id,
        binanceIdDepositAccount: paymentAttempt.binancePay.id,
      });
    } else {
      throw new InternalServerErrorException('Invalid rail');
    }
  }
}
