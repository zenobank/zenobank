import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class BinancePayAttemptResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Deposit Binance ID for the payment attempt',
    example: '568321',
  })
  binanceIdDepositAccount: string;
}
