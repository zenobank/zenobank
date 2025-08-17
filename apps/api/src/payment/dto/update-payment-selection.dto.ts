import { ApiProperty } from '@nestjs/swagger';
import { Network, NetworkId, TokenOnNetwork } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class UpdatePaymentSelectionDto {
  @IsString()
  @ApiProperty({
    example: 'USDC_BASE',
  })
  tokenId: TokenOnNetwork['id'];

  @IsEnum(NetworkId)
  @ApiProperty({
    enum: NetworkId,
    enumName: 'NetworkId',
    example: NetworkId.ETHEREUM_MAINNET,
  })
  networkId: NetworkId;
}
