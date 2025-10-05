import { ApiProperty } from '@nestjs/swagger';
import { MethodType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePaymentAttemptDto {
  @ApiProperty({
    description: 'Token ID to use for this attempt',
    example: 'USDC_ETHEREUM_MAINNET',
  })
  @IsString()
  @MaxLength(256)
  @IsNotEmpty()
  tokenId: string;

  @ApiProperty({
    description: 'Checkout ID to use for this attempt',
    example: 'ckl1234567890',
  })
  @IsString()
  @MaxLength(256)
  @IsNotEmpty()
  checkoutId: string;
}
