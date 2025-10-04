// // dto/attempt-selection-response.dto.ts
// // ————————————————————————————————————————————————————————————————
// import { ApiProperty } from '@nestjs/swagger';
// import { AttemptStatus, PaymentRail, Token } from '@prisma/client';
// import { Expose, Type } from 'class-transformer';
// import {
//   IsDate,
//   IsEnum,
//   IsNotEmpty,
//   IsOptional,
//   IsString,
//   IsUrl,
// } from 'class-validator';
// import { SupportedNetworksId } from 'src/networks/network.interface';

// export class OnchainAttemptDetailsDto {
//   @Expose()
//   @ApiProperty({ example: '0x1234567890123456789012345678901234567890' })
//   @IsString()
//   address: string;

//   @Expose()
//   @ApiProperty({ example: SupportedNetworksId.ETHEREUM_MAINNET })
//   @IsString()
//   networkId: SupportedNetworksId;

//   @Expose()
//   @ApiProperty({ example: 'USDC_ETHEREUM_MAINNET' })
//   @IsString()
//   tokenId: string;

//   @Expose()
//   @ApiProperty({ example: 6 })
//   tokenDecimals: number;

//   @Expose()
//   @ApiProperty({ example: '100' })
//   @IsString()
//   expectedAmount: string;

//   @Expose()
//   @ApiProperty({ example: 3 })
//   minConfirmations: number;

//   @Expose()
//   @ApiProperty({ example: 0 })
//   confirmations: number;

//   @Expose()
//   @ApiProperty({ example: '0xTRANSACTIONHASH', nullable: true })
//   @IsOptional()
//   @IsString()
//   transactionHash?: string | null;
// }

// export class BinancePayDetailsDto {
//   @Expose()
//   @ApiProperty({ example: 'attempt_cj1k4z...' })
//   merchantTradeNo: string;

//   @Expose()
//   @ApiProperty({ example: 'https://pay.binance.com/qr/abcdef', nullable: true })
//   @IsOptional()
//   @IsUrl()
//   qrCodeUrl?: string | null;

//   @Expose()
//   @ApiProperty({ example: '1234567890', nullable: true })
//   @IsOptional()
//   prepayId?: string | null;

//   @Expose()
//   @ApiProperty({ example: '987654321', nullable: true })
//   @IsOptional()
//   transactionId?: string | null;

//   @Expose()
//   @ApiProperty({ example: 'PENDING' })
//   nativeStatus: string;

//   @Expose()
//   @ApiProperty({ example: '2025-09-18T18:15:26.971Z', nullable: true })
//   @IsOptional()
//   expireAt?: Date | null;
// }

// export class AttemptSelectionResponseDto {
//   @Expose()
//   @IsString()
//   @IsNotEmpty()
//   @ApiProperty({ example: 'chk_cj1k4z...' })
//   checkoutId: string;

//   @Expose()
//   @IsString()
//   @IsNotEmpty()
//   @ApiProperty({ example: 'att_cj1k4z...' })
//   attemptId: string;

//   @Expose()
//   @IsEnum(PaymentRail)
//   @ApiProperty({ enum: PaymentRail, example: PaymentRail.ONCHAIN })
//   rail: PaymentRail;

//   @Expose()
//   @IsString()
//   @ApiProperty({ example: '100' })
//   priceAmount: string;

//   @Expose()
//   @IsString()
//   @ApiProperty({ example: 'USD' })
//   priceCurrency: string;

//   @Expose()
//   @IsEnum(AttemptStatus)
//   @ApiProperty({ enum: AttemptStatus, example: AttemptStatus.PENDING })
//   status: AttemptStatus;

//   @Expose()
//   @ApiProperty({ example: '2025-09-18T18:15:26.971Z', nullable: true })
//   @IsOptional()
//   @IsDate()
//   expiresAt: Date | null;

//   @Expose()
//   @IsString()
//   @IsUrl()
//   @ApiProperty({ example: 'https://tuapp.com/checkout/chk_cj1k4z' })
//   paymentUrl: string;

//   // Detalles específicos por rail (uno u otro)
//   @Expose()
//   @ApiProperty({ type: OnchainAttemptDetailsDto, nullable: true })
//   @Type(() => OnchainAttemptDetailsDto)
//   onchain?: OnchainAttemptDetailsDto | null;

//   @Expose()
//   @ApiProperty({ type: BinancePayDetailsDto, nullable: true })
//   @Type(() => BinancePayDetailsDto)
//   binancePay?: BinancePayDetailsDto | null;
// }
