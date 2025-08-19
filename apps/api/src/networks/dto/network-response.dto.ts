import { ApiProperty } from '@nestjs/swagger';
import { Network, NetworkType } from '@prisma/client';
import { Expose } from 'class-transformer';
import { IsBoolean, IsEnum, IsString } from 'class-validator';

export class NetworkResponseDto {
  @Expose()
  @IsString()
  @ApiProperty({
    example: 'ETHEREUM_MAINNET',
  })
  id: string;

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
}
