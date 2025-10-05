import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsISO4217CurrencyCode,
  IsNotEmpty,
  IsNumberString,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { trimTrailingDecimalZeros } from 'src/lib/utils/numbers';

export class CreateCheckoutDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(256)
  @ApiProperty({
    example: 'order-12345',
    description: 'Unique order identifier',
  })
  orderId: string;

  @IsNotEmpty()
  @IsNumberString()
  // @IsPositive()
  @ApiProperty({
    example: '100.12',
    description: 'Price amount in the specified currency',
  })
  //   @Transform(({ value }) => trimTrailingDecimalZeros(value))
  priceAmount: string;

  @IsNotEmpty()
  @IsISO4217CurrencyCode()
  @Transform(({ value }) => value?.toUpperCase())
  @ApiProperty({
    example: 'USD',
    description: 'ISO 4217 currency code',
  })
  priceCurrency: string;
}
