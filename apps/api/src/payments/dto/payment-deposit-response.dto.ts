import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEthereumAddress, IsString, IsEnum } from 'class-validator';
import { SupportedNetworksId } from '@repo/networks';

export class DepositDetailsDto {
  @Expose()
  @IsEthereumAddress()
  @ApiProperty({
    example: '0x1234567890123456789012345678901234567890',
  })
  address: string;

  @Expose()
  @IsString()
  @ApiProperty({
    example: 'USDC_ARBITRUM',
  })
  currencyId: string;

  @Expose()
  @IsString()
  @ApiProperty({
    example: '100',
  })
  amount: string;

  @Expose()
  @IsEnum(SupportedNetworksId)
  @ApiProperty({
    example: SupportedNetworksId.ARBITRUM_ONE_MAINNET,
    enum: SupportedNetworksId,
    enumName: 'NetworkId',
  })
  networkId: SupportedNetworksId;
}
