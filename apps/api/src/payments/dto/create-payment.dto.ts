import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    example: '100',
  })
  amount: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 3)
  @ApiProperty({
    example: 'USD',
  })
  currency: string;
}
