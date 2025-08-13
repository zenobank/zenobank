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

export class CreateWalletDto {
  @IsEnum(AddressType)
  addressType: AddressType;

  @IsString()
  @IsOptional()
  label?: string;

  @ValidateNested()
  @Type(() => WalletMetaDto)
  meta: WalletMetaDto;
}

export class WalletMetaDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}
