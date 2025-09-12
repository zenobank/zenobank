// dto/payment-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Payment, PaymentStatus } from '@prisma/client';
import { NetworkId } from 'src/networks/network.interface';
import { Env, getEnv } from 'src/lib/utils/env';
import { getPaymentUrl } from '../lib/utils';
import ms from 'src/lib/utils/ms';
import { Expose, plainToInstance } from 'class-transformer';
import {
  IsString,
  IsEthereumAddress,
  IsEnum,
  IsISO4217CurrencyCode,
  IsDate,
} from 'class-validator';

type PaymentWithAddress = Payment & {
  depositWalletAddress: string | null;
};

export class DepositDetailsDto {
  @Expose()
  @IsEthereumAddress()
  @ApiProperty({
    example: '0x1234567890123456789012345678901234567890',
  })
  address: string;

  @Expose()
  @IsString()
  @ApiProperty({
    example: 'USDC_ARBITRUM',
  })
  currencyId: string;

  @Expose()
  @IsString()
  @ApiProperty({
    example: '100',
  })
  amount: string;

  @Expose()
  @IsEnum(NetworkId)
  @ApiProperty({
    example: NetworkId.ARBITRUM_MAINNET,
    enum: NetworkId,
    enumName: 'NetworkId',
  })
  networkId: NetworkId;
}

export class PaymentResponseDto {
  @Expose()
  @IsString()
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @Expose()
  @IsString()
  @ApiProperty({
    example: '100',
  })
  amount: string;

  @Expose()
  @IsISO4217CurrencyCode()
  @ApiProperty({
    example: 'USD',
  })
  currency: string;

  @Expose()
  @IsEnum(PaymentStatus)
  @ApiProperty({
    enum: PaymentStatus,
    enumName: 'PaymentStatus',
    example: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Expose()
  @IsDate()
  @ApiProperty({
    example: new Date().toISOString(),
  })
  createdAt: Date;

  @Expose()
  @IsDate()
  @ApiProperty({
    example: new Date(Date.now() + ms('1h')).toISOString(),
  })
  expiredAt: Date;

  @Expose()
  @ApiProperty({ type: DepositDetailsDto, nullable: true })
  depositDetails: DepositDetailsDto | null;

  @Expose()
  @IsString()
  @ApiProperty()
  paymentUrl: string;

  constructor(partial: Partial<PaymentResponseDto>) {
    Object.assign(this, partial);
  }

  static fromPrisma(payment: PaymentWithAddress): PaymentResponseDto {
    return plainToInstance(PaymentResponseDto, {
      ...payment,
      amount: payment.amount,
      paymentUrl: getPaymentUrl(payment.id),
      depositDetails:
        payment.depositWalletAddress && payment.tokenId && payment.networkId
          ? plainToInstance(DepositDetailsDto, {
              address: payment.depositWalletAddress,
              amount: payment.tokenAmount,
              currencyId: payment.tokenId,
              networkId: payment.networkId,
            })
          : null,
    });
  }
}
