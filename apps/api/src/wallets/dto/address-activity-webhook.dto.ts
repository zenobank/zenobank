import { SupportedNetworksId } from 'src/networks/networks.interface';
import { Expose, Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { ALCHEMY_WEBHOOK_TO_NETWORK_MAP } from '../../integrations/alchemy/lib/alchemy.network-map';

export class AddressActivityWebhookDto {
  @Expose()
  @IsString()
  id: string;

  @Expose()
  @Transform(({ value }) =>
    Object.values(SupportedNetworksId).includes(value)
      ? value
      : (ALCHEMY_WEBHOOK_TO_NETWORK_MAP[value] ?? value),
  )
  @IsEnum(SupportedNetworksId)
  network: SupportedNetworksId;
}
