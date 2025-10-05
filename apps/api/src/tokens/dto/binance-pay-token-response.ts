import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString, IsUrl } from 'class-validator';

export class BinancePayTokenResponseDto {
  @Expose()
  @IsString()
  @ApiProperty({ example: 'USDC_BINANCE_PAY' })
  id: string;

  @Expose()
  @IsString()
  @ApiProperty({ example: 'USDC' })
  canonicalTokenId: string;

  @Expose()
  @IsString()
  @ApiProperty({ example: 'USDC' })
  binanceTokenId: string;

  @Expose()
  @IsString()
  @ApiProperty({ example: 'USDC' })
  symbol: string;

  @Expose()
  @IsUrl()
  @ApiProperty({ example: 'https://example.com/logo.png' })
  logoUrl: string;
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
