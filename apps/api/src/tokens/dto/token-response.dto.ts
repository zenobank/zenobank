import { ApiProperty } from '@nestjs/swagger';
import { Provider, Rail, TokenStandard } from '@prisma/client';
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
  @IsEnum(Rail)
  @ApiProperty({ enum: Rail, example: Rail.ONCHAIN })
  rail: Rail;

  @Expose()
  @IsString()
  @ApiProperty({ example: 'USDC' })
  symbol: string;

  @Expose()
  @IsUrl()
  @ApiProperty({ example: 'https://example.com/logo.png' })
  logoUrl: string;

  /* On-chain */
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
  @IsString()
  @ApiProperty({ example: SupportedNetworksId.ETHEREUM_MAINNET })
  networkId: string | null;

  /* Custodial */
  @Expose()
  @IsString()
  @ApiProperty({ example: null })
  providerTokenId: string | null;

  @Expose()
  @IsEnum(Provider)
  @ApiProperty({ enum: Provider, example: null })
  provider: Provider | null;
}

// export class OnChainTokenResponseDto extends TokenResponseDto {
//   @Expose()
//   @IsString()
//   @ApiProperty({ example: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' })
//   address: string;

//   @Expose()
//   @IsInt()
//   @Min(0)
//   @ApiProperty({ example: 6 })
//   decimals: number;

//   @Expose()
//   @IsEnum(TokenStandard)
//   @ApiProperty({ enum: TokenStandard, example: TokenStandard.ERC20 })
//   standard: TokenStandard;

//   @Expose()
//   @ApiProperty({
//     example: SupportedNetworksId.ETHEREUM_MAINNET,
//   })
//   networkId: string;
// }

// export class CustodialTokenResponseDto extends TokenResponseDto {
//   @Expose()
//   @IsString()
//   @ApiProperty({ example: 'USDC' })
//   providerTokenId: string;

//   @Expose()
//   @IsEnum(Provider)
//   @ApiProperty({ enum: Provider, example: Provider.BINANCE_PAY })
//   provider: Provider;

//   @Expose()
//   @IsString()
//   @ApiProperty({ example: '1234567890' })
//   accountId: string;
// }
