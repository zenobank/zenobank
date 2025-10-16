import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { SupportedNetworksId } from '@repo/networks';

export class WalletResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Unique identifier for the wallet',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Wallet address',
    example: '0xc429e068b65b3462f0e422b3ea388a7a37b23bff',
  })
  @Transform(({ value }) => value.toLowerCase())
  address: string;

  @Expose()
  @ApiProperty({
    description: 'Wallet network',
    example: SupportedNetworksId.ETHEREUM_MAINNET,
    enum: SupportedNetworksId,
  })
  network: SupportedNetworksId;

  @Expose()
  @ApiProperty({
    description: 'Wallet label',
    example: 'Main Wallet',
    nullable: true,
  })
  label: string | null;
}
