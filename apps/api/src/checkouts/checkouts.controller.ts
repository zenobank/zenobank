import {
  Body,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { CheckoutsService } from './checkouts.service';
import { CreateCheckoutDto } from './dtos/create-checkout.dto';
import { CheckoutResponseDto } from './dtos/checkout-response.dto';
import { ApiKeyAuth } from 'src/auth/api-key-auth.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { API_KEY_HEADER } from 'src/auth/auth.constants';
import { CreatePaymentAttemptDto } from './attempts/dtos/create-payment-attempt.dto';
import { AttemptsService } from './attempts/attempts.service';
import { BinancePayAttemptResponseDto } from './attempts/dtos/binance-pay-attempt-response.dto';
import { OnchainAttemptResponseDto } from './attempts/dtos/onchain-attempt-response.dto';
import { CanonicalTokensResponseDto } from 'src/tokens/dto/canonical-tokens-response';

@ApiTags('Checkouts')
@Controller('checkouts')
export class CheckoutsController {
  constructor(
    private readonly checkoutsService: CheckoutsService,
    private readonly attemptsService: AttemptsService,
  ) {}

  @Post('')
  @ApiKeyAuth()
  @ApiOperation({ summary: 'Create a new checkout' })
  async createCheckout(
    @Body() createCheckoutDto: CreateCheckoutDto,
    @Headers(API_KEY_HEADER) apiKey: string,
  ): Promise<CheckoutResponseDto> {
    return this.checkoutsService.createCheckout(createCheckoutDto, apiKey);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get checkout by ID' })
  async getCheckout(@Param('id') id: string): Promise<CheckoutResponseDto> {
    const checkout = await this.checkoutsService.getCheckout(id);
    if (!checkout) {
      throw new NotFoundException('Checkout not found');
    }
    return checkout;
  }
  //   @Get(':id/attempts')
  //   @ApiOperation({ summary: 'Get checkout attempts by ID' })
  //   async getCheckoutAttempts(
  //     @Param('id') id: string,
  //   ): Promise<CheckoutAttemptResponseDto[]> {
  //     const attempts = await this.attemptsService.getCheckoutAttempts(id);
  //     return attempts;
  //   }
  // TODO: CAMBIAR EL ANY
  // @Post(':id/attempts')
  // @ApiOperation({ summary: 'Create a new checkout attempt' })
  // async createCheckoutAttempt(
  //   @Param('id') Compruebas sícheckoutId: string,
  //   @Body() createCheckoutAttemptDto: CreatePaymentAttemptDto,
  // ): Promise<void> {
  //   return this.attemptsService.createCheckoutAttempt(
  //     checkoutId,
  //     createCheckoutAttemptDto,
  //   );
  // }
  @Post(':id/attempts/binance-pay')
  @ApiOperation({ summary: 'Create a new binance pay checkout attempt' })
  async createCheckoutAttemptBinancePay(
    @Param('id') checkoutId: string,
    @Body() createCheckoutAttemptDto: CreatePaymentAttemptDto,
  ): Promise<BinancePayAttemptResponseDto> {
    return this.attemptsService.createBinancePayCheckoutAttempt(
      checkoutId,
      createCheckoutAttemptDto,
    );
  }

  @Post(':id/attempts/onchain')
  @ApiOperation({ summary: 'Create a new onchain checkout attempt' })
  async createCheckoutAttemptOnchain(
    @Param('id') checkoutId: string,
    @Body() createCheckoutAttemptDto: CreatePaymentAttemptDto,
  ): Promise<OnchainAttemptResponseDto> {
    return this.attemptsService.createOnChainCheckoutAttempt(
      checkoutId,
      createCheckoutAttemptDto,
    );
  }

  @Get(':id/enabled-tokens')
  @ApiOperation({ summary: 'Get enabled tokens for a checkout' })
  async getEnabledTokens(
    @Param('id') checkoutId: string,
  ): Promise<CanonicalTokensResponseDto> {
    return this.checkoutsService.getEnabledTokens(checkoutId);
  }
}
