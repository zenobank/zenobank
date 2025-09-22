import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer/types/decorators';
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

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsNumberString()
  @IsPositive()
  @ApiProperty({
    example: '100',
  })
  priceAmount: string;

  @IsNotEmpty()
  @IsISO4217CurrencyCode()
  @ApiProperty({
    example: 'USD',
  })
  @Transform(({ value }) => value?.toUpperCase())
  priceCurrency: string;

  // optional
  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  @ApiProperty({
    example: 'https://example.com/webhook',
    nullable: true,
  })
  webhookUrl: string | null;

  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  @ApiProperty({
    example: 'https://example.com/success',
    nullable: true,
  })
  successUrl: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  verificationToken: string | null;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '765',
    nullable: true,
  })
  orderId: string | null;
}
