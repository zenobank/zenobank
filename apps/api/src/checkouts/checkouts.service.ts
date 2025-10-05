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

  async createCheckout(
    createCheckoutDto: CreateCheckoutDto,
    apiKey: string,
  ): Promise<CheckoutResponseDto> {
    const { orderId, priceAmount, priceCurrency } = createCheckoutDto;

    const store = await this.storesService.getStore(apiKey);
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const [onchainTokens, binancePayTokens] = await Promise.all([
      this.tokensService.getOnChainTokens(),
      this.tokensService.getBinancePayTokens(),
    ]);

    const checkout = await this.db.checkout.create({
      data: {
        orderId,
        priceAmount,
        priceCurrency,
        storeId: store.id,
        enabledOnchainTokens: {
          connect: onchainTokens.map((token) => ({ id: token.id })),
        },
        enabledBinancePayTokens: {
          connect: binancePayTokens.map((token) => ({ id: token.id })),
        },
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
      include: {
        enabledOnchainTokens: true,
        enabledBinancePayTokens: true,
      },
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
