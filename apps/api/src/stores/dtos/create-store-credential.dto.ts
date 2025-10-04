import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

enum Provider {
  BINANCE_PAY = 'BINANCE_PAY',
}

export class CreateStoreCredentialDto {
  @IsNotEmpty()
  @IsEnum(Provider)
  @ApiProperty({
    enum: Provider,
    example: Provider.BINANCE_PAY,
    description: 'Credential provider',
  })
  provider: Provider;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'your-api-key',
    description: 'API Key',
  })
  apiKey: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'your-api-secret',
    description: 'API Secret',
  })
  apiSecret: string;
}
