import { SupportedNetworksId } from 'src/networks/network.interface';
import { Transform } from 'class-transformer';
import { IsEnum, IsString } from 'class-validator';
import { ALCHEMY_WEBHOOK_TO_NETWORK_MAP } from '../lib/alchemy.network-map';

export class WebhookActivityDto {
  @IsString()
  webhookId: string;

  @IsString()
  createdAt: string;

  @IsString()
  fromAddress: string;

  @IsString()
  toAddress: string;

  @Transform(({ value }) => ALCHEMY_WEBHOOK_TO_NETWORK_MAP[value])
  @IsEnum(SupportedNetworksId)
  network: SupportedNetworksId;

  @IsString()
  address: string; // contract address

  @IsString()
  hash: string;
}
