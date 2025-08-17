// dto/payment-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Payment, PaymentStatus } from '@prisma/client';
import { Env, getEnv } from 'src/lib/utils/env';
import { getPaymentUrl } from '../lib/utils';

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
    enum: PaymentStatus,
    enumName: 'PaymentStatus',
    example: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @ApiProperty({
    example: new Date().toISOString(),
  })
  createdAt: Date;

  @ApiProperty()
  paymentUrl: string;

  constructor(partial: Partial<PaymentResponseDto>) {
    Object.assign(this, partial);
  }

  static fromPrisma(payment: Payment): PaymentResponseDto {
    return new PaymentResponseDto({
      id: payment.id,
      paymentUrl: getPaymentUrl(payment.id),
      amount: payment.amount.toString(),
      currency: payment.currency,
      status: payment.status,
      createdAt: payment.createdAt,
    });
  }
}
