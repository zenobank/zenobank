import { ApiProperty } from '@nestjs/swagger';
import { CheckoutStatus } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';
import { OnchainAttemptResponseDto } from '../attempts/dtos/onchain-attempt-response.dto';
import { BinancePayAttemptResponseDto } from '../attempts/dtos/binance-pay-attempt-response.dto';
import { BinancePayTokenResponseDto } from 'src/tokens/dto/binance-pay-token-response';
import { OnChainTokenResponseDto } from 'src/tokens/dto/on-chain-token-response';

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
}
