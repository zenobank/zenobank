import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateBinancePayCredentialDto {
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

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'your-account-id',
    description: 'Account ID',
  })
  accountId: string;
}
