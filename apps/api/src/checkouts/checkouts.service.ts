import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCheckoutDto } from './dtos/create-checkout.dto';
import { CheckoutResponseDto } from './dtos/checkout-response.dto';
import { toDto } from 'src/lib/utils/to-dto';
import { StoresService } from 'src/stores/stores.service';
import { TokensService } from 'src/tokens/tokens.service';
import { getCheckoutUrl } from 'src/checkouts/lib/utils';

@Injectable()
export class CheckoutsService {
  private readonly logger = new Logger(CheckoutsService.name);

  constructor(
    private readonly db: PrismaService,
    private readonly storesService: StoresService,
    private readonly tokensService: TokensService,
  ) {}
  async getEnabledTokens(checkoutId: string): Promise<any> {
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
    if (checkout.store.binancePayCredential) {
      const binancePayTokens = await this.tokensService.getBinancePayTokens();
      return {
        binancePayTokens,
      };
    }
    if (checkout.store.wallets.length > 0) {
      const onchainTokens = await this.tokensService.getOnChainTokens();
      return {
        onchainTokens,
      };
    }
    return {
      onchainTokens: [],
      binancePayTokens: [],
    };
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
