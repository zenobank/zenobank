// dto/payment-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from '@prisma/client';
import { Expose } from 'class-transformer';
import {
  IsString,
  IsEnum,
  IsISO4217CurrencyCode,
  IsDate,
  IsUrl,
  IsNotEmpty,
} from 'class-validator';
import { DepositDetailsDto } from './payment-deposit-response.dto';

export class PaymentResponseDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  id: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '100',
    required: true,
  })
  priceAmount: string;

  @Expose()
  @IsISO4217CurrencyCode()
  @IsNotEmpty()
  @ApiProperty({
    example: 'USD',
    required: true,
  })
  priceCurrency: string;

  @Expose()
  @IsEnum(PaymentStatus)
  @ApiProperty({
    enum: PaymentStatus,
    enumName: 'PaymentStatus',
    example: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Expose()
  @IsDate()
  @ApiProperty({
    example: '2025-09-18T17:15:26.969Z',
  })
  createdAt: Date;

  @Expose()
  @IsDate()
  @ApiProperty({
    example: '2025-09-18T18:15:26.971Z',
  })
  expiredAt: Date | null;

  @Expose()
  @ApiProperty({ type: DepositDetailsDto, nullable: true })
  depositDetails: DepositDetailsDto | null;

  @Expose()
  @IsString()
  @IsUrl()
  @ApiProperty({
    required: true,
  })
  paymentUrl: string;

  @Expose()
  @IsUrl()
  @ApiProperty({
    example: 'https://example.com/webhook',
    nullable: true,
  })
  webhookUrl: string | null;

  @Expose()
  @IsUrl()
  @ApiProperty({
    example: 'https://example.com/success',
    nullable: true,
  })
  successUrl: string | null;

  @Expose()
  @IsString()
  transactionHash: string | null;
}
