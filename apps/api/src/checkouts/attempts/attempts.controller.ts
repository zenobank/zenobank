import { Body, Controller, Param, Post } from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { BinancePayAttemptResponseDto } from './dtos/binance-pay-attempt-response.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePaymentAttemptDto } from './dtos/create-payment-attempt.dto';
import { OnchainAttemptResponseDto } from './dtos/onchain-attempt-response.dto';

@ApiTags('Checkouts')
@Controller('checkouts')
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

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
}
