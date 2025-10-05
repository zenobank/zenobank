import { ApiProperty } from '@nestjs/swagger';
import { Rail } from '@prisma/client';
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
}
