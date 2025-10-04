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
import { CheckoutAttemptResponseDto } from './attempts/dtos/checkout-attempt-response.dto';
import { AttemptsService } from './attempts/attempts.service';

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
  @Get(':id/attempts')
  @ApiOperation({ summary: 'Get checkout attempts by ID' })
  async getCheckoutAttempts(
    @Param('id') id: string,
  ): Promise<CheckoutAttemptResponseDto[]> {
    const attempts = await this.attemptsService.getCheckoutAttempts(id);
    return attempts;
  }
}
