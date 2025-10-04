import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class BinancePayAttemptResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Unique identifier for the payment attempt',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Token ID for the payment attempt',
    example: 'BINANCE_PAY_USDC',
  })
  tokenId: string;

  @Expose()
  @ApiProperty({
    description: 'Token pay amount for the payment attempt',
    example: '100',
  })
  tokenPayAmount: string;

  @Expose()
  @ApiProperty({
    description: 'Deposit Binance ID for the payment attempt',
    example: '568321',
  })
  binanceIdDepositAccount: string;
}
