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
  IsUrl,
  IsNotEmpty,
} from 'class-validator';

type PaymentWithAddress = Payment & {
  depositWalletAddress: string | null;
};

// Tipo más estricto que requiere campos críticos
type RequiredPaymentFields = {
  id: string;
  priceAmount: string;
  priceCurrency: string;
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
  @IsNotEmpty()
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  id: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '100',
    required: true,
  })
  amount: string;

  @Expose()
  @IsISO4217CurrencyCode()
  @IsNotEmpty()
  @ApiProperty({
    example: 'USD',
    required: true,
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
    example: '2025-09-18T17:15:26.969Z',
  })
  createdAt: Date;

  @Expose()
  @IsDate()
  @ApiProperty({
    example: '2025-09-18T18:15:26.971Z',
  })
  expiredAt: Date | null;

  @Expose()
  @ApiProperty({ type: DepositDetailsDto, nullable: true })
  depositDetails: DepositDetailsDto | null;

  @Expose()
  @IsString()
  @IsUrl()
  @ApiProperty({
    required: true,
  })
  paymentUrl: string;

  @Expose()
  @IsUrl()
  @ApiProperty({
    example: 'https://example.com/notify',
  })
  notifyUrl: string | null;

  constructor(partial: Partial<PaymentResponseDto>) {
    Object.assign(this, partial);
  }

  static fromPrisma(
    payment: PaymentWithAddress & RequiredPaymentFields,
  ): PaymentResponseDto {
    const paymentUrl = getPaymentUrl(payment.id);
    if (!paymentUrl) {
      throw new Error('Payment URL could not be generated');
    }

    const dto = {
      id: payment.id,
      amount: payment.priceAmount,
      currency: payment.priceCurrency,
      status: payment.status,
      createdAt: payment.createdAt,
      expiredAt: payment.expiredAt,
      notifyUrl: payment.notifyUrl,
      paymentUrl,
      depositDetails:
        payment.depositWalletAddress &&
        payment.payCurrencyId &&
        payment.networkId
          ? plainToInstance(DepositDetailsDto, {
              address: payment.depositWalletAddress,
              amount: payment.payAmount,
              currencyId: payment.payCurrencyId,
              networkId: payment.networkId,
            })
          : null,
    } satisfies PaymentResponseDto;

    return plainToInstance(PaymentResponseDto, dto);
  }
}
