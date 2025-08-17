// dto/payment-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { NetworkId, Payment, PaymentStatus } from '@prisma/client';
import { Env, getEnv } from 'src/lib/utils/env';
import { getPaymentUrl } from '../lib/utils';
import ms from 'src/lib/utils/ms';

type PaymentWithAddress = Payment & {
  depositWalletAddress: string | null;
};

export class DepositDetailsDto {
  @ApiProperty({
    example: '0x1234567890123456789012345678901234567890',
  })
  address: string;

  @ApiProperty({
    example: 'USDC_ARBITRUM',
  })
  currencyId: string;

  @ApiProperty({
    example: NetworkId.ARBITRUM_MAINNET,
    enum: NetworkId,
    enumName: 'NetworkId',
  })
  networkId: NetworkId;
}

export class PaymentResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    example: '100',
  })
  amount: string;

  @ApiProperty({
    example: 'USD',
  })
  currency: string;

  @ApiProperty({
    enum: PaymentStatus,
    enumName: 'PaymentStatus',
    example: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @ApiProperty({
    example: new Date().toISOString(),
  })
  createdAt: Date;

  @ApiProperty({
    example: new Date(Date.now() + ms('1h')).toISOString(),
  })
  expiredAt: Date;

  @ApiProperty({ type: DepositDetailsDto, nullable: true })
  depositDetails: DepositDetailsDto | null;

  @ApiProperty()
  paymentUrl: string;

  constructor(partial: Partial<PaymentResponseDto>) {
    Object.assign(this, partial);
  }

  static fromPrisma(payment: PaymentWithAddress): PaymentResponseDto {
    return new PaymentResponseDto({
      id: payment.id,
      paymentUrl: getPaymentUrl(payment.id),
      depositDetails:
        payment.depositWalletAddress && payment.tokenId && payment.networkId
          ? {
              address: payment.depositWalletAddress,
              currencyId: payment.tokenId,
              networkId: payment.networkId,
            }
          : null,
      amount: payment.amount.toString(),
      currency: payment.currency,
      status: payment.status,
      createdAt: payment.createdAt,
      expiredAt: payment.expiredAt,
    });
  }
}
