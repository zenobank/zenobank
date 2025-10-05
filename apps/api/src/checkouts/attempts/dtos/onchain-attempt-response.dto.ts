import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { WalletResponseDto } from 'src/wallets/dto/wallet.response.dto';

export class OnchainAttemptResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Token ID for the payment attempt',
    example: 'USDC',
  })
  tokenId: string;

  @Expose()
  @ApiProperty({
    description: 'Token pay amount for the payment attempt',
    example: '100',
  })
  tokenPayAmount: string;

  @Expose()
  @ApiProperty({
    description: 'Network ID for the payment attempt',
    example: 'ETHEREUM_MAINNET',
  })
  networkId: string;

  @Expose()
  @Type(() => WalletResponseDto)
  depositWallet: WalletResponseDto;
}
