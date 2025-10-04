import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { AttemptStatus, CheckoutStatus, PaymentRail } from '@prisma/client';
import { Expose } from 'class-transformer';
import { BinancePayAttemptResponseDto } from './binance-pay-attempt-response.dto';
import { OnchainAttemptResponseDto } from './onchain-attempt-response.dto';
import { PaymentResponseDto } from 'src/payments/dto/payment-response.dto';

export class CheckoutResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Unique identifier for the payment attempt',
    example: 'clx1abcde0000v0z7d4x1abcd',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Checkout ID this attempt belongs to',
    example: 'clx2fghij0000v0z7d4x2fghi',
  })
  checkoutId: string;

  @ApiProperty({
    description: 'Status of the checkout attempt',
    enum: CheckoutStatus,
    example: CheckoutStatus.OPEN,
  })
  @Expose()
  status: CheckoutStatus;

  @Expose()
  @ApiProperty({
    description: 'Payments attempts',
    isArray: true,
    oneOf: [
      { $ref: getSchemaPath(BinancePayAttemptResponseDto) },
      { $ref: getSchemaPath(OnchainAttemptResponseDto) },
    ],
  })
  paymentsAttempts: Array<
    BinancePayAttemptResponseDto | OnchainAttemptResponseDto
  >;
}
