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
  id: Network['id'];

  @Expose()
  @IsString()
  @ApiProperty({ example: 'Ethereum Mainnet' })
  name: Network['name'];

  @Expose()
  @IsString()
  @ApiProperty({ example: 'Ethereum' })
  displayName: Network['displayName'];

  @Expose()
  @IsEnum(NetworkType)
  @ApiProperty({
    example: NetworkType.EVM,
    enum: NetworkType,
  })
  networkType: Network['networkType'];

  @Expose()
  @IsBoolean()
  @ApiProperty({ example: false })
  isTestnet: Network['isTestnet'];
}
