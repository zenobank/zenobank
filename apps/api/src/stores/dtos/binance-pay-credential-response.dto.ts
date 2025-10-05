import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class BinancePayCredentialResponseDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'cuid_1234567890abcdef' })
  apiKey: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '568321' })
  accountId: string;
}
