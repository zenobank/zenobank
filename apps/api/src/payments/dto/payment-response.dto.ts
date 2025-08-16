// dto/payment-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { PaymentRequest, PaymentRequestStatus } from '@prisma/client';

export class PaymentResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    example: '100',
  })
  amount: string;

  @ApiProperty({
    example: 'USD',
  })
  currency: string;

  @ApiProperty({
    enum: PaymentRequestStatus,
    enumName: 'PaymentRequestStatus',
    example: PaymentRequestStatus.PENDING,
  })
  status: PaymentRequestStatus;

  @ApiProperty({
    example: new Date().toISOString(),
  })
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
