import { ApiProperty } from '@nestjs/swagger';
import { NetworkId, TokenStandard } from '@prisma/client';
import { Expose } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsString, Min } from 'class-validator';

export class TokenResponseDto {
  @Expose()
  @IsString()
  @ApiProperty({ example: 'USDC_ETHEREUM_MAINNET' })
  id: string;

  @Expose()
  @IsString()
  @ApiProperty({ example: 'USDC' })
  canonicalTokenId: string;

  @Expose()
  @IsEnum(TokenStandard)
  @ApiProperty({ enum: TokenStandard, example: TokenStandard.ERC20 })
  standard: TokenStandard;

  @Expose()
  @IsString()
  @ApiProperty({ example: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' })
  address: string;

  @Expose()
  @IsInt()
  @Min(0)
  @ApiProperty({ example: 6 })
  decimals: number;

  @Expose()
  @IsString()
  @ApiProperty({ example: 'USDC' })
  symbol: string;

  @Expose()
  @IsBoolean()
  @ApiProperty({ example: false })
  isDeprecated!: boolean;

  @Expose()
  @IsEnum(NetworkId)
  @ApiProperty({ enum: NetworkId, example: NetworkId.ETHEREUM_MAINNET })
  networkId: NetworkId;
}
