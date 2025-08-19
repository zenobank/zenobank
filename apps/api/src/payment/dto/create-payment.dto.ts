import { ApiProperty } from '@nestjs/swagger';
import {
  IsISO4217CurrencyCode,
  IsNotEmpty,
  IsNumberString,
  IsPositive,
} from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsNumberString()
  @IsPositive()
  @ApiProperty({
    example: '100',
  })
  amount: string;

  @IsNotEmpty()
  @IsISO4217CurrencyCode()
  @ApiProperty({
    example: 'USD',
  })
  currency: string;
}
