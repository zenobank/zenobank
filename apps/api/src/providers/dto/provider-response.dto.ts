import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class ProviderResponseDto {
  @Expose()
  @IsString()
  @ApiProperty({
    example: 'BINANCE_PAY',
  })
  id: string;
  @Expose()
  @IsString()
  @ApiProperty({
    example: 'Binance Pay',
  })
  name: string;
  @Expose()
  @IsString()
  @ApiProperty({
    example: 'Binance Pay',
  })
  displayName: string;
}
