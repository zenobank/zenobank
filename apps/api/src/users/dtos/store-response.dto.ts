import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { WalletResponseDto } from 'src/wallet/dto/wallet.response.dto';

export class StoreResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Unique identifier for the store',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Name of the store',
    example: 'My Store',
  })
  name: string;

  @Expose()
  @ApiProperty({
    description: 'Domain of the store',
    example: 'my-store.com',
  })
  domain: string;

  @Expose()
  @ApiProperty({
    description: 'API key for the store',
    example: 'cuid_1234567890abcdef',
  })
  apiKey: string;

  @Expose()
  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @Expose()
  @Type(() => WalletResponseDto)
  @ApiProperty({
    description: 'Associated wallets',
    type: [WalletResponseDto],
  })
  wallets: WalletResponseDto[];
}
