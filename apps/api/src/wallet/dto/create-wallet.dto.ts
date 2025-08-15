import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AddressType } from 'src/lib/contants/address-type.enum';
import { Network } from 'src/lib/contants/network';
import { NetworkId } from '@prisma/client';

export class CreateWalletDto {
  @IsEnum(NetworkId)
  networkId: NetworkId;

  @IsString()
  @IsOptional()
  label?: string;
}
