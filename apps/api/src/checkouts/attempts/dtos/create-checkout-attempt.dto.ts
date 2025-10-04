import { ApiProperty } from '@nestjs/swagger';
import { PaymentRail } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCheckoutAttemptDto {
  @ApiProperty({
    description: 'Token ID to use for this attempt',
    example: 'USDC_ETHEREUM_MAINNET',
  })
  @IsString()
  @MaxLength(256)
  @IsNotEmpty()
  tokenId: string;

  @ApiProperty({
    description: 'Payment rail to use for this attempt',
    enum: PaymentRail,
    example: PaymentRail.ONCHAIN,
  })
  @IsEnum(PaymentRail)
  @IsNotEmpty()
  rail: PaymentRail;
}
