// dto/payment-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { PaymentRequest } from '@prisma/client';

export class PaymentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  amount: string;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: Date;

  constructor(partial: Partial<PaymentResponseDto>) {
    Object.assign(this, partial);
  }

  static fromPrisma(paymentRequest: PaymentRequest): PaymentResponseDto {
    return new PaymentResponseDto({
      id: paymentRequest.id,
      amount: paymentRequest.amount.toString(),
      currency: paymentRequest.currency,
      status: paymentRequest.status,
      createdAt: paymentRequest.createdAt,
    });
  }
}
