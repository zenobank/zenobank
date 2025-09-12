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
import { UpdateDepositSelectionDto } from './dto/update-payment-selection.dto';
import { Convert } from 'easy-currencies';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentsService: PaymentService) {}

  @Get('test')
  async test() {
    const amount = await Convert(15).from('USD').to('USD');
    console.log('Converted:', amount);
    return { amount };
  }

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

  @Patch(':id/deposit')
  async updatePaymentDepositSelection(
    @Param('id') id: string,
    @Body() dto: UpdateDepositSelectionDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.updatePaymentDepositSelection(id, dto);
  }
}
