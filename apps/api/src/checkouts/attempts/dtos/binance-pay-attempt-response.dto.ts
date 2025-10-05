import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class BinancePayAttemptResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Deposit Binance ID for the payment attempt',
    example: '568321',
  })
  depositAccountId: string;

  @Expose()
  @ApiProperty({
    description: 'Token pay amount for the payment attempt',
    example: '100',
  })
  tokenPayAmount: string;

  @Expose()
  @ApiProperty({
    description: 'Binance token ID for the payment attempt',
    example: 'USDC',
  })
  binanceTokenId: string;
}
