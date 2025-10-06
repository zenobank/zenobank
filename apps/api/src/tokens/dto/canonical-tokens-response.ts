import { ApiProperty } from '@nestjs/swagger';
import { MethodType } from '@prisma/client';
import { OnChainTokenResponseDto } from './onchain-token-response';
import { BinancePayTokenResponseDto } from './binance-pay-token-response';

export class CanonicalTokensResponseDto {
  @ApiProperty({
    type: [OnChainTokenResponseDto],
    description: 'On-chain tokens available for payments',
  })
  [MethodType.ONCHAIN]: OnChainTokenResponseDto[];

  @ApiProperty({
    type: [BinancePayTokenResponseDto],
    description: 'Binance Pay tokens available for payments',
  })
  [MethodType.BINANCE_PAY]: BinancePayTokenResponseDto[];
}

