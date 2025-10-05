import { ApiProperty } from '@nestjs/swagger';
import { PaymentRail } from '@prisma/client';
import { Expose } from 'class-transformer';
import { SupportedNetworksId } from 'src/networks/network.interface';

export class PaymentAttemptResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Unique identifier for the payment attempt',
    example: 'cjoa8x1r00001qzrmn5z5x1r2',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Payment rail for the payment attempt',
    enum: PaymentRail,
    example: PaymentRail.ONCHAIN,
  })
  rail: PaymentRail;

  //   depositDetails: {

  //     // si es PaymentRail.ONCHAIN, estos
  //  @Expose()
  //   @ApiProperty({
  //     description: 'Token ID for the payment attempt',
  //     example: 'USDC_ETHEREUM_MAINNET',
  //   })
  //   tokenId: string;

  //   @Expose()
  //   @ApiProperty({
  //     description: 'Token pay amount for the payment attempt',
  //     example: '100',
  //   })
  //   tokenPayAmount: string;

  //   @Expose()
  //   @ApiProperty({
  //     description: 'Network ID for the payment attempt',
  //     enum: SupportedNetworksId,
  //     example: SupportedNetworksId.ETHEREUM_MAINNET,
  //   })
  //   networkId: SupportedNetworksId;

  //   @Expose()
  //   @ApiProperty({
  //     description: 'Deposit wallet address for the payment attempt',
  //     example: '0x1234567890123456789012345678901234567890',
  //   })
  //   depositWalletAddress: string;
  //   }

  //   // si es Payment.onrail.custodial, estos
  //   // accountId
}
