import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  ValidateIf,
  IsDefined,
  IsEmpty,
} from 'class-validator';
import { PaymentRail } from '@prisma/client';

export class UpdateDepositSelectionDto {
  @ApiProperty({ enum: PaymentRail, example: PaymentRail.ONCHAIN })
  @IsEnum(PaymentRail)
  rail: PaymentRail;

  @ApiPropertyOptional({
    example: 'USDC_ETHEREUM_MAINNET',
    description: 'Required only when rail = ONCHAIN',
  })
  // tokenId is required only when rail is ONCHAIN
  @ValidateIf((o) => o.rail === PaymentRail.ONCHAIN)
  @IsDefined({ message: 'tokenId is required when rail = ONCHAIN' })
  @IsString()
  // tokenId must be empty when rail is not ONCHAIN
  @ValidateIf((o) => o.rail !== PaymentRail.ONCHAIN)
  @IsEmpty({ message: 'tokenId only applies when rail = ONCHAIN' })
  tokenId?: string;
}
