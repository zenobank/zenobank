import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCheckoutDto } from './dtos/create-checkout.dto';
import { CheckoutResponseDto } from './dtos/checkout-response.dto';
import { toDto } from 'src/lib/utils/to-dto';
import { StoresService } from 'src/stores/stores.service';
import { TokensService } from 'src/tokens/tokens.service';
import { getCheckoutUrl } from 'src/checkouts/lib/utils';
import { CanonicalTokensResponseDto } from 'src/tokens/dto/canonical-tokens-response';
import { WalletsService } from 'src/wallets/wallets.service';
import { Checkout, CheckoutStatus } from '@prisma/client';
import axios from 'axios';
import { CheckoutEvents } from './lib/constants';
@Injectable()
export class CheckoutsService {
  private readonly logger = new Logger(CheckoutsService.name);

  constructor(
    private readonly db: PrismaService,
    private readonly storesService: StoresService,
    private readonly tokensService: TokensService,
  ) {}
  async getEnabledTokens(
    checkoutId: string,
  ): Promise<CanonicalTokensResponseDto> {
    const checkout = await this.db.checkout.findUnique({
      where: { id: checkoutId },
      include: {
        store: {
          include: {
            wallets: true,
            binancePayCredential: true,
          },
        },
      },
    });
    if (!checkout) {
      throw new NotFoundException('Checkout not found');
    }
    const canonicalTokens = await this.tokensService.getCanonicalTokens();
    if (!checkout.store.binancePayCredential) {
      canonicalTokens.BINANCE_PAY = [];
    }
    if (checkout.store.wallets.length === 0) {
      canonicalTokens.ONCHAIN = [];
    }
    return canonicalTokens;
  }
  async markCheckoutAsExpired(checkoutId: string) {
    const checkout = await this.db.checkout.update({
      where: { id: checkoutId },
      data: { status: CheckoutStatus.EXPIRED },
    });

    if (checkout.webhookUrl) {
      // await this.webhooksService.sendWebhook(checkout.webhookUrl, {
      //   event: 'checkout_expired',
      //   data: { checkoutId },
      // });
    }
    this.logger.log(`Marked checkout ${checkoutId} as expired`);
  }

  async createCheckout(
    createCheckoutDto: CreateCheckoutDto,
    apiKey: string,
  ): Promise<CheckoutResponseDto> {
    const { orderId, priceAmount, priceCurrency } = createCheckoutDto;

    const store = await this.storesService.getStore(apiKey);
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const checkout = await this.db.checkout.create({
      data: {
        orderId,
        priceAmount,
        priceCurrency,
        storeId: store.id,
        webhookUrl: createCheckoutDto.webhookUrl,
        verificationToken: createCheckoutDto.verificationToken,
      },
    });

    this.logger.log(
      `Created checkout ${checkout.id} for store ${store.id} with orderId ${orderId}`,
    );

    return toDto(CheckoutResponseDto, {
      ...checkout,
      checkoutUrl: getCheckoutUrl(checkout.id),
    });
  }

  /*
   * Mark checkout as completed
   */
  async completeCheckout(checkoutId: string) {
    const checkout = await this.db.checkout.update({
      where: { id: checkoutId },
      data: { status: CheckoutStatus.COMPLETED },
    });
    if (checkout.webhookUrl) {
      await axios.post(
        checkout.webhookUrl,
        {
          event: CheckoutEvents.COMPLETED,
          data: toDto(CheckoutResponseDto, {
            ...checkout,
            checkoutUrl: getCheckoutUrl(checkout.id),
          }),
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }
  }

  async getCheckoutIntegrity(
    checkoutId: string,
  ): Promise<{ isValid: boolean; checkout: Checkout | null; reason?: string }> {
    const checkout = await this.db.checkout.findUnique({
      where: { id: checkoutId },
    });

    if (!checkout) {
      return { isValid: false, checkout: null, reason: 'Checkout not found' };
    }

    if (checkout.expiresAt && checkout.expiresAt < new Date()) {
      return { isValid: false, checkout: null, reason: 'Checkout expired' };
    }
    return { isValid: true, checkout: checkout };
  }

  async getCheckout(id: string): Promise<CheckoutResponseDto | null> {
    const checkout = await this.db.checkout.findUnique({
      where: { id },
    });

    if (!checkout) {
      return null;
    }

    return toDto(CheckoutResponseDto, {
      ...checkout,
      checkoutUrl: getCheckoutUrl(checkout.id),
    });
  }
}
