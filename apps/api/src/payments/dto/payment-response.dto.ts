// dto/payment-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { PaymentRequest, PaymentRequestStatus } from '@prisma/client';

export class PaymentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  amount: string;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  status: PaymentRequestStatus;

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
