import { ApiProperty } from '@nestjs/swagger';
import { OnChainTokenResponseDto } from './onchain-token-response';
import { BinancePayTokenResponseDto } from './binance-pay-token-response';
import { Expose, Type } from 'class-transformer';

export class CanonicalTokensResponseDto {
  @Expose()
  @Type(() => OnChainTokenResponseDto)
  @ApiProperty({
    type: [OnChainTokenResponseDto],
    description: 'On-chain tokens available for payments',
  })
  ONCHAIN: OnChainTokenResponseDto[];

  @Expose()
  @Type(() => BinancePayTokenResponseDto)
  @ApiProperty({
    type: [BinancePayTokenResponseDto],
    description: 'Binance Pay tokens available for payments',
  })
  BINANCE_PAY: BinancePayTokenResponseDto[];
}
