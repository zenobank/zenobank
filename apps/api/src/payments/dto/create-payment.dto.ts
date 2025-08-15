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
  amount: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 3)
  currency: string;
}
