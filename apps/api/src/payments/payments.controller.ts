import { Body, Controller, Post } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('')
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    this.paymentsService.createPayment(createPaymentDto);
  }
}
