import { ApiProperty } from '@nestjs/swagger';
import { CheckoutStatus, PaymentRail } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CheckoutResponseDto {
  @Expose()
  @ApiProperty({
    example: 'ckl1234567890',
    description: 'Checkout ID',
  })
  id: string;

  @Expose()
  @ApiProperty({
    example: 'order-12345',
    description: 'Unique order identifier',
  })
  orderId: string;

  @Expose()
  @ApiProperty({
    example: 'USD',
    description: 'Currency code',
  })
  priceCurrency: string;

  @Expose()
  @ApiProperty({
    example: '100.00',
    description: 'Price amount',
  })
  priceAmount: string;

  @Expose()
  @ApiProperty({
    enum: CheckoutStatus,
    example: CheckoutStatus.OPEN,
    description: 'Current status of the checkout',
  })
  status: CheckoutStatus;

  @Expose()
  @ApiProperty({
    example: '2025-10-05T12:00:00Z',
    description: 'Expiration date',
    nullable: true,
  })
  expiresAt: Date | null;

  @Expose()
  @ApiProperty({
    example: ['ONCHAIN', 'BINANCE_PAY'],
    description: 'Enabled payment rails',
    enum: PaymentRail,
    isArray: true,
  })
  enabledRails: PaymentRail[];

  @Expose()
  @ApiProperty({
    example: 'https://pay.zenobank.io/ckl1234567890',
    description: 'URL to complete the checkout',
  })
  checkoutUrl: string;

  @Expose()
  @ApiProperty({
    example: '2025-10-04T10:00:00Z',
    description: 'Creation date',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    example: '2025-10-04T10:00:00Z',
    description: 'Last update date',
  })
  updatedAt: Date;
}
