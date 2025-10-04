import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { SupportedNetworksId } from 'src/networks/network.interface';

export class OnchainAttemptResponseDto {
  @Expose()
  @ApiProperty({ description: 'Unique identifier for the payment attempt' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'Token ID for the payment attempt' })
  tokenId: string;

  @Expose()
  @ApiProperty({ description: 'Token pay amount for the payment attempt' })
  tokenPayAmount: string;

  @Expose()
  @ApiProperty({ description: 'Network ID for the payment attempt' })
  networkId: SupportedNetworksId;

  @Expose()
  @ApiProperty({
    description: 'Deposit wallet address for the payment attempt',
  })
  depositWalletAddress: string;
}
