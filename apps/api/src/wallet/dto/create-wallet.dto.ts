import { IsString, IsOptional, IsEnum } from 'class-validator';
import { NetworkId } from 'src/networks/network.interface';

export class CreateWalletDto {
  @IsEnum(NetworkId)
  networkId: NetworkId;

  @IsString()
  @IsOptional()
  label?: string;
}
