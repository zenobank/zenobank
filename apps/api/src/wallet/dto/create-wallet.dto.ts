import { IsString, IsOptional, IsEnum } from 'class-validator';
import { NetworkId } from '@prisma/client';

export class CreateWalletDto {
  @IsEnum(NetworkId)
  networkId: NetworkId;

  @IsString()
  @IsOptional()
  label?: string;
}
