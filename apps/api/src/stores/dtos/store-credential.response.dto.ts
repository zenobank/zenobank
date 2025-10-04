import { ApiProperty } from '@nestjs/swagger';
import { Provider } from '@prisma/client';
import { Expose } from 'class-transformer';

export class StoreCredentialDto {
  @Expose()
  @ApiProperty({
    description: 'Provider for the store',
    example: Provider.BINANCE_PAY,
  })
  provider: Provider;

  @Expose()
  @ApiProperty({
    description: 'API key for the store',
    example: 'cuid_1234567890abcdef',
  })
  apiKey: string;
}
