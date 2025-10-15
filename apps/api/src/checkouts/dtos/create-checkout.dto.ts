import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsISO4217CurrencyCode,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
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

  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  @ApiProperty({
    example: 'https://example.com/webhook',
    description:
      'Webhook URL to notify checkout status changes. For example, when the checkout is paid',
    nullable: true,
  })
  webhookUrl: string | null = null;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description:
      'Verification token signed with an secret key to ensure webhook integrity',
    nullable: true,
  })
  verificationToken: string | null = null;
}
