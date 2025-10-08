import { ApiProperty } from '@nestjs/swagger';
import { Network, NetworkType } from '@prisma/client';
import { SupportedNetworksId } from 'src/networks/network.interface';
import { Expose } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsString } from 'class-validator';

export class NetworkResponseDto {
  @Expose()
  @IsString()
  @ApiProperty({
    example: 'ETHEREUM_MAINNET',
  })
  id: string;

  @Expose()
  @IsNumber()
  @ApiProperty({
    example: 1,
    nullable: true,
    description: 'Chain ID of evm networks',
  })
  chainId: number | null;

  @Expose()
  @IsString()
  @ApiProperty({ example: 'Ethereum Mainnet' })
  name: string;

  @Expose()
  @IsString()
  @ApiProperty({ example: 'Ethereum' })
  displayName: string;

  @Expose()
  @IsEnum(NetworkType)
  @ApiProperty({
    example: NetworkType.EVM,
    enum: NetworkType,
  })
  networkType: NetworkType;

  @Expose()
  @IsBoolean()
  @ApiProperty({ example: false })
  isTestnet: boolean;

  @Expose()
  @IsNumber()
  @ApiProperty({ example: 3 })
  minBlockConfirmations: number;

  @Expose()
  @IsNumber()
  @ApiProperty({ example: 100 })
  maxConfirmationAttempts;

  @Expose()
  @IsNumber()
  @ApiProperty({ example: 1000 })
  confirmationRetryDelay;
}
