import { ApiProperty } from '@nestjs/swagger';
import { Network, Token } from '@prisma/client';
import { SupportedNetworksId } from 'src/networks/network.interface';
import { IsEnum, IsString } from 'class-validator';

export class UpdateDepositSelectionDto {
  @IsString()
  @ApiProperty({
    example: 'USDC_BASE_MAINNET',
  })
  tokenId: Token['id'];
}
