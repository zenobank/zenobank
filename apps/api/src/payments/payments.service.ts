import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomUUID } from 'crypto';
import { PaymentResponseDto } from './dto/payment-response.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly db: PrismaService) {}
  async createPayment(
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    const { amount, currency } = createPaymentDto;
    const payment = await this.db.paymentRequest.create({
      data: {
        amount,
        currency,
        notifyUrl: 'https://example.com/notify',
        orderId: randomUUID(),
        expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });
    return PaymentResponseDto.fromPrisma(payment);
  }
}
