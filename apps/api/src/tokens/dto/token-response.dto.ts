import { ApiProperty } from '@nestjs/swagger';
import { TokenStandard } from '@prisma/client';
import { SupportedNetworksId } from 'src/networks/network.interface';
import { Expose } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

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
  @ApiProperty({
    example: SupportedNetworksId.ETHEREUM_MAINNET,
  })
  networkId: string | null;

  @Expose()
  @IsEnum(TokenStandard)
  @ApiProperty({ enum: TokenStandard, example: TokenStandard.ERC20 })
  standard: TokenStandard;

  @Expose()
  @IsString()
  @ApiProperty({ example: 'USDC' })
  symbol: string;

  @Expose()
  @IsString()
  @ApiProperty({ example: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' })
  address: string | null;

  @Expose()
  @IsInt()
  @Min(0)
  @ApiProperty({ example: 6 })
  decimals: number | null;

  @Expose()
  @IsUrl()
  @ApiProperty({ example: 'https://example.com/logo.png' })
  logoUrl: string;
}
