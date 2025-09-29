import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentService } from './payment.service';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { UpdateDepositSelectionDto } from './dto/update-payment-selection.dto';
import { ApiKeyGuard } from 'src/auth/api-key.guard';
import { ApiKey } from 'src/auth/api-key.decorator';
import { ApiSecurity } from '@nestjs/swagger';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentsService: PaymentService) {}

  @Post('')
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('api-key')
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @ApiKey() apiKey: string,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.createPayment(createPaymentDto, apiKey);
  }

  @Get(':id')
  async getPayment(@Param('id') id: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentsService.getPayment(id);
    if (!payment) {
      throw new NotFoundException();
    }
    return payment;
  }

  @Patch(':id/deposit')
  async updatePaymentDepositSelection(
    @Param('id') id: string,
    @Body() dto: UpdateDepositSelectionDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.updatePaymentDepositSelection(id, dto);
  }
}
