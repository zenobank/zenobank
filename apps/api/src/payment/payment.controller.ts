import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentService } from './payment.service';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { UpdatePaymentSelectionDto } from './dto/update-payment-selection.dto';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentsService: PaymentService) {}

  @Post('')
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.createPayment(createPaymentDto);
  }

  @Get(':id')
  async getPayment(@Param('id') id: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentsService.getPayment(id);
    if (!payment) {
      throw new NotFoundException();
    }
    return payment;
  }

  @Patch(':id/selection')
  async updatePaymentSelection(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentSelectionDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.updatePaymentSelection(id, dto);
  }
}
