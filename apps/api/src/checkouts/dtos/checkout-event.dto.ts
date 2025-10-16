import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsString,
} from 'class-validator';
import { CheckoutEvents, type CheckoutEvent } from '../lib/constants';
import { ProtectedCheckoutResponseDto } from './checkout-response.dto';
import { Expose, Type } from 'class-transformer';

export class CheckoutEventDto {
  @Expose()
  @IsNotEmpty()
  @IsEnum(CheckoutEvents)
  @ApiProperty({
    example: CheckoutEvents.COMPLETED,
  })
  event: CheckoutEvent;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @Expose()
  @IsNotEmpty()
  @IsDate()
  @ApiProperty({
    example: '2025-09-18T17:15:26.969Z',
  })
  eventDate: Date;

  @Expose()
  @IsNotEmpty()
  @IsObject()
  @ApiProperty({
    type: ProtectedCheckoutResponseDto,
  })
  @Type(() => ProtectedCheckoutResponseDto)
  data: ProtectedCheckoutResponseDto;
}
