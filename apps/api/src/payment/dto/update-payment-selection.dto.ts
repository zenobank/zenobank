import { ApiProperty } from '@nestjs/swagger';
import { Network, Token } from '@repo/db';
import { NetworkId } from 'src/networks/network.interface';
import { IsEnum, IsString } from 'class-validator';

export class UpdateDepositSelectionDto {
  @IsString()
  @ApiProperty({
    example: 'USDC_BASE',
  })
  tokenId: Token['id'];

  @IsEnum(NetworkId)
  @ApiProperty({
    enum: NetworkId,
    enumName: 'NetworkId',
    example: NetworkId.ETHEREUM_MAINNET,
  })
  networkId: NetworkId;
}
