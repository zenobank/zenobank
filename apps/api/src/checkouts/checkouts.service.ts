import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCheckoutDto } from './dtos/create-checkout.dto';
import { CheckoutResponseDto } from './dtos/checkout-response.dto';
import { toDto } from 'src/lib/utils/to-dto';
import { StoresService } from 'src/stores/stores.service';
import { TokensService } from 'src/currencies/token/tokens.service';
import { PaymentRail } from '@prisma/client';
import { getCheckoutUrl } from 'src/payments/lib/utils';

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

    const tokens = await this.tokensService.getTokens();

    const checkout = await this.db.checkout.create({
      data: {
        orderId,
        priceAmount,
        priceCurrency,
        storeId: store.id,
        enabledRails: [...Object.values(PaymentRail)],
        enabledTokens: {
          connect: tokens.map((token) => ({ id: token.id })),
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
