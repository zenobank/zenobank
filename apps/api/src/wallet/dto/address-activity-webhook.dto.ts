import { SupportedNetworksId } from 'src/networks/network.interface';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { ALCHEMY_WEBHOOK_TO_NETWORK_MAP } from '../../alchemy/lib/alchemy.network-map';

export class AddressActivityWebhookDto {
  @IsString()
  id: string;

  @Transform(({ value }) => ALCHEMY_WEBHOOK_TO_NETWORK_MAP[value])
  @IsEnum(SupportedNetworksId)
  network: SupportedNetworksId;
}
